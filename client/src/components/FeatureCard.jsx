function FeatureCard({ step, title, desc }) {
    return (
        <div className="feature-card">
            <div className="feature-card-step">{step}</div>
            <h3 className="feature-card-title">{title}</h3>
            <p className="feature-card-desc">{desc}</p>
        </div>
    );
}

export default FeatureCard;
