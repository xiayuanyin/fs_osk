import React, { StrictMode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import style from './stylesheets/index.less?loader=text'
import { OnscreenKeyboardContainer } from './container'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['fs-osk']: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

if (typeof document != 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    class FsOsk extends HTMLElement {
      reactRoot: Root
      reactRootElement: HTMLElement
    
      constructor() {
        super()
    
        this.attachShadow({ mode: 'open' })
    
        const styleElement = document.createElement('style')
        styleElement.textContent = style
        this.shadowRoot.appendChild(styleElement)
    
        this.reactRootElement = document.createElement('div')
        this.reactRootElement.classList.add('react-root')
        this.shadowRoot.appendChild(this.reactRootElement)
      }
    
      connectedCallback() {
        this.reactRoot = createRoot(this.reactRootElement)
        this.reactRoot.render(
          <StrictMode>
            <OnscreenKeyboardContainer />
          </StrictMode>
        )
      }
    
      disconnectedCallback() {
        this.reactRoot.unmount()
        this.reactRoot = null
      }
    }
    

    customElements.define('fs-osk', FsOsk)
  })
}
