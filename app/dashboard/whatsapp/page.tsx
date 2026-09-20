'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Send, Phone, Video, MoreVertical, Check, CheckCheck, MessageSquare, User } from 'lucide-react'

interface WhatsAppMessage {
  id: string
  from: string
  to: string
  content: string
  type: 'text' | 'image' | 'video' | 'document'
  direction: 'inbound' | 'outbound'
  status: 'sent' | 'delivered' | 'read'
  timestamp: string
}

interface Conversation {
  id: string
  phone: string
  name: string
  last_message: string
  last_message_time: string
  unread_count: number
  is_online: boolean
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', phone: '+2348109522432', name: 'Emeka Obi', last_message: 'I need a quote for 2 Suzuki 100HP engines', last_message_time: '2 min ago', unread_count: 2, is_online: true },
  { id: '2', phone: '+2348033170802', name: 'Grace Ade', last_message: 'When can you install the CCTV?', last_message_time: '15 min ago', unread_count: 0, is_online: false },
  { id: '3', phone: '+2348180388018', name: 'Chief Okoro', last_message: 'Send me the solar system price list', last_message_time: '1 hour ago', unread_count: 1, is_online: true },
  { id: '4', phone: '+2347012345678', name: 'NDDC Procurement', last_message: 'We need 20 life jackets for our boats', last_message_time: '3 hours ago', unread_count: 0, is_online: false },
  { id: '5', phone: '+2348098765432', name: 'Hotel Trans Amadi', last_message: 'Can you do a site survey tomorrow?', last_message_time: 'Yesterday', unread_count: 0, is_online: false },
]

const MOCK_MESSAGES: Record<string, WhatsAppMessage[]> = {
  '1': [
    { id: 'm1', from: '+2348109522432', to: 'system', content: 'Hello, I saw your ad for Suzuki engines', type: 'text', direction: 'inbound', status: 'read', timestamp: '10:30 AM' },
    { id: 'm2', from: 'system', to: '+2348109522432', content: 'Good morning! Thank you for reaching out. We have Suzuki engines from 15HP to 300HP. Which model are you interested in?', type: 'text', direction: 'outbound', status: 'read', timestamp: '10:32 AM' },
    { id: 'm3', from: '+2348109522432', to: 'system', content: 'I need a quote for 2 Suzuki 100HP engines', type: 'text', direction: 'inbound', status: 'read', timestamp: '10:35 AM' },
  ],
  '2': [
    { id: 'm1', from: '+2348033170802', to: 'system', content: 'Hi, I want to install CCTV at my shop', type: 'text', direction: 'inbound', status: 'read', timestamp: '9:00 AM' },
    { id: 'm2', from: 'system', to: '+2348033170802', content: 'Hello Grace! We offer Hikvision CCTV systems with professional installation. How many cameras do you need?', type: 'text', direction: 'outbound', status: 'read', timestamp: '9:05 AM' },
    { id: 'm3', from: '+2348033170802', to: 'system', content: 'When can you install the CCTV?', type: 'text', direction: 'inbound', status: 'read', timestamp: '9:10 AM' },
  ],
}

export default function WhatsAppInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/whatsapp/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch {
      setConversations(MOCK_CONVERSATIONS)
    }
  }

  const selectConversation = async (id: string) => {
    setSelectedConversation(id)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/whatsapp/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {
      setMessages(MOCK_MESSAGES[id] || [])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: WhatsAppMessage = {
      id: crypto.randomUUID(),
      from: 'system',
      to: conversations.find(c => c.id === selectedConversation)?.phone || '',
      content: newMessage,
      type: 'text',
      direction: 'outbound',
      status: 'sent',
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          to: message.to,
          content: message.content,
        }),
      })
    } catch {
      console.error('Failed to send message')
    }
  }

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  )

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-clash text-3xl font-bold text-text-primary">WhatsApp Inbox</h1>
          <p className="text-text-secondary mt-1">Manage all WhatsApp conversations in one place</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 rounded-lg">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-400">Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full p-4 border-b border-border-ghost text-left hover:bg-bg-elevated transition-colors ${
                  selectedConversation === conv.id ? 'bg-bg-elevated' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-accent-primary-glow" />
                    </div>
                    {conv.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-bg-surface" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary truncate">{conv.name}</p>
                      <span className="text-xs text-text-muted">{conv.last_message_time}</span>
                    </div>
                    <p className="text-xs text-text-secondary truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center text-xs text-white">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-xl overflow-hidden flex flex-col">
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-border-subtle flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-accent-primary-glow" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{selectedConv.name}</p>
                  <p className="text-xs text-text-muted">{selectedConv.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-bg-elevated rounded-lg">
                    <Phone className="w-5 h-5 text-text-muted" />
                  </button>
                  <button className="p-2 hover:bg-bg-elevated rounded-lg">
                    <Video className="w-5 h-5 text-text-muted" />
                  </button>
                  <button className="p-2 hover:bg-bg-elevated rounded-lg">
                    <MoreVertical className="w-5 h-5 text-text-muted" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      msg.direction === 'outbound'
                        ? 'bg-accent-primary/20 text-text-primary'
                        : 'bg-bg-elevated text-text-primary'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-text-muted">{msg.timestamp}</span>
                        {msg.direction === 'outbound' && (
                          msg.status === 'read' ? (
                            <CheckCheck className="w-3 h-3 text-blue-400" />
                          ) : (
                            <Check className="w-3 h-3 text-text-muted" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-3 bg-bg-elevated border border-border-subtle rounded-lg text-sm text-text-primary"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">Select a conversation</h3>
                <p className="text-text-secondary">Choose a conversation from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
