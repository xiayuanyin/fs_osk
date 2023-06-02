import React from 'react'

const inputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set
const textAreaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set

export interface XYSetter {
  x: number
  y: number
  setX: (n: number) => void
  setY: (n: number) => void
}

export function handleMove(event: React.PointerEvent<Element>, { x, y, setX, setY }: XYSetter) {
  const { clientX: startX, clientY: startY } = event

  function pointermove(event: PointerEvent) {
    const { clientX, clientY } = event

    setX(x + clientX - startX)
    setY(y + clientY - startY)
  }

  function pointerup(_event: PointerEvent) {
    window.removeEventListener('pointermove', pointermove)
  }

  window.addEventListener('pointermove', pointermove, { passive: true })
  window.addEventListener('pointerup', pointerup, { once: true })
}

export function setInputValue(
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  selectionStart: number,
  selectionEnd: number
) {
  if (input instanceof HTMLInputElement) {
    inputValueSetter!.call(input, value)
  } else {
    textAreaValueSetter!.call(input, value)
  }

  input.setSelectionRange(selectionStart, selectionEnd)
  input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }))
}


export function inputCharacterAtCursor(input: HTMLInputElement | HTMLTextAreaElement, keyname: string, pattern?: RegExp) {
  const { selectionStart, selectionEnd, value } = input
  const newValue = `${value.substring(0, selectionStart!)}${keyname}${value.substring(selectionEnd!)}`
  if (pattern && !pattern.test(newValue)) {
    return
  }

  setInputValue(input, newValue, selectionStart! + 1, selectionStart! + 1)
}

export function backspace(input: HTMLInputElement | HTMLTextAreaElement) {
  const { selectionStart, selectionEnd, value } = input

  if (selectionStart !== selectionEnd) {
    const newValue = `${value.substring(0, selectionStart!)}${value.substring(selectionEnd!)}`
    setInputValue(input, newValue, selectionStart!, selectionStart!)
  } else {
    if (selectionStart === 0) {
      return
    } else {
      const newStart = selectionStart! - 1
      const newValue = `${value.substring(0, newStart)}${value.substring(selectionStart!)}`
      setInputValue(input, newValue, newStart, newStart)
    }
  }
}
