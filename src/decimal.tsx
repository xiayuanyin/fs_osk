import React, { MutableRefObject, forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { KeyboardElement, KeyboardState, activeElementWithIframe, backspace, delayedRepeatInput, desiredKeyboardState, inputCharacterAtCursor, isKeyboardElement, useKeycapPointerDown } from './util'

function Key(
  { keyname, onPointerDown, isFunctionKey = false }: {
    keyname: string,
    onPointerDown?: React.PointerEventHandler<HTMLDivElement>,
    isFunctionKey?: boolean
  }
) {
  const keycapRef = useRef<HTMLDivElement>(null)
  const onPointerDownWrapper = useKeycapPointerDown(onPointerDown, keycapRef)

  return <div
    ref={keycapRef}
    className={`keycap ${isFunctionKey ? 'function-key' : ''}`}
    data-keyname={keyname}
    onPointerDown={onPointerDownWrapper}>
    {keyname}
  </div>
}

const DECIMAL_ONLY = /^-?\d*(?:\.\d*)?$/

export const DecimalKeyboard = forwardRef(function DecimalKeyboard(
  { targetElement, focusingOnInputOnKeyboardRef }: {
    targetElement: KeyboardElement,
    focusingOnInputOnKeyboardRef: MutableRefObject<boolean>
  },
  keyboardRef: MutableRefObject<HTMLDivElement>
) {
  const inputRef = useRef<HTMLInputElement>(null)
  const delayedRef = useRef<number>(null)
  const intervalRef = useRef<number>(null)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  useLayoutEffect(() => {
    if (desiredKeyboardState(targetElement) != KeyboardState.Decimal) return

    const {
      left: elementLeft,
      right: elementRight,
      top: elementTop,
      bottom: elementBottom,
    } = targetElement.getBoundingClientRect()
    const ownerWindow = targetElement.ownerDocument.defaultView

    let x = elementLeft, y = elementBottom

    if (ownerWindow !== window) {
      let iframe: HTMLIFrameElement | undefined = undefined
      for (const iframeElement of ownerWindow.parent.document.getElementsByTagName('iframe')) {
        if (iframeElement.contentDocument === targetElement.ownerDocument) {
          iframe = iframeElement
          break
        }
      }

      const { left, top } = iframe.getBoundingClientRect()
      const { borderTopWidth, borderLeftWidth } = getComputedStyle(iframe)

      x += left + parseInt(borderLeftWidth, 10)
      y += top + parseInt(borderTopWidth, 10)
    }

    const { innerWidth: windowWidth, innerHeight: windowHeight } = window
    const { width: keyboardWidth, height: keyboardHeight } = keyboardRef.current.getBoundingClientRect()

    if (x + keyboardWidth > windowWidth) {
      x = windowWidth - keyboardWidth
    }

    if (y + keyboardHeight > windowHeight) {
      y = elementTop - keyboardHeight - 3
    }

    setX(x)
    setY(y)

    inputRef.current.value = targetElement.value
    focusingOnInputOnKeyboardRef.current = true
    inputRef.current.focus()
    focusingOnInputOnKeyboardRef.current = false

    function focus() {
      focusingOnInputOnKeyboardRef.current = true
      inputRef.current.focus()
      focusingOnInputOnKeyboardRef.current = false
    }

    targetElement.addEventListener('focus', focus)

    return () => {
      targetElement.removeEventListener('focus', focus)
    }

  }, [targetElement])

  function getPointerDownHandler(keyname: string) {
    return function(e: React.PointerEvent<HTMLDivElement>) {
      e.preventDefault()
      e.stopPropagation()
      inputCharacterAtCursor(inputRef.current, keyname, DECIMAL_ONLY)
    }
  }

  return <div
    id="keyboard"
    ref={keyboardRef}
    className="decimal"
    onPointerDown={e => {
      e.target instanceof HTMLInputElement || e.preventDefault()
    }}
    onContextMenu={e => {
      e.stopPropagation()
      e.preventDefault()
    }}
    style={{
      top: `${y}px`,
      left: `${x}px`
    }}
  >
    <input type="text" ref={inputRef} className='current-input' name="osk-decimal-current-input" />
    <Key keyname="1" onPointerDown={getPointerDownHandler("1")} />
    <Key keyname="2" onPointerDown={getPointerDownHandler("2")} />
    <Key keyname="3" onPointerDown={getPointerDownHandler("3")} />

    <Key keyname="4" onPointerDown={getPointerDownHandler("4")} />
    <Key keyname="5" onPointerDown={getPointerDownHandler("5")} />
    <Key keyname="6" onPointerDown={getPointerDownHandler("6")} />
    <Key keyname="7" onPointerDown={getPointerDownHandler("7")} />
    <Key keyname="8" onPointerDown={getPointerDownHandler("8")} />
    <Key keyname="9" onPointerDown={getPointerDownHandler("9")} />
    <Key keyname="0" onPointerDown={getPointerDownHandler("0")} />
    <Key keyname="." onPointerDown={getPointerDownHandler(".")} />
    <Key keyname="-" onPointerDown={(e) => {
      const { value } = inputRef.current
      if (value.startsWith('-')) {
        inputRef.current.value = value.substring(1)
      } else {
        inputRef.current.value = '-' + value
      }
    }} />

    <Key keyname='bksp' isFunctionKey onPointerDown={(e) => {
      e.preventDefault()
      backspace(inputRef.current)
      delayedRepeatInput(delayedRef, intervalRef, () => {
        backspace(inputRef.current)
      })
    }} />

    <Key keyname='return' isFunctionKey onPointerDown={() => {
      targetElement.value = inputRef.current.value
      inputRef.current.blur()
    }} />

    <Key keyname='clear' isFunctionKey onPointerDown={(e => {
      e.preventDefault()
      inputRef.current.value = ''
    })} />

    <Key keyname="←" isFunctionKey onPointerDown={(e) => {
      e.preventDefault()
      if (!inputRef.current) return
      const input = inputRef.current

      input.selectionStart = input.selectionEnd = Math.max(0, input.selectionStart - 1)

      delayedRepeatInput(delayedRef, intervalRef, () => {
        input.selectionStart = input.selectionEnd = Math.max(0, input.selectionStart - 1)
      })

    }} />

    <Key keyname="→" isFunctionKey onPointerDown={(e) => {
      e.preventDefault()
      if (!inputRef.current) return
      const input = inputRef.current

      input.selectionStart = input.selectionEnd = Math.min(input.value.length, input.selectionEnd + 1)

      delayedRepeatInput(delayedRef, intervalRef, () => {
        input.selectionStart = input.selectionEnd = Math.min(input.value.length, input.selectionEnd + 1)
      })
    }} />
  </div >
})
