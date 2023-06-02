import { KeyCap } from "./keycap"

const STANDARD_KEYBOARD = `tab     q(1)  w(2)  e(3)  r(4)  t(5)  y(6)  u(7)  i(8)  o(9)  p(0) backspace
    capslock a(@€) s(#£) d($¥) f(&_) g(*^) h(([) j()]) k('{) l("}) return
    shift    z(%§) x(-|) c(+~) v(=…) b(/\\) n(;<) m(:>) ,(!) .(?) shift
    move    .?123          space         .?123           closekeyboard
    `
export const KEY_CAPS = STANDARD_KEYBOARD.trim()
  .split("\n")
  .map((line) => {
    return line
      .trim()
      .split(/\s+/)
      .map((d) => new KeyCap(d))
  })

KEY_CAPS[2].at(-1)!.reactKey = "shift_right"
KEY_CAPS[3].at(3)!.reactKey = ".?123_right"
