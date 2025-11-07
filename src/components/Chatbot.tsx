import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, User, Loader2, Minimize2 } from 'lucide-react';
import Lottie from 'lottie-react';
import robotWaving from '@/assets/robot-waving.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Função util para obter base da API de forma segura
const getApiBase = () => {
  const raw = import.meta.env.VITE_API_URL || '';
  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.replace(/\/api$/, '');
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  // Oculta o gatilho flutuante especificamente na Landing (/ e /landing)
  const hideFloatingTriggerOnThisPage = path === '/' || path === '/landing';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadWelcomeMessage();
    }
  }, [isOpen]);

  // Permite abrir/alternar/fechar o chatbot por eventos globais do window
  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    const toggleHandler = () => setIsOpen(prev => !prev);
    const closeHandler = () => setIsOpen(false);

    window.addEventListener('chatbot:open', openHandler as unknown as EventListener);
    window.addEventListener('chatbot:toggle', toggleHandler as unknown as EventListener);
    window.addEventListener('chatbot:close', closeHandler as unknown as EventListener);

    return () => {
      window.removeEventListener('chatbot:open', openHandler as unknown as EventListener);
      window.removeEventListener('chatbot:toggle', toggleHandler as unknown as EventListener);
      window.removeEventListener('chatbot:close', closeHandler as unknown as EventListener);
    };
  }, []);

  const loadWelcomeMessage = async () => {
    try {
      const apiBase = getApiBase();
      const url = `${apiBase}/api/chatbot/welcome`;
      console.log('🤖 [CHATBOT] Buscando mensagem de boas-vindas em:', url);

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ [CHATBOT] Resposta não OK:', response.status, errText?.slice(0, 200));
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawText = await response.text();
        console.error('❌ [CHATBOT] Conteúdo não-JSON recebido:', rawText?.slice(0, 200));
        throw new Error('Resposta inválida da API (não-JSON)');
      }

      const data = await response.json();
      
      setMessages([{
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Erro ao carregar mensagem de boas-vindas:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          chatHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    // Na LandingPage, o gatilho será fornecido pelo header; aqui não renderizamos o botão flutuante
    if (hideFloatingTriggerOnThisPage) {
      return null;
    }
    return (
      <button
        onClick={() => setIsOpen(true)}
        data-testid="button-open-chat"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9998] flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 hover:scale-110 transition-all duration-300"
        aria-label="Abrir chat"
      >
        <Lottie 
          animationData={robotWaving} 
          loop={true}
          className="w-full h-full"
        />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9998]">
        <button
          onClick={() => setIsMinimized(false)}
          data-testid="button-restore-chat"
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8">
            <Lottie 
              animationData={robotWaving} 
              loop={true}
              className="w-full h-full"
            />
          </div>
          <span className="font-medium text-sm sm:text-base">HumaniQ</span>
          {messages.length > 1 && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[10000]
                 w-full h-[100dvh] sm:w-[420px] sm:h-auto sm:max-h-[85vh] md:w-[480px] lg:w-[520px]
                 bg-white dark:bg-slate-900 
                 rounded-none sm:rounded-2xl 
                 shadow-none sm:shadow-2xl border-none sm:border border-slate-200 dark:border-slate-700 
                 flex flex-col overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="chatbot-container"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between text-white flex-shrink-0 relative z-[10001]">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12">
            <Lottie 
              animationData={robotWaving} 
              loop={true}
              className="w-full h-full"
            />
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg">HumaniQ</h3>
            <p className="text-xs text-white/80 hidden sm:block">Online • Sempre disponível</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-[10002]">
          <button
            onClick={() => setIsMinimized(true)}
            data-testid="button-minimize-chat"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer relative z-[10003]"
            aria-label="Minimizar"
          >
            <Minimize2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            data-testid="button-close-chat"
            className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer relative z-[10003]"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-x-auto overflow-y-auto p-3 sm:p-4 scrollbar-visible">
        <div className="space-y-4 w-full min-w-0">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              data-testid={`message-${message.role}-${index}`}
            >
              <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-full' 
                  : ''
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Lottie 
                    animationData={robotWaving} 
                    loop={true}
                    className="w-full h-full"
                  />
                )}
              </div>
              <div className={`flex flex-col min-w-0 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl min-w-0 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700'
                }`}>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere min-w-0">{message.content}</p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Lottie 
                  animationData={robotWaving} 
                  loop={true}
                  className="w-full h-full"
                />
              </div>
              <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Digitando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            data-testid="input-chat-message"
            className="flex-1 rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-sm"
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            data-testid="button-send-message"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-3 sm:px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center hidden sm:block">
          Powered by Google Gemini AI
        </p>
      </form>
    </div>
  );
}
