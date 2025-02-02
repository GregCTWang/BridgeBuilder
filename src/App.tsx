import React from 'react'
import { Button } from '@/components/ui/button'
import { PenLine } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">我的日誌</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl text-foreground">所有日誌</h2>
          <Button>
            <PenLine className="mr-2 h-4 w-4" />
            寫新日誌
          </Button>
        </div>

        <div className="grid gap-4">
          {/* 日誌列表將在這裡顯示 */}
          <div className="p-4 rounded-lg border bg-card text-card-foreground">
            <p className="text-sm text-muted-foreground">2024年2月3日</p>
            <h3 className="text-lg font-semibold mt-2">今天的心得...</h3>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 