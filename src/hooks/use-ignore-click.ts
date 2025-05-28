import { useEffect } from 'react'
import { WINDOWS_ID } from '@/constants/windowsId'

const mouseMoveListener = async (e: MouseEvent) => {

  try {
    // Use the new page capture method to check for transparency
    const isTransparent = await window.electronAPI.checkTransparentPixel({
      windowId: WINDOWS_ID.MAIN,
      x: e.screenX,
      y: e.screenY
    })

    // Toggle mouse event ignoring based on transparency
    window.electronAPI.toggleIgnoreMouseEvents({
      ignore: isTransparent,
      windowId: WINDOWS_ID.MAIN,
      forward: true
    })
  } catch (error) {
    // Fallback: don't ignore mouse events if there's an error
    window.electronAPI.toggleIgnoreMouseEvents({
      ignore: false,
      windowId: WINDOWS_ID.MAIN,
      forward: true
    })
  }
}

export const useIgnoreClick = () => {
  useEffect(() => {
    window.addEventListener('mousemove', mouseMoveListener)
    return () => {
      window.removeEventListener('mousemove', mouseMoveListener)
    }
  }, [])
}
