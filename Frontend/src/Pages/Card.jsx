import React from 'react'

function Card({ title, description, icon: Icon }) {
  return (
    <>
    <div className='card-wrap'>
      <div className="card">
        {Icon && <div style={{ color: '#00ffff', marginBottom: '15px' }}><Icon size={40} />
        </div>}
        <h3>{title}</h3>
        {description && <p>{description}

          </p>}
          
      </div>
      </div>
    </>
  )
}

export default Card



