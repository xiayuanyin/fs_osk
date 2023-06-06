import React, { Dispatch, SetStateAction, RefObject, MutableRefObject } from 'react'

const REPEATE_INPUT_DELAY = 500 // ms
const REPEATE_INPUT_INTERVAL = 50 //ms

const inputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set
const textAreaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set

export type KeyboardElement = HTMLInputElement | HTMLTextAreaElement

export function isKeyboardElement(element: any) {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
}

export function desiredKeyboardState(input: KeyboardElement) {
  if (input.dataset.keyboardType === 'decimal') {
    return KeyboardState.Decimal
  } else {
    return KeyboardState.Standard
  }
}

export enum KeyboardState {
  None, Standard, Decimal
}

export interface XYSetter {
  x: number
  y: number
  setX: Dispatch<SetStateAction<number>>
  setY: Dispatch<SetStateAction<number>>
  keyboardRef: RefObject<HTMLElement>
}

export function handleMove(event: React.PointerEvent<Element>, { x, y, setX, setY, keyboardRef }: XYSetter) {
  const { clientX: startX, clientY: startY } = event

  console.log('start handling move')
  const keyboardElement = keyboardRef.current

  function pointermove(event: PointerEvent) {
    const { clientX, clientY } = event
    keyboardElement.style.transform = `translate(${clientX - startX}px, ${clientY - startY}px)`
  }

  function pointerup(event: PointerEvent) {
    console.log('pointer up')
    const { clientX, clientY } = event

    window.removeEventListener('pointermove', pointermove)

    const finalX = x + clientX - startX
    const finalY = y + clientY - startY
    keyboardElement.style.transform = ''

    setX(finalX)
    setY(finalY)
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
    inputValueSetter.call(input, value)
  } else {
    textAreaValueSetter.call(input, value)
  }

  input.setSelectionRange(selectionStart, selectionEnd)
  input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }))
}


export function inputCharacterAtCursor(input: HTMLInputElement | HTMLTextAreaElement, keyname: string, pattern?: RegExp) {
  const { selectionStart, selectionEnd, value } = input
  const newValue = `${value.substring(0, selectionStart)}${keyname}${value.substring(selectionEnd)}`
  if (pattern && !pattern.test(newValue)) {
    return
  }

  setInputValue(input, newValue, selectionStart + 1, selectionStart + 1);
  (input as any).inputtingCharacterProgrammatically = true
  input.blur()
  input.focus();
  (input as any).inputtingCharacterProgrammatically = false
}

export function backspace(input: HTMLInputElement | HTMLTextAreaElement) {
  const { selectionStart, selectionEnd, value } = input

  if (selectionStart !== selectionEnd) {
    const newValue = `${value.substring(0, selectionStart)}${value.substring(selectionEnd)}`
    setInputValue(input, newValue, selectionStart, selectionStart)
  } else {
    if (selectionStart === 0) {
      return
    } else {
      const newStart = selectionStart - 1
      const newValue = `${value.substring(0, newStart)}${value.substring(selectionStart)}`
      setInputValue(input, newValue, newStart, newStart)
    }
  }
}

export function delayedRepeatInput(timeoutRef: MutableRefObject<number>, intervalRef: MutableRefObject<number>, action: () => void) {
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
