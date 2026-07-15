import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiSend } from 'react-icons/fi'
import Logo from '../components/layout/Logo'
import {
  HAS_WEBHOOK,
  INTRO,
  newId,
  sendToAssistant,
  type ChatMessage,
  type Intent,
} from '../components/assistant/engine'

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [live, setLive] = useState<boolean | null>(null)
  const sessionId = useRef(`s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typing])

  const deliver = (userText: string, intent: Intent) => {
    setMessages((m) => [...m, { id: newId(), role: 'user', text: userText }])
    setTyping(true)
    const started = Date.now()
    void sendToAssistant(userText, sessionId.current, intent).then(
      ({ reply, live: isLive }) => {
        // keep a minimum "typing" beat so instant canned replies feel human
        const wait = Math.max(0, 650 - (Date.now() - started))
        window.setTimeout(() => {
          setMessages((m) => [...m, { id: newId(), role: 'bot', text: reply }])
          setLive(isLive)
          setTyping(false)
        }, wait)
      },
    )
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput('')
    deliver(trimmed, 'chat')
  }

  const sendGreeting = () =>
    deliver('👋 ¡Hola Emi! Te mando un saludo.', 'greeting')

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <div>
            <p className="font-display text-base font-semibold leading-none">
              Asistente de Emi
            </p>
            <p className="font-mono text-[11px] text-faint">
              {live === true ? (
                <span className="text-glow-a">● conectado a n8n</span>
              ) : live === false && HAS_WEBHOOK ? (
                'modo demo · n8n fuera de línea'
              ) : live === false ? (
                'modo demo'
              ) : (
                'asistente personal'
              )}
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="glow inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm text-fg"
        >
          Volver <FiArrowUpRight size={15} />
        </Link>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border/70 bg-surface/40 p-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-br-sm bg-fg text-bg'
                  : 'rounded-bl-sm border border-border bg-bg text-fg'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-border bg-bg px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={sendGreeting}
          className="glow rounded-full border border-border px-3.5 py-1.5 text-sm text-fg"
        >
          👋 Mandarle un saludo
        </button>
        <button
          type="button"
          onClick={() => send('¿Emi busca trabajo?')}
          className="glow rounded-full border border-border px-3.5 py-1.5 text-sm text-muted"
        >
          ¿Busca trabajo?
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí algo…"
          aria-label="Mensaje"
          className="glow flex-1 rounded-full border border-border bg-surface/60 px-4 py-2.5 text-sm text-fg outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          aria-label="Enviar"
          className="glow flex h-11 w-11 items-center justify-center rounded-full border border-border text-fg"
        >
          <FiSend size={18} />
        </button>
      </form>
    </div>
  )
}
