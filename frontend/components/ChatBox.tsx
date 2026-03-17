"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { sendMessage, ChatApiError } from "@/lib/api"

type Message = { role: "user" | "assistant"; content: string }

const USER_ID = "user_1"

function toUserMessage(err: unknown): string {
  if (err instanceof ChatApiError) {
    if (err.status === 422) return "Please enter a message and try again."
    if (err.status === 0) return "Couldn't reach the server. Check your connection and try again."
    if (err.status >= 500) return "Something went wrong on our side. Please try again in a moment."
    return err.message || "Something went wrong. Please try again."
  }
  return "Something went wrong. Please try again."
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" />
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`
          max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm
          ${isUser
            ? "bg-emerald-600 text-white rounded-br-md"
            : "bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-bl-md border border-zinc-200 dark:border-zinc-700"
          }
        `}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  )
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput("")
    setError(null)
    const userMessage: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendMessage(text, USER_ID)
      const reply = typeof response === "string" && response.length > 0 ? response : "I didn't get a response. You can try again."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (e) {
      const userFacing = toUserMessage(e)
      setError(userFacing)
      setMessages((prev) => [...prev, { role: "assistant", content: userFacing }])
    } finally {
      setIsLoading(false)
      focusInput()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <header className="flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-semibold shadow-sm">
            A
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-lg tracking-tight">Support</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Ask anything about your booking</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h2 className="text-xl font-medium text-foreground mb-1">Start a conversation</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm">
                Ask about your trip, refunds, or any booking details.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400 mb-2">{error}</p>
          )}
          <div className="flex gap-3 items-end rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50 transition-shadow">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              disabled={isLoading}
              className="flex-1 min-h-[44px] max-h-32 resize-none bg-transparent px-4 py-3 text-foreground placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none disabled:opacity-60 text-[15px] leading-relaxed"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
