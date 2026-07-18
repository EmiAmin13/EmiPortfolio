import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiSend, FiX } from 'react-icons/fi'
import Logo from '../components/layout/Logo'
import {
  HAS_WEBHOOK,
  INTRO,
  newId,
  sendToAssistant,
  type AssistantData,
  type ChatMessage,
  type GreetingData,
  type Intent,
  type LeadData,
  type NivelProyecto,
  type TipoProyecto,
} from '../components/assistant/engine'

type Flow =
  | { type: 'greeting'; step: 'nombre' | 'apellido' | 'mensaje'; data: Partial<GreetingData> }
  | {
      type: 'lead'
      step: 'tipo' | 'nivel' | 'nombre' | 'apellido' | 'contacto' | 'consent'
      data: Partial<LeadData>
    }

const TIPOS: { value: TipoProyecto; label: string }[] = [
  { value: 'landing', label: 'Landing / web simple' },
  { value: 'ecommerce', label: 'E-commerce / tienda' },
  { value: 'sistema_a_medida', label: 'Sistema a medida' },
]

const NIVELES: { value: NivelProyecto; label: string }[] = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'full', label: 'Full (diseño + animaciones)' },
]

/** Acepta un mail o un teléfono (≥ 7 dígitos, admite +, espacios y guiones). */
const contactoValido = (v: string) => {
  const t = v.trim()
  const esMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
  const esTel = /^[+()\d][\d\s()-]{6,}$/.test(t)
  return esMail || esTel
}

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [live, setLive] = useState<boolean | null>(null)
  const [flow, setFlow] = useState<Flow | null>(null)
  const sessionId = useRef(`s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, typing])

  const pushUser = (text: string) =>
    setMessages((m) => [...m, { id: newId(), role: 'user', text }])
  const pushBot = (text: string) =>
    setMessages((m) => [...m, { id: newId(), role: 'bot', text }])

  /** Envía a n8n (chat o cierre de flujo guiado) y muestra la respuesta. */
  const deliver = (userText: string, intent: Intent, data?: AssistantData) => {
    if (userText) pushUser(userText)
    setTyping(true)
    const started = Date.now()
    void sendToAssistant(userText, sessionId.current, intent, data).then(
      ({ reply, live: isLive }) => {
        const wait = Math.max(0, 650 - (Date.now() - started))
        window.setTimeout(() => {
          pushBot(reply)
          setLive(isLive)
          setTyping(false)
        }, wait)
      },
    )
  }

  const cancelFlow = () => {
    setFlow(null)
    pushBot('Listo, lo dejamos acá. Si querés, arrancamos de nuevo cuando quieras. 🙂')
  }

  // ---- Arranque de flujos ----
  const startGreeting = () => {
    setFlow({ type: 'greeting', step: 'nombre', data: {} })
    pushBot('¡Genial! Se lo hago llegar a Emi. ¿Cómo te llamás? (tu nombre)')
  }

  const startLead = () => {
    setFlow({ type: 'lead', step: 'tipo', data: {} })
    pushBot('¡Buenísimo! ¿Qué tipo de proyecto tenés en mente?')
  }

  // ---- Botones de tipo (paso lead/tipo) ----
  const chooseTipo = (t: { value: TipoProyecto; label: string }) => {
    if (!flow || flow.type !== 'lead') return
    pushUser(t.label)
    setFlow({ type: 'lead', step: 'nivel', data: { ...flow.data, tipo: t.value } })
    pushBot('¿Y qué nivel de detalle buscás?')
  }

  // ---- Botones de nivel (paso lead/nivel) ----
  const chooseNivel = (n: { value: NivelProyecto; label: string }) => {
    if (!flow || flow.type !== 'lead') return
    pushUser(n.label)
    setFlow({ type: 'lead', step: 'nombre', data: { ...flow.data, nivel: n.value } })
    pushBot('Perfecto. ¿Cómo es tu nombre?')
  }

  // ---- Botones de consentimiento (paso lead/consent) ----
  const acceptConsent = () => {
    if (!flow || flow.type !== 'lead') return
    pushUser('Acepto')
    const d = flow.data as LeadData
    setFlow(null)
    deliver('', 'lead', { ...d, avisoAceptado: true })
  }
  const rejectConsent = () => {
    if (!flow || flow.type !== 'lead') return
    pushUser('No acepto')
    setFlow(null)
    pushBot(
      'Sin problema, no guardo nada. Si más adelante querés que AMN te contacte, ' +
        'volvé cuando quieras. 🙂',
    )
  }

  // ---- Entrada de texto: enruta al flujo activo o al chat libre ----
  const handleText = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    setInput('')

    if (!flow) {
      deliver(text, 'chat')
      return
    }

    pushUser(text)

    if (flow.type === 'greeting') {
      const d = flow.data
      if (flow.step === 'nombre') {
        setFlow({ ...flow, step: 'apellido', data: { ...d, nombre: text } })
        pushBot('¿Y tu apellido?')
      } else if (flow.step === 'apellido') {
        setFlow({ ...flow, step: 'mensaje', data: { ...d, apellido: text } })
        pushBot('¿Qué mensaje querés dejarle a Emi?')
      } else if (flow.step === 'mensaje') {
        const full = { ...d, mensaje: text } as GreetingData
        setFlow(null)
        deliver('', 'greeting', full)
      }
      return
    }

    // flow.type === 'lead'
    const d = flow.data
    if (flow.step === 'nombre') {
      setFlow({ ...flow, step: 'apellido', data: { ...d, nombre: text } })
      pushBot('¿Y tu apellido?')
    } else if (flow.step === 'apellido') {
      setFlow({ ...flow, step: 'contacto', data: { ...d, apellido: text } })
      pushBot('¿A qué contacto te pueden escribir? (un mail o un teléfono)')
    } else if (flow.step === 'contacto') {
      if (!contactoValido(text)) {
        pushBot(
          'Mmm, eso no parece un mail ni un teléfono válido. Probá de nuevo — ' +
            'un mail (nombre@dominio.com) o un teléfono con al menos 7 dígitos.',
        )
        return
      }
      setFlow({ ...flow, step: 'consent', data: { ...d, contacto: text } })
      pushBot(
        'Antes de seguir, algo importante: tus datos (nombre, apellido y contacto) ' +
          'se van a compartir con AMN, el estudio con el que trabaja Emi, para que ' +
          'se comuniquen con vos. ¿Estás de acuerdo?',
      )
    }
    // el paso 'consent' se resuelve con los botones Acepto / No acepto
  }

  const showTipoButtons = flow?.type === 'lead' && flow.step === 'tipo'
  const showNivelButtons = flow?.type === 'lead' && flow.step === 'nivel'
  const showConsentButtons = flow?.type === 'lead' && flow.step === 'consent'
  const inputDisabled = showTipoButtons || showNivelButtons || showConsentButtons

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

      {/* Acciones contextuales */}
      <div className="mt-3 flex flex-wrap gap-2">
        {showTipoButtons ? (
          TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => chooseTipo(t)}
              className="glow rounded-full border border-border px-3.5 py-1.5 text-sm text-fg"
            >
              {t.label}
            </button>
          ))
        ) : showNivelButtons ? (
          NIVELES.map((n) => (
            <button
              key={n.value}
              type="button"
              onClick={() => chooseNivel(n)}
              className="glow rounded-full border border-border px-3.5 py-1.5 text-sm text-fg"
            >
              {n.label}
            </button>
          ))
        ) : showConsentButtons ? (
          <>
            <button
              type="button"
              onClick={acceptConsent}
              className="glow rounded-full border border-border bg-fg px-3.5 py-1.5 text-sm text-bg"
            >
              ✓ Acepto
            </button>
            <button
              type="button"
              onClick={rejectConsent}
              className="glow rounded-full border border-border px-3.5 py-1.5 text-sm text-muted"
            >
              No acepto
            </button>
          </>
        ) : flow ? (
          <button
            type="button"
            onClick={cancelFlow}
            className="glow inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm text-muted"
          >
            <FiX size={14} /> Cancelar
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={startGreeting}
              className="glow rounded-full border border-border px-3.5 py-1.5 text-sm text-fg"
            >
              👋 Mandarle un saludo
            </button>
            <button
              type="button"
              onClick={startLead}
              className="glow rounded-full border border-border px-3.5 py-1.5 text-sm text-fg"
            >
              💼 Quiero un proyecto
            </button>
          </>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleText(input)
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={inputDisabled}
          placeholder={
            showTipoButtons
              ? 'Elegí un tipo de arriba…'
              : showNivelButtons
                ? 'Elegí un nivel de arriba…'
                : showConsentButtons
                  ? 'Respondé con los botones de arriba…'
                  : flow
                    ? 'Escribí tu respuesta…'
                    : 'Escribí algo…'
          }
          aria-label="Mensaje"
          className="glow flex-1 rounded-full border border-border bg-surface/60 px-4 py-2.5 text-sm text-fg outline-none placeholder:text-faint disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={inputDisabled}
          aria-label="Enviar"
          className="glow flex h-11 w-11 items-center justify-center rounded-full border border-border text-fg disabled:opacity-50"
        >
          <FiSend size={18} />
        </button>
      </form>
    </div>
  )
}
