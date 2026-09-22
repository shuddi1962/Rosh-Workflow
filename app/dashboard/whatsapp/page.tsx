'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Send, Phone, MessageSquare, User, Megaphone, Mic } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

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

  const loadConversations = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/whatsapp/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { conversations?: Conversation[] }
        setConversations(data.conversations && data.conversations.length > 0 ? data.conversations : MOCK_CONVERSATIONS)
      } else {
        setConversations(MOCK_CONVERSATIONS)
      }
    } catch {
      setConversations(MOCK_CONVERSATIONS)
    }
  }

  const selectConversation = async (id: string): Promise<void> => {
    setSelectedConversation(id)
    setMessages(MOCK_MESSAGES[id] || [])
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/whatsapp/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json() as { messages?: WhatsAppMessage[] }
        if (data.messages && data.messages.length > 0) setMessages(data.messages)
      }
    } catch {
      // Fall back to the messages already set above
    }
    setConversations(prev => prev.map(c => (c.id === id ? { ...c, unread_count: 0 } : c)))
  }

  const sendMessage = async (): Promise<void> => {
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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        eyebrow="Communication"
        title="WhatsApp Inbox"
        description="Every customer chat in one inbox — reply fast, sell faster."
        icon={MessageSquare}
        actions={
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-emerald-700 font-medium">Connected</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <div className="bg-white border border-border-subtle rounded-xl overflow-hidden flex flex-col min-h-[300px]">
          <div className="p-4 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm font-medium text-text-primary mb-1">No conversations yet</p>
                <p className="text-xs text-text-secondary mb-4">Run a campaign to start chatting with customers.</p>
                <Link href="/dashboard/campaigns" className="inline-block px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium hover:bg-accent-primary/90">
                  Go to Campaigns
                </Link>
              </div>
            )}
            {filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => void selectConversation(conv.id)}
                className={`w-full p-4 border-b border-border-subtle text-left hover:bg-bg-surface transition-colors ${
                  selectedConversation === conv.id ? 'bg-bg-surface' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-accent-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-accent-primary" />
                    </div>
                    {conv.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">{conv.name}</p>
                      <span className="text-xs text-text-muted flex-shrink-0">{conv.last_message_time}</span>
                    </div>
                    <p className="text-xs text-text-secondary truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center text-xs text-white flex-shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-border-subtle rounded-xl overflow-hidden flex flex-col min-h-[400px]">
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-border-subtle flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-accent-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{selectedConv.name}</p>
                  <p className="text-xs text-text-muted">{selectedConv.phone}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={`tel:${selectedConv.phone}`}
                    aria-label={`Call ${selectedConv.name}`}
                    className="p-2 hover:bg-bg-surface rounded-lg"
                  >
                    <Phone className="w-5 h-5 text-text-secondary" />
                  </a>
                  <Link
                    href="/dashboard/voice/agents"
                    aria-label="Call via voice agent"
                    className="p-2 hover:bg-bg-surface rounded-lg"
                  >
                    <Mic className="w-5 h-5 text-text-secondary" />
                  </Link>
                  <Link
                    href="/dashboard/campaigns"
                    aria-label="Follow up with a campaign"
                    className="p-2 hover:bg-bg-surface rounded-lg"
                  >
                    <Megaphone className="w-5 h-5 text-text-secondary" />
                  </Link>
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
                        ? 'bg-accent-primary/10 text-text-primary'
                        : 'bg-bg-surface text-text-primary'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-text-muted">{msg.timestamp}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-sm text-text-muted py-8">No messages yet — say hello to start the conversation.</p>
                )}
              </div>

              <div className="p-4 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && void sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-3 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary"
                  />
                  <button
                    onClick={() => void sendMessage()}
                    aria-label="Send message"
                    className="p-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">Select a conversation</h3>
                <p className="text-text-secondary text-sm mb-6">Choose a conversation from the left to start chatting</p>
                <Link href="/dashboard/campaigns" className="inline-block px-4 py-2.5 border border-border-subtle rounded-lg text-sm text-text-primary hover:bg-bg-surface font-medium">
                  Or start a new campaign
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
