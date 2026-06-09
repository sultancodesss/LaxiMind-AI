import React from 'react'
import Card from './Card'
import { FileAudio, Languages, FileText, Users, Shield, Zap } from 'lucide-react'
import Payment from './Payment'

function Cardmainpage() {
  return (
    <>
      <div className="card-container">
        <Card icon={FileAudio} title="AI Speech to Text" description='Industry-leading transcription accuracy with legal terminology support'/>
        <Card icon={Languages} title="Real-Time Translation  " description='Instant multilingual translation across 100+ languages' />
        <Card icon={FileText} title="AI Summaries" description='Automated legal document summarization and analysis'/>
        <Card icon={Users} title='Speaker ID' description='Automatic speaker identification and labeling'/>
        <Card icon={Shield} title='Secure Storage' description='Bank-level encryption and compliance-ready security'/>
        <Card icon={Zap} title='Fast Processing' description='Lightning-fast transcription and translation powered by AI'/>
      </div>




 





    </>
  )
}

export default Cardmainpage
