import { Fragment, useEffect, useRef } from 'react'
import { TECH_MAP, type TechId } from '../../data/tech'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { glowPair, lerpHex } from '../../lib/palette'

interface SectionDividerProps {
  index: string
  label: string
  /** Alternate base direction between consecutive dividers. */
  reverse?: boolean
  /** Techs whose icons appear interleaved in the ribbon. */
  icons?: TechId[]
}

const DEFAULT_ICONS: TechId[] = ['react', 'typescript', 'git', 'docker']
const BASE_SPEED = 42 // px/s ambient drift

/**
 * Draggable marquee ribbon between sections. Grab it and fling it:
 * it keeps rolling with inertia, and while it spins fast the whole
 * ribbon heats up with the live colors of the active theme, cooling
 * back to sober gray as it settles into its ambient drift.
 */
export default function SectionDivider({
  index,
  label,
  reverse = false,
  icons = DEFAULT_ICONS,
}: SectionDividerProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const w = wrap.current
    const el = track.current
    if (!w || !el) return

    const base = reverse ? -BASE_SPEED : BASE_SPEED
    const s = {
      offset: 0,
      vel: base,
      dx: 0,
      dragging: false,
      lastX: 0,
      half: 1,
      hot: 0,
    }

    const measure = () => {
      s.half = Math.max(el.scrollWidth / 2, 1)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)

    // live palette, refreshed on theme flips
    let ink = getComputedStyle(document.documentElement)
      .getPropertyValue('--faint')
      .trim()
    let [glowA, glowB] = glowPair()
    const mo = new MutationObserver(() => {
      ink = getComputedStyle(document.documentElement)
        .getPropertyValue('--faint')
        .trim()
      ;[glowA, glowB] = glowPair()
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    const onDown = (e: PointerEvent) => {
      s.dragging = true
      s.lastX = e.clientX
      w.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return
      s.dx += s.lastX - e.clientX
      s.lastX = e.clientX
    }
    const onUp = () => {
      s.dragging = false
    }
    w.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    let raf = 0
    let prev = performance.now()
    const loop = (t: number) => {
      const dt = Math.min((t - prev) / 1000, 0.05)
      prev = t
      if (s.dragging) {
        s.offset += s.dx
        if (dt > 0) s.vel = s.vel * 0.7 + (s.dx / dt) * 0.3
        s.dx = 0
      } else {
        s.offset += s.vel * dt
        // inertia decays back to the ambient drift
        s.vel = base + (s.vel - base) * (1 - Math.min(dt * 1.1, 0.1))
      }
      s.offset = ((s.offset % s.half) + s.half) % s.half
      el.style.transform = `translateX(${-s.offset}px)`

      // heat: excess speed over ambient tints the ribbon with live colors
      const excess = Math.abs(s.vel - base)
      const target = Math.min(Math.max((excess - 160) / 700, 0), 1)
      s.hot += (target - s.hot) * Math.min(dt * 4, 0.16)
      if (s.hot > 0.01) {
        el.style.color = lerpHex(ink, glowA, s.hot)
        el.style.textShadow = `0 0 ${Math.round(12 * s.hot)}px ${glowB}`
      } else {
        el.style.color = ''
        el.style.textShadow = ''
      }
      raf = requestAnimationFrame(loop)
    }
    if (!reduced) raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      w.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [reverse, reduced])

  const REPEATS = 6

  const half = (
    <div className="flex items-center gap-10 pr-10" aria-hidden="true">
      {Array.from({ length: REPEATS }, (_, i) => {
        const tech = TECH_MAP[icons[i % icons.length]]
        const Icon = tech.icon
        return (
          <Fragment key={i}>
            <span className="glow-text font-mono text-xs tracking-[0.3em]">
              [ {index} · {label} ]
            </span>
            <span className="text-sm opacity-60">✳</span>
            <Icon className="glow-text" size={16} />
            <span className="text-sm opacity-60">✳</span>
          </Fragment>
        )
      })}
    </div>
  )

  return (
    <div
      ref={wrap}
      className="marquee border-y border-border/40 bg-chrome/30 py-3.5 text-faint"
      role="separator"
      aria-label={`Sección ${index}: ${label}`}
    >
      <div ref={track} className="marquee-track">
        {half}
        {half}
      </div>
    </div>
  )
}
