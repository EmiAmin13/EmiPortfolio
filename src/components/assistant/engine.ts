export interface ChatMessage {
  id: string
  role: 'bot' | 'user'
  text: string
}

const WORK = [
  'Emi ya tiene trabajo. Y estudios. Y un perro. La agenda está… completa.',
  '¿Trabajo? Mirá, justo está en modo "no molestar hasta recibirme".',
  'Le paso tu mensaje… al fondo de la cola. Muy al fondo.',
]
const PRICE = [
  'Presupuestos: cerrado por vacaciones mentales indefinidas.',
  'El precio es "no, gracias" — pero dicho con mucho cariño.',
]
const GENERIC = [
  'Interesante. Igual sigue ocupado.',
  'Anotado. Prioridad: baja. Muy baja.',
  'Te leo, pero Emi no. Está compilando su vida.',
]

const random = (a: string[]) => a[Math.floor(Math.random() * a.length)]

let counter = 0
export const newId = () => `m${Date.now()}-${counter++}`

export function botReply(input: string): string {
  const t = input.toLowerCase()
  if (/(hola|buenas|hey|holi|qué tal|que tal)/.test(t))
    return '¡Hola! Soy el asistente de Emi. Él está… ocupado. Muy ocupado. ¿En qué NO puedo ayudarte hoy?'
  if (/(trabajo|contrat|empleo|puesto|vacante|cv|entrevista|reclut|linkedin)/.test(t))
    return random(WORK)
  if (/(precio|presupuesto|cotiz|freelance|proyecto|pagar)/.test(t))
    return random(PRICE)
  if (/(saludo|saludar|mandar|hola a emi)/.test(t))
    return 'Eso sí puedo. Tocá "Mandarle un saludo" y se lo hago llegar. Sin reuniones, sin "¿tenés 5 minutos?".'
  if (/(gracias|genial|jaja|jeje|crack)/.test(t))
    return '👏 Un placer no ayudarte. Volvé cuando quieras.'
  return random(GENERIC)
}

export const GREETING_SENT =
  'Saludo enviado. (Bueno… casi: todavía no conecté el n8n de verdad, pero la intención ya viaja.)'

export const LEAD_SENT =
  'Datos anotados. (En modo demo no viajan a ningún lado todavía, pero cuando el n8n esté conectado, AMN te contacta.)'

/* ------------------------------------------------------------------ *
 * Live transport — if VITE_N8N_WEBHOOK_URL is configured, messages go
 * to the n8n workflow; any failure (offline, timeout, bad shape)
 * falls back to the canned brain above so the chat never breaks.
 * ------------------------------------------------------------------ */
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined

/** Whether a live n8n webhook is configured for this build. */
export const HAS_WEBHOOK = Boolean(WEBHOOK_URL)

export type Intent = 'chat' | 'greeting' | 'lead'

/** Datos que junta el flujo guiado de saludo antes de enviarlo a n8n. */
export interface GreetingData {
  nombre: string
  apellido: string
  mensaje: string
}

/** Qué es el proyecto. */
export type TipoProyecto = 'landing' | 'ecommerce' | 'sistema_a_medida'
/** Cuánto esfuerzo/detalle lleva. */
export type NivelProyecto = 'basico' | 'intermedio' | 'full'

/** Datos que junta el flujo guiado de interesado en un proyecto. */
export interface LeadData {
  tipo: TipoProyecto
  nivel: NivelProyecto
  nombre: string
  apellido: string
  contacto: string
  /** Sólo lo pone el botón "Acepto" — nunca se infiere de texto libre. */
  avisoAceptado: boolean
  resumen?: string
}

export type AssistantData = GreetingData | LeadData

export interface AssistantResult {
  reply: string
  /** true when the reply came from n8n, false when canned fallback. */
  live: boolean
}

export async function sendToAssistant(
  text: string,
  sessionId: string,
  intent: Intent = 'chat',
  data?: AssistantData,
): Promise<AssistantResult> {
  if (WEBHOOK_URL) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId, intent, data }),
        signal: ctrl.signal,
      })
      clearTimeout(timer)
      if (res.ok) {
        const data: unknown = await res.json()
        const reply = extractReply(data)
        if (reply) return { reply, live: true }
      }
    } catch {
      /* fall through to canned */
    }
  }
  return {
    reply:
      intent === 'greeting'
        ? GREETING_SENT
        : intent === 'lead'
          ? LEAD_SENT
          : botReply(text),
    live: false,
  }
}

/** n8n can answer {reply} or [{reply}] depending on the workflow setup. */
function extractReply(data: unknown): string | null {
  if (Array.isArray(data)) return extractReply(data[0])
  if (data && typeof data === 'object' && 'reply' in data) {
    const r = (data as { reply: unknown }).reply
    if (typeof r === 'string' && r.trim()) return r
  }
  return null
}

export const INTRO: ChatMessage = {
  id: 'intro',
  role: 'bot',
  text: 'Hola 👋 Soy el asistente de Emi. Spoiler: está ocupado y no busca trabajo. Pero podés dejarle un saludo — eso sí lo acepta.',
}
