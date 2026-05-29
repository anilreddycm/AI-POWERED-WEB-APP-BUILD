import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import FeatureCard from '../components/FeatureCard.jsx';
import '../styles/landing.css';

function LandingPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handlePromptSubmit = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="landing-logo">
                    <span className="landing-logo-mark">&lt;/&gt;</span> SmartWebBuild
                </div>
                <div className="landing-nav-right">
                    {user ? (
                        <button className="landing-nav-cta" onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </button>
                    ) : (
                        <>
                            <button className="landing-nav-login" onClick={() => navigate('/login')}>
                                Sign In
                            </button>
                            <button className="landing-nav-cta" onClick={() => navigate('/login')}>
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <main style={{ flex: 1 }}>
                <section className="landing-hero">
                    <div className="landing-hero-content">
                        <div className="landing-badge">AI-Powered App Builder</div>
                        <h1 className="landing-hero-title">
                            Build Web Apps <br />
                            <span className="landing-hero-accent">in seconds with AI</span>
                        </h1>
                        <p className="landing-hero-subtitle">
                            Describe what you want to build, and watch SmartWebBuild write, run, and preview the code in real-time.
                        </p>

                        <div className="landing-prompt-box">
                            <div className="landing-prompt-input">
                                "Create a beautiful dashboard app with a toggleable sidebar..."
                            </div>
                            <button className="landing-prompt-btn" onClick={handlePromptSubmit}>
                                Start Building
                            </button>
                        </div>

                        <div className="landing-stats">
                            <div className="landing-stat">
                                <span className="landing-stat-number">100%</span>
                                <span className="landing-stat-label">Generated</span>
                            </div>
                            <div className="landing-stat-divider" />
                            <div className="landing-stat">
                                <span className="landing-stat-number">1-Click</span>
                                <span className="landing-stat-label">Deploy</span>
                            </div>
                            <div className="landing-stat-divider" />
                            <div className="landing-stat">
                                <span className="landing-stat-number">Instant</span>
                                <span className="landing-stat-label">Live Preview</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-features">
                    <h2 className="landing-section-title">How it works</h2>
                    <p className="landing-section-subtitle">Three simple steps to build your next web application</p>

                    <div className="landing-features-grid">
                        <FeatureCard
                            step="01"
                            title="Describe Your Idea"
                            desc="Tell the AI what you want to build in plain English. No coding experience required."
                        />
                        <FeatureCard
                            step="02"
                            title="Watch it Generate"
                            desc="Our advanced AI model writes fully functional HTML, CSS, and JS code in real-time."
                        />
                        <FeatureCard
                            step="03"
                            title="Iterate & Edit"
                            desc="Refine your app using prompt updates or directly edit the generated code in the editor."
                        />
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-footer-content">
                    <div className="landing-footer-logo">
                        <span className="landing-logo-mark">&lt;/&gt;</span> SmartWebBuild
                    </div>
                    <div className="landing-footer-text">
                        &copy; {new Date().getFullYear()} SmartWebBuild. Powered by Gemini.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
