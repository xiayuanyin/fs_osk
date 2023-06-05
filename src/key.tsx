import React from 'react'
import { KeyboardMode, KeyCap, Alignment } from "./keycap"

export interface KeyProps {
  keycap: KeyCap
  mode: KeyboardMode
  alignment: Alignment
  onPointerUp: React.PointerEventHandler
  onPointerDown: React.PointerEventHandler
}


export function Key({ keycap, mode, alignment, onPointerUp, onPointerDown }: KeyProps) {
  let fragment: React.ReactNode
  const { isFunctionKey } = keycap

  console.log('key renders')

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

  return (
    <div
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      className={`keycap ${keycap.isFunctionKey ? "function-key" : "character-key"}`}
      data-keyname={keycap.currentName(mode)}
      data-alterate-keyname={keycap.currentAlternateName(mode)}
    >
      {fragment}
    </div>
  )
}
