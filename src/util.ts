import React, { Dispatch, SetStateAction, RefObject, MutableRefObject } from 'react'

const REPEATE_INPUT_DELAY = 500 // ms
const REPEATE_INPUT_INTERVAL = 50 //ms

const inputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set
const textAreaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set

export type KeyboardElement = HTMLInputElement | HTMLTextAreaElement
export type IFocusEvent = FocusEvent | CustomEvent<IframeEventRedispatchedDetail>

export function isKeyboardElement(element: any) {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element?.nodeName == 'FS-OSK'
}

export function fromKeyboardElement(event: IFocusEvent) {
  if (event instanceof FocusEvent) {
    return isKeyboardElement(event.target)
  } else {
    const { tagName } = event.detail

    return tagName === 'INPUT' || tagName === 'TEXTAREA'
  }
}

export function relatedTargetShouldHaveKeyboard(event: IFocusEvent) {
  if (event instanceof FocusEvent) {
    return isKeyboardElement(event.relatedTarget)
  } else {
    const { relatedDetail: { tagName } = {} } = event.detail

    return tagName === 'INPUT' || tagName === 'TEXTAREA'
  }
}

export function activeElementWithIframe(document: Document) {
  const { activeElement } = document
  if (activeElement instanceof HTMLIFrameElement) {
    return activeElementWithIframe(activeElement.contentDocument)
  } else {
    return activeElement
  }
}

export function desiredKeyboardState(input: KeyboardElement) {
  if (input.type === 'number' || input.dataset.keyboardType === 'decimal') {
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
  if (input.tagName === 'INPUT') {
    inputValueSetter.call(input, value)
  } else {
    textAreaValueSetter.call(input, value)
  }

  input.setSelectionRange(selectionStart, selectionEnd)
  input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }))
}

function disableFocus(e: FocusEvent) {
  e.stopPropagation()
  e.stopImmediatePropagation()
  e.preventDefault()
}

export function inputCharacterAtCursor(input: HTMLInputElement | HTMLTextAreaElement, keyname: string, pattern?: RegExp) {
  const { selectionStart, selectionEnd, value } = input
  const newValue = `${value.substring(0, selectionStart)}${keyname}${value.substring(selectionEnd)}`
  if (pattern && !pattern.test(newValue)) {
    return
  }

  setInputValue(input, newValue, selectionStart + 1, selectionStart + 1);
  input.addEventListener('focusout', disableFocus)
  input.blur()
  input.focus();
  input.removeEventListener('focusout', disableFocus)
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

export interface IframeEventRedispatchedDetail {
  tagName: string
  type: string
  disabled: boolean
  className: string
  relatedDetail?: Omit<IframeEventRedispatchedDetail, 'relatedDetail'>
}

export function redispatchIframeEvent(iframe: HTMLIFrameElement & { __redispatchers_installed?: boolean }, ...events: (keyof HTMLElementEventMap)[]) {
  const reDispatchEvent = (e: Event) => {
    const target = e.target as HTMLInputElement;

    const detail: IframeEventRedispatchedDetail = {
      tagName: target.tagName,
      type: target.type,
      disabled: target.disabled,
      className: target.className,
    }

    const relatedTarget = (e as FocusEvent).relatedTarget as (HTMLInputElement | HTMLTextAreaElement)

    if (relatedTarget) {
      detail.relatedDetail = {
        tagName: relatedTarget.tagName,
        type: relatedTarget.type,
        disabled: relatedTarget.disabled,
        className: relatedTarget.className,
      }
    }

    const newEvent = new CustomEvent<IframeEventRedispatchedDetail>(`iframe:${e.type}`, {
      detail,
      bubbles: true
    });

    iframe.dispatchEvent(newEvent);
  };

  if (!iframe.__redispatchers_installed) {
    iframe.addEventListener('load', () => {
      const { contentDocument } = iframe

      for (const eventName of events) {
        contentDocument.addEventListener(eventName, reDispatchEvent, true)
      }
    }, { once: true })

    iframe.__redispatchers_installed = true
  }

  return () => {
    const { contentDocument } = iframe

    for (const eventName of events) {
      contentDocument.removeEventListener(eventName, reDispatchEvent, true)
    }
  }
}
