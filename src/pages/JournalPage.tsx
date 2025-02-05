import React, { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { cn } from "../lib/utils"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { syncToNotion, JournalEntry } from "../lib/notion"

const JournalPage = () => {
  const [entry, setEntry] = useState("")
  const [entries, setEntries] = useState<Array<{ date: Date; content: string }>>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isFaded, setIsFaded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [textareaRef])

  useEffect(() => {
    let typingTimer: NodeJS.Timeout
    if (isTyping) {
      setIsFaded(true)
      typingTimer = setTimeout(() => {
        setIsTyping(false)
      }, 1500)
    } else {
      typingTimer = setTimeout(() => {
        setIsFaded(false)
      }, 1500)
    }
    return () => clearTimeout(typingTimer)
  }, [isTyping])

  useEffect(() => {
    setEntries([
      {
        date: new Date(),
        content: "這是一個測試日誌，用來測試 hover card 功能。"
      },
      {
        date: new Date(Date.now() - 86400000), // 昨天
        content: "這是昨天的日誌，測試日期格式。"
      }
    ])
  }, [])

  useEffect(() => {
    // 測試環境變量是否正確載入
    console.log('Notion Token:', import.meta.env.VITE_NOTION_TOKEN ? '已設置' : '未設置');
    console.log('Database ID:', import.meta.env.VITE_NOTION_DATABASE_ID ? '已設置' : '未設置');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (entry.trim()) {
      try {
        const newEntry: JournalEntry = {
          title: format(new Date(), "yyyy-MM-dd"),
          content: entry,
          date: new Date().toISOString(),
        }

        // Save to Notion
        await syncToNotion(newEntry)
        
        // Update local state
        setEntries([{ date: new Date(), content: entry }, ...entries])
        setEntry("")
        toast({
          title: "已儲存",
          description: `儲存時間：${format(new Date(), "yyyy年MM月dd日 HH:mm")}`,
          duration: 3000,
        })
      } catch (error) {
        console.error('Error saving to Notion:', error);
        toast({
          title: "儲存失敗",
          description: "無法同步到 Notion，請檢查連線設定",
          variant: "destructive",
          duration: 5000,
        })
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen bg-background">
      <h1 className="text-2xl font-bold mb-6">今天想寫些什麼？</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          ref={textareaRef}
          value={entry}
          onChange={(e) => {
            setEntry(e.target.value)
            setIsTyping(true)
          }}
          onBlur={() => setIsTyping(false)}
          placeholder="開始寫下你的想法..."
          className="w-full min-h-[100px] p-4 text-lg"
        />
        <Button 
          type="submit" 
          className={cn(
            "w-full md:w-auto",
            isFaded && "opacity-50 transition-opacity duration-500"
          )}
        >
          儲存
        </Button>
      </form>
      <Separator className="my-8" />
      <div className={cn(
        "space-y-4",
        isFaded && "opacity-50 transition-opacity duration-500"
      )}>
        {entries.map((entry, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="font-bold mb-2">
              {format(entry.date, "yyyy年MM月dd日")}
            </div>
            <div>{entry.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JournalPage 