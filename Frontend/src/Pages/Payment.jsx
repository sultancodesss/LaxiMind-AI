import React from 'react'

function Payment({ planName, amount, features, isPopular }) {
  return (
    <>
      <div className={`card-wrap ${isPopular ? 'popular-wrap' : ''}`}>
        <div className={`card pricing-card ${isPopular ? 'popular' : ''}`}>
          {isPopular && <div className="popular-badge">Most Popular</div>}
          <h2>{planName}</h2>
          <div className="price-container">
            <h1>{amount}</h1>
            <span className="month">/month</span>
          </div>
          <ul className="features-list">
            {features.map((feature, idx) => (
              <li key={idx}>
                <span className="check">✓</span> {feature}
              </li>
            ))}
          </ul>
          <button className={`btn-pricing ${isPopular ? 'btn-popular' : ''}`}>
            Get Started <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Payment