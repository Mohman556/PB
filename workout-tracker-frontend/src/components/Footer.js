import React from 'react';
import './assets/css/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Personal Best</h3>
          <p>Track your fitness journey and achieve your goals.</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {2025} Personal Best. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;