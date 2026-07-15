import { TECH_MAP, type TechId } from '../data/tech'

interface TechChipProps {
  id: TechId
  showLabel?: boolean
  className?: string
}

/**
 * Monochrome tech badge (icon + optional label). Stays sober by default;
 * `data-tech` lets the orbit choreography find and light it up per project.
 */
export default function TechChip({ id, showLabel = true, className }: TechChipProps) {
  const tech = TECH_MAP[id]
  if (!tech) return null
  const Icon = tech.icon
  return (
    <span
      data-tech={id}
      className={`tech-chip inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-surface/40 px-2 py-1 font-mono text-[11px] text-muted transition-colors ${className ?? ''}`}
    >
      <Icon size={14} aria-hidden />
      {showLabel && <span>{tech.label}</span>}
    </span>
  )
}
