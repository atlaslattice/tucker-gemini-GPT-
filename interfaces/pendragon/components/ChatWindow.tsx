import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2, Bot, User as UserIcon } from 'lucide-react';
import { Message, Sender } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-950/50">
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
          <Terminal size={16} className="text-pendragon" />
        </div>
        <div>
          <h2 className="text-gray-200 font-semibold tracking-wide text-sm">TUCKER_PENDRAGON</h2>
          <p className="text-xs text-gray-500">v1.0 // Diplomatic Alignment Protocol</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 space-y-4">
                <Terminal size={48} />
                <p className="text-sm">System Ready. Awaiting Input.</p>
            </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === Sender.User ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                msg.sender === Sender.User 
                ? 'bg-gray-800 border-gray-700 text-gray-300' 
                : 'bg-gray-900 border-pendragon/30 text-pendragon'
            }`}>
                {msg.sender === Sender.User ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>

            <div className={`flex flex-col max-w-[80%] ${msg.sender === Sender.User ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.sender === Sender.User
                    ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tr-none'
                    : 'bg-gray-900 text-gray-300 border border-gray-800 rounded-tl-none'
                }`}>
                {msg.text}
              </div>
              {msg.sender === Sender.System && msg.reasoning && (
                  <div className="mt-1 text-[10px] text-gray-500 italic max-w-full px-1">
                      Analysis: {msg.reasoning}
                  </div>
              )}
               <span className="text-[10px] text-gray-600 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border bg-gray-900 border-pendragon/30 text-pendragon">
                <Bot size={14} />
            </div>
            <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg rounded-tl-none flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-gray-500" />
                <span className="text-xs text-gray-500 animate-pulse">Calculating alignment vectors...</span>
            </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950/50">
        <div className="relative flex items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Query the archetype..."
            className="w-full bg-gray-900 text-gray-200 text-sm rounded-lg pl-4 pr-12 py-3 border border-gray-700 focus:outline-none focus:border-pendragon focus:ring-1 focus:ring-pendragon/50 transition-all resize-none h-[50px] scrollbar-hide"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 text-gray-400 hover:text-pendragon disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-[10px] text-gray-600 mt-2 text-center">
            Tucker_Pendragon treats all inputs as if potentially sentient.
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;