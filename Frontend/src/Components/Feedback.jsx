import React from 'react';
import './Feedback.css';

function Feedback({ description, name, title, colorClass }) {
  return (
    <>
      <div className="card-wrap">
        <div className="card feedback-card">
          <div className="stars">
            ★★★★★
          </div>
          <p className="feedback-text">{description}</p>
          <div className="profile-section">
            <div className={`avatar ${colorClass}`}></div>
            <div className="profile-info">
              <h4>{name}</h4>
              <span>{title}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Feedback;
