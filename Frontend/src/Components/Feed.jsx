import React from 'react'
import Feedback from './Feedback'
import Payment from '../Pages/Payment'
import Pay from '../Pages/Pay'

function Feed() {
  return (
    <>
      <div className='trust'>
        <h1>Trusted by Legal Professionals</h1>
      </div>

      <div className='card-container'>
        <Feedback 
          description='LexiMind AI has transformed how we handle multilingual depositions. The accuracy is incredible!' 
          name='Farhan Nawazish'
          title='Senior Devloper'
          colorClass='avatar-purple'
        />
        <Feedback 
          description='The real-time translation feature saved us countless hours in international cases.' 
          name='Gautum Kumar '
          title='Ai Engineer'
          colorClass='avatar-blue'
        />
        <Feedback 
          description="Best legal tech investment we've made. The AI summaries are a game-changer." 
          name='Aditya Singh'
          title='AI/ ML'
          colorClass='avatar-indigo'
        />
      </div>

      <Pay/>

      <div className='card-container'>
        <Payment  
          planName='Starter'
          amount='$49'  
          features={['10 hours transcription/month', 'Basic translation', 'PDF export', 'Email support']} 
        />
        <Payment  
          planName='Professional'
          amount='$149'  
          features={['50 hours transcription/month', 'Advanced AI features', 'Priority support', 'Custom branding', 'API access']} 
          isPopular={true}
        />
        <Payment  
          planName='Enterprise'
          amount='$499'  
          features={['Unlimited transcription', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option']} 
        />
      </div>
    </>
  );
}

export default Feed;
