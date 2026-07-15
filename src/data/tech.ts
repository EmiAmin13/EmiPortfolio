import type { IconType } from 'react-icons'
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiVite,
  SiNodedotjs,
  SiAngular,
  SiOpenjdk,
  SiSpringboot,
  SiPostgresql,
  SiMysql,
  SiN8N,
  SiPostman,
  SiGit,
  SiVercel,
  SiDocker,
  SiClaudecode,
  SiOpencode,
} from 'react-icons/si'

export type TechId =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'vite'
  | 'node'
  | 'angular'
  | 'java'
  | 'springboot'
  | 'postgresql'
  | 'mysql'
  | 'n8n'
  | 'postman'
  | 'git'
  | 'vercel'
  | 'docker'
  | 'claudecode'
  | 'opencode'

export interface Tech {
  id: TechId
  label: string
  icon: IconType
  /** Simple Icons brand color — used only for the "alive" highlight fx. */
  color: string
}

export const TECHS: Tech[] = [
  { id: 'html', label: 'HTML', icon: SiHtml5, color: '#E34F26' },
  { id: 'css', label: 'CSS', icon: SiCss, color: '#663399' },
  { id: 'javascript', label: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  { id: 'typescript', label: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { id: 'react', label: 'React', icon: SiReact, color: '#61DAFB' },
  { id: 'vite', label: 'Vite', icon: SiVite, color: '#646CFF' },
  { id: 'node', label: 'Node', icon: SiNodedotjs, color: '#5FA04E' },
  { id: 'angular', label: 'Angular', icon: SiAngular, color: '#DD0031' },
  { id: 'java', label: 'Java', icon: SiOpenjdk, color: '#ED8B00' },
  { id: 'springboot', label: 'Spring Boot', icon: SiSpringboot, color: '#6DB33F' },
  { id: 'postgresql', label: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
  { id: 'mysql', label: 'MySQL', icon: SiMysql, color: '#4479A1' },
  { id: 'n8n', label: 'n8n', icon: SiN8N, color: '#EA4B71' },
  { id: 'postman', label: 'Postman', icon: SiPostman, color: '#FF6C37' },
  { id: 'git', label: 'Git', icon: SiGit, color: '#F05032' },
  { id: 'vercel', label: 'Vercel', icon: SiVercel, color: '#000000' },
  { id: 'docker', label: 'Docker', icon: SiDocker, color: '#2496ED' },
  { id: 'claudecode', label: 'Claude Code', icon: SiClaudecode, color: '#D97757' },
  { id: 'opencode', label: 'OpenCode', icon: SiOpencode, color: '#000000' },
]

export const TECH_MAP: Record<TechId, Tech> = Object.fromEntries(
  TECHS.map((t) => [t.id, t]),
) as Record<TechId, Tech>
