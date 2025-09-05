import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, IndianRupee } from 'lucide-react'

const ChatWindow = ({ selectedChat, messages, onSendMessage, onPaymentRequest, user }) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const renderMessage = (message) => {
    const isOwn = message.senderId === user.id
    const isPayment = message.type === 'payment'

    return (
      <div
        key={message.id}
        className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`chat-bubble ${
            isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'
          } ${isPayment ? 'border-2 border-green-400' : ''}`}
        >
          {isPayment && (
            <div className="flex items-center mb-2 text-green-600">
              <IndianRupee className="w-4 h-4 mr-1" />
              <span className="text-xs font-semibold">Payment</span>
            </div>
          )}
          <p className="text-sm">{message.content}</p>
          <div className="flex items-center justify-end mt-1">
            <span className="text-xs text-gray-500">
              {formatMessageTime(message.timestamp)}
            </span>
            {isOwn && (
              <span className="ml-1 text-xs text-blue-500">✓✓</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Phone className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Welcome to ChatApp</h3>
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={selectedChat.avatar}
            alt={selectedChat.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
            <p className="text-sm text-gray-500">
              {selectedChat.online ? 'Online' : `Last seen ${selectedChat.lastSeen || 'recently'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPaymentRequest(selectedChat)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Send Payment"
          >
            <IndianRupee className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-whatsapp-primary text-white rounded-full hover:bg-whatsapp-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatWindow
