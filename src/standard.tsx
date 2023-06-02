import React, { useRef, useState } from "react"
import { useLayoutEffect } from "react"

import { KeyboardMode, Alignment } from './keycap'
import { KEY_CAPS } from "./definition"
import { Key } from "./key"
import { setInputValue, handleMove, XYSetter, inputCharacterAtCursor, backspace } from "./util"

function processFunctionKey(
  keyname: string,
  input: Element,
  mode: KeyboardMode,
  setMode: (newMode: KeyboardMode) => void,
  event: React.PointerEvent<Element>,
  xySetter: XYSetter
) {
  switch (keyname) {
    case "backspace":
      if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
        break
      }

      backspace(input)
      break
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

export function StandardKeyboard() {
  const [mode, setMode] = useState(KeyboardMode.Standard)
  const keyboardRef = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  const onKeyPress = (e: React.PointerEvent<Element>): void => {
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
    if (!input) {
      console.warn("no active element, nor lastFocus element")
      return
    }

    if (keyname?.length !== 1) {
      processFunctionKey(keyname!, input, mode, setMode, e, { x, y, setX, setY })
      return
    }

    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      inputCharacterAtCursor(input, keyname)
    }
  }

  useLayoutEffect(() => {
    if (!keyboardRef.current) return

    const { width, height } = keyboardRef.current!.getBoundingClientRect()
    const { innerWidth, innerHeight } = window

    // 底部居中
    setX((innerWidth - width) / 2)
    setY(innerHeight - height)
  }, [keyboardRef.current])

  return (
    <div id="keyboard"
      ref={keyboardRef}
      onPointerDown={(e) => e.target instanceof HTMLInputElement || e.preventDefault()}
      style={{ transform: `translate(${x}px, ${y}px)` }}>
      <input name="test1" />
      <input name="test2" />
      {KEY_CAPS.map((row, i) => {
        return (
          <div key={i} className="keyboard-row">
            {row.map((keycap) => {
              return (
                <Key
                  onKeyPress={onKeyPress}
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
}
