import { useState } from 'react'
import { PROJECTS, type Project } from '../../data/projects'
import SectionHeading from '../layout/SectionHeading'
import Reveal from '../fx/Reveal'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'

export default function Projects() {
  const [modal, setModal] = useState<Project | null>(null)

  return (
    <section
      id="proyectos"
      className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8"
    >
      <SectionHeading
        index="003"
        label="PROYECTOS"
        title={
          <>
            Cosas que <span className="glow-text">construí</span>.
          </>
        }
        intro="Algunas están online; otras son sistemas internos que no puedo mostrar en vivo. Tocá una tecnología en la rueda de arriba y mirá qué proyectos la usan."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <ProjectCard project={p} onDetails={setModal} />
          </Reveal>
        ))}
      </div>

      <ProjectModal project={modal} onClose={() => setModal(null)} />
    </section>
  )
}
