'use client'

/**
 * Global Sidebar Component
 * 左侧固定导航栏，支持响应式
 */

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useStore } from '@/lib/store'
import { getPathWithLocale, type Locale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale() as Locale
  const resetSession = useStore(state => state.resetSession)
  const [isOpen, setIsOpen] = useState(false)
  
  // 导航菜单项
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      id: 'framework',
      label: 'My Framework',
      icon: Sparkles,
      path: '/personalized'
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      path: '/universal'
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: BookOpen,
      path: '#'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '#'
    }
  ]

  const handleNavigation = (path: string) => {
    if (path === '#') return
    const fullPath = getPathWithLocale(path, locale)
    router.push(fullPath)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    if (confirm('确定要登出吗？当前会话将被保存。')) {
      await resetSession()
      router.push(getPathWithLocale('/', locale))
    }
  }

  const isActive = (path: string) => {
    if (path === '#') return false
    return pathname.includes(path)
  }

  // Sidebar内容组件
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl border-r border-border/50">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-teal-amber flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Learning Assistant</h1>
            <p className="text-xs text-muted-foreground">AI Coach</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal to-amber flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">Alex Chen</p>
            <p className="text-sm text-muted-foreground truncate">Growth Journey</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              disabled={item.path === '#'}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${active 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }
                ${item.path === '#' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

