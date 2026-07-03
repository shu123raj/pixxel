"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation"; // NAYA: URL check karne ke liye
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Copy, 
  CheckCircle2,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Button } from "./ui/button";
import { buildLocalPixxelAnswer } from "@/lib/pixxel-knowledge";

// Pre-defined quick prompts for users
const SUGGESTED_PROMPTS =[
  "How does AI crop work?",
  "What are the Pro features?",
  "How to remove background?",
  "Is this tool free?"
];

const Chatbot = () => {
  const pathname = usePathname(); // NAYA: Current page ka URL nikalega

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Pixxel's AI assistant. Ask me anything about this Pixxel web app and I will answer based on how the application works.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  },[messages, isTyping]);

  // Hide tooltip after 5 seconds automatically
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ==========================================
  // 🚀 HIDE ON EDITOR PAGE LOGIC
  // ==========================================
  // Agar URL "/editor" se shuru hota hai, toh chatbot return (render) hi nahi hoga
  if (pathname && pathname.startsWith("/editor")) {
    return null; 
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bot Logic
  const getBotResponse = (userMessage) => {
    const message = userMessage.trim().toLowerCase();

    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return "Hello! Welcome to Pixxel, your AI-powered image editing platform. How can I help you create amazing images today?";
    }

    const answer = buildLocalPixxelAnswer(userMessage);
    if (answer && answer.trim().length > 0) {
      return answer;
    }

    return "I understand this Pixxel app and can help explain how it works. Could you ask a more specific question about the editor, dashboard, AI tools, or plans?";
  };

  const handleSendMessage = (text = inputMessage) => {
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefresh = () => {
    setMessages([
      {
        id: 1,
        text: "Hi! I'm Pixxel's AI assistant. How can I help you with image editing today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setInputMessage("");
    setIsTyping(false);
  };

  return (
    <>
      {/* Bot Toggle Button & Tooltip */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        
        {/* Animated Greeting Tooltip */}
        {!isOpen && showTooltip && (
          <div className="relative animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-slate-900 border border-cyan-500/30 text-white text-sm px-4 py-3 rounded-2xl shadow-xl shadow-cyan-500/10 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Need help with editing?</span>
              <button onClick={() => setShowTooltip(false)} className="text-slate-400 hover:text-white ml-2">
                <X className="w-3 h-3" />
              </button>
            </div>
            {/* Tooltip Tail */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900 border-r border-b border-cyan-500/30 rotate-45"></div>
          </div>
        )}

        <Button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center relative group
            ${isOpen 
              ? "bg-slate-800 hover:bg-slate-700 text-white border border-white/10" 
              : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-110 shadow-cyan-500/40"
            }`}
        >
          {isOpen ? (
            <ChevronDown className="h-6 w-6 text-white transition-transform duration-300" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
              {/* Ping Animation Effect */}
              <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-20"></span>
            </>
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[80vh] bg-[#0a0c10]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_10px_50px_rgba(6,182,212,0.15)] z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900/50 border-b border-white/5 relative">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-inner shadow-white/20">
                  <Bot className="h-6 w-6 text-white drop-shadow-md" />
                </div>
                {/* Online Indicator */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-white tracking-wide">Pixxel AI</h3>
                <p className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                  Online & ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-9 w-9 rounded-full p-0 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                title="Clear chat history"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-slate-900/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 relative group ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Bot Avatar */}
                {message.sender === "bot" && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] px-4 py-3 shadow-md relative ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-sm"
                      : "bg-slate-800/80 backdrop-blur-sm border border-white/5 text-slate-200 rounded-2xl rounded-tl-sm"
                  }`}
                >
                  <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Timestamp */}
                  <div className={`text-[10px] mt-2 font-medium flex items-center gap-1 ${message.sender === "user" ? "text-cyan-100" : "text-slate-400"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>

                  {/* Copy Button (Only for Bot) */}
                  {message.sender === "bot" && (
                    <button 
                      onClick={() => copyToClipboard(message.text, message.id)}
                      className="absolute -right-10 top-2 p-1.5 bg-slate-800 border border-white/10 rounded-md text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === message.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Premium Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-in fade-in duration-300">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 shadow-md">
                  <div className="flex space-x-1.5 items-center h-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_-0.3s]"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_-0.15s]"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-[bounce_1s_infinite]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900/50 border-t border-white/5 backdrop-blur-md">
            
            {/* Quick Suggested Prompts (Hidden while typing or processing) */}
            {messages.length < 3 && !isTyping && (
              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 mb-1">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 bg-slate-800 border border-white/10 rounded-full text-xs text-slate-300 hover:bg-slate-700 hover:text-white hover:border-cyan-500/50 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-slate-950/50 border border-white/10 rounded-2xl p-1 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Pixxel AI..."
                rows={1}
                className="flex-1 max-h-32 bg-transparent px-3 py-3 text-sm text-white placeholder:text-slate-500 outline-none resize-none custom-scrollbar"
                style={{ minHeight: "44px" }}
              />
              <Button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping}
                className={`h-10 w-10 shrink-0 rounded-xl p-0 transition-all duration-300 mb-0.5 mr-0.5
                  ${inputMessage.trim() && !isTyping 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20" 
                    : "bg-slate-800 text-slate-500"
                  }`}
              >
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-500 font-medium">Powered by Pixxel Intelligence</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;