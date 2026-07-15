import type { TechId } from './tech'

export interface Project {
  id: string
  title: string
  tagline: string
  description: string
  /** External link, when the project is publicly visitable. */
  url?: string
  /** Preview images in /public/previews (first is the card thumbnail). */
  previews: string[]
  tech: TechId[]
  /** true → sensitive system, no public link; opens a detail modal instead. */
  privateProject?: boolean
}

export const PROJECTS: Project[] = [
  {
    id: 'flora',
    title: 'FloraStudio · Landing Page',
    tagline: 'Arquitectura + paisajismo · Mendoza',
    description:
      'Landing de estudio de arquitectura y paisajismo. Hero editorial, tipografía con carácter y foco en el bienestar de los espacios. Construida a mano, ligera y rápida.',
    url: 'https://flora-studio-delta.vercel.app',
    previews: ['/previews/FloraStudioDemo.png'],
    tech: ['vite', 'css', 'html', 'javascript', 'node', 'git'],
  },
  {
    id: 'guia',
    title: 'GuIA de Desarrollo con Agentes',
    tagline: 'Del vibe coding a la ingeniería de software',
    description:
      'Sitio-guía del curso de desarrollo con agentes: cómo funcionan los modelos, cómo se dirige un agente de código y cómo se escribe software contra una especificación. Hecho con el mismo método que explica: spec → plan → tareas → verificar.',
    url: 'https://prueba-claude-omega.vercel.app',
    previews: ['/previews/GuIA%20-%20Desarrollo%20con%20Agentes.png'],
    tech: ['typescript', 'html', 'css', 'angular', 'git'],
  },
  {
    id: 'amn',
    title: 'Gestor AMN — Ventas / Stock / Inventario',
    tagline: 'Sistema de gestión para consultora informática',
    description:
      'Sistema interno de gestión: productos, stock con mínimos y alertas, ventas, compras, clientes, proveedores y reportes. Sin enlace público por datos sensibles — abajo, algunas capturas.',
    previews: [
      '/previews/AMN%20-%20Login.png',
      '/previews/AMN%20-%20Productos.png',
      '/previews/AMN%20-%20Reportes.png',
      '/previews/AMN%20-%20Personalizacion.png',
    ],
    tech: [
      'java',
      'springboot',
      'angular',
      'typescript',
      'css',
      'html',
      'postgresql',
      'docker',
      'node',
    ],
    privateProject: true,
  },
]

/** tech id → project ids that use it (for the orbit → projects choreography). */
export const PROJECTS_BY_TECH: Record<string, string[]> = PROJECTS.reduce(
  (acc, p) => {
    for (const t of p.tech) {
      ;(acc[t] ??= []).push(p.id)
    }
    return acc
  },
  {} as Record<string, string[]>,
)
