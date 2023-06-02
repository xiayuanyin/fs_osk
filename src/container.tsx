import React, { useEffect, useState } from "react";
import { StandardKeyboard } from "./standard";
import { DecimalKeyboard } from "./decimal";

enum State {
  None, Standard, Decimal
}

export function OnscreenKeyboardContainer() {
  const [keyboardState, setKeyboardState] = useState(State.None)

  function focusin(event: FocusEvent) {
    if ((event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) && !event.target.closest('#keyboard')) {
      setKeyboardState(State.Standard)
    }
  }

  function focusout(event: FocusEvent) {
    // if (event.target instanceof HTMLElement && !event.target.closest('#keyboard')) {
    //   setKeyboardState(State.None)
    // }

    // console.log('blurred:', event.target)
  }

  useEffect(() => {
    window.addEventListener('focusin', focusin)
    window.addEventListener('focusout', focusout)

    return () => {
      window.removeEventListener('focusin', focusin)
      window.removeEventListener('focusout', focusout)
    }
  }, [])

  switch (keyboardState) {
    case State.Standard:
      return <StandardKeyboard />
    case State.Decimal:
      return <DecimalKeyboard />
    default:
      return null
  }
}
