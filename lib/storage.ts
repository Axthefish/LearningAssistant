/**
 * 存储抽象层
 * MVP: localStorage实现
 * 未来: 可切换为数据库（Prisma/Supabase）
 * Agent 4: State Management Expert
 */

import type { Session } from './types'

export interface StorageAdapter {
  saveSession(session: Session): Promise<void>
  getSession(id: string): Promise<Session | null>
  getCurrentSession(): Promise<Session | null>
  listSessions(): Promise<Session[]>
  deleteSession(id: string): Promise<void>
}

/**
 * LocalStorage 实现（MVP阶段）
 */
class LocalStorageAdapter implements StorageAdapter {
  private readonly CURRENT_SESSION_KEY = 'learning-assistant:current-session'
  private readonly SESSIONS_KEY = 'learning-assistant:sessions'
  
  async saveSession(session: Session): Promise<void> {
    // 保存当前会话
    localStorage.setItem(this.CURRENT_SESSION_KEY, JSON.stringify(session))
    
    // 保存到会话列表
    const sessions = await this.listSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.push(session)
    }
    
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions))
  }
  
  async getSession(id: string): Promise<Session | null> {
    const sessions = await this.listSessions()
    return sessions.find(s => s.id === id) || null
  }
  
  async getCurrentSession(): Promise<Session | null> {
    const data = localStorage.getItem(this.CURRENT_SESSION_KEY)
    return data ? JSON.parse(data) : null
  }
  
  async listSessions(): Promise<Session[]> {
    const data = localStorage.getItem(this.SESSIONS_KEY)
    return data ? JSON.parse(data) : []
  }
  
  async deleteSession(id: string): Promise<void> {
    const sessions = await this.listSessions()
    const filtered = sessions.filter(s => s.id !== id)
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filtered))
    
    // 如果删除的是当前会话，清空当前会话
    const current = await this.getCurrentSession()
    if (current?.id === id) {
      localStorage.removeItem(this.CURRENT_SESSION_KEY)
    }
  }
}

/**
 * 数据库实现（未来）
 * 示例接口，实际实现时替换
 */
class DatabaseAdapter implements StorageAdapter {
  async saveSession(session: Session): Promise<void> {
    // TODO: 数据库实现
    // await prisma.session.upsert({ ... })
    throw new Error('Not implemented')
  }
  
  async getSession(id: string): Promise<Session | null> {
    // TODO: 数据库实现
    throw new Error('Not implemented')
  }
  
  async getCurrentSession(): Promise<Session | null> {
    // TODO: 数据库实现
    throw new Error('Not implemented')
  }
  
  async listSessions(): Promise<Session[]> {
    // TODO: 数据库实现
    throw new Error('Not implemented')
  }
  
  async deleteSession(id: string): Promise<void> {
    // TODO: 数据库实现
    throw new Error('Not implemented')
  }
}

// 导出当前使用的适配器（MVP使用localStorage）
export const storage: StorageAdapter = new LocalStorageAdapter()

// 未来切换到数据库时，只需改这一行：
// export const storage: StorageAdapter = new DatabaseAdapter()

