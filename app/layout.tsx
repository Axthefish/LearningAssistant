import type { Metadata } from "next"
import "./globals.css"
import { StoreInitializer } from "@/components/StoreInitializer"
import { GlobalNav } from "@/components/GlobalNav"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "Learning Assistant",
  description: "将想法，变为行动",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
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

