export enum KeyboardMode {
  Standard = 'Standard',
  Shift = 'Shift',
  Capslocked = 'Capslocked',
  Alternate = 'Alternate',
  AlternateShift = 'AlternateShift'
}

export enum Alignment {
  Left,
  Right
}

export class KeyCap {
  name: string
  shiftName: string
  alternateName?: string
  alternateShiftName?: string
  isFunctionKey = false
  reactKey: string

  constructor(definition: string) {
    const matched = definition.match(/^(.)\((.)(.)?\)$/)
    if (matched) {
      this.name = matched[1]

      if (this.name.match(/^[a-z]$/)) {
        this.shiftName = this.name.toUpperCase()
        this.alternateName = matched[2]
        this.alternateShiftName = matched[3]
      } else {
        this.shiftName = matched[2]
        this.alternateName = this.name
        this.alternateShiftName = this.shiftName
      }
    } else {
      this.isFunctionKey = true
      this.name = definition
      switch (this.name) {
        case ".?123":
          this.shiftName = this.name
          this.alternateName = "ABC"
          break
        case "shift":
          this.shiftName = this.name
          this.alternateName = "#+="
          this.alternateShiftName = "123"
          break
        default:
          this.shiftName = this.alternateName = this.alternateShiftName = definition
      }
    }

    this.reactKey = this.name
  }

  currentName(mode: KeyboardMode) {
    switch (mode) {
      case KeyboardMode.Standard:
        return this.name
      case KeyboardMode.Shift:
      case KeyboardMode.Capslocked:
        return this.shiftName
      case KeyboardMode.Alternate:
        return this.alternateName ?? this.name
      case KeyboardMode.AlternateShift:
        return this.alternateShiftName ?? this.alternateName ?? this.name
    }
  }

  currentAlternateName(mode: KeyboardMode) {
    switch (mode) {
      case KeyboardMode.Standard:
      case KeyboardMode.Shift:
      case KeyboardMode.Capslocked:
        return this.alternateName
      case KeyboardMode.Alternate:
        return this.alternateShiftName
      case KeyboardMode.AlternateShift:
        return null
    }
  }
}
