import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { streamResponse } from '../services/geminiService';
import { Send, Terminal as TerminalIcon, Cpu } from 'lucide-react';

interface TerminalProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const Terminal: React.FC<TerminalProps> = ({ messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsProcessing(true);

    // Placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      },
    ]);

    try {
        let accumulatedText = "";
        await streamResponse(
            newMessages.map(m => ({ role: m.role, content: m.content })),
            (chunk) => {
                accumulatedText += chunk;
                setMessages((prev) => 
                    prev.map(m => m.id === aiMsgId ? { ...m, content: accumulatedText } : m)
                );
            }
        );
    } catch (err) {
        console.error(err);
    } finally {
        setMessages((prev) => 
            prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m)
        );
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="ml-3 font-mono text-xs text-slate-400 flex items-center">
                <TerminalIcon size={12} className="mr-1" />
                tucker_v3_shell
            </span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
             <Cpu size={12} className={isProcessing ? "animate-pulse" : ""} />
             <span>{isProcessing ? "COMPUTING GRADS..." : "IDLE"}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-cyan-900/30 text-cyan-100 border border-cyan-800'
                  : 'bg-slate-800/50 text-slate-200 border border-slate-700'
              }`}
            >
              <div className="flex items-center mb-1 opacity-50 text-[10px]">
                <span className="uppercase font-bold mr-2">{msg.role === 'user' ? 'OPERATOR' : 'TUCKER_V3'}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
                {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-cyan-500 animate-pulse align-middle"></span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <span className="absolute left-3 text-cyan-500 font-mono">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Initialize command..."
            className="w-full bg-slate-900 text-slate-100 font-mono text-sm rounded border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-8 pr-12 py-3 outline-none transition-all"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 p-1.5 text-slate-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};