import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <>
    <div className='footer'>

      <div className='footer-1'>

        <h1> LaxiMind AI</h1>


        <p1>@2024 LaxiMind AI. Institutional Trust & Legal Excellence. </p1>

        <div className='about'>
          <Link to= 'privacy-policy'> Privancy Policy</Link>
          <Link to= 'terms-of-service'>Terms OF Service</Link>
          <Link to= 'complaince'>Comlaince</Link>
          <Link to= 'security'>Security</Link>
          


        </div>


      </div>









    </div>
    

    </>
  )
}

export default Footer