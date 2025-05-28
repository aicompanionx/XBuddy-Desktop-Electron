import React from 'react'
import { useLive2DModel } from '../hooks/use-live2d-model'

interface Live2DCharacterProps {
  width: number
  height: number
}

const Live2DCharacter = ({ width, height }: Live2DCharacterProps) => {
  // Use Live2D model management hook
  const { canvasRef } = useLive2DModel({
    width,
    height,
  })

  return <canvas ref={canvasRef} width={width} height={height}></canvas>
}

export default Live2DCharacter
