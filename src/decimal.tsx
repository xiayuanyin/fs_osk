import React, { useRef } from 'react'
import { backspace, inputCharacterAtCursor } from './util'

function Key({ keyname, onPointerDown }: { keyname: string, onPointerDown?: React.PointerEventHandler<HTMLDivElement> }) {
  return <div className='keycap' data-keyname={keyname} onPointerDown={onPointerDown}>
    {keyname}
  </div>
}

const DECIMAL_ONLY = /^-?\d*(?:\.\d*)?$/

export function DecimalKeyboard() {
  const inputRef = useRef<HTMLInputElement>(null)
  const keyboardRef = useRef<HTMLDivElement>(null)

  function getPointerDownHandler(keyname: string) {
    return function(e: React.PointerEvent<HTMLDivElement>) {
      e.preventDefault()
      inputCharacterAtCursor(inputRef.current!, keyname, DECIMAL_ONLY)
    }
  }

  return <div id="keyboard" ref={keyboardRef} className="decimal" onPointerDown={e => {
    if (e.target === keyboardRef.current) {
      e.preventDefault()
    }
  }}>
    <input type="text" ref={inputRef} className='current-input' name="current-input" />
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
    <Key keyname="-" onPointerDown={getPointerDownHandler("-")} />

    <Key keyname='bksp' onPointerDown={(e) => {
      e.preventDefault()
      backspace(inputRef.current!)
    }} />
    <Key keyname='return' />
    <Key keyname='clear' onPointerDown={(e => {
      e.preventDefault()
      inputRef.current!.value = ''
    })} />
    <Key keyname="←" onPointerDown={(e) => {
      e.preventDefault()
      if (!inputRef.current) return
      const input = inputRef.current

      input.selectionStart = input.selectionEnd = Math.max(0, input.selectionStart! - 1)
    }} />
    <Key keyname="→" onPointerDown={(e) => {
      e.preventDefault()
      if (!inputRef.current) return
      const input = inputRef.current

      input.selectionStart = input.selectionEnd = Math.min(input.value.length, input.selectionEnd! + 1)
    }} />
  </div >
}
