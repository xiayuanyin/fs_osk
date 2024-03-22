import React, { useState, useRef } from 'react'
import { useEffect } from 'react'
import { redispatchIframeEvent } from '../src/util'

export function App() {
  const iframeRef1 = useRef<HTMLIFrameElement>(null)
  const iframeRef2 = useRef<HTMLIFrameElement>(null)
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState(0)

  useEffect(() => {
    const dispose1 = redispatchIframeEvent(iframeRef1.current, 'focusin', 'focusout')
    const dispose2 = redispatchIframeEvent(iframeRef2.current, 'focusin', 'focusout')
    // document.addEventListener('iframe:focusin', console.log)
    // document.addEventListener('iframe:focusout', console.log)
    return () => {
      dispose1()
      dispose2()
    }
  }, [])

  const onClick = () => {
    console.log("outer frame clicked")
  }

  return <>
    <div id="content" onClick={onClick}>
      <div className='row'>
        <input name="non-controled" id="non-controled" />
        <input name="non-controled-2" id="non-controled-2" data-keyboard-type="decimal" />
        <input name="non-controled-3" id="non-controled-3" />
        <input type="number" name="non-controled-4" id="non-controled-4" data-keyboard-type="decimal" />
      </div>
      <p>Controlled Input: {text1}</p>
      <input name='controled-1' value={text1} onChange={e => { setText1(e.target.value) }} />
      <p>Controlled Input2: {text2}</p>
      <input name='controled-1' type="number" value={text2} onChange={e => { setText2(parseInt(e.target.value, 10)) }} />

      <iframe seamless className='iframe1' ref={iframeRef1} src="in_iframe.html" />
      <iframe seamless className='iframe2' ref={iframeRef2} src="in_iframe.html" />

      <div className='fixed'>
        <input name="non-controled-fixed" type="number" />
        <input id="non-controled-fixed-2" name="non-controled-fixed" type="number" />
      </div>
    </div>
  </>
}
