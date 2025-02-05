import React from 'react'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  )
}