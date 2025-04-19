import React from 'react';
import { Link } from 'react-router-dom';
import './assets/css/Home.css';


function Home() {
    return (
        <div className='homePage'>

            <section className="hero">
                <div className="hero-content">
                    <h1>Track Your Fitness Journey</h1>
                    <p>A simple and powerful way to log workouts, track progress, and achieve your fitness goals.</p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary">Get Started</Link>
                        <Link to="/features" className="btn btn-secondary">Learn More</Link>
                    </div>
                </div>
            </section>
            
            <section className="features">
                <h2>Why Choose MacroLanks?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Progress Tracking</h3>
                        <p>Monitor your strength gains, body measurements, and personal records over time.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>Workout Logging</h3>
                        <p>Log your exercises, sets, reps, and weights!</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">🍽️</div>
                        <h3>Calorie Logging</h3>
                        <p>Log your caloric consumption, meals, and limits!</p>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default Home;