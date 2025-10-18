import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { StoreInitializer } from "@/components/StoreInitializer"
import { GlobalNav } from "@/components/GlobalNav"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Learning Assistant",
  description: "将模糊需求转化为个性化行动蓝图",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <StoreInitializer>
              <GlobalNav />
              <main className="pt-16">{children}</main>
              <Toaster />
            </StoreInitializer>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

