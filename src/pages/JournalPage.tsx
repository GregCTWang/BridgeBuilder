import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useToast } from "@/components/ui/use-toast"

export default function JournalPage() {
  const [entry, setEntry] = useState("")
  const [date, setDate] = useState<Date>(new Date())
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (entry.trim()) {
      setEntries([{ date, content: entry }, ...entries])
      setEntry("")
      toast({
        title: "已儲存",
        description: `儲存時間：${format(date, "yyyy年MM月dd日 HH:mm")}`,
        duration: 3000,
      })
    }
  }

  const formatDate = (date: Date) => {
    const isToday = new Date().toDateString() === date.toDateString()
    return isToday ? "今天" : format(date, "yyyy年MM月dd日")
  }

  const testToast = () => {
    toast({
      title: "測試通知",
      description: "這是一個測試通知，測試 Toast 組件。",
      duration: 3000,
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className={cn("text-2xl font-bold", isFaded && "opacity-50 transition-opacity duration-500")}>
          今天想寫些什麼？
        </h1>
        <Button onClick={testToast} variant="outline" size="sm">
          測試通知
        </Button>
      </div>
      <div className={cn("flex justify-end mb-2", isFaded && "opacity-50 transition-opacity duration-500")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDate(date)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={(newDate) => newDate && setDate(newDate)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
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
          className="w-full min-h-[100px]"
        />
        <Button type="submit" className={cn(isFaded && "opacity-50 transition-opacity duration-500")}>
          儲存
        </Button>
      </form>
      <Separator className="my-4" />
      <div className={cn("space-y-2", isFaded && "opacity-50 transition-opacity duration-500")}>
        {entries.map((entry, index) => (
          <HoverCard key={index} openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
              <div className="cursor-pointer truncate">
                {format(entry.date, "yyyy年MM月dd日")}: {entry.content}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="font-semibold">{format(entry.date, "yyyy年MM月dd日 HH:mm")}</p>
              <p className="mt-2">{entry.content}</p>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  )
} 