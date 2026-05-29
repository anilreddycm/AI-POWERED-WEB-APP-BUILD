function ChatMessage({ message }) {
    const isAi = message.role === 'assistant';
    
    let timeStr = '';
    try {
        const dateObj = message.createdAt ? new Date(message.createdAt) : new Date();
        if (isNaN(dateObj.getTime())) {
            timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    } catch {
        timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className={`chat-message ${isAi ? 'chat-message-ai' : 'chat-message-user'}`}>
            <div className={`chat-bubble ${isAi ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
                <div className="chat-bubble-text">{message.content}</div>
            </div>
            <span className="chat-timestamp">{timeStr}</span>
        </div>
    );
}

export default ChatMessage;