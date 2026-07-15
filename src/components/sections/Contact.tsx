import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMessageSquare } from 'react-icons/fi'
import { motion } from 'motion/react'
import SectionHeading from '../layout/SectionHeading'
import Reveal from '../fx/Reveal'

export default function Contact() {
  const [pulsing, setPulsing] = useState(false)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const onNudge = () => {
      setPulsing(true)
      ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.setTimeout(() => setPulsing(false), 2600)
    }
    window.addEventListener('nudge-assistant', onNudge)
    return () => window.removeEventListener('nudge-assistant', onNudge)
  }, [])

  return (
    <section
      id="contacto"
      className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8"
    >
      <SectionHeading
        index="004"
        label="CONTACTO"
        title={
          <>
            Hablá con mi <span className="glow-text">asistente</span>.
          </>
        }
        intro="No estoy buscando trabajo (en serio). Pero armé un asistente para que la charla sea más entretenida. Contale lo que quieras — o simplemente dejame un saludo."
      />

      <Reveal>
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-border/70 bg-surface/50 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <p className="font-display text-2xl font-semibold">
              ¿Charlamos? Bueno, charla con él.
            </p>
            <p className="mt-2 text-muted">
              Responde por mí, con humor y sin agenda. Spoiler: va a decirte que
              estoy ocupado.
            </p>
          </div>

          <motion.div
            animate={
              pulsing
                ? { scale: [1, 1.06, 1], transition: { repeat: 3, duration: 0.5 } }
                : { scale: 1 }
            }
          >
            <Link
              ref={ctaRef}
              to="/asistente"
              className="glow inline-flex items-center gap-2.5 rounded-full border-2 px-6 py-3.5 text-base font-semibold"
              style={
                pulsing
                  ? {
                      borderColor: 'var(--glow-a)',
                      boxShadow:
                        '0 0 0 3px color-mix(in srgb, var(--glow-a) 40%, transparent), 0 0 40px -6px var(--glow-b)',
                    }
                  : { borderColor: 'var(--border)' }
              }
            >
              <FiMessageSquare size={20} />
              Hablar con el asistente
            </Link>
          </motion.div>
        </div>
      </Reveal>
    </section>
  )
}
