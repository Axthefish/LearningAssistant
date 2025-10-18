import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { StoreInitializer } from "@/components/StoreInitializer"

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
    <html lang="zh-CN">
      <body className={inter.className}>
        <StoreInitializer>{children}</StoreInitializer>
      </body>
    </html>
  )
}

