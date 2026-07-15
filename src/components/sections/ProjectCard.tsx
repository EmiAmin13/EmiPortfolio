import { FiArrowUpRight, FiLock } from 'react-icons/fi'
import type { Project } from '../../data/projects'
import TechChip from '../TechChip'

interface ProjectCardProps {
  project: Project
  onDetails: (project: Project) => void
}

export default function ProjectCard({ project, onDetails }: ProjectCardProps) {
  const isPrivate = project.privateProject

  return (
    <article
      id={`project-${project.id}`}
      data-project={project.id}
      className="project-card group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface/50 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1"
    >
      {/* preview */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border/60 bg-bg">
        <img
          src={project.previews[0]}
          alt={`Vista previa de ${project.title}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {isPrivate && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-bg/85 px-2.5 py-1 font-mono text-[10px] text-muted backdrop-blur">
            <FiLock size={11} /> privado
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow mb-2">{project.tagline}</p>
        <h3 className="font-display text-xl font-semibold leading-tight">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {project.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li key={t}>
              <TechChip id={t} />
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center gap-3 pt-1">
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="glow inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-fg"
            >
              Visitar <FiArrowUpRight size={16} />
            </a>
          ) : null}
          {isPrivate && (
            <button
              type="button"
              onClick={() => onDetails(project)}
              className="glow inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-fg"
            >
              Ver detalles
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
