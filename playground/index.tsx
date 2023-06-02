import { createRoot } from 'react-dom/client'
import { App } from './App'
import React, { StrictMode } from 'react'
import "./index.css"
import { OnscreenKeyboard } from '../src'

new OnscreenKeyboard().install()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
