"use client";
import React, { useState, useEffect, useRef } from "react";

// Helper to get/set cookies
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// Helper to get IP address
async function getIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    return "unknown";
  }
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");   
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Open animation: expand from icon
  const handleIconClick = () => {
    setAnimating(true);
    setTimeout(() => {
      setOpen(true);
      setAnimating(false);
    }, 400); // Animation duration
  };

  // Close animation: shrink to icon
  const handleClose = () => {
    setAnimating(true);
    setTimeout(() => {
      setOpen(false);
      setAnimating(false);
    }, 400); // Animation duration
  };

  useEffect(() => {
    async function initChatId() {
      let cid = getCookie("chatid");
      if (!cid) {
        const ip = await getIP();
        const sys = navigator.userAgent.replace(/\s/g, "");
        cid = btoa(`${sys}-${ip}-${Date.now()}-${Math.random()}`);
        setCookie("chatid", cid);
      }
      setChatId(cid);
    }
    initChatId();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, chatid: chatId }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { from: "bot", text: data.reply }]);
    } catch {
      setMessages((msgs) => [...msgs, { from: "bot", text: "Something went wrong on our side. We’re looking into it, and things should be back to normal soon. Thanks for your patience." }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <>
      {/* Chat Icon (hidden when open or animating) */}
      {!open && !animating && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            zIndex: 9999,
            background: "#fff",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            width: "56px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "opacity 0.3s",
            opacity: 1,
          }}
          title="Chat Assistant"
          onClick={handleIconClick}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2" fill="#f5f5f5"/>
            <ellipse cx="9" cy="13" rx="1.5" ry="2" fill="#333"/>
            <ellipse cx="15" cy="13" rx="1.5" ry="2" fill="#333"/>
            <path d="M8 17c1.333 1 4.667 1 6 0" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      {/* Expand Animation (only when opening) */}
      {animating && !open && (
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            width: "420px",
            maxWidth: "95vw", // Responsive width
            height: "600px",
            maxHeight: "80vh", // Responsive height
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            opacity: 1,
            transformOrigin: "bottom right",
            animation: "expandFromIcon 0.4s forwards",
          }}
        >
          {/* Empty content for animation */}
        </div>
      )}
      {/* Shrink Animation (only when closing) */}
      {animating && open && (
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            width: "420px",
            maxWidth: "90vw", // <-- Reduced for mobile
            height: "600px",
            maxHeight: "80vh",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            opacity: 1,
            transformOrigin: "bottom right",
            animation: "shrinkToIcon 0.4s forwards",
          }}
        >
          <div style={{
  padding: "12px",
  borderBottom: "1px solid #eee",
  fontWeight: "bold",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#000",
  fontSize: "16px" // <-- Reduced header text size
}}>
            Chat Assistant
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "18px", // <-- Reduced close button size
                cursor: "pointer",
                color: "#000"
              }}
              onClick={handleClose}
              title="Close"
            >
              ×
            </button>
          </div>
          <div
            ref={messagesEndRef}
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              background: "#fafafa",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}
            className="hide-scrollbar"
          >
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: "8px", textAlign: msg.from === "user" ? "right" : "left" }}>
                <span style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  background: msg.from === "user" ? "#0078d4" : "#eee",
                  color: msg.from === "user" ? "#fff" : "#000",
                  maxWidth: "80%",
                  fontSize: "14px" // <-- Reduced message text size
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div style={{ textAlign: "center", color: "#888" }}>...</div>}
          </div>
          <form style={{ display: "flex", borderTop: "1px solid #eee", padding: "8px" }}>
            <input
              value={input}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "8px",
                borderRadius: "8px",
                color: "#000",
                background: "#fff",
                fontSize: "14px" // <-- Reduced input text size
              }}
              placeholder="Type a message..."
              disabled
              readOnly // Prevent typing while closing
            />
            <button
              type="button"
              style={{
                marginLeft: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#0078d4",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              disabled
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 12h16M14 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
            </button>
          </form>
        </div>
      )}
      {/* Chat Window (only when open and not animating) */}
      {open && !animating && (
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            width: "420px",
            maxWidth: "90vw", // <-- Reduced for mobile
            height: "600px",
            maxHeight: "80vh",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            opacity: 1,
            transformOrigin: "bottom right",
          }}
        >
          <div style={{
  padding: "12px",
  borderBottom: "1px solid #eee",
  fontWeight: "bold",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#000",
  fontSize: "16px" // <-- Reduced header text size
}}>
            Chat Assistant
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "18px", // <-- Reduced close button size
                cursor: "pointer",
                color: "#000"
              }}
              onClick={handleClose}
              title="Close"
            >
              ×
            </button>
          </div>
          <div
            ref={messagesEndRef}
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              background: "#fafafa",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}
            className="hide-scrollbar"
          >
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: "8px", textAlign: msg.from === "user" ? "right" : "left" }}>
                <span style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  background: msg.from === "user" ? "#0078d4" : "#eee",
                  color: msg.from === "user" ? "#fff" : "#000",
                  maxWidth: "80%",
                  fontSize: "14px" // <-- Reduced message text size
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div style={{ textAlign: "center", color: "#888" }}>...</div>}
          </div>
          <form onSubmit={handleSend} style={{ display: "flex", borderTop: "1px solid #eee", padding: "8px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "8px",
                borderRadius: "8px",
                color: "#000",
                background: "#fff",
                fontSize: "14px" // <-- Reduced input text size
              }}
              placeholder="Type a message..."
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                marginLeft: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#0078d4",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              disabled={loading}
            >
              {/* Send Arrow SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 12h16M14 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
            </button>
          </form>
        </div>
      )}
      {/* Add keyframes for expand/shrink animation */}
      <style>{`
        @keyframes expandFromIcon {
          0% {
            transform: scale(0.13);
            opacity: 0.7;
          }
          80% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes shrinkToIcon {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.13);
            opacity: 0.7;
          }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        @media (max-width: 600px) {
    .chat-header {
      font-size: 14px !important;
      padding: 8px !important;
    }
    .chat-message {
      font-size: 12px !important;
      padding: 6px 8px !important;
    }
    .chat-input {
      font-size: 12px !important;
      padding: 6px !important;
    }
  }
      `}</style>
    </>
  );
}

// export default Chatbot;