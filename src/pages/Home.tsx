import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Projects from '../components/sections/Projects'
import Contact from '../components/sections/Contact'
import SectionDivider from '../components/fx/SectionDivider'
import ScrollRail from '../components/fx/ScrollRail'
import { useSectionObserver } from '../hooks/useSectionSpy'

export default function Home() {
  useSectionObserver()

  return (
    <>
      <span id="top" />
      <Header />
      <ScrollRail />
      <main>
        <About />
        <SectionDivider
          index="002"
          label="SKILLS / STACK"
          icons={['react', 'typescript', 'angular', 'springboot']}
        />
        <Skills />
        <SectionDivider
          index="003"
          label="PROYECTOS"
          reverse
          icons={['vite', 'java', 'postgresql', 'docker']}
        />
        <Projects />
        <SectionDivider
          index="004"
          label="CONTACTO"
          icons={['n8n', 'node', 'git', 'vercel']}
        />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
