import { FiGithub, FiInstagram } from 'react-icons/fi'
import Logo from './Logo'
import LinkedInEasterEgg from '../social/LinkedInEasterEgg'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border/60 bg-chrome">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-12 sm:px-8 md:flex-row md:justify-between">
        <a
          href="#top"
          aria-label="Volver al inicio"
          className="group flex items-center gap-3 text-center md:text-left"
        >
          <Logo className="logo-fx h-8 w-8 shrink-0 text-fg" />
          <div>
            <p className="font-display text-lg font-semibold">Emi&nbsp;:)</p>
            <p className="font-mono text-xs text-faint">
              Mendoza, AR · Hecho con React + GSAP
            </p>
          </div>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/emi_amin13/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="glow flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted"
          >
            <FiInstagram size={18} />
          </a>
          <a
            href="https://github.com/EmiAmin13"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="glow flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted"
          >
            <FiGithub size={18} />
          </a>
          <LinkedInEasterEgg />
        </div>
      </div>

      <div className="border-t border-border/40 py-4">
        <p className="text-center font-mono text-xs text-faint">
          © {year} Emi. Todos los derechos… más o menos.
        </p>
      </div>
    </footer>
  )
}
