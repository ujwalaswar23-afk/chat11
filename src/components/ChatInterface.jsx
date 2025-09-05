import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'
import PaymentModal from './PaymentModal'
import UserList from './UserList'

const ChatInterface = () => {
  const [selectedChat, setSelectedChat] = useState(null)
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState({})
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentRecipient, setPaymentRecipient] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { user } = useAuth()
  const { socket } = useSocket()

  useEffect(() => {
    // Fetch all users
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const users = await response.json();
        // Filter out the current user from the list
        setAllUsers(users.filter(u => u._id !== user.id));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [user.id]);

  useEffect(() => {
    if (socket) {
      // Listen for online users
      socket.on('onlineUsers', (users) => {
        // Filter out the current user from the online list
        setOnlineUsers(users.filter(u => u.userId !== user.id));
      });

      // Listen for new messages
      socket.on('newMessage', (message) => {
        setMessages(prev => ({
          ...prev,
          [message.chatId]: [...(prev[message.chatId] || []), message]
        }))
        
        // Update chat list with latest message
        setChats(prev => prev.map(chat => 
          chat.id === message.chatId 
            ? { ...chat, lastMessage: message.content, lastMessageTime: message.timestamp }
            : chat
        ))
      })

      // Listen for chat list updates
      socket.on('chatList', (chatList) => {
        setChats(chatList)
        // Auto-select the first chat if none is selected
        if (!selectedChat && chatList && chatList.length > 0) {
          setSelectedChat(chatList[0])
        }
      })

      // Listen for message history
      socket.on('messageHistory', ({ chatId, messages: chatMessages }) => {
        setMessages(prev => ({
          ...prev,
          [chatId]: chatMessages
        }))
      })

      return () => {
        socket.off('newMessage')
        socket.off('chatList')
        socket.off('messageHistory')
        socket.off('onlineUsers');
      }
    }
  }, [socket, user.id])

  // When a chat is selected, request its message history
  useEffect(() => {
    if (socket && selectedChat?.id) {
      socket.emit('getMessageHistory', { chatId: selectedChat.id })
    }
  }, [socket, selectedChat])

  const handleSendMessage = (content, type = 'text') => {
    if (!selectedChat || !socket) return

    const message = {
      id: Date.now().toString(),
      chatId: selectedChat.id,
      senderId: user.id,
      senderName: user.name,
      content,
      type,
      timestamp: new Date().toISOString()
    }

    socket.emit('sendMessage', message)
  }

  const handleStartChat = (peer) => {
    if (!socket) return

    socket.emit('startChat', {
      initiatorId: user.id,
      initiatorPhone: user.phoneNumber,
      phoneNumber: peer.phoneNumber
    })
  }

  const handlePaymentRequest = (recipient) => {
    setPaymentRecipient(recipient)
    setShowPaymentModal(true)
  }

  const handlePaymentComplete = (paymentData) => {
    // Send payment confirmation as a message
    handleSendMessage(
      `Payment of ₹${paymentData.amount} sent successfully! Transaction ID: ${paymentData.transactionId}`,
      'payment'
    )
    setShowPaymentModal(false)
    setPaymentRecipient(null)
  }

  return (
    <div className="flex h-screen bg-whatsapp-gray">
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onStartChat={handleStartChat}
        user={user}
        onlineUsers={onlineUsers}
        allUsers={allUsers}
      />
      
      <ChatWindow
        selectedChat={selectedChat}
        messages={messages[selectedChat?.id] || []}
        onSendMessage={handleSendMessage}
        onPaymentRequest={handlePaymentRequest}
        user={user}
      />

      {showPaymentModal && (
        <PaymentModal
          recipient={paymentRecipient}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  )
}

export default ChatInterface
