import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TECHS, TECH_MAP, type TechId } from '../../data/tech'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { flyTechToProjects } from '../../lib/flyToProjects'

export default function TechOrbit() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([])
  const centerIconRef = useRef<HTMLButtonElement>(null)
  const rotationRef = useRef(0)
  const pausedRef = useRef(false)
  const leaveTimer = useRef<number | undefined>(undefined)
  const [selected, setSelected] = useState<TechId | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const N = TECHS.length
    const layout = (dt: number) => {
      if (!pausedRef.current && !reduced) rotationRef.current += 0.00016 * dt
      const w = container.clientWidth
      const h = container.clientHeight
      const cx = w / 2
      const cy = h / 2
      const rx = Math.min(w * 0.44, w / 2 - 40)
      const ry = h * 0.4
      for (let i = 0; i < N; i++) {
        const el = chipRefs.current[i]
        if (!el) continue
        const th = (i / N) * Math.PI * 2 + rotationRef.current
        const x = cx + rx * Math.cos(th)
        const y = cy + ry * Math.sin(th)
        const depth = (Math.sin(th) + 1) / 2
        const scale = 0.72 + depth * 0.5
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`
        el.style.opacity = `${0.4 + depth * 0.6}`
        el.style.zIndex = `${Math.round(depth * 100)}`
      }
    }

    layout(0)
    if (reduced) return

    let raf = 0
    let prev = performance.now()
    let running = false
    const loop = (t: number) => {
      const dt = Math.min(t - prev, 48)
      prev = t
      layout(dt)
      if (running) raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (running) return
      running = true
      prev = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    // only spin while the orbit is on-screen (perf + lets the page settle)
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.05 },
    )
    io.observe(container)
    return () => {
      stop()
      io.disconnect()
    }
  }, [reduced])

  const onChipEnter = (id: TechId) => {
    window.clearTimeout(leaveTimer.current)
    pausedRef.current = true
    setSelected(id)
  }

  const onContainerLeave = () => {
    leaveTimer.current = window.setTimeout(() => {
      pausedRef.current = false
      setSelected(null)
    }, 180)
  }
  const onContainerEnterCancel = () => window.clearTimeout(leaveTimer.current)

  const launch = (id: TechId, el: HTMLElement | null) => {
    if (el) flyTechToProjects(id, el)
  }

  const SelectedIcon = selected ? TECH_MAP[selected].icon : null

  return (
    <>
      {/* -------- desktop / tablet: the orbit -------- */}
      <div
        ref={containerRef}
        onMouseLeave={onContainerLeave}
        onMouseEnter={onContainerEnterCancel}
        className="relative mx-auto hidden h-[420px] w-full max-w-4xl sm:block"
      >
        {/* faint elliptical guide */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-border/40" />

        {/* center panel */}
        <div className="pointer-events-none absolute inset-0 z-[120] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {selected && SelectedIcon && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -6 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <p className="eyebrow">Ver proyectos con:</p>
                <button
                  ref={centerIconRef}
                  type="button"
                  onClick={() => launch(selected, centerIconRef.current)}
                  aria-label={`Ver proyectos con ${TECH_MAP[selected].label}`}
                  className="pointer-events-auto grid h-20 w-20 place-items-center rounded-2xl border-2 bg-surface transition-transform hover:scale-105"
                  style={{
                    color: TECH_MAP[selected].color,
                    borderColor: TECH_MAP[selected].color,
                    boxShadow: `0 0 30px -6px ${TECH_MAP[selected].color}`,
                  }}
                >
                  <SelectedIcon size={40} />
                </button>
                <p className="font-display text-lg font-semibold">
                  {TECH_MAP[selected].label}
                </p>
                <p className="font-mono text-[11px] text-faint">click para resaltar</p>
              </motion.div>
            )}
            {!selected && (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-[220px] text-center font-mono text-xs leading-relaxed text-faint"
              >
                pasá el cursor por una tecnología
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* orbiting chips */}
        {TECHS.map((tech, i) => {
          const Icon = tech.icon
          const isSel = selected === tech.id
          return (
            <button
              key={tech.id}
              ref={(el) => {
                chipRefs.current[i] = el
              }}
              type="button"
              onMouseEnter={() => onChipEnter(tech.id)}
              onFocus={() => onChipEnter(tech.id)}
              onClick={(e) => {
                onChipEnter(tech.id)
                launch(tech.id, e.currentTarget)
              }}
              aria-label={`Ver proyectos con ${tech.label}`}
              className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-xl border bg-surface/70 backdrop-blur-sm transition-colors"
              style={{
                color: isSel ? tech.color : 'var(--muted)',
                borderColor: isSel ? tech.color : 'var(--border)',
                boxShadow: isSel ? `0 0 20px -4px ${tech.color}` : 'none',
              }}
            >
              <Icon size={22} />
            </button>
          )
        })}
      </div>

      {/* -------- mobile fallback: chip grid -------- */}
      <div className="grid grid-cols-4 gap-3 sm:hidden">
        {TECHS.map((tech) => {
          const Icon = tech.icon
          return (
            <button
              key={tech.id}
              type="button"
              onClick={(e) => launch(tech.id, e.currentTarget)}
              aria-label={`Ver proyectos con ${tech.label}`}
              className="glow grid aspect-square place-items-center rounded-xl border border-border bg-surface/60 text-muted"
            >
              <Icon size={22} />
            </button>
          )
        })}
      </div>
    </>
  )
}
