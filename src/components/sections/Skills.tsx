import SectionHeading from '../layout/SectionHeading'
import Reveal from '../fx/Reveal'
import TechOrbit from './TechOrbit'

const PRINCIPLES = [
  {
    k: 'Ideas grandes',
    t: 'Me inspiro en referencias ambiciosas y las aterrizo. Apunto alto a propósito: es más fácil recortar una idea grande que agrandar una chica.',
  },
  {
    k: 'IA como herramienta',
    t: 'Hice un curso de desarrollo con agentes y armé una guía con ese método. Trabajo spec-driven: escribo la especificación, dejo que el agente implemente y verifico el resultado. Claude Code y OpenCode ejecutan; yo pongo el criterio.',
  },
  {
    k: 'Del vibe a la ingeniería',
    t: 'Nada de improvisar a ciegas: spec → plan → tareas → verificar. La IA acelera, pero el diseño, las decisiones y la revisión siguen siendo míos.',
  },
]

export default function Skills() {
  return (
    <section
      id="skills"
      className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8"
    >
      <SectionHeading
        index="002"
        label="SKILLS / STACK"
        title={
          <>
            Cómo <span className="glow-text">trabajo</span>, y con qué.
          </>
        }
        intro="Pienso en grande y ejecuto con método. La IA es una herramienta más del cinturón — potente, pero dirigida."
      />

      <div className="mb-16 grid gap-5 md:grid-cols-3">
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.k} delay={i * 0.08}>
            <div className="glow h-full rounded-2xl border border-border/70 bg-surface/50 p-6">
              <p className="eyebrow mb-3">
                [ 0{i + 1} ]
              </p>
              <h3 className="mb-2 font-display text-xl font-semibold">{p.k}</h3>
              <p className="text-sm leading-relaxed text-muted">{p.t}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mb-2 text-center font-mono text-xs text-faint">
          [ STACK · pasá el cursor por una tech y hacé click para ver dónde la usé ]
        </p>
      </Reveal>
      <TechOrbit />
    </section>
  )
}
