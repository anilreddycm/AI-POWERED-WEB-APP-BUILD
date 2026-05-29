import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import LivePreview from '../components/LivePreview.jsx';
import { getProject, updateProject } from '../services/projectService.js';
import { generateCode } from '../services/generationService.js';
import '../styles/builder.css';

const EXAMPLE_PROMPTS = [
    'A personal portfolio website with a dark theme',
    'A simple calculator app',
    'A weather dashboard with cards',
    'A landing page for a coffee shop',
    'A to-do list app',
    'A countdown timer for New Year',
];

function BuilderPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useContext(ToastContext);

    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [code, setCode] = useState('');
    const [activeTab, setActiveTab] = useState('preview');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadProject = async () => {
            try {
                const data = await getProject(projectId);
                setProject(data);
                setMessages(data.messages || []);
                setCode(data.generatedCode || '');
                setEditTitle(data.title || 'Untitled Project');
            } catch (err) {
                showToast('Project not found.', 'error');
                navigate('/dashboard');
            } finally {
                setPageLoading(false);
            }
        };
        loadProject();
    }, [projectId]);

    const handleSend = async (prompt) => {
        if (loading) return;

        const userMessage = { role: 'user', content: prompt, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            const result = await generateCode(projectId, prompt);

            if (result.messages) {
                setMessages(result.messages);
            }

            if (result.generatedCode) {
                setCode(result.generatedCode);
                setActiveTab('preview');
            }

            if (result.title) {
                setProject((prev) => ({ ...prev, title: result.title }));
                setEditTitle(result.title);
            }
        } catch (err) {
            const message = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Generation failed. Please try again.';
            showToast(message, 'error');
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    const handleTitleSave = async () => {
        setIsEditingTitle(false);
        if (editTitle.trim() && editTitle !== project.title) {
            try {
                await updateProject(projectId, { title: editTitle.trim() });
                setProject((prev) => ({ ...prev, title: editTitle.trim() }));
            } catch (error) {
                showToast('Failed to rename project.', 'error');
            }
        }
    };

    const handleDownload = () => {
        if (!code) return;
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project && project.title ? project.title : 'my-app'}.html`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Code downloaded!', 'success');
    };

    const toggleShare = async () => {
        if (!project) return;
        const newSharedState = !project.isShared;
        try {
            const updated = await updateProject(projectId, { isShared: newSharedState });
            setProject(updated);
            showToast(
                newSharedState 
                    ? 'Project public sharing enabled!' 
                    : 'Project public sharing disabled.', 
                'success'
            );
        } catch (error) {
            showToast('Failed to update sharing settings.', 'error');
        }
    };

    const handleShareClick = () => {
        setShowShareModal(true);
    };

    const handleCopyLink = () => {
        const shareUrl = `${window.location.origin}/share/${projectId}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                setCopied(true);
                showToast('Public preview link copied to clipboard!', 'success');
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                showToast('Failed to copy share link.', 'error');
            });
    };

    if (pageLoading) {
        return (
            <div className="loading-state" style={{ flex: 1 }}>
                <div className="spinner" />
                <p>Loading project...</p>
            </div>
        );
    }

    return (
        <div className="builder">
            <div className="builder-chat">
                <div className="builder-chat-header">
                    {isEditingTitle ? (
                        <input
                            className="builder-title-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                            autoFocus
                        />
                    ) : (
                        <h2
                            className="builder-chat-title"
                            onClick={() => setIsEditingTitle(true)}
                            title="Click to rename"
                        >
                            {project && project.title ? project.title : 'Untitled Project'}
                        </h2>
                    )}
                </div>

                <div className="builder-messages">
                    {messages.length === 0 ? (
                        <div className="builder-empty-chat">
                            <p className="builder-empty-icon">&#9830;</p>
                            <p className="builder-empty-title">What would you like to build?</p>
                            <p className="builder-empty-subtitle">Describe your idea and AI will generate the code.</p>
                            <div className="builder-examples">
                                {EXAMPLE_PROMPTS.map((prompt, index) => (
                                    <button
                                        key={index}
                                        className="builder-example-chip"
                                        onClick={() => handleSend(prompt)}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="builder-messages-list">
                            {messages.map((msg, index) => (
                                <ChatMessage key={index} message={msg} />
                            ))}
                            {loading && (
                                <div className="builder-typing">
                                    <span className="builder-typing-dot">.</span>
                                    <span className="builder-typing-dot">.</span>
                                    <span className="builder-typing-dot">.</span>
                                    <span className="builder-typing-text">AI is generating your code</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <ChatInput onSend={handleSend} loading={loading} disabled={false} />
            </div>

            <div className="builder-preview">
                <div className="builder-tabs">
                    <div className="builder-tabs-left">
                        <button
                            className={`builder-tab ${activeTab === 'preview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preview')}
                        >
                            Preview
                        </button>
                        <button
                            className={`builder-tab ${activeTab === 'code' ? 'active' : ''}`}
                            onClick={() => setActiveTab('code')}
                        >
                            Code
                        </button>
                    </div>
                    <div className="builder-tabs-right" style={{ display: 'flex', gap: '8px' }}>
                        {code && (
                            <>
                                <button className="builder-action-btn" onClick={handleShareClick}>Share</button>
                                <button className="builder-action-btn" onClick={handleDownload}>Download</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="builder-content">
                    {activeTab === 'preview' ? (
                        <LivePreview code={code} />
                    ) : (
                        <CodeEditor code={code} onChange={setCode} readOnly={false} />
                    )}
                </div>
            </div>

            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="share-modal-header">
                            <h3 className="share-modal-title">Share Project</h3>
                            <button className="share-modal-close" onClick={() => setShowShareModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="share-modal-body">
                            <div className="share-toggle-card">
                                <div className="share-toggle-info">
                                    <h4 className="share-toggle-title">Public Link Sharing</h4>
                                    <p className="share-toggle-desc">
                                        Anyone with the link can view this app without logging in.
                                    </p>
                                </div>
                                <label className="share-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={project?.isShared || false} 
                                        onChange={toggleShare}
                                    />
                                    <span className="share-slider" />
                                </label>
                            </div>

                            {project?.isShared && (
                                <div className="share-link-section">
                                    <p className="share-link-label">Public Access URL</p>
                                    <div className="share-url-container">
                                        <input
                                            type="text"
                                            className="share-url-input"
                                            value={`${window.location.origin}/share/${projectId}`}
                                            readOnly
                                            onClick={(e) => e.target.select()}
                                        />
                                        <button className="share-copy-btn" onClick={handleCopyLink}>
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="share-link-actions">
                                        <a 
                                            href={`${window.location.origin}/share/${projectId}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="share-view-btn"
                                        >
                                            <span style={{ marginRight: '6px' }}>&#x274A;</span> View Live Site
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuilderPage;