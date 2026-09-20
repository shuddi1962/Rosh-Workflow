import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initIO first.')
  }
  return io
}

export function initIO(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })
  
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }
    
    try {
      const { verifyToken } = require('@/lib/auth')
      const payload = verifyToken(token)
      if (!payload) {
        return next(new Error('Invalid token'))
      }
      socket.data.userId = payload.userId
      socket.data.role = payload.role
      next()
    } catch {
      next(new Error('Authentication error'))
    }
  })
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`)
    
    socket.join(`user:${socket.data.userId}`)
    
    if (socket.data.role === 'admin') {
      socket.join('admin')
    }
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`)
    })
  })
  
  return io
}

export const WS_EVENTS = {
  'trend:new': 'trend:new',
  'trend:breaking': 'trend:breaking',
  'content:generating': 'content:generating',
  'content:ready': 'content:ready',
  'competitor:scan_started': 'competitor:scan_started',
  'competitor:scan_complete': 'competitor:scan_complete',
  'post:publishing': 'post:publishing',
  'post:published': 'post:published',
  'post:failed': 'post:failed',
  'lead:new': 'lead:new',
  'lead:qualified': 'lead:qualified',
  'campaign:started': 'campaign:started',
  'campaign:progress': 'campaign:progress',
  'campaign:complete': 'campaign:complete',
  'system:budget_warning': 'system:budget_warning',
  'system:api_error': 'system:api_error'
} as const

export function emitEvent(event: string, data: Record<string, unknown>, room?: string): void {
  const socketIO = getIO()
  
  if (room) {
    socketIO.to(room).emit(event, data)
  } else {
    socketIO.emit(event, data)
  }
}

export function emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
  emitEvent(event, data, `user:${userId}`)
}

export function emitToAdmin(event: string, data: Record<string, unknown>): void {
  emitEvent(event, data, 'admin')
}
