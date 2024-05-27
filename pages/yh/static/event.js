export function addListener(callback) {
  if (typeof callback !== 'function') throw 'Ticker.addListener() requires a function reference passed for a callback.'

  listeners.push(callback)

  // start frame-loop lazily
  if (!started) {
    started = true
    queueFrame()
  }
}

// private
let started = false
let lastTimestamp = 0
let listeners = []

// queue up a new frame (calls frameHandler)
function queueFrame() {
  if (window.requestAnimationFrame) {
    requestAnimationFrame(frameHandler)
  } else {
    webkitRequestAnimationFrame(frameHandler)
  }
}

function frameHandler(timestamp) {
  let frameTime = timestamp - lastTimestamp
  lastTimestamp = timestamp
  // make sure negative time isn't reported (first frame can be whacky)
  if (frameTime < 0) {
    frameTime = 17
  }
  // - cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
  else if (frameTime > 68) {
    frameTime = 68
  }

  // fire custom listeners
  listeners.forEach((listener) => listener.call(window, frameTime, frameTime / 16.6667))

  // always queue another frame
  queueFrame()
}
