/**
 * 将帧图片、贴纸和边框合成为完整的卡片纹理
 */
export interface Sticker {
  id: number
  icon: string
  x: number
  y: number
  scale: number
  rotation: number
}

export interface CardCompositeOptions {
  frameImage: string
  stickers: Sticker[]
  borderColor: string
  borderWidth: 'narrow' | 'medium' | 'wide'
  width?: number
  height?: number
}

export async function createCompositeCardTexture(options: CardCompositeOptions): Promise<HTMLCanvasElement> {
  const {
    frameImage,
    stickers,
    borderColor,
    borderWidth,
    width = 1024,
    height = 1434 // 保持 5:7 的卡片比例
  } = options

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 边框宽度映射（像素）
  const borderWidthMap = {
    narrow: width * 0.02,
    medium: width * 0.04,
    wide: width * 0.06
  }
  const borderPx = borderWidthMap[borderWidth]

  // 1. 绘制边框背景
  ctx.fillStyle = borderColor
  ctx.fillRect(0, 0, width, height)

  // 2. 添加边框内侧阴影效果
  const gradient = ctx.createLinearGradient(borderPx, borderPx, borderPx * 2, borderPx * 2)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(borderPx, borderPx, width - borderPx * 2, borderPx * 0.5)
  ctx.fillRect(borderPx, borderPx, borderPx * 0.5, height - borderPx * 2)

  // 3. 加载并绘制帧图片
  const img = await loadImage(frameImage)
  const contentX = borderPx
  const contentY = borderPx
  const contentWidth = width - borderPx * 2
  const contentHeight = height - borderPx * 2
  
  ctx.drawImage(img, contentX, contentY, contentWidth, contentHeight)

  // 4. 绘制贴纸
  for (const sticker of stickers) {
    ctx.save()
    
    // 计算贴纸位置（相对于内容区域）
    const stickerX = contentX + (sticker.x / 100) * contentWidth
    const stickerY = contentY + (sticker.y / 100) * contentHeight
    
    ctx.translate(stickerX, stickerY)
    ctx.rotate((sticker.rotation * Math.PI) / 180)
    ctx.scale(sticker.scale, sticker.scale)
    
    // 绘制贴纸文字（emoji）
    const fontSize = Math.floor(contentWidth * 0.08)
    ctx.font = `${fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 添加贴纸阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    ctx.fillText(sticker.icon, 0, 0)
    
    ctx.restore()
  }

  return canvas
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
