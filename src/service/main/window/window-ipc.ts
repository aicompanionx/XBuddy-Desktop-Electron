import { ipcMain } from 'electron'
import { getWindowById, getMainWindow, setWindowPosition } from './window-registry'
import { WINDOWS_ID } from '@/constants/windowsId'

/**
 * Initialize IPC event listeners for window management
 */
export const initWindowManagerIPC = () => {
  // Handle window movement IPC messages (relative movement)
  ipcMain.on('move-window', (event, data) => {
    const { windowId, x, y } = data
    const window = getWindowById(windowId)

    if (window) {
      const [currentX, currentY] = window.getPosition()
      // Use setWindowPosition to ensure boundary checking
      setWindowPosition(windowId, currentX + x, currentY + y)
    }
  })

  // For backward compatibility - to be deprecated
  ipcMain.on('move-live2d-window', (event, data) => {
    const { windowId, x, y } = data
    const window = getWindowById(windowId)

    if (window) {
      const [currentX, currentY] = window.getPosition()
      // Use setWindowPosition to ensure boundary checking
      setWindowPosition(windowId, currentX + x, currentY + y)
    }
  })

  // Handle window position setting messages (absolute positioning)
  ipcMain.on('set-window-position', (event, data) => {
    const { windowId, x, y } = data
    setWindowPosition(windowId, x, y)
  })

  // Handle get window position request
  ipcMain.handle('get-window-position', (event, { windowId }) => {
    const window = getWindowById(windowId)
    if (window) {
      const [x, y] = window.getPosition()
      return { x, y }
    }
    return { x: 0, y: 0 } // Default position if window not found
  })

  ipcMain.on('close-live2d-window', (_event, { windowId }) => {
    const window = getWindowById(windowId)
    if (window) {
      window.close()
    }
  })

  ipcMain.on('minimize-live2d-window', (_event, { windowId }) => {
    const window = getWindowById(windowId)
    if (window) {
      window.minimize()
    }
  })

  ipcMain.on('open-live2d-settings', (_event, { windowId }) => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send('open-live2d-settings-dialog', { windowId })
    }
  })

  // Open news windows
  ipcMain.on('open-news-popup', () => {
    const newsWindow = getWindowById(WINDOWS_ID.NEWS)
    if (newsWindow) {
      newsWindow.webContents.send('show-news-popup')
    }
  })

  // Close news windows
  ipcMain.on('close-news-popup', () => {
    const newsWindow = getWindowById(WINDOWS_ID.NEWS)
    if (newsWindow) {
      newsWindow.close()
    }
  })

  registerGenericWindowEvents()
}

const registerGenericWindowEvents = () => {
  ipcMain.on('toggle-ignore-mouse-events', (_event, { ignore, windowId, forward = true }) => {
    const window = getWindowById(windowId)
    if (window) {
      window.setIgnoreMouseEvents(ignore, { forward })
    }
  })

  // Handle transparent pixel detection using page capture
  ipcMain.handle('check-transparent-pixel', async (_event, { windowId, x, y }) => {
    const window = getWindowById(windowId)
    console.log('window', typeof window)
    if (!window) {
      return false
    }

    try {
      // Get window bounds for coordinate conversion
      const bounds = window.getBounds()
      const scaleFactor = window.webContents.getZoomFactor()

      // Convert screen coordinates to window-relative coordinates
      const windowX = Math.round((x - bounds.x) * scaleFactor)
      const windowY = Math.round((y - bounds.y) * scaleFactor)

      // Capture a small area around the point (1x1 pixel)
      const rect = {
        x: Math.max(0, windowX),
        y: Math.max(0, windowY),
        width: 1,
        height: 1
      }

      // Capture the page area
      const image = await window.webContents.capturePage(rect)

      // Convert to bitmap data
      const bitmap = image.toBitmap()

      console.log('bitmap', bitmap)
      if (bitmap.length === 0) {
        console.log('bitmap is empty')
        return false
      }

      // For a 1x1 pixel, the bitmap should have 4 bytes (RGBA)
      // Check the alpha channel (4th byte) - if it's 0, the pixel is transparent
      const alpha = bitmap[3]

      console.log('alpha', alpha)

      return alpha === 0
    } catch (error) {
      console.error('Failed to check transparent pixel:', error)
      return false
    }
  })
}
