import React, { useEffect, useRef, useState } from "react";
import { CSSTransition } from 'react-transition-group'
import { DecimalKeyboard } from "./decimal";
import { StandardKeyboard } from "./standard";

enum State {
  None, Standard, Decimal
}

function isFocusable(element: any) {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
}

function onKeyboard(element: any) {
  return !!(element as HTMLElement).closest('#keyboard')
}

export function OnscreenKeyboardContainer() {
  const [keyboardState, setKeyboardState] = useState(State.None)
  const standardKeyboardRef = useRef<HTMLDivElement>(null)
  const decimalKeyboardRef = useRef<HTMLDivElement>(null)

  function focusin(event: FocusEvent) {
    if (isFocusable(event.target) && !onKeyboard(event.target)) {
      setKeyboardState(State.Standard)
    }
  }

  function focusout(event: FocusEvent) {
    if (!onKeyboard(event.target) && !isFocusable(event.relatedTarget)) {
      setKeyboardState(State.None)
    }
  }

  useEffect(() => {
    window.addEventListener('focusin', focusin)
    window.addEventListener('focusout', focusout)

    return () => {
      window.removeEventListener('focusin', focusin)
      window.removeEventListener('focusout', focusout)
    }
  }, [])

  return <>
    <CSSTransition nodeRef={standardKeyboardRef} in={keyboardState === State.Standard} timeout={500} classNames="standard-keyboard" unmountOnExit onExit={() => {
      console.log('hey')
      const keyboard = standardKeyboardRef.current
      const { top, height } = keyboard.getBoundingClientRect()
      if (top < (window.innerHeight - height)) {
        keyboard.classList.add('fade')
      }
    }}>
      <StandardKeyboard ref={standardKeyboardRef} />
    </CSSTransition>
    <CSSTransition nodeRef={decimalKeyboardRef} in={keyboardState === State.Decimal} timeout={500} classNames="decimal-keyboard" unmountOnExit>
      <DecimalKeyboard ref={decimalKeyboardRef} />
    </CSSTransition>
  </>
}
