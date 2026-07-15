import { useEffect, useState } from 'react'
import { FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi'
import { AnimatePresence, motion, useScroll } from 'motion/react'
import { useTheme } from '../../context/ThemeContext'
import { useActiveSection, type SectionId } from '../../hooks/useSectionSpy'
import Logo from './Logo'

const NAV: Array<{ label: string; id: SectionId }> = [
  { label: 'Sobre mí', id: 'sobre-mi' },
  { label: 'Skills / Stack', id: 'skills' },
  { label: 'Proyectos', id: 'proyectos' },
]

export default function Header() {
  const { theme, toggle } = useTheme()
  const active = useActiveSection()
  const [compact, setCompact] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-3">
        <motion.nav
          layout
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className={`relative flex items-center gap-1 rounded-full border border-border/60 bg-chrome/75 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md ${
            compact ? 'px-2 py-1.5' : 'px-3 py-2'
          }`}
          aria-label="Navegación principal"
        >
          {/* brand */}
          <a
            href="#top"
            aria-label="Inicio — Emi"
            className="group flex items-center gap-2 rounded-full px-2 py-1"
          >
            <Logo className="logo-fx h-6 w-6" />
            {!compact && (
              <motion.span
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden font-display text-base font-semibold tracking-tight sm:inline"
              >
                Emi&nbsp;:)
              </motion.span>
            )}
          </a>

          {/* section links + sliding indicator */}
          <div className="hidden items-center md:flex">
            {NAV.map((item) => {
              const isActive = active === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`nav-glow relative rounded-full px-3.5 py-1.5 text-sm font-medium ${
                    isActive ? 'text-fg' : 'text-muted'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full border border-border/70 bg-surface"
                      style={{
                        boxShadow:
                          '0 0 14px -5px var(--glow-a), inset 0 0 8px -6px var(--glow-b)',
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              )
            })}
          </div>

          <span className="mx-1 hidden h-5 w-px bg-border/60 md:block" />

          {/* contact, apart from the rest */}
          <a
            href="#contacto"
            className={`glow hidden rounded-full border border-border px-4 py-1.5 text-sm font-medium md:inline-block ${
              active === 'contacto' ? 'border-glow-a text-fg' : 'text-fg'
            }`}
          >
            Contacto
          </a>

          {/* theme toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'day' ? 'Activar modo noche' : 'Activar modo día'}
            className="glow flex h-9 w-9 items-center justify-center rounded-full border border-border text-fg"
          >
            {theme === 'day' ? <FiMoon size={16} /> : <FiSun size={16} />}
          </button>

          {/* mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="glow flex h-9 w-9 items-center justify-center rounded-full border border-border text-fg md:hidden"
          >
            <FiMenu size={16} />
          </button>

          {/* reading progress hairline */}
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px overflow-hidden rounded-full">
            <motion.div
              className="h-full w-full origin-left"
              style={{
                scaleX: scrollYProgress,
                background:
                  'linear-gradient(90deg, var(--glow-a), var(--glow-b))',
              }}
            />
          </div>
        </motion.nav>
      </header>

      {/* mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col bg-bg/95 backdrop-blur-lg md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
          >
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2">
                <Logo className="h-7 w-7" />
                <span className="font-display text-lg font-semibold">Emi&nbsp;:)</span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="glow flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg"
              >
                <FiX size={18} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-start justify-center gap-2 px-8">
              {[...NAV, { label: 'Contacto', id: 'contacto' as SectionId }].map(
                (item, i) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ delay: 0.05 + i * 0.07 }}
                    className={`glow-text py-2 font-display text-4xl font-semibold ${
                      active === item.id ? 'text-fg' : 'text-muted'
                    }`}
                  >
                    <span className="mr-3 font-mono text-sm text-faint">
                      0{i + 1}
                    </span>
                    {item.label}
                  </motion.a>
                ),
              )}
            </nav>

            <p className="px-8 pb-10 font-mono text-xs text-faint">
              Mendoza, AR · React + GSAP
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
