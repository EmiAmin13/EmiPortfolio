import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import Reveal from '../fx/Reveal'
import Polaroid from './Polaroid'

const HeroBlob = lazy(() => import('../fx/HeroBlob'))

const META = ['Mendoza, AR', '23 años', 'UTN · Ing. en Sistemas']

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [show3D, setShow3D] = useState(false)

  useEffect(() => {
    // 3D only where it earns its keep: fine pointer, desktop-ish, motion ok
    const fine = window.matchMedia('(pointer: fine)').matches
    setShow3D(!reduced && fine && window.innerWidth >= 768)
  }, [reduced])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const polaroidY = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section
      ref={sectionRef}
      id="sobre-mi"
      className="relative mx-auto max-w-6xl scroll-mt-24 overflow-visible px-5 pb-24 pt-32 sm:px-8 sm:pt-40"
    >
      {/* 3D accent floating behind the polaroid column */}
      {show3D && (
        <div className="pointer-events-none absolute -right-24 top-16 hidden h-[480px] w-[480px] opacity-70 md:block">
          <Suspense fallback={null}>
            <HeroBlob />
          </Suspense>
        </div>
      )}

      <div className="relative grid items-center gap-14 md:grid-cols-[1.45fr_1fr]">
        <motion.div style={reduced ? undefined : { y: headlineY }}>
          <Reveal>
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-current opacity-40" />
              [ 001 · SOBRE MÍ ]
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              Pienso en grande.
              <br />
              Especifico.
              <br />
              <span className="glow-text inline-block">Dejo que el agente ejecute.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
              Soy <strong className="text-fg">Emilio Amin</strong> — estudiante
              avanzado de Ingeniería en Sistemas en la UTN, desde Mendoza,
              Argentina. Me obsesiona bajar ideas grandes a software que
              funciona: pensar en grande, escribir una buena especificación y
              dejar que los agentes ejecuten mientras yo cuido el criterio y
              verifico el resultado.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {META.map((m) => (
                <li
                  key={m}
                  className="glow rounded-full border border-border px-4 py-1.5 font-mono text-xs tracking-wide text-muted"
                >
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </motion.div>

        <motion.div
          style={reduced ? undefined : { y: polaroidY }}
          className="relative"
        >
          <Reveal delay={0.1} className="flex flex-col items-center">
            <Polaroid src="/FotoPerroPortfolio.jpg" alt="Simón, el perro" />
            <p className="mt-6 max-w-[280px] text-center font-mono text-xs leading-relaxed text-faint">
              // sobrio por fuera. vivo al tocarlo — mové el cursor y probá el
              modo día/noche.
            </p>
          </Reveal>
        </motion.div>
      </div>
    </section>
  )
}
