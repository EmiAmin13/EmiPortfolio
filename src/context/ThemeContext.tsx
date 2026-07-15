import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'day' | 'night'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'night',
  toggle: () => {},
  setTheme: () => {},
})

const STORAGE_KEY = 'emi-theme'

function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'night'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'day' || saved === 'night') return saved
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'day' ? 'day' : 'night'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = useCallback(
    () => setThemeState((t) => (t === 'day' ? 'night' : 'day')),
    [],
  )
  const setTheme = useCallback((t: Theme) => setThemeState(t), [])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext)
}
