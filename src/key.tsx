import { KeyboardMode, KeyCap, Alignment } from "./keycap"

export interface KeyProps {
  keycap: KeyCap
  mode: KeyboardMode
  alignment: Alignment
  onKeyPress: React.PointerEventHandler
}


export function Key({ keycap, mode, alignment, onKeyPress }: KeyProps) {
  let fragment: React.ReactNode
  const { isFunctionKey } = keycap

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
      onPointerDown={onKeyPress}
      className={`keycap ${keycap.isFunctionKey ? "function-key" : ""}`}
      data-keyname={keycap.currentName(mode)}
    >
      {fragment}
    </div>
  )
}
