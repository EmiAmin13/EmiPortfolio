import { useRef, type ReactNode } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import Reveal from '../fx/Reveal'

interface SectionHeadingProps {
  index: string
  label: string
  title: ReactNode
  intro?: ReactNode
}

export default function SectionHeading({
  index,
  label,
  title,
  intro,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <div ref={ref} className="relative mb-12 max-w-3xl">
      {/* giant watermark number, drifting slower than the page */}
      <motion.span
        aria-hidden="true"
        style={reduced ? undefined : { y }}
        className="pointer-events-none absolute -top-24 right-0 select-none font-mono text-[9rem] font-bold leading-none text-fg opacity-[0.05] sm:-top-28 sm:text-[13rem]"
      >
        {index}
      </motion.span>

      <div className="relative">
        <Reveal>
          <p className="eyebrow mb-4 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-current opacity-40" />
            [ {index} · {label} ]
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            {title}
          </h2>
        </Reveal>
        {intro && (
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              {intro}
            </p>
          </Reveal>
        )}
      </div>
    </div>
  )
}
