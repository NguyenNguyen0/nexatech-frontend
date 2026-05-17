import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'
type Font = 'system' | 'inter' | 'manrope' | 'roboto' | 'outfit' | 'montserrat' | 'poppins' | 'geist'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultFont?: Font
  storageKey?: string
  fontStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  font: Font
  setFont: (font: Font) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  font: 'system',
  setFont: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultFont = 'system',
  storageKey = 'vite-ui-theme',
  fontStorageKey = 'vite-ui-font',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [font, setFont] = useState<Font>(
    () => (localStorage.getItem(fontStorageKey) as Font) || defaultFont
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    let fontFamily = "system-ui, -apple-system, sans-serif"
    
    switch (font) {
      case 'inter':
        fontFamily = "'Inter', sans-serif"
        break
      case 'manrope':
        fontFamily = "'Manrope', sans-serif"
        break
      case 'roboto':
        fontFamily = "'Roboto', sans-serif"
        break
      case 'outfit':
        fontFamily = "'Outfit', sans-serif"
        break
      case 'montserrat':
        fontFamily = "'Montserrat', sans-serif"
        break
      case 'poppins':
        fontFamily = "'Poppins', sans-serif"
        break
      case 'geist':
        fontFamily = "'Geist Variable', sans-serif"
        break
      default:
        fontFamily = "system-ui, -apple-system, sans-serif"
    }

    root.style.setProperty('--font-family', fontFamily)
    root.style.transition = 'font-family 0.3s ease-in-out'
    localStorage.setItem(fontStorageKey, font)
  }, [font, fontStorageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    font,
    setFont: (font: Font) => {
      setFont(font)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
