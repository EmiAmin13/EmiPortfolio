import { Route, Routes } from 'react-router-dom'
import CursorTrail from './components/fx/CursorTrail'
import Home from './pages/Home'
import Assistant from './pages/Assistant'

function App() {
  return (
    <>
      <CursorTrail />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/asistente" element={<Assistant />} />
      </Routes>
    </>
  )
}

export default App
