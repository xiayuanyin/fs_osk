import React, { useEffect, useRef, useState } from "react";
import { CSSTransition } from 'react-transition-group'
import { DecimalKeyboard } from "./decimal";
import { StandardKeyboard } from "./standard";
import { KeyboardElement, isKeyboardElement, KeyboardState, desiredKeyboardState } from "./util";

function onKeyboard(element: any) {
  return !!(element as HTMLElement).closest('#keyboard') || element.nodeName === 'FS-OSK'
}

export function OnscreenKeyboardContainer() {
  const [keyboardState, setKeyboardState] = useState(KeyboardState.None)
  const [targetElement, setTargetElement] = useState<KeyboardElement>(null)
  const standardKeyboardRef = useRef<HTMLDivElement>(null)
  const decimalKeyboardRef = useRef<HTMLDivElement>(null)

  function focusin(event: FocusEvent) {
    // console.log("focusin", event.target, "relatedTarget:", event.relatedTarget)

    if (isKeyboardElement(event.target) && !onKeyboard(event.target)) {
      setTargetElement(document.activeElement as KeyboardElement)
      setKeyboardState(desiredKeyboardState(event.target as KeyboardElement))
    }
  }

  function focusout(event: FocusEvent) {
    // console.log("focusout", event.target, "relatedTarget:", event.relatedTarget)

    if (!isKeyboardElement(event.relatedTarget)) {
      setKeyboardState(KeyboardState.None)
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
    <CSSTransition nodeRef={standardKeyboardRef} in={keyboardState === KeyboardState.Standard} timeout={500} classNames="standard-keyboard" unmountOnExit onExit={() => {
      console.log('hey')
      const keyboard = standardKeyboardRef.current
      const { top, height } = keyboard.getBoundingClientRect()
      if (top < (window.innerHeight - height)) {
        keyboard.classList.add('fade')
      }
    }}>
      <StandardKeyboard ref={standardKeyboardRef} />
    </CSSTransition>
    <CSSTransition nodeRef={decimalKeyboardRef} in={keyboardState === KeyboardState.Decimal} timeout={250} classNames="decimal-keyboard" unmountOnExit>
      <DecimalKeyboard targetElement={targetElement} ref={decimalKeyboardRef} />
    </CSSTransition>
  </>
}
