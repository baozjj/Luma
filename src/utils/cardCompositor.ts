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

// 贴纸位置微调配置（如果预览时位置不准确，可以调整这些值）
const STICKER_OFFSET_X = 0  // X轴偏移百分比
const STICKER_OFFSET_Y = 0  // Y轴偏移百分比
const STICKER_SIZE_RATIO = 0.11  // 贴纸大小相对于卡片宽度的比例

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
  // 基于编辑界面的固定像素值，按比例缩放到当前 canvas 宽度
  // 编辑界面卡片宽度为 360px
  const borderWidthMap = {
    narrow: width * (16 / 360),  // 16px / 360px = 4.44%
    medium: width * (24 / 360),  // 24px / 360px = 6.67%
    wide: width * (48 / 360)     // 48px / 360px = 13.33%
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

  // 4. 设置裁剪区域为整个卡片（包括边框），超出部分不显示
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, width, height)
  ctx.clip()

  // 5. 绘制贴纸
  for (const sticker of stickers) {
    ctx.save()
    
    // 计算贴纸位置（相对于整个卡片，包括边框）
    // 注意：编辑界面使用 translate(-50%, -50%) 来居中，这里通过 textAlign 和 textBaseline 实现相同效果
    const stickerX = ((sticker.x + STICKER_OFFSET_X) / 100) * width
    const stickerY = ((sticker.y + STICKER_OFFSET_Y) / 100) * height
    
    ctx.translate(stickerX, stickerY)
    ctx.rotate((sticker.rotation * Math.PI) / 180)
    ctx.scale(sticker.scale, sticker.scale)
    
    // 绘制贴纸文字（emoji）
    const fontSize = Math.floor(width * STICKER_SIZE_RATIO)
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

  // 恢复裁剪前的状态
  ctx.restore()

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
