import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2, Bot, User as UserIcon, Users, Zap } from 'lucide-react';
import { Message, Sender } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string, useCouncil: boolean) => void;
  isLoading: boolean;
  councilMode: boolean;
  onToggleCouncil: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages, onSendMessage, isLoading, councilMode, onToggleCouncil
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText, councilMode);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSenderIcon = (sender: Sender) => {
    switch (sender) {
      case Sender.User: return <UserIcon size={14} />;
      case Sender.Council: return <Users size={14} />;
      default: return <Bot size={14} />;
    }
  };

  const getSenderStyle = (sender: Sender) => {
    switch (sender) {
      case Sender.User: return 'bg-gray-800 border-gray-700 text-gray-300';
      case Sender.Council: return 'bg-gray-900 border-amber-500/30 text-amber-400';
      default: return 'bg-gray-900 border-purple-500/30 text-purple-400';
    }
  };

  const getMsgStyle = (sender: Sender) => {
    switch (sender) {
      case Sender.User: return 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tr-none';
      case Sender.Council: return 'bg-gray-900 text-gray-300 border border-amber-500/20 rounded-tl-none';
      default: return 'bg-gray-900 text-gray-300 border border-purple-500/20 rounded-tl-none';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-purple-500/30">
            <Terminal size={16} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-gray-200 font-semibold tracking-wide text-sm">TUCKER_PENDRAGON</h2>
            <p className="text-xs text-gray-500">v2.0 // Claude-Native // 51% Constitutional Arbiter</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 mr-1">{councilMode ? 'COUNCIL' : 'SOLO'}</span>
          <button
            onClick={onToggleCouncil}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
              councilMode
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
            }`}
          >
            {councilMode ? <Users size={14} /> : <Zap size={14} />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 space-y-4">
            <Terminal size={48} />
            <p className="text-sm">System Ready. Constitutional Arbiter Online.</p>
            <p className="text-xs text-gray-700">Claude-native with access to every AI via API</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === Sender.User ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${getSenderStyle(msg.sender)}`}>
              {getSenderIcon(msg.sender)}
            </div>
            <div className={`flex flex-col max-w-[85%] ${msg.sender === Sender.User ? 'items-end' : 'items-start'}`}>
              {msg.sender === Sender.Council && (
                <span className="text-[10px] text-amber-500 font-semibold mb-1 tracking-wider">PANTHEON COUNCIL — {msg.deliberation?.responses.filter(r => !r.error).length || 0}/5 RESPONDED</span>
              )}
              <div className={`p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${getMsgStyle(msg.sender)}`}>
                {msg.text}
              </div>
              {msg.reasoning && msg.sender !== Sender.User && (
                <div className="mt-1 text-[10px] text-gray-500 italic max-w-full px-1">
                  {msg.reasoning}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[10px] text-gray-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.model_used && (
                  <span className="text-[10px] text-gray-700">via {msg.model_used}</span>
                )}
                {msg.deliberation && (
                  <span className="text-[10px] text-amber-600">{msg.deliberation.total_latency_ms}ms</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
              councilMode ? 'bg-gray-900 border-amber-500/30 text-amber-400' : 'bg-gray-900 border-purple-500/30 text-purple-400'
            }`}>
              {councilMode ? <Users size={14} /> : <Bot size={14} />}
            </div>
            <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg rounded-tl-none flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-gray-500" />
              <span className="text-xs text-gray-500 animate-pulse">
                {councilMode ? 'Convening Pantheon Council — querying 5 models...' : 'Tucker processing via Claude...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/50">
        <div className="relative flex items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={councilMode ? "Query the Pantheon Council..." : "Query Tucker (Claude solo)..."}
            className="w-full bg-gray-900 text-gray-200 text-sm rounded-lg pl-4 pr-12 py-3 border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none h-[50px]"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 text-gray-400 hover:text-purple-400 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-[10px] text-gray-600 mt-2 text-center">
          Tucker_Pendragon — 51% Claude, 100% Constitutional
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;