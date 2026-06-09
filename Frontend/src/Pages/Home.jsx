import React from 'react'
import Section from './Section'
import Cardmainpage from './Cardmainpage'
import Feedback from '../Components/Feedback'
import Feed from '../Components/Feed'
import Footer from '../Components/Footer'

function Home() {
  return (
    <>
      <Section />
      <Cardmainpage />
      
      <Feed/>

      <Footer/>
      
    </>
  )
}

export default Home
