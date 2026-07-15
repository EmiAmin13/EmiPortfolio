import gsap from 'gsap'
import { PROJECTS_BY_TECH } from '../data/projects'
import { TECH_MAP, type TechId } from '../data/tech'
import { highlightColor } from './palette'

interface Point {
  x: number
  y: number
}

function toast(message: string) {
  const el = document.createElement('div')
  el.className = 'emi-toast'
  el.textContent = message
  document.body.appendChild(el)
  gsap.fromTo(
    el,
    { opacity: 0, y: 10 },
    {
      opacity: 1,
      y: 0,
      duration: 0.3,
      onComplete: () => {
        gsap.to(el, {
          opacity: 0,
          y: 8,
          delay: 1.6,
          duration: 0.4,
          onComplete: () => el.remove(),
        })
      },
    },
  )
}

function makeClone(originEl: HTMLElement, color: string, at: Point): HTMLElement {
  const rect = originEl.getBoundingClientRect()
  const clone = document.createElement('div')
  clone.className = 'fly-clone'
  clone.innerHTML = originEl.innerHTML
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.left = `${at.x}px`
  clone.style.top = `${at.y}px`
  clone.style.color = color
  clone.style.background = 'var(--surface)'
  clone.style.border = `1px solid ${color}`
  clone.style.boxShadow = `0 0 22px -4px ${color}`
  document.body.appendChild(clone)
  // gsap owns the transform; keep it centered on the point while x/y animate
  gsap.set(clone, { xPercent: -50, yPercent: -50 })
  return clone
}

function sparkle(point: Point, color: string) {
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('div')
    s.className = 'fly-spark'
    s.style.left = `${point.x}px`
    s.style.top = `${point.y}px`
    s.style.background = color
    s.style.boxShadow = `0 0 8px ${color}`
    document.body.appendChild(s)
    const angle = Math.random() * Math.PI * 2
    const dist = 30 + Math.random() * 60
    gsap.to(s, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      scale: 0.2,
      duration: 0.5 + Math.random() * 0.3,
      ease: 'power2.out',
      onComplete: () => s.remove(),
    })
  }
}

function lightCard(projectId: string, techId: TechId, color: string) {
  const card = document.getElementById(`project-${projectId}`)
  if (!card) return
  card.style.setProperty('--hl', color)
  card.classList.add('card-highlight')
  const chip = card.querySelector<HTMLElement>(`[data-tech="${techId}"]`)
  if (chip) {
    chip.style.setProperty('--hl', color)
    chip.classList.add('chip-lit')
  }
  window.setTimeout(() => {
    card.classList.remove('card-highlight')
    chip?.classList.remove('chip-lit')
  }, 1800)
}

/** Center of an element in DOCUMENT space (scroll-invariant). */
function centerOf(el: Element): Point {
  const r = el.getBoundingClientRect()
  return {
    x: r.left + r.width / 2 + window.scrollX,
    y: r.top + r.height / 2 + window.scrollY,
  }
}

/**
 * Fly a tech icon from its origin (orbit center or an orbiting chip) to
 * every project card that uses it. Everything is computed in document
 * coordinates and the clones are absolutely positioned, so the flight
 * stays glued to the page while it smooth-scrolls to the projects — no
 * drift if the user scrolls mid-animation.
 */
export function flyTechToProjects(techId: TechId, originEl: HTMLElement) {
  const projectIds = PROJECTS_BY_TECH[techId] ?? []
  const color = highlightColor(TECH_MAP[techId].color)

  if (projectIds.length === 0) {
    gsap.to(originEl, {
      keyframes: [{ x: -6 }, { x: 6 }, { x: -4 }, { x: 0 }],
      duration: 0.4,
    })
    toast('Sin proyectos con esta tech… todavía')
    return
  }

  const start = centerOf(originEl)
  const clones = projectIds.map(() => makeClone(originEl, color, start))

  document
    .getElementById('proyectos')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // document coords → stable regardless of the ongoing smooth scroll
  const targets: Point[] = projectIds.map((id) => {
    const card = document.getElementById(`project-${id}`)
    return card ? centerOf(card) : start
  })
  const mid: Point = {
    x: targets.reduce((s, t) => s + t.x, 0) / targets.length,
    y: targets.reduce((s, t) => s + t.y, 0) / targets.length - 40,
  }

  const tl = gsap.timeline({ delay: 0.08 })
  // leg 1: all clones converge to a shared midpoint (reads as one icon)
  clones.forEach((c) => {
    tl.to(
      c,
      {
        x: mid.x - start.x,
        y: mid.y - start.y,
        scale: 0.85,
        duration: 0.5,
        ease: 'power2.in',
      },
      0,
    )
  })
  // leg 2: fan out to each card, lighting it up on arrival
  clones.forEach((c, i) => {
    const t = targets[i]
    tl.to(
      c,
      {
        x: t.x - start.x,
        y: t.y - start.y,
        scale: 1.1,
        duration: 0.55,
        ease: 'power2.out',
        onComplete: () => {
          lightCard(projectIds[i], techId, color)
          sparkle(t, color)
          gsap.to(c, {
            opacity: 0,
            scale: 0.4,
            duration: 0.3,
            delay: 0.05,
            onComplete: () => c.remove(),
          })
        },
      },
      0.5,
    )
  })
}
