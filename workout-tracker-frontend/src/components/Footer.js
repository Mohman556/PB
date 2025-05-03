import React from 'react';
import './assets/css/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>MacroLanks</h3>
          <p>Track your fitness journey and achieve your goals.</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} MacroLanks. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;