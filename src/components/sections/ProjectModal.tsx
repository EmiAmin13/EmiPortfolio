import { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { AnimatePresence, motion } from 'motion/react'
import type { Project } from '../../data/projects'
import TechChip from '../TechChip'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive(0)
  }, [project])

  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/60 p-5">
              <div>
                <p className="eyebrow mb-1">{project.tagline}</p>
                <h3 className="font-display text-2xl font-semibold">
                  {project.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="glow flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="overflow-hidden rounded-xl border border-border/60 bg-surface">
                <img
                  src={project.previews[active]}
                  alt={`${project.title} — captura ${active + 1}`}
                  className="w-full object-contain"
                />
              </div>

              {project.previews.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {project.previews.map((p, i) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Captura ${i + 1}`}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border transition-colors ${
                        i === active
                          ? 'border-fg'
                          : 'border-border/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <p className="mt-5 text-sm leading-relaxed text-muted">
                {project.description}
              </p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <li key={t}>
                    <TechChip id={t} />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
