import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, LogOut, MessageCircle, Users, Wifi } from 'lucide-react'
import UserList from './UserList'

const ChatSidebar = ({ chats, selectedChat, onSelectChat, onStartChat, user, onlineUsers, allUsers }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('chats') // 'chats', 'online', 'all'
  const { logout } = useAuth()

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.phoneNumber.includes(searchTerm)
  )

  const handleSelectUser = (peer) => {
    onStartChat(peer);
    setActiveTab('chats'); // Switch back to chats after starting a new one
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'online':
        return <UserList users={onlineUsers} onSelectUser={handleSelectUser} title="Online Users" />;
      case 'all':
        return <UserList users={allUsers} onSelectUser={handleSelectUser} title="All Users" />;
      case 'chats':
      default:
        return filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No chats yet</p>
            <p className="text-sm">Click on 'All Users' to start a new conversation</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChat?.id === chat.id ? 'bg-whatsapp-light' : ''
              }`}
            >
              <div className="flex items-center">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="bg-whatsapp-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))
        );
    }
  }

  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-whatsapp-dark text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-sm opacity-75">{user.phoneNumber}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 hover:bg-whatsapp-secondary rounded-full transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Search (only for chats tab) */}
      {activeTab === 'chats' && (
        <div className="p-3 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary"
            />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex justify-around border-b">
        <button onClick={() => setActiveTab('chats')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'chats' ? 'border-b-2 border-whatsapp-primary text-whatsapp-primary' : 'text-gray-600'}`}>
          <MessageCircle size={18} /> Chats
        </button>
        <button onClick={() => setActiveTab('online')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'online' ? 'border-b-2 border-whatsapp-primary text-whatsapp-primary' : 'text-gray-600'}`}>
          <Wifi size={18} /> Online
        </button>
        <button onClick={() => setActiveTab('all')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'all' ? 'border-b-2 border-whatsapp-primary text-whatsapp-primary' : 'text-gray-600'}`}>
          <Users size={18} /> All Users
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {renderContent()}
      </div>
    </div>
  )
}

export default ChatSidebar