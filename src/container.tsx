import React, { useEffect, useRef, useState } from "react";
import { CSSTransition } from 'react-transition-group'
import { DecimalKeyboard } from "./decimal";
import { StandardKeyboard } from "./standard";
import { KeyboardElement, isKeyboardElement, KeyboardState, desiredKeyboardState, fromKeyboardElement, IFocusEvent, activeElementWithIframe, relatedTargetShouldHaveKeyboard } from "./util";

function onKeyboard(element: any) {
  return !!(element as HTMLElement).closest('#keyboard') || element.nodeName === 'FS-OSK'
}


export function fromKeyboard(event: IFocusEvent) {
  if (event instanceof FocusEvent) {
    return onKeyboard(event.target)
  } else {
    return false
  }
}

export function OnscreenKeyboardContainer() {
  const [keyboardState, setKeyboardState] = useState(KeyboardState.None)
  const [targetElement, setTargetElement] = useState<KeyboardElement>(null)
  const [standardAlwaysOn, setStandardAlwaysOn] = useState(false)
  const standardKeyboardRef = useRef<HTMLDivElement>(null)
  const decimalKeyboardRef = useRef<HTMLDivElement>(null)
  const focusingOnInputOnKeyboardRef = useRef(false)
  const standardKeyBoardDisplay = keyboardState === KeyboardState.Standard || (standardAlwaysOn && keyboardState !== KeyboardState.Decimal)

  useEffect(() => {
    const EVENT_TYPE = 'LOC:osk_set_standard_always_on'

    function onStandardAlwaysOn(e: CustomEvent<{data: boolean}>) {
      setStandardAlwaysOn(e.detail.data)
    }

    document.addEventListener(EVENT_TYPE, onStandardAlwaysOn)

    return () => {
      document.removeEventListener(EVENT_TYPE, onStandardAlwaysOn)
    }
  }, [])

  function focusin(event: IFocusEvent) {
    if (fromKeyboardElement(event) && !fromKeyboard(event)) {
      const activeElement = activeElementWithIframe(document) as KeyboardElement
      setTargetElement(activeElement)
      setKeyboardState(desiredKeyboardState(activeElement))
    }
  }

  function focusout(event: IFocusEvent) {
    if (!focusingOnInputOnKeyboardRef.current && !relatedTargetShouldHaveKeyboard(event)) {
      setKeyboardState(KeyboardState.None)
    }
  }

  useEffect(() => {
    window.addEventListener('focusin', focusin)
    window.addEventListener('iframe:focusin', focusin)
    window.addEventListener('focusout', focusout)
    window.addEventListener('iframe:focusout', focusout)

    return () => {
      window.removeEventListener('focusin', focusin)
      window.removeEventListener('iframe:focusin', focusin)
      window.removeEventListener('focusout', focusout)
      window.removeEventListener('iframe:focusout', focusout)
    }
  }, [])

  return <>
    <CSSTransition nodeRef={standardKeyboardRef} in={standardKeyBoardDisplay} timeout={500} classNames="standard-keyboard" unmountOnExit onExit={() => {
      const keyboard = standardKeyboardRef.current
      const { top, height } = keyboard.getBoundingClientRect()
      if (top < (window.innerHeight - height)) {
        keyboard.classList.add('fade')
      }
    }}>
      <StandardKeyboard ref={standardKeyboardRef} />
    </CSSTransition>
    <CSSTransition nodeRef={decimalKeyboardRef} in={keyboardState === KeyboardState.Decimal} timeout={250} classNames="decimal-keyboard" unmountOnExit>
      <DecimalKeyboard
        focusingOnInputOnKeyboardRef={focusingOnInputOnKeyboardRef}
        targetElement={targetElement}
        ref={decimalKeyboardRef} />
    </CSSTransition>
  </>
}
