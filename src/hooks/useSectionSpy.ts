import { useEffect, useSyncExternalStore } from 'react'

export const SECTION_IDS = ['sobre-mi', 'skills', 'proyectos', 'contacto'] as const
export type SectionId = (typeof SECTION_IDS)[number]

/* Tiny shared store: one observer feeds both the <html data-section> attribute
 * (background morph via CSS) and the navbar scroll-spy. */
let current: SectionId = 'sobre-mi'
const listeners = new Set<() => void>()

function setCurrent(id: SectionId) {
  if (id === current) return
  current = id
  document.documentElement.setAttribute('data-section', id)
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/**
 * Mount once (Home). Watches which section crosses the viewport's center
 * band and publishes it. Cleans the attribute on unmount (e.g. /asistente).
 */
export function useSectionObserver() {
  useEffect(() => {
    document.documentElement.setAttribute('data-section', current)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(e.target.id as SectionId)
        }
      },
      // only the band around the viewport center counts as "active"
      { rootMargin: '-40% 0px -55% 0px' },
    )
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => {
      io.disconnect()
      document.documentElement.removeAttribute('data-section')
    }
  }, [])
}

/** Subscribe to the active section (navbar indicator). */
export function useActiveSection(): SectionId {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => 'sobre-mi' as SectionId,
  )
}
