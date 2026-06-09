import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';

function Navbar() {
  return (
    <div className='navbar'>
      <div className='logo'>
        <Link style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} to="/">
          {/* <img src={logoImg} alt="LaxiMind AI Logo" style={{ height: '40px', objectFit: 'contain' }} /> */}
          <h1>LaxiMind AI</h1>
        </Link>
      </div>

      <div className='nav-links' style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>

      <Link to='pricing' className='pricing' style={{
           color: '#e2e8f0',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          transition: 'color 0.3s ease'
        }}>
          Product
        </Link>




       <Link to='pricing' className='pricing' style={{
           color: '#e2e8f0',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          transition: 'color 0.3s ease'
        }}>
          Solution
        </Link>



      <Link to='pricing' className='pricing' style={{
           color: '#e2e8f0',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          transition: 'color 0.3s ease'
        }}>
          Pricing
        </Link>

        <Link to="/login" className="nav-link" style={{
          color: '#e2e8f0',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          transition: 'color 0.3s ease'
        }}>
          Login
        </Link>

        



        <Link to="/get-started" className="nav-btn" style={{
          background: 'linear-gradient(90deg, #bc13fe, #00ffff)',
          color: '#fff',
          textDecoration: 'none',
          padding: '8px 20px',
          borderRadius: '30px',
          fontWeight: 600,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          boxShadow: '0 0 10px rgba(188, 19, 254, 0.3)'
        }}>
          
          Get Started
        </Link>
        
      </div>
    </div>
  );
}

export default Navbar;