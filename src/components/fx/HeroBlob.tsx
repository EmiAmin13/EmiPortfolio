import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  BufferAttribute,
  Color,
  IcosahedronGeometry,
  Vector3,
  type Mesh,
  type MeshBasicMaterial,
  type Points,
} from 'three'

/* ------------------------------------------------------------------ *
 * Sober 3D accent — low-poly wireframe icosahedron in the theme's
 * ink gray. Hovering it "fills" the lines bottom-up with the live
 * colors of the active mode. It's grabbable: drag to spin it, and a
 * fast spin sheds glowing particles until the inertia settles back
 * into the ambient rotation.
 * ------------------------------------------------------------------ */

interface Palette {
  ink: string
  glowA: string
  glowB: string
}

function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement)
  return {
    ink: s.getPropertyValue('--faint').trim() || '#aca1a1',
    glowA: s.getPropertyValue('--glow-a').trim() || '#29ed22',
    glowB: s.getPropertyValue('--glow-b').trim() || '#0047ab',
  }
}

const RADIUS = 1.7
const AMBIENT_VY = 0.12 // baseline spin (rad/s)
const SPARK_SPEED = 2.4 // spin speed that starts shedding particles

interface DragState {
  dragging: boolean
  /** pending pointer deltas, consumed each frame */
  dx: number
  dy: number
  /** angular velocity (rad/s) */
  vx: number
  vy: number
}

function Wire({
  palette,
  hoverRef,
  drag,
}: {
  palette: Palette
  hoverRef: React.RefObject<boolean>
  drag: React.RefObject<DragState>
}) {
  const mesh = useRef<Mesh>(null)
  const mat = useRef<MeshBasicMaterial>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const fill = useRef(0)

  const colors = useMemo(
    () => ({
      ink: new Color(palette.ink),
      a: new Color(palette.glowA),
      b: new Color(palette.glowB),
      tmp: new Color(),
    }),
    [palette],
  )

  const geometry = useMemo(() => {
    const g = new IcosahedronGeometry(RADIUS, 1)
    const count = g.attributes.position.count
    g.setAttribute('color', new BufferAttribute(new Float32Array(count * 3), 3))
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const v = useMemo(() => new Vector3(), [])

  useFrame((_, rawDt) => {
    const m = mesh.current
    const d = drag.current
    if (!m || !d) return
    const dt = Math.min(rawDt, 0.05)

    if (d.dragging) {
      // direct: the sphere follows the hand; velocity remembered for inertia
      const rotY = d.dx * 0.007
      const rotX = d.dy * 0.007
      m.rotation.y += rotY
      m.rotation.x += rotX
      if (dt > 0) {
        d.vy = d.vy * 0.7 + (rotY / dt) * 0.3
        d.vx = d.vx * 0.7 + (rotX / dt) * 0.3
      }
      d.dx = 0
      d.dy = 0
    } else {
      // inertia, decaying back to the sober ambient spin
      m.rotation.y += d.vy * dt
      m.rotation.x += d.vx * dt
      const decay = 1 - Math.min(dt * 0.9, 0.09)
      d.vy = AMBIENT_VY + (d.vy - AMBIENT_VY) * decay
      d.vx *= decay
      // gentle lean toward the cursor only when calm
      if (Math.abs(d.vx) + Math.abs(d.vy - AMBIENT_VY) < 0.6) {
        m.rotation.x += (pointer.current.y * 0.35 - m.rotation.x) * 0.03
        m.rotation.z += (pointer.current.x * 0.25 - m.rotation.z) * 0.03
      }
    }
    m.scale.setScalar(1 + Math.min(window.scrollY / 2000, 0.25))

    // liquid fill: rises while hovered/grabbed, and STAYS painted while
    // the fling's inertia keeps it spinning noticeably; once it settles
    // back to the ambient rotation, the color drains out
    const spinSpeed = Math.abs(d.vx) + Math.abs(d.vy - AMBIENT_VY)
    const painted = hoverRef.current || d.dragging || spinSpeed > 0.4
    fill.current += ((painted ? 1 : 0) - fill.current) * Math.min(dt * 3.2, 0.12)

    const pos = geometry.attributes.position as BufferAttribute
    const col = geometry.attributes.color as BufferAttribute
    const th = -RADIUS - 0.2 + fill.current * (RADIUS * 2 + 0.4)
    const edge = 0.22

    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyEuler(m.rotation)
      if (v.y < th - edge) {
        const t = (v.y + RADIUS) / (RADIUS * 2)
        colors.tmp.copy(colors.a).lerp(colors.b, t)
      } else if (v.y < th + edge) {
        colors.tmp.copy(colors.a)
      } else {
        colors.tmp.copy(colors.ink)
      }
      col.setXYZ(i, colors.tmp.r, colors.tmp.g, colors.tmp.b)
    }
    col.needsUpdate = true

    if (mat.current) mat.current.opacity = 0.5 + fill.current * 0.35
  })

  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshBasicMaterial ref={mat} wireframe vertexColors transparent opacity={0.5} />
    </mesh>
  )
}

/* Particle pool shed by the sphere when it spins fast. Each spark
 * fades via its own alpha (custom shader) so it truly disappears on
 * light AND dark backgrounds — the canvas is transparent, so color
 * tricks (fade-to-black) leave dark squares in day mode. */
const POOL = 240

const SPARK_VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 58.0 / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const SPARK_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    // round sparks, not squares
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`

function Sparks({
  palette,
  drag,
}: {
  palette: Palette
  drag: React.RefObject<DragState>
}) {
  const points = useRef<Points>(null)
  const data = useMemo(() => {
    return {
      pos: new Float32Array(POOL * 3),
      col: new Float32Array(POOL * 3),
      alpha: new Float32Array(POOL),
      vel: new Float32Array(POOL * 3),
      life: new Float32Array(POOL).fill(Infinity),
      max: new Float32Array(POOL).fill(1),
      base: Array.from({ length: POOL }, () => new Color()),
      cursor: 0,
      carry: 0,
    }
  }, [])
  const glow = useMemo(
    () => [new Color(palette.glowA), new Color(palette.glowB)],
    [palette],
  )
  const u = useMemo(() => new Vector3(), [])
  const tangent = useMemo(() => new Vector3(), [])
  const UP = useMemo(() => new Vector3(0, 1, 0), [])

  useFrame((_, rawDt) => {
    const d = drag.current
    const p = points.current
    if (!d || !p) return
    const dt = Math.min(rawDt, 0.05)

    // spawn proportionally to how hard it's being spun
    const speed = Math.abs(d.vx) + Math.abs(d.vy - AMBIENT_VY)
    if (speed > SPARK_SPEED) {
      data.carry += Math.min((speed - SPARK_SPEED) * 26, 130) * dt
      while (data.carry >= 1) {
        data.carry -= 1
        const i = data.cursor
        data.cursor = (data.cursor + 1) % POOL
        // random point on the sphere surface
        u.randomDirection()
        const scale = 1 + Math.min(window.scrollY / 2000, 0.25)
        data.pos[i * 3] = u.x * RADIUS * scale
        data.pos[i * 3 + 1] = u.y * RADIUS * scale
        data.pos[i * 3 + 2] = u.z * RADIUS * scale
        // fly outward + tangentially (with the spin direction)
        tangent.crossVectors(u, UP).normalize()
        const dir = Math.sign(d.vy - AMBIENT_VY) || 1
        const burst = 0.9 + Math.random() * 1.2
        data.vel[i * 3] = (u.x * 0.9 - tangent.x * dir * 1.4) * burst
        data.vel[i * 3 + 1] = (u.y * 0.9 + (Math.random() - 0.3) * 0.5) * burst
        data.vel[i * 3 + 2] = (u.z * 0.9 - tangent.z * dir * 1.4) * burst
        data.life[i] = 0
        data.max[i] = 0.35 + Math.random() * 0.45
        data.base[i].copy(glow[Math.random() < 0.5 ? 0 : 1])
        data.col[i * 3] = data.base[i].r
        data.col[i * 3 + 1] = data.base[i].g
        data.col[i * 3 + 2] = data.base[i].b
      }
    }

    // integrate + fade (alpha → 0 = truly gone on any background)
    for (let i = 0; i < POOL; i++) {
      if (data.life[i] > data.max[i]) {
        data.alpha[i] = 0
        continue
      }
      data.life[i] += dt
      data.pos[i * 3] += data.vel[i * 3] * dt
      data.pos[i * 3 + 1] += data.vel[i * 3 + 1] * dt
      data.pos[i * 3 + 2] += data.vel[i * 3 + 2] * dt
      data.vel[i * 3] *= 0.985
      data.vel[i * 3 + 1] *= 0.985
      data.vel[i * 3 + 2] *= 0.985
      // sharper falloff so every spark clearly dies out
      data.alpha[i] = Math.max(0, 1 - data.life[i] / data.max[i]) ** 1.7
    }
    const geo = p.geometry
    ;(geo.attributes.position as BufferAttribute).needsUpdate = true
    ;(geo.attributes.aColor as BufferAttribute).needsUpdate = true
    ;(geo.attributes.aAlpha as BufferAttribute).needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[data.col, 3]} />
        <bufferAttribute attach="attributes-aAlpha" args={[data.alpha, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={SPARK_VERT}
        fragmentShader={SPARK_FRAG}
      />
    </points>
  )
}

export default function Hero3D() {
  const holder = useRef<HTMLDivElement>(null)
  const hoverRef = useRef(false)
  const drag = useRef<DragState>({
    dragging: false,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: AMBIENT_VY,
  })
  const [palette, setPalette] = useState<Palette>(readPalette)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const mo = new MutationObserver(() => setPalette(readPalette()))
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    const el = holder.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* All interaction happens at window level with circle hit-testing, so
   * the canvas itself never blocks the polaroid or anything behind it. */
  useEffect(() => {
    const insideSphere = (x: number, y: number) => {
      const el = holder.current
      if (!el) return false
      const r = el.getBoundingClientRect()
      return (
        Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) <
        r.width * 0.42
      )
    }
    const interactive = (t: EventTarget | null) =>
      t instanceof Element &&
      !!t.closest('figure, button, a, input, textarea, [contenteditable]')

    let lastX = 0
    let lastY = 0

    const onDown = (e: PointerEvent) => {
      if (interactive(e.target)) return
      if (!insideSphere(e.clientX, e.clientY)) return
      drag.current.dragging = true
      lastX = e.clientX
      lastY = e.clientY
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    }
    const onMove = (e: PointerEvent) => {
      hoverRef.current = insideSphere(e.clientX, e.clientY)
      if (!drag.current.dragging) {
        document.body.style.cursor =
          hoverRef.current && !interactive(e.target) ? 'grab' : ''
        return
      }
      drag.current.dx += e.clientX - lastX
      drag.current.dy += e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
    }
    const onUp = () => {
      if (!drag.current.dragging) return
      drag.current.dragging = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])

  return (
    <div ref={holder} className="h-full w-full" aria-hidden="true">
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Wire palette={palette} hoverRef={hoverRef} drag={drag} />
        <Sparks palette={palette} drag={drag} />
      </Canvas>
    </div>
  )
}
