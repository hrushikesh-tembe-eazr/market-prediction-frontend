import { useState } from 'react';
import { Send, Bot, Sparkles, X, MessageSquare } from 'lucide-react';
import type { Market } from '../types/market';
import './AIChat.css';

interface AIChatProps {
  selectedMarket: Market | null;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3847'
  : '/api/proxy';

export function AIChat({ selectedMarket, apiKey, onApiKeyChange }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || !apiKey) return;

    const userMessage: ChatMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          marketContext: selectedMarket,
          apiKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error?.message || 'Failed to get response'}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to connect to AI service' }]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeMarket = async () => {
    if (!selectedMarket || !apiKey) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: `Analyze: ${selectedMarket.title}` }]);

    try {
      const response = await fetch(`${API_BASE}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: selectedMarket,
          apiKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.analysis }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error?.message || 'Failed to analyze'}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to connect to AI service' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What factors could move this market?",
    "Is this a good trading opportunity?",
    "What's the risk/reward here?",
    "Explain this market to a beginner",
  ];

  if (!isOpen) {
    return (
      <button className="ai-chat-fab" onClick={() => setIsOpen(true)}>
        <Bot size={24} />
        <span>AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="ai-chat-panel">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <Bot size={20} />
          <span>AI Market Analyst</span>
        </div>
        <button className="ai-chat-close" onClick={() => setIsOpen(false)}>
          <X size={18} />
        </button>
      </div>

      {showApiKeyInput ? (
        <div className="ai-api-key-section">
          <p>Enter your DeepSeek API key to use AI features</p>
          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="ai-api-key-input"
          />
          <button
            className="ai-api-key-btn"
            onClick={() => apiKey && setShowApiKeyInput(false)}
            disabled={!apiKey}
          >
            Save & Continue
          </button>
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="ai-get-key-link"
          >
            Get API Key →
          </a>
        </div>
      ) : (
        <>
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-welcome">
                <Sparkles size={32} />
                <h4>AI Market Analyst</h4>
                <p>Ask questions about prediction markets or get analysis on selected markets.</p>

                {selectedMarket && (
                  <button className="ai-analyze-btn" onClick={analyzeMarket} disabled={loading}>
                    <Sparkles size={16} />
                    Analyze "{selectedMarket.title.slice(0, 30)}..."
                  </button>
                )}

                <div className="ai-quick-questions">
                  <p>Quick questions:</p>
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      className="ai-quick-btn"
                      onClick={() => sendMessage(q)}
                      disabled={loading}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role}`}>
                {msg.role === 'assistant' && <Bot size={16} />}
                {msg.role === 'user' && <MessageSquare size={16} />}
                <div className="ai-message-content">
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message assistant">
                <Bot size={16} />
                <div className="ai-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <div className="ai-chat-input-area">
            {selectedMarket && messages.length > 0 && (
              <button className="ai-analyze-inline" onClick={analyzeMarket} disabled={loading}>
                <Sparkles size={14} />
                Analyze Market
              </button>
            )}
            <div className="ai-chat-input-row">
              <input
                type="text"
                placeholder="Ask about prediction markets..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                <Send size={18} />
              </button>
            </div>
            <button
              className="ai-change-key"
              onClick={() => setShowApiKeyInput(true)}
            >
              Change API Key
            </button>
          </div>
        </>
      )}
    </div>
  );
}
