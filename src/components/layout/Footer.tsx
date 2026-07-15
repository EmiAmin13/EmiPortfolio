import { useRef } from 'react'
import { FiGithub, FiInstagram } from 'react-icons/fi'
import Logo from './Logo'
import LinkedInEasterEgg from '../social/LinkedInEasterEgg'

const NAV = [
  { label: 'Sobre mí', href: '#sobre-mi' },
  { label: 'Skills / Stack', href: '#skills' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const ref = useRef<HTMLElement>(null)

  // the giant watermark drifts gently toward the cursor
  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', String(((e.clientX - r.left) / r.width) * 2 - 1))
    el.style.setProperty('--my', String(((e.clientY - r.top) / r.height) * 2 - 1))
  }

  return (
    <footer
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative overflow-hidden border-t border-border/60 bg-chrome"
    >
      {/* live hairline */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--glow-a), var(--glow-b), transparent)',
        }}
        aria-hidden="true"
      />

      {/* giant watermark, drifting with the mouse */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 select-none whitespace-nowrap font-display text-[26vw] font-bold leading-none text-fg opacity-[0.045] transition-transform duration-500 ease-out md:text-[15rem]"
        style={{
          transform:
            'translate(calc(-50% + var(--mx, 0) * 22px), calc(-50% + var(--my, 0) * 14px))',
        }}
      >
        EMI&nbsp;:)
      </span>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr]">
        {/* brand */}
        <a
          href="#top"
          aria-label="Volver al inicio"
          className="group flex items-start gap-3 justify-self-center md:justify-self-start"
        >
          <Logo className="logo-fx h-9 w-9 shrink-0 text-fg" />
          <div>
            <p className="font-display text-xl font-semibold leading-tight">
              Emi&nbsp;:)
            </p>
            <p className="mt-1 max-w-[240px] font-mono text-xs leading-relaxed text-faint">
              Sobrio por fuera, vivo al tocarlo. Hecho en Mendoza con React,
              GSAP y tres ideas grandes.
            </p>
          </div>
        </a>

        {/* quick nav */}
        <nav
          aria-label="Mapa del sitio"
          className="justify-self-center text-center md:justify-self-auto md:text-left"
        >
          <p className="eyebrow mb-3">[ MAPA ]</p>
          <ul className="space-y-1.5">
            {NAV.map((item, i) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="glow-text inline-flex items-baseline gap-2 text-sm font-medium text-muted"
                >
                  <span className="font-mono text-[10px] text-faint">
                    00{i + 1}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* social */}
        <div className="justify-self-center text-center md:justify-self-end md:text-right">
          <p className="eyebrow mb-3">[ REDES ]</p>
          <div className="flex items-center justify-center gap-3 md:justify-end">
            <a
              href="https://www.instagram.com/emi_amin13/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="social-btn social-ig flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted"
            >
              <FiInstagram size={19} />
            </a>
            <a
              href="https://github.com/EmiAmin13"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="social-btn social-gh flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted"
            >
              <FiGithub size={19} />
            </a>
            <LinkedInEasterEgg />
          </div>
          <p className="mt-3 font-mono text-[10px] text-faint">
            // linkedin: tocá bajo tu propio riesgo
          </p>
        </div>
      </div>

      <div className="relative border-t border-border/40 py-4">
        <p className="text-center font-mono text-xs text-faint">
          © {year} Emilio Amin · Todos los derechos… más o menos.
        </p>
      </div>
    </footer>
  )
}
