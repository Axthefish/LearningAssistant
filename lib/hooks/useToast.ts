/**
 * Custom Toast Hook
 * Agent 7: UI/UX Polish Expert
 */

import { useToast as useToastBase } from '@/components/ui/use-toast'

export function useCustomToast() {
  const { toast } = useToastBase()
  
  return {
    success: (message: string) => {
      toast({
        title: '成功',
        description: message,
        variant: 'default',
      })
    },
    error: (message: string) => {
      toast({
        title: '错误',
        description: message,
        variant: 'destructive',
      })
    },
    info: (message: string) => {
      toast({
        title: '提示',
        description: message,
      })
    },
  }
}

