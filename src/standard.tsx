import React, { MutableRefObject, forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react"

import { KeyboardMode } from './keycap'
import { KEY_CAPS } from "./definition"
import { Key } from "./key"
import { handleMove, XYSetter, inputCharacterAtCursor, backspace } from "./util"

const REPEATE_INPUT_DELAY = 500 // ms
const REPEATE_INPUT_INTERVAL = 50 //ms

const ALTERNATE_SLIDE = {
  maxDeltaY: 60,
  alternateKeyTargetStyle: {
    scale: 2,
    translateY: 0.6, // em
    color: {
      r: 0, g: 0, b: 0
    }
  },
  currentKeyTargetStyle: {
    scale: 0,
    opacity: 0
  }
}

function processFunctionKey(
  keyname: string,
  mode: KeyboardMode,
  setMode: (newMode: KeyboardMode) => void,
  event: React.PointerEvent<Element>,
  xySetter: XYSetter
) {
  switch (keyname) {
    case "shift":
      switch (mode) {
        case KeyboardMode.Standard:
          setMode(KeyboardMode.Shift)
          break
        case KeyboardMode.Shift:
          setMode(KeyboardMode.Standard)
          break
        case KeyboardMode.Alternate:
          setMode(KeyboardMode.AlternateShift)
          break
        case KeyboardMode.AlternateShift:
          setMode(KeyboardMode.Alternate)
          break
      }
      break
    case "capslock":
      if (mode === KeyboardMode.Standard || mode === KeyboardMode.Shift) {
        setMode(KeyboardMode.Capslocked)
      } else if (mode === KeyboardMode.Capslocked) {
        setMode(KeyboardMode.Standard)
      }
      break
    case ".?123":
      setMode(KeyboardMode.Alternate)
      break
    case "ABC":
      setMode(KeyboardMode.Standard)
      break
    case "#+=":
      setMode(KeyboardMode.AlternateShift)
      break
    case "123":
      setMode(KeyboardMode.Alternate)
      break
    case "move":
      handleMove(event, xySetter)
      break
  }
}

function delayedRepeatInput(timeoutRef: MutableRefObject<number>, intervalRef: MutableRefObject<number>, action: () => void) {
  timeoutRef.current = setTimeout(() => {
    timeoutRef.current = null
    intervalRef.current = setInterval(() => {
      action()
    }, REPEATE_INPUT_INTERVAL)
  }, REPEATE_INPUT_DELAY)

  window.addEventListener('pointerup', () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, { once: true })
}

function beginDraggingToAlternative(e: React.PointerEvent<Element>, onPointerUp: (usingAlternate: boolean) => void) {
  const { clientY: startY } = e
  const keycap = e.currentTarget as HTMLElement
  const alternate = keycap.children[0] as HTMLElement
  const current = keycap.children[1] as HTMLElement

  const alternateColor = window.getComputedStyle(alternate).getPropertyValue("color")
  const matchedColor = alternateColor.match(/rgb\(\s*(.*),\s*(.*),\s*(.*)\s*\)/)
  const acR = parseInt(matchedColor[1], 10)
  const acG = parseInt(matchedColor[2], 10)
  const acB = parseInt(matchedColor[3], 10)
  console.log({ acR, acG, acB })

  const {
    maxDeltaY,
    alternateKeyTargetStyle: {
      scale,
      translateY,
      color: {
        r, g, b
      }
    },
    currentKeyTargetStyle: {
      scale: scaleCurrent,
      opacity
    }
  } = ALTERNATE_SLIDE

  const scaleDefault = 1
  const dr = r - acR, dg = g - acG, db = b - acB

  let usingAlternate = false

  function pointermove(e: PointerEvent) {
    const { clientY } = e
    const deltaY = clientY - startY

    if (deltaY <= 0) {
      alternate.style.transform = ''
      alternate.style.color = ''
      current.style.transform = ''
      current.style.opacity = ''
      usingAlternate = false
    } else if (deltaY > maxDeltaY) {
      alternate.style.transform = `scale(${scale}) translateY(${translateY}em)`
      alternate.style.color = `rgb(${r}, ${g}, ${b})`
      current.style.transform = `scale(${scaleCurrent})`
      current.style.opacity = `${opacity}`
      usingAlternate = true
    } else {
      const ratio = deltaY / maxDeltaY
      usingAlternate = ratio > 0.5

      alternate.style.transform = `scale(${(scale - scaleDefault) * ratio + scaleDefault}) translateY(${translateY * ratio}em)`
      alternate.style.color = `rgb(${acR + dr * ratio}, ${acG + dg * ratio}, ${acB + db * ratio})`
      current.style.transform = `scale(${(scaleCurrent - scaleDefault) * ratio + scaleDefault})`
      current.style.opacity = `${1 - (1 - opacity) * ratio}`
    }
  }

  function pointerup() {
    window.removeEventListener('pointermove', pointermove)
    alternate.classList.add('sliding-back')
    current.classList.add('sliding-back')

    alternate.addEventListener('transitionend', () => {
      alternate.classList.remove('sliding-back')
    }, { once: true })

    current.addEventListener('transitionend', () => {
      current.classList.remove('sliding-back')
    }, { once: true })

    alternate.style.transform = ''
    alternate.style.color = ''
    current.style.transform = ''
    current.style.opacity = ''

    onPointerUp(usingAlternate)
  }

  window.addEventListener('pointermove', pointermove, { passive: true })
  window.addEventListener('pointerup', pointerup, { once: true })
}

export const StandardKeyboard = forwardRef<HTMLDivElement>(function StandardKeyboard(_props, keyboardRef: MutableRefObject<HTMLDivElement>) {
  const [mode, setMode] = useState(KeyboardMode.Standard)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const delayRef = useRef<number>(null)
  const intervalRef = useRef<number>(null)

  const onPointerDown = useCallback((e: React.PointerEvent<Element>) => {
    const div = e.currentTarget as HTMLElement
    let keyname = div.dataset.keyname
    switch (keyname) {
      case "tab":
        keyname = "\t"
        break
      case "space":
        keyname = " "
        break
    }

    e.preventDefault() // 防止丢失焦点
    const input = document.activeElement
    if (!input || !(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
      console.warn("no active element")
      return
    }

    if (keyname === 'backspace') {
      backspace(input)
      delayedRepeatInput(delayRef, intervalRef, () => {
        backspace(input)
      })
    } else if (keyname.length === 1) {
      const alternateKeyname = div.dataset.alternateKeyname


      if (alternateKeyname) {
        beginDraggingToAlternative(e, (usingAlternate) => {
          inputCharacterAtCursor(input, usingAlternate ? alternateKeyname : keyname)
          if (mode === KeyboardMode.Shift) {
            setMode(KeyboardMode.Standard)
          }
        })
      } else {
        window.addEventListener('pointerup', () => {
          inputCharacterAtCursor(input, keyname)
          if (mode === KeyboardMode.Shift) {
            setMode(KeyboardMode.Standard)
          }
        }, { once: true })
      }
    } else {
      processFunctionKey(keyname, mode, setMode, e, { x, y, setX, setY, keyboardRef })

    }
  }, [mode, setMode, x, y, setX, setY, keyboardRef])

  useLayoutEffect(() => {
    if (!keyboardRef.current) return

    const keyboard = keyboardRef.current

    const { width, height } = keyboard.getBoundingClientRect()
    const { innerWidth, innerHeight } = window

    // 底部居中
    setX((innerWidth - width) / 2)
    setY(innerHeight - height)
  }, [])

  return (
    <div id="keyboard"
      ref={keyboardRef}
      onPointerDown={(e) => e.target instanceof HTMLInputElement || e.preventDefault()}
      data-mode={mode}
      style={{ left: `${x}px`, top: `${y}px` }}>
      <input name="test1" />
      <input name="test2" />
      {KEY_CAPS.map((row, i) => {
        return (
          <div key={i} className="keyboard-row">
            {row.map((keycap) => {
              return (
                <Key
                  onPointerDown={onPointerDown}
                  key={keycap.reactKey}
                  keycap={keycap}
                  mode={mode}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
})
