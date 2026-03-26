'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Send, MessageCircle, Home, Loader2, BadgeCheck } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') fetchConversations()
  }, [status])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setConversations(data)
    } finally {
      setLoading(false)
    }
  }

  const openConversation = async (conv: any) => {
    setActiveConv(conv)
    try {
      const res = await fetch(`/api/messages?conversationId=${conv.id}`)
      const data = await res.json()
      setMessages(data)
      // Update unread count locally
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    } catch { toast.error('Failed to load messages') }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    try {
      const otherParticipant = activeConv.participants.find((p: any) => p.user.id !== session?.user?.id)
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: otherParticipant?.user?.id,
          content: newMessage,
          conversationId: activeConv.id,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
      }
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-nepal-red" /></div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex">
        {/* Conversations List */}
        <div className={cn(
          'w-full sm:w-80 lg:w-96 bg-white border-r border-gray-100 flex flex-col flex-shrink-0',
          activeConv ? 'hidden sm:flex' : 'flex'
        )}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h1 className="font-bold text-gray-900 text-lg">Messages</h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-500 mb-1">No messages yet</h3>
                <p className="text-gray-400 text-sm">When you contact a landlord, messages appear here</p>
              </div>
            ) : (
              conversations.map(conv => {
                const other = conv.participants.find((p: any) => p.user.id !== session.user?.id)
                const lastMsg = conv.messages?.[0]
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left',
                      activeConv?.id === conv.id && 'bg-red-50'
                    )}
                  >
                    <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {other?.user?.avatar ? (
                        <img src={other.user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gray-500">{other?.user?.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">{other?.user?.name}</span>
                        <span className="text-xs text-gray-400">{lastMsg ? timeAgo(lastMsg.createdAt) : ''}</span>
                      </div>
                      {conv.listing && (
                        <div className="text-xs text-nepal-red truncate">{conv.listing.title}</div>
                      )}
                      <div className="text-xs text-gray-500 truncate mt-0.5">{lastMsg?.content || 'No messages yet'}</div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-nepal-red text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          'flex-1 flex flex-col',
          !activeConv ? 'hidden sm:flex' : 'flex'
        )}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="sm:hidden p-1 text-gray-400 hover:text-gray-600">
                  ←
                </button>
                {(() => {
                  const other = activeConv.participants.find((p: any) => p.user.id !== session.user?.id)
                  return (
                    <>
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {other?.user?.avatar ? (
                          <img src={other.user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="font-bold text-gray-500">{other?.user?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{other?.user?.name}</div>
                        {activeConv.listing && (
                          <div className="text-xs text-gray-500 truncate">Re: {activeConv.listing.title}</div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
                {activeConv.listing && (
                  <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 text-sm mb-4">
                    {activeConv.listing.images?.[0] && (
                      <img src={activeConv.listing.images[0].url} alt="" className="w-12 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900 line-clamp-1">{activeConv.listing.title}</div>
                      <div className="text-xs text-gray-400">Regarding this listing</div>
                    </div>
                  </div>
                )}

                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn('flex', msg.senderId === session.user?.id ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn(
                      'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                      msg.senderId === session.user?.id
                        ? 'bg-nepal-red text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                    )}>
                      <p>{msg.content}</p>
                      <p className={cn('text-xs mt-1', msg.senderId === session.user?.id ? 'text-red-200' : 'text-gray-400')}>
                        {timeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="w-10 h-10 bg-nepal-red text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-500">Select a conversation</h3>
                <p className="text-gray-400 text-sm mt-1">Choose from your message threads</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
