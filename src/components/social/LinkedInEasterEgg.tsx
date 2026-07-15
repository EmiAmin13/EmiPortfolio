import { useCallback, useEffect, useRef, useState } from 'react'
import { FiLinkedin } from 'react-icons/fi'
import { AnimatePresence, motion } from 'motion/react'

const MESSAGES = [
  'No estoy buscando trabajo...',
  'No me molestes... estoy ocupado.',
  'Si necesitás algo, hablá con mi asistente.',
  'En serio, hablá con el asistente 👇',
]

export default function LinkedInEasterEgg() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [hot, setHot] = useState(false)
  const hotTimer = useRef<number | undefined>(undefined)
  const msgTimer = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      window.clearTimeout(hotTimer.current)
      window.clearTimeout(msgTimer.current)
    },
    [],
  )

  const handleClick = useCallback(() => {
    setCount((c) => {
      const next = c + 1
      if (next >= 3) {
        window.dispatchEvent(new CustomEvent('nudge-assistant'))
      }
      return next
    })
    // hot = big + red; snaps back to normal (size and color together)
    setHot(true)
    window.clearTimeout(hotTimer.current)
    hotTimer.current = window.setTimeout(() => setHot(false), 1100)
    // message stays just long enough to read, then leaves
    setOpen(true)
    window.clearTimeout(msgTimer.current)
    msgTimer.current = window.setTimeout(() => setOpen(false), 2200)
  }, [])

  const msgIndex = Math.min(count === 0 ? 0 : count - 1, MESSAGES.length - 1)

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="absolute bottom-full left-1/2 mb-3 w-52 -translate-x-1/2 rounded-xl border px-3 py-2 text-center text-xs font-medium shadow-lg"
            style={{
              background: '#b5303f',
              borderColor: '#e0808f',
              color: '#fff',
              transformOrigin: 'bottom center',
            }}
          >
            {MESSAGES[msgIndex]}
            <span
              className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45"
              style={{ background: '#b5303f' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleClick}
        aria-label="LinkedIn"
        className="flex h-10 w-10 items-center justify-center rounded-full border bg-surface"
        animate={{
          scale: hot ? 1.35 : 1,
          borderColor: hot ? '#b5303f' : 'var(--border)',
          color: hot ? '#ff5a6a' : 'var(--muted)',
          rotate: hot ? [0, -8, 8, -4, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: hot ? 1.4 : 1.12 }}
      >
        <FiLinkedin size={18} />
      </motion.button>
    </div>
  )
}
