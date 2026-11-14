
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

type MessageRole = "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
}

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Send message to Node.js backend
  const handleSendMessage = async () => {
    const userMessage = input.trim();

    if (!userMessage || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    setMessages(updatedMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to get AI response."
        );
      }

      const aiMessage: Message = {
        role: "assistant",
        content: result.data.reply,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);
    } catch (err) {
      console.error("Chat API error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle Enter and Shift + Enter
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Start a new conversation
  const handleNewChat = () => {
    if (loading) return;

    setMessages([]);
    setInput("");
    setError("");
    inputRef.current?.focus();
  };

  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">AI</div>
          <span className="brand-name">AI Assistant</span>
        </div>

        <button
          className="new-chat-button"
          onClick={handleNewChat}
          disabled={loading}
        >
          <span>＋</span> New Chat
        </button>

        <div className="sidebar-info">
          <p>AI Assistant</p>
          <span>Powered by Claude AI</span>
        </div>

        <div className="sidebar-footer">
          <span className="status-dot"></span>
          AI Service Connected
        </div>
      </aside>

      {/* Main Chat Section */}
      <main className="chat-main">

        {/* Header */}
        <header className="chat-header">
          <div>
            <h2>AI Chat Assistant</h2>
            <p>Ask anything. Get intelligent answers.</p>
          </div>

          <div className="header-status">
            <span className="status-dot"></span>
            Online
          </div>
        </header>

        {/* Messages */}
        <section className="chat-messages">

          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">✦</div>

              <h1>How can I help you today?</h1>

              <p>
                I'm your AI assistant. Ask me a question
                and I'll help you find the answer.
              </p>

              <div className="suggestion-list">
                <button
                  onClick={() =>
                    setInput("Explain artificial intelligence.")
                  }
                >
                  Explain artificial intelligence
                </button>

                <button
                  onClick={() =>
                    setInput("Help me write a professional email.")
                  }
                >
                  Write a professional email
                </button>

                <button
                  onClick={() =>
                    setInput("Help me understand React and TypeScript.")
                  }
                >
                  Learn React and TypeScript
                </button>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              className={`message-row ${message.role}`}
              key={index}
            >
              <div className="message-avatar">
                {message.role === "user" ? "U" : "AI"}
              </div>

              <div className="message-content">
                <span className="message-author">
                  {message.role === "user"
                    ? "You"
                    : "AI Assistant"}
                </span>

                <div className="message-bubble">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="message-row assistant">
              <div className="message-avatar">AI</div>

              <div className="message-content">
                <span className="message-author">
                  AI Assistant
                </span>

                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* Input Section */}
        <footer className="chat-input-section">
          <div className="chat-input-wrapper">

            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message your AI assistant..."
              rows={1}
              disabled={loading}
            />

            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              title="Send message"
            >
              ➤
            </button>
          </div>

          <p className="input-disclaimer">
            AI can make mistakes. Verify important information.
          </p>
        </footer>

      </main>
    </div>
  );
};

export default App;
