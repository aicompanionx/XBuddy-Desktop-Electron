import { createContext, ReactNode, useContext, useState, useEffect } from 'react'

interface Live2DMenuContextType {
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
}

interface Live2DMenuContextProviderProps {
  children: ReactNode
}

const Live2DMenuContext = createContext<Live2DMenuContextType | undefined>(undefined)

export const Live2DMenuContextProvider = ({ children }: Live2DMenuContextProviderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!window.electronAPI) return

    const unsubscribeBlur = window.electronAPI.onAppBlur(() => {
      if (isMenuOpen) {
        setIsMenuOpen(false)
      }
    })

    return () => {
      unsubscribeBlur()
    }
  }, [isMenuOpen])

  return <Live2DMenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>{children}</Live2DMenuContext.Provider>
}

export const useLive2DMenu = () => {
  return useContext(Live2DMenuContext)
}
