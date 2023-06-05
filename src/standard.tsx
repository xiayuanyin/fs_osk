import React, { MutableRefObject, forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { KeyboardMode, Alignment } from './keycap'
import { KEY_CAPS } from "./definition"
import { Key } from "./key"
import { handleMove, XYSetter, inputCharacterAtCursor, backspace } from "./util"

const REPEATE_INPUT_DELAY = 500 // ms
const REPEATE_INPUT_INTERVAL = 50 //ms

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

function beginDraggingToAlternative(e: React.PointerEvent<Element>) {
  const { clientY: StartY } = e

  function pointermove(e: PointerEvent) {
    const { clientY } = e

  }

  function pointerup(e: PointerEvent) {
    window.removeEventListener('pointermove', pointermove)
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

  const onPointerUp = useCallback((e: React.PointerEvent<Element>) => {
    // console.log("keypressed")
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

    if (keyname?.length !== 1) {
      if (keyname === 'backspace') {
        // 在pointerdown处理
        return
      } else {
        processFunctionKey(keyname, mode, setMode, e, { x, y, setX, setY, keyboardRef })
      }

      return
    }

    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      inputCharacterAtCursor(input, keyname)
      if (mode === KeyboardMode.Shift) {
        setMode(KeyboardMode.Standard)
      }
    }
  }, [mode, setMode, x, y, setX, setY, keyboardRef])

  const onPointerDown = useCallback((e: React.PointerEvent<Element>) => {
    const input = document.activeElement
    if (!input || !(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
      console.warn("no active element")
      return
    }
    const div = e.currentTarget as HTMLElement
    const keyname = div.dataset.keyname

    if (keyname === 'backspace') {
      backspace(input)
      delayedRepeatInput(delayRef, intervalRef, () => {
        backspace(input)
      })
    } else if (keyname.length === 1) {
      const alternateKeyname = div.dataset.alternateKeyname
      if (!alternateKeyname) return

      beginDraggingToAlternative(e)
    }
  }, [delayRef, intervalRef])

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
                  onPointerUp={onPointerUp}
                  onPointerDown={onPointerDown}
                  key={keycap.reactKey}
                  keycap={keycap}
                  alignment={Alignment.Left}
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
