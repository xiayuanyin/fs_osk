import React, { StrictMode, useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { OnscreenKeyboardContainer } from "./container";

export class OnscreenKeyboard {
  element: HTMLElement
  reactRoot: Root

  install() {
    const keyboardDiv = document.createElement('div')
    keyboardDiv.classList.add('__onscreen_keyboard_container')
    document.body.appendChild(keyboardDiv)

    this.reactRoot = createRoot(keyboardDiv)
    this.reactRoot.render(
      <StrictMode>
        <OnscreenKeyboardContainer />
      </StrictMode>
    )

    this.element = keyboardDiv
  }

  dispose() {
    this.reactRoot.unmount()
    this.element.remove()
  }
}


export function useOnscreenKeyboard() {
  const keyboardRef = useRef<OnscreenKeyboard>(null)

  useEffect(() => {
    if (keyboardRef.current) return

    const onscreenKeyboard = new OnscreenKeyboard()
    onscreenKeyboard.install()
    keyboardRef.current = onscreenKeyboard

    return () => {
      keyboardRef.current.dispose()
      keyboardRef.current = null
    }
  }, [])
}
