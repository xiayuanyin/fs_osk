import React, { useRef } from 'react'
import { KeyboardMode, KeyCap } from "./keycap"
import { useKeycapPointerDown } from './util'

export interface KeyProps {
  keycap: KeyCap
  mode: KeyboardMode
  onPointerDown: React.PointerEventHandler
}

export function Key({ keycap, mode, onPointerDown }: KeyProps) {
  let fragment: React.ReactNode
  const { isFunctionKey } = keycap
  const keycapRef = useRef<HTMLDivElement>(null)

  switch (mode) {
    case KeyboardMode.Standard:
      fragment = (
        <>
          {!isFunctionKey && <div className="alternate">{keycap.alternateName}</div>}
          <div className="current">{keycap.name}</div>
        </>
      )
      break
    case KeyboardMode.Shift:
    case KeyboardMode.Capslocked:
      fragment = (
        <>
          {!isFunctionKey && <div className="alternate">{keycap.alternateName}</div>}
          <div className="current">{keycap.shiftName}</div>
        </>
      )
      break
    case KeyboardMode.Alternate:
      fragment = (
        <>
          {!isFunctionKey && keycap.alternateShiftName && <div className="alternate">{keycap.alternateShiftName}</div>}
          <div className="current">{keycap.alternateName}</div>
        </>
      )
      break
    case KeyboardMode.AlternateShift:
      fragment = (
        <>
          <div className="current">{keycap.alternateShiftName ?? keycap.alternateName}</div>
        </>
      )
      break
  }

  const onPointerDownWrapped = useKeycapPointerDown(onPointerDown, keycapRef);

  return (
    <div
      ref={keycapRef}
      onPointerDown={onPointerDownWrapped}
      className={`keycap ${keycap.isFunctionKey ? "function-key" : "character-key"}`}
      data-keyname={keycap.currentName(mode)}
      data-alternate-keyname={keycap.currentAlternateName(mode)}
    >
      {fragment}
    </div>
  )
}
