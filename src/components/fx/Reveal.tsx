import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'li' | 'section'
}

/** Simple scroll-into-view reveal. Falls back to static under reduced motion. */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: RevealProps) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
