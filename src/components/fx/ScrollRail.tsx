import { AnimatePresence, motion, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { useActiveSection, type SectionId } from '../../hooks/useSectionSpy'
import { glowPair, lerpHex } from '../../lib/palette'

const STOPS: Array<{ id: SectionId; n: string; label: string }> = [
  { id: 'sobre-mi', n: '001', label: 'Sobre mí' },
  { id: 'skills', n: '002', label: 'Skills / Stack' },
  { id: 'proyectos', n: '003', label: 'Proyectos' },
  { id: 'contacto', n: '004', label: 'Contacto' },
]

/**
 * Side scroll rail (desktop): hairline track with a live-gradient fill
 * showing reading progress, plus one node per section. Each node owns
 * its own stop along the theme's glow gradient (night: green at the
 * top → blue at Contacto; day: crimson → coral), so the active color
 * travels with you down the page.
 */
export default function ScrollRail() {
  const { scrollYProgress } = useScroll()
  const active = useActiveSection()
  const [hovered, setHovered] = useState<SectionId | null>(null)
  const [[glowA, glowB], setGlow] = useState<[string, string]>(glowPair)

  useEffect(() => {
    const mo = new MutationObserver(() => setGlow(glowPair()))
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => mo.disconnect()
  }, [])

  return (
    <div
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center lg:flex"
      aria-label="Progreso de la página"
    >
      <span className="mb-3 font-mono text-[10px] tracking-widest text-faint [writing-mode:vertical-rl]">
        SCROLL
      </span>

      <div className="relative flex h-64 flex-col items-center justify-between py-1">
        {/* track + progress fill */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/50" />
        <motion.div
          className="absolute inset-y-0 left-1/2 w-px origin-top -translate-x-1/2"
          style={{
            scaleY: scrollYProgress,
            background: 'linear-gradient(180deg, var(--glow-a), var(--glow-b))',
            boxShadow: '0 0 8px var(--glow-a)',
          }}
        />

        {STOPS.map((stop, i) => {
          const isActive = active === stop.id
          const isHovered = hovered === stop.id
          // this node's own stop along the live gradient
          const stopColor = lerpHex(glowA, glowB, i / (STOPS.length - 1))
          return (
            <div key={stop.id} className="relative">
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.span
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.18 }}
                    className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] tracking-wider"
                    style={{ color: isHovered ? stopColor : 'var(--faint)' }}
                  >
                    [{stop.n}] {isHovered ? stop.label : ''}
                  </motion.span>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={() =>
                  document
                    .getElementById(stop.id)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                onMouseEnter={() => setHovered(stop.id)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`Ir a ${stop.label}`}
                className="relative z-10 block h-3 w-3 rounded-full border"
                animate={{
                  scale: isHovered ? 1.7 : isActive ? 1.35 : 1,
                  backgroundColor: isActive ? stopColor : 'var(--bg)',
                  borderColor: isActive || isHovered ? stopColor : 'var(--border)',
                  boxShadow: isActive
                    ? `0 0 10px ${stopColor}`
                    : isHovered
                      ? `0 0 8px ${stopColor}`
                      : '0 0 0px transparent',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
