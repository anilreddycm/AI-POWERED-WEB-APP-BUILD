import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LivePreview from '../components/LivePreview.jsx';
import { getSharedProject } from '../services/projectService.js';
import '../styles/navbar.css'; // Reuse navbar styling to look consistent

function SharePage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await getSharedProject(projectId);
                setProject(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    const handleDownload = () => {
        if (!project || !project.generatedCode) return;
        const blob = new Blob([project.generatedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.title || 'shared-app'}.html`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="loading-state" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner" />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading shared application...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--bg-app)',
                color: 'var(--text-primary)',
                padding: '24px'
            }}>
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    padding: '40px',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    maxWidth: '480px',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <p style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}>&#9888;</p>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>App Not Found</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                        This shared application could not be found or has been deleted.
                    </p>
                    <Link to="/" style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '14px',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 4px 12px var(--primary-glow)'
                    }}>
                        Go to SmartWebBuild Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Share Header */}
            <nav className="navbar" style={{ flexShrink: 0 }}>
                <div className="navbar-left">
                    <Link to="/" className="navbar-brand">
                        <span className="navbar-brand-mark">&lt;/&gt;</span> SmartWebBuild
                    </Link>
                    <div style={{ marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {project.title || 'Shared Application'}
                        </span>
                        <span style={{
                            marginLeft: '8px',
                            fontSize: '10px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            background: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid hsla(250, 85%, 65%, 0.2)'
                        }}>
                            Public Preview
                        </span>
                    </div>
                </div>
                <div className="navbar-right" style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleDownload}
                        style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            padding: '8px 18px',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-surface-elevated)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        Download Code
                    </button>
                    <Link
                        to="/"
                        style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            padding: '8px 18px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            boxShadow: '0 4px 12px var(--primary-glow)'
                        }}
                    >
                        Remix with AI
                    </Link>
                </div>
            </nav>

            {/* Application Preview */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <LivePreview code={project.generatedCode} />
            </div>
        </div>
    );
}

export default SharePage;
