import { addListener } from './event.js'

// Track touch times to prevent redundant mouse events.
let lastTouchTimestamp = 0

// Stage constructor (canvas can be a dom node, or an id string)
export class Stage {
  constructor(canvas) {
    if (typeof canvas === 'string') canvas = document.getElementById(canvas)

    // canvas and associated context references
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    // Prevent gestures on stages (scrolling, zooming, etc)
    this.canvas.style.touchAction = 'none'

    // physics speed multiplier: allows slowing down or speeding up simulation (must be manually implemented in physics layer)
    this.speed = 1

    // devicePixelRatio alias (should only be used for rendering, physics shouldn't care)
    // avoids rendering unnecessary pixels that browser might handle natively via CanvasRenderingContext2D.backingStorePixelRatio
    this.dpr = Stage.disableHighDPI ? 1 : (window.devicePixelRatio || 1) / (this.ctx.backingStorePixelRatio || 1)

    // canvas size in DIPs and natural pixels
    this.width = canvas.width
    this.height = canvas.height
    this.naturalWidth = this.width * this.dpr
    this.naturalHeight = this.height * this.dpr

    // size canvas to match natural size
    if (this.width !== this.naturalWidth) {
      this.canvas.width = this.naturalWidth
      this.canvas.height = this.naturalHeight
      this.canvas.style.width = this.width + 'px'
      this.canvas.style.height = this.height + 'px'
    }

    Stage.stages.push(this)

    // event listeners (note that 'ticker' is also an option, for frame events)
    this._listeners = {
      // canvas resizing
      resize: [],
      // pointer events
      pointerstart: [],
      pointermove: [],
      pointerend: [],
      lastPointerPos: { x: 0, y: 0 }
    }
  }
  // track all Stage instances
  static stages = []
  // allow turning off high DPI support for perf reasons (enabled by default)
  // Note: MUST be set before Stage construction.
  // Each stage tracks its own DPI (initialized at construction time), so you can effectively allow some Stages to render high-res graphics but not others.
  static disableHighDPI = false
  // utility function for coordinate space conversion
  static windowToCanvas(canvas, x, y) {
    const bbox = canvas.getBoundingClientRect()
    return {
      x: (x - bbox.left) * (canvas.width / bbox.width),
      y: (y - bbox.top) * (canvas.height / bbox.height)
    }
  }
  // handle interaction
  static mouseHandler(evt) {
    // Prevent mouse events from firing immediately after touch events
    if (Date.now() - lastTouchTimestamp < 500) {
      return
    }

    let type = 'start'
    if (evt.type === 'mousemove') {
      type = 'move'
    } else if (evt.type === 'mouseup') {
      type = 'end'
    }

    Stage.stages.forEach((stage) => {
      const pos = Stage.windowToCanvas(stage.canvas, evt.clientX, evt.clientY)
      stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr)
    })
  }
  static touchHandler(evt) {
    lastTouchTimestamp = Date.now()

    // Set generic event type
    let type = 'start'
    if (evt.type === 'touchmove') {
      type = 'move'
    } else if (evt.type === 'touchend') {
      type = 'end'
    }

    // Dispatch "pointer events" for all changed touches across all stages.
    Stage.stages.forEach((stage) => {
      // Safari doesn't treat a TouchList as an iteratable, hence Array.from()
      for (let touch of Array.from(evt.changedTouches)) {
        let pos
        if (type !== 'end') {
          pos = Stage.windowToCanvas(stage.canvas, touch.clientX, touch.clientY)
          stage._listeners.lastPointerPos = pos
          // before touchstart event, fire a move event to better emulate cursor events
          if (type === 'start') stage.pointerEvent('move', pos.x / stage.dpr, pos.y / stage.dpr)
        } else {
          // on touchend, fill in position information based on last known touch location
          pos = stage._listeners.lastPointerPos
        }
        stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr)
      }
    })
  }
  // events
  addEventListener(event, handler) {
    try {
      if (event === 'ticker') {
        addListener(handler)
      } else {
        this._listeners[event].push(handler)
      }
    } catch (e) {
      throw 'Invalid Event'
    }
  }
  dispatchEvent(event, val) {
    const listeners = this._listeners[event]
    if (listeners) {
      listeners.forEach((listener) => listener.call(this, val))
    } else {
      throw 'Invalid Event'
    }
  }
  // resize canvas
  resize(w, h) {
    this.width = w
    this.height = h
    this.naturalWidth = w * this.dpr
    this.naturalHeight = h * this.dpr
    this.canvas.width = this.naturalWidth
    this.canvas.height = this.naturalHeight
    this.canvas.style.width = w + 'px'
    this.canvas.style.height = h + 'px'

    this.dispatchEvent('resize')
  }
  // dispatch a normalized pointer event on a specific stage
  pointerEvent(type, x, y) {
    // build event oject to dispatch
    const evt = {
      type: type,
      x: x,
      y: y
    }

    // whether pointer event was dispatched over canvas element
    evt.onCanvas = x >= 0 && x <= this.width && y >= 0 && y <= this.height

    // dispatch
    this.dispatchEvent('pointer' + type, evt)
  }
}

document.addEventListener('mousedown', Stage.mouseHandler)
document.addEventListener('mousemove', Stage.mouseHandler)
document.addEventListener('mouseup', Stage.mouseHandler)
document.addEventListener('touchstart', Stage.touchHandler)
document.addEventListener('touchmove', Stage.touchHandler)
document.addEventListener('touchend', Stage.touchHandler)
