import { Fragment } from 'react'
import { TECH_MAP, type TechId } from '../../data/tech'

interface SectionDividerProps {
  index: string
  label: string
  /** Alternate scroll direction between consecutive dividers. */
  reverse?: boolean
  /** Techs whose icons appear interleaved in the ribbon. */
  icons?: TechId[]
}

const DEFAULT_ICONS: TechId[] = ['react', 'typescript', 'git', 'docker']

/**
 * Marquee ribbon between sections: repeating mono label + tech icons
 * sliding in an infinite loop. Hover pauses the ribbon and lets items
 * bloom with the theme's live colors.
 */
export default function SectionDivider({
  index,
  label,
  reverse = false,
  icons = DEFAULT_ICONS,
}: SectionDividerProps) {
  const REPEATS = 6

  const half = (
    <div className="flex items-center gap-10 pr-10" aria-hidden="true">
      {Array.from({ length: REPEATS }, (_, i) => {
        const tech = TECH_MAP[icons[i % icons.length]]
        const Icon = tech.icon
        return (
          <Fragment key={i}>
            <span className="glow-text font-mono text-xs tracking-[0.3em] text-faint">
              [ {index} · {label} ]
            </span>
            <span className="text-faint/60 text-sm">✳</span>
            <Icon className="glow-text text-faint" size={16} />
            <span className="text-faint/60 text-sm">✳</span>
          </Fragment>
        )
      })}
    </div>
  )

  return (
    <div
      className="marquee border-y border-border/40 bg-chrome/30 py-3.5"
      data-reverse={reverse}
      role="separator"
      aria-label={`Sección ${index}: ${label}`}
    >
      <div className="marquee-track">
        {half}
        {half}
      </div>
    </div>
  )
}
