/** Runtime access to the "live" interaction palette + theme, read from CSS vars. */

export type ThemeName = 'day' | 'night'

export function currentTheme(): ThemeName {
  if (typeof document === 'undefined') return 'night'
  return document.documentElement.getAttribute('data-theme') === 'day'
    ? 'day'
    : 'night'
}

/** The set of accent colors for cursor trail + hover fx in the active theme. */
export function livePalette(): string[] {
  if (typeof document === 'undefined') return ['#29ed22', '#0047ab']
  const s = getComputedStyle(document.documentElement)
  const vals = ['--live-1', '--live-2', '--live-3', '--live-4']
    .map((v) => s.getPropertyValue(v).trim())
    .filter(Boolean)
  return [...new Set(vals)]
}

export function pickLive(): string {
  const p = livePalette()
  return p[Math.floor(Math.random() * p.length)] ?? '#29ed22'
}

/** The two glow accents of the active theme. */
export function glowPair(): [string, string] {
  if (typeof document === 'undefined') return ['#29ed22', '#0047ab']
  const s = getComputedStyle(document.documentElement)
  return [
    s.getPropertyValue('--glow-a').trim() || '#29ed22',
    s.getPropertyValue('--glow-b').trim() || '#0047ab',
  ]
}

/** Linear #rrggbb interpolation, t in 0..1. */
export function lerpHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.replace('#', ''), 16)
  const pb = parseInt(b.replace('#', ''), 16)
  const ch = (sa: number, sb: number) => Math.round(sa + (sb - sa) * t)
  const r = ch((pa >> 16) & 255, (pb >> 16) & 255)
  const g = ch((pa >> 8) & 255, (pb >> 8) & 255)
  const bl = ch(pa & 255, pb & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`
}

/** Relative luminance (0..1) of a #rrggbb color. */
export function luminance(hex: string): number {
  const c = hex.replace('#', '')
  if (c.length < 6) return 0.5
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  const lin = (v: number) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/**
 * A brand color guaranteed to read against the current background.
 * Near-black brands (Vercel/OpenCode) on night, near-white on day, fall
 * back to the active glow accent.
 */
export function highlightColor(brand: string): string {
  const theme = currentTheme()
  const lum = luminance(brand)
  if (theme === 'night' && lum < 0.08) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--glow-a')
      .trim()
  }
  if (theme === 'day' && lum > 0.9) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--glow-a')
      .trim()
  }
  return brand
}
