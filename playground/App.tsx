import React, { useState } from 'react'

export function App() {

  const [text1, setText1] = useState('')

  return <>
    <div id="content">
      <input name="non-controled" id="non-controled" />
      <input name="non-controled-2" id="non-controled-2" data-keyboard-type="decimal" />
      <input name="non-controled-3" id="non-controled-3" />
      <input type="number" name="non-controled-4" id="non-controled-4" data-keyboard-type="decimal" />
      <p>文字元素</p>
      <input name='controled-1' value={text1} onChange={e => { setText1(e.target.value) }} />
    </div>
  </>
}
