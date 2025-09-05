import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Phone, MessageCircle } from 'lucide-react'

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const { socket } = useSocket();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber || !name) return;
    setLoading(true);
    if (!socket) {
      alert('Unable to connect to server. Please try again.');
      setLoading(false);
      return;
    }
    // Register/login user via socket
    const userData = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=25D366&color=fff`
    };
    socket.emit('userJoin', userData);
    // Listen for chatList event to get backend userId
    const handleChatList = (chats) => {
      // Get userId from socket's onlineUsers or from server
      socket.emit('getOnlineUsers');
      socket.once('onlineUsers', (users) => {
        const backendUser = users.find(u => u.phoneNumber === userData.phoneNumber);
        if (backendUser) {
          login({
            id: backendUser.userId,
            name: userData.name,
            phoneNumber: userData.phoneNumber,
            avatar: userData.avatar
          });
          navigate('/chat');
        } else {
          alert('Login failed. Please try again.');
        }
        setLoading(false);
      });
    };
    socket.once('chatList', handleChatList);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-secondary to-whatsapp-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-whatsapp-primary mr-2" />
            <h1 className="text-3xl font-bold text-whatsapp-dark">ChatApp</h1>
          </div>
          <p className="text-gray-600">Connect with friends and family</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent outline-none transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent outline-none transition-all"
                placeholder="+91 9876543210"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !phoneNumber || !name}
            className="w-full bg-whatsapp-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-whatsapp-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Start Chatting'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  )
}

export default Login
