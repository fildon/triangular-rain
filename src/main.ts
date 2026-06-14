import './style.css'
import { SQRT3_OVER_2 } from './geometry'
import type { Scene } from './scene'
import { createScene, step } from './scene'

const PADDING = 40
const GROW_SPEED = 500  // pixels per second — controls how fast each triangle expands

function makeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  return canvas
}

function outerTriangleDimensions(w: number, h: number) {
  const availW = w - 2 * PADDING
  const availH = h - 2 * PADDING
  const side = Math.min(availW, availH / SQRT3_OVER_2)
  const triH = side * SQRT3_OVER_2
  const left = (w - side) / 2
  const top = (h - triH) / 2
  return {
    topLeft:  { x: left,        y: top },
    topRight: { x: left + side, y: top },
    apex:     { x: w / 2,       y: top + triH },
  }
}

function draw(ctx: CanvasRenderingContext2D, scene: Scene, growProgress: number | null) {
  const { width, height } = ctx.canvas

  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#111111'

  // Draw all fully completed triangles (skip the last one if it's still growing)
  const fullyDrawn = growProgress !== null ? scene.filled.length - 1 : scene.filled.length
  for (let i = 0; i < fullyDrawn; i++) {
    const tri = scene.filled[i]
    ctx.beginPath()
    ctx.moveTo(tri.tip.x, tri.tip.y)
    ctx.lineTo(tri.bottomLeft.x, tri.bottomLeft.y)
    ctx.lineTo(tri.bottomRight.x, tri.bottomRight.y)
    ctx.closePath()
    ctx.fill()
  }

  // Draw the in-progress triangle scaled from tip outward by the current fraction
  if (growProgress !== null && scene.filled.length > 0) {
    const tri = scene.filled[scene.filled.length - 1]
    const f = Math.min(growProgress, 1)
    ctx.beginPath()
    ctx.moveTo(tri.tip.x, tri.tip.y)
    ctx.lineTo(
      tri.tip.x + f * (tri.bottomLeft.x - tri.tip.x),
      tri.tip.y + f * (tri.bottomLeft.y - tri.tip.y),
    )
    ctx.lineTo(
      tri.tip.x + f * (tri.bottomRight.x - tri.tip.x),
      tri.tip.y + f * (tri.bottomRight.y - tri.tip.y),
    )
    ctx.closePath()
    ctx.fill()
  }

  // Outer triangle stroke drawn last so it stays crisp over filled triangles
  ctx.strokeStyle = '#111111'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(scene.topLeft.x, scene.topLeft.y)
  ctx.lineTo(scene.topRight.x, scene.topRight.y)
  ctx.lineTo(scene.apex.x, scene.apex.y)
  ctx.closePath()
  ctx.stroke()
}

function run() {
  const canvas = makeCanvas()
  const ctx = canvas.getContext('2d')!
  const dims = outerTriangleDimensions(canvas.width, canvas.height)

  let rafId = 0

  function start() {
    cancelAnimationFrame(rafId)

    const scene = createScene(dims.topLeft, dims.topRight, dims.apex)

    // growProgress: null = no triangle in flight; 0–1 = fraction of current triangle grown
    let growProgress: number | null = null
    let currentSideLength = 0
    let lastTs: number | null = null

    function startNext() {
      const before = scene.filled.length
      while (!scene.done && scene.filled.length === before) step(scene)
      if (scene.filled.length > before) {
        const tri = scene.filled[scene.filled.length - 1]
        const dx = tri.bottomLeft.x - tri.tip.x
        const dy = tri.bottomLeft.y - tri.tip.y
        currentSideLength = Math.sqrt(dx * dx + dy * dy)
        growProgress = 0
      }
    }

    function frame(ts: number) {
      if (lastTs !== null && growProgress !== null) {
        const dt = ts - lastTs
        growProgress += (dt / 1000) * GROW_SPEED / currentSideLength
        if (growProgress >= 1) {
          growProgress = null
          if (!scene.done) startNext()
        }
      }
      lastTs = ts

      draw(ctx, scene, growProgress)

      if (!scene.done || growProgress !== null) {
        rafId = requestAnimationFrame(frame)
      }
    }

    startNext()
    rafId = requestAnimationFrame(frame)
  }

  canvas.addEventListener('click', start)
  start()
}

run()
