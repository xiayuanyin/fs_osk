import React, { useState, useRef } from 'react'
import { useEffect } from 'react'
import { redispatchIframeEvent } from '../src/util'

export function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [text1, setText1] = useState('')

  useEffect(() => {
    const dispose = redispatchIframeEvent(iframeRef.current!, 'focusin', 'focusout')
    // document.addEventListener('iframe:focusin', console.log)
    // document.addEventListener('iframe:focusout', console.log)
    return () => {
      dispose()
    }
  }, [])

  return <>
    <div id="content">
      <div className='row'>
        <input name="non-controled" id="non-controled" />
        <input name="non-controled-2" id="non-controled-2" data-keyboard-type="decimal" />
        <input name="non-controled-3" id="non-controled-3" />
        <input type="number" name="non-controled-4" id="non-controled-4" data-keyboard-type="decimal" />
      </div>
      <p>文字元素</p>
      <input name='controled-1' value={text1} onChange={e => { setText1(e.target.value) }} />

      <iframe seamless ref={iframeRef} src="in_iframe.html" />

      <div className='fixed'>
        <input name="non-controled-fixed" type="number" />
        <input id="non-controled-fixed-2" name="non-controled-fixed" type="number" />
      </div>
    </div>
  </>
}
