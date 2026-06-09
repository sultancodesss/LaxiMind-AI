import React from 'react'
import { Mic, Upload, Bot } from 'lucide-react'

function Section() {
  return (
   <>

<div className='section'>
   <button className='tech-btn' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
     <Bot size={18} />
     Next-Gen Legal Technology
   </button>


<div className='section-2'>
   <h1> AI-Powered Legal Translation
& Transcription Platform</h1>

<p>
  Transform multilingual legal communication with cutting-edge AI. Real-time transcription, instant translation, and intelligent analysis for courts, lawyers, and legal professionals.
</p>


<div className='recoding'>

  <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Mic size={20} />
    Start Recording
  </button>
  <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'blue' }}>
    <Upload size={20} />
    Upload Audio
  </button>
</div>



</div>

   </div>
   </>
  )
}

export default Section
