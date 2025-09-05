import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { User, Chat, Message } from './models/index.js'

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const app = express()
const server = createServer(app)

// Allowed origins from env (comma-separated). Examples:
// CLIENT_ORIGIN="https://myapp.com,https://www.myapp.com"
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : "*",
    methods: ["GET", "POST"],
    credentials: !!allowedOrigins.length
  }
})

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients or same-origin requests with no Origin header
    if (!origin) return callback(null, true)
    // If no explicit origins are configured, allow all (good for same-origin prod or dev)
    if (!allowedOrigins.length) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp')
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Store online users
const onlineUsers = new Map()

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Handle user joining
  socket.on('userJoin', async (userData) => {
    try {
      // Find or create user
      let user = await User.findOne({ phoneNumber: userData.phoneNumber })
      if (!user) {
        user = new User({
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          avatar: userData.avatar
        })
        await user.save()
      }

      // Store user in online users
      onlineUsers.set(socket.id, {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name
      })

      // Join user to their personal room
      socket.join(user._id.toString())

      // Send user's chat list
      const chats = await Chat.find({
        participants: user._id
      }).populate('participants', 'name phoneNumber avatar')

      socket.emit('chatList', chats.map(chat => {
        const otherParticipant = chat.participants.find(p => p._id.toString() !== user._id.toString())
        return {
          id: chat._id,
          name: otherParticipant?.name || 'Unknown',
          phoneNumber: otherParticipant?.phoneNumber || '',
          avatar: otherParticipant?.avatar || '',
          lastMessage: chat.lastMessage,
          lastMessageTime: chat.lastMessageTime,
          unreadCount: 0
        }
      }))

      // Broadcast online users
      io.emit('onlineUsers', Array.from(onlineUsers.values()))
    } catch (error) {
      console.error('Error in userJoin:', error)
    }
  })

  // Handle starting a new chat
  socket.on('startChat', async ({ initiatorId, initiatorPhone, phoneNumber }) => {
    try {
      let initiator = null
      if (initiatorId) {
        try {
          initiator = await User.findById(initiatorId)
        } catch {}
      }
      if (!initiator) {
        // Try resolve via provided phone or from onlineUsers map
        if (initiatorPhone) {
          initiator = await User.findOne({ phoneNumber: initiatorPhone })
        }
        if (!initiator) {
          const session = onlineUsers.get(socket.id)
          if (session?.userId) {
            initiator = await User.findById(session.userId)
          }
        }
      }

      if (!initiator) {
        throw new Error('Unable to resolve initiator user')
      }
      let recipient = await User.findOne({ phoneNumber })

      if (!recipient) {
        // Create a placeholder user for the phone number
        recipient = new User({
          name: `User ${phoneNumber}`,
          phoneNumber,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(phoneNumber)}&background=25D366&color=fff`
        })
        await recipient.save()
      }

      // Check if chat already exists
      let chat = await Chat.findOne({
        participants: { $all: [initiator._id, recipient._id] }
      })

      if (!chat) {
        // Create new chat
        chat = new Chat({
          participants: [initiator._id, recipient._id],
          createdAt: new Date()
        })
        await chat.save()
      }

      // Populate participants
      await chat.populate('participants', 'name phoneNumber avatar')

      // Send updated chat list to initiator
      const chats = await Chat.find({
        participants: initiator._id
      }).populate('participants', 'name phoneNumber avatar')

      socket.emit('chatList', chats.map(c => {
        const otherParticipant = c.participants.find(p => p._id.toString() !== initiator._id.toString())
        return {
          id: c._id,
          name: otherParticipant?.name || 'Unknown',
          phoneNumber: otherParticipant?.phoneNumber || '',
          avatar: otherParticipant?.avatar || '',
          lastMessage: c.lastMessage,
          lastMessageTime: c.lastMessageTime,
          unreadCount: 0
        }
      }))

    } catch (error) {
      console.error('Error starting chat:', error)
    }
  })

  // Handle sending messages
  socket.on('sendMessage', async (messageData) => {
    try {
      // Infer sender from the socket session for trust
      const session = onlineUsers.get(socket.id)
      if (!session?.userId) {
        throw new Error('Unauthenticated socket: missing user session')
      }

      const message = new Message({
        chatId: messageData.chatId,
        senderId: session.userId,
        senderName: session.name || messageData.senderName || 'User',
        content: messageData.content,
        type: messageData.type || 'text',
        timestamp: new Date()
      })

      await message.save()

      // Update chat's last message
      await Chat.findByIdAndUpdate(messageData.chatId, {
        lastMessage: messageData.content,
        lastMessageTime: new Date()
      })

      // Send message to all participants in the chat
      const chat = await Chat.findById(messageData.chatId)
      chat.participants.forEach(participantId => {
        io.to(participantId.toString()).emit('newMessage', {
          id: message._id,
          chatId: message.chatId,
          senderId: message.senderId,
          senderName: message.senderName,
          content: message.content,
          type: message.type,
          timestamp: message.timestamp
        })
      })

    } catch (error) {
      console.error('Error sending message:', error)
    }
  })

  // Handle getting message history
  socket.on('getMessageHistory', async ({ chatId }) => {
    try {
      const messages = await Message.find({ chatId })
        .sort({ timestamp: 1 })
        .limit(50)

      socket.emit('messageHistory', {
        chatId,
        messages: messages.map(msg => ({
          id: msg._id,
          chatId: msg.chatId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          content: msg.content,
          type: msg.type,
          timestamp: msg.timestamp
        }))
      })
    } catch (error) {
      console.error('Error getting message history:', error)
    }
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    onlineUsers.delete(socket.id)
    io.emit('onlineUsers', Array.from(onlineUsers.values()))
  })
})

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChatApp server is running' })
})

// Serve frontend in production (Vite output)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Start server
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
