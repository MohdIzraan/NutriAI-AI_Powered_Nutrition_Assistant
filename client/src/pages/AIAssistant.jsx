import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chat.service';
import { Card, Button, Spinner, DemoBanner, Alert } from '../components/ui';
import { Send, MessageCircle, Bot, User, Zap, Trash2 } from 'lucide-react';
import { classNames } from '../utils/formatters';
import toast from 'react-hot-toast';

const SUGGESTED = [
  'What can I replace paneer with for more protein?',
  'Suggest a high-protein vegetarian breakfast.',
  'What locally available foods suit a weight loss diet?',
  'How do I make my lunch more budget-friendly?',
  'Give me a healthy evening snack for under ₹20.',
  'What are good carb sources in North Indian cuisine?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={classNames('flex gap-3 animate-fade-in', isUser && 'flex-row-reverse')}>
      <div className={classNames(
        'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold',
        isUser ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={classNames(
        'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-primary-600 text-white rounded-tr-sm'
          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
      )}>
        {msg.content}
        {msg.isDemo && (
          <div className="mt-2 text-xs opacity-60 border-t border-current pt-1">
            ⚠️ Demo response
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
        <Bot className="h-4 w-4 text-gray-500" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [chatId, setChatId]       = useState(null);
  const [isDemo, setIsDemo]       = useState(false);
  const [error, setError]         = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const { data } = await chatService.sendMessage({
        message: content,
        chatId,
        contextType: 'general',
      });

      const res = data.data;
      setChatId(res.chatId);
      setIsDemo(res.isDemo);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.message,
        isDemo: res.isDemo,
        timestamp: new Date(),
      }]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not reach AI assistant. Please try again.';
      setError(msg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setChatId(null);
    setError('');
    toast.success('Chat cleared');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Nutrition Assistant</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ask about meals, substitutions, regional foods, and nutrition</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4" />Clear
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-surface rounded-xl border border-gray-100 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div className="h-14 w-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle className="h-7 w-7 text-primary-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">NutriAI Assistant</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                Ask me about meal planning, food substitutions, regional cuisine, calorie counts, or any nutrition question.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left px-3 py-2.5 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all duration-150 leading-relaxed"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}
          {error && <Alert type="error">{error}</Alert>}

          <div ref={bottomRef} />
        </div>

        {/* Demo banner inside chat */}
        {isDemo && (
          <div className="px-4 pb-2">
            <DemoBanner />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white p-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about nutrition, foods, diet plans…"
                rows={1}
                className="w-full form-input resize-none py-2.5 pr-2 scrollbar-thin"
                style={{ minHeight: '42px', maxHeight: '120px', overflowY: 'auto' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                disabled={loading}
              />
            </div>
            <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="shrink-0 h-[42px]">
              {loading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" />
            Not medical advice · Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>
    </div>
  );
}
