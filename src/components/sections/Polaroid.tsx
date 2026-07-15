import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiEdit2 } from 'react-icons/fi'

const STORAGE_KEY = 'emi-polaroid-caption'
const DEFAULT_CAPTION = 'In progress...'

interface PolaroidProps {
  src: string
  alt: string
}

export default function Polaroid({ src, alt }: PolaroidProps) {
  const [caption, setCaption] = useState(
    () => window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CAPTION,
  )
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(caption)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const save = () => {
    const value = draft.trim() || DEFAULT_CAPTION
    setCaption(value)
    window.localStorage.setItem(STORAGE_KEY, value)
    setEditing(false)
  }

  return (
    <figure className="group relative w-full max-w-[300px] -rotate-3 select-none rounded-[4px] bg-[#f4efe9] p-3 pb-0 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]">
      <div className="relative overflow-hidden rounded-[2px] bg-[#20201c]">
        <img
          src={src}
          alt={alt}
          className="aspect-square w-full object-cover"
          draggable={false}
        />
        {/* photo sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/10" />
      </div>

      <figcaption className="relative px-1 py-5">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              maxLength={40}
              className="w-full border-b border-[#b8b0a5] bg-transparent font-mono text-lg font-bold text-[#2a2a28] outline-none"
              aria-label="Editar pie de foto"
            />
            <button
              type="submit"
              aria-label="Guardar"
              className="text-[#6e0921]"
            >
              <FiCheck size={18} />
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-lg font-bold tracking-tight text-[#2a2a28]">
              {caption}
            </span>
            <button
              type="button"
              onClick={() => {
                setDraft(caption)
                setEditing(true)
              }}
              aria-label="Editar pie de foto"
              className="text-[#8a8175] opacity-0 transition-opacity duration-200 hover:text-[#6e0921] group-hover:opacity-100"
            >
              <FiEdit2 size={15} />
            </button>
          </div>
        )}

        {/* indeterminate barber-pole loading bar — appears on hover */}
        {!editing && (
          <div
            className="mt-1 h-[6px] overflow-hidden rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-45deg, #6e0921 0 10px, #ff7e70 10px 20px)',
              backgroundSize: '40px 100%',
              animation: 'barber 0.7s linear infinite',
            }}
            aria-hidden="true"
          />
        )}
      </figcaption>
    </figure>
  )
}
