import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { pickLive } from '../../lib/palette'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  color: string
}

/**
 * Full-screen additive particle trail that follows the cursor and fades.
 * Colors come from the active theme's live palette. Disabled under
 * reduced-motion and on coarse (touch) pointers.
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx: CanvasRenderingContext2D = context

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    const resize = () => {
      w = canvas.width = window.innerWidth * dpr
      h = canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []
    let lastX = 0
    let lastY = 0
    let lastSpawn = 0
    let raf = 0
    let running = false
    let prev = performance.now()

    const start = () => {
      if (running) return
      running = true
      prev = performance.now()
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      const x = e.clientX * dpr
      const y = e.clientY * dpr
      const dx = x - lastX
      const dy = y - lastY
      const dist = Math.hypot(dx, dy)
      if (now - lastSpawn > 8 && dist > 1.5) {
        const count = Math.min(3, 1 + Math.floor(dist / 45))
        for (let i = 0; i < count; i++) {
          const t = Math.random()
          particles.push({
            x: x - dx * t,
            y: y - dy * t,
            vx: (Math.random() - 0.5) * 0.5 * dpr,
            vy: ((Math.random() - 0.5) * 0.5 - 0.15) * dpr,
            life: 0,
            max: 420 + Math.random() * 300,
            size: (1.6 + Math.random() * 3) * dpr,
            color: pickLive(),
          })
        }
        lastSpawn = now
        if (particles.length > 320) particles.splice(0, particles.length - 320)
      }
      lastX = x
      lastY = y
      start()
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    function loop(time: number) {
      const dt = Math.min(time - prev, 48)
      prev = time
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life += dt
        if (p.life >= p.max) {
          particles.splice(i, 1)
          continue
        }
        p.x += p.vx * dt * 0.06
        p.y += p.vy * dt * 0.06
        const k = 1 - p.life / p.max
        ctx.globalAlpha = k * 0.85
        ctx.shadowBlur = 12 * dpr
        ctx.shadowColor = p.color
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * k + 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      ctx.globalCompositeOperation = 'source-over'
      // idle out when nothing left to draw so the page can settle
      if (particles.length === 0) {
        running = false
        return
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  if (reduced) return null
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden="true"
    />
  )
}
