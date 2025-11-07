import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Heart, Zap, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';

interface LoadingAnimationProps {
  onComplete: () => void;
  testName?: string;
  duration?: number; // em milissegundos, padrão 8000ms (8 segundos)
}

const motivationalMessages = [
  {
    text: "Preparando suas perguntas personalizadas...",
    subtext: "Cada pergunta foi cuidadosamente selecionada para você",
    icon: Target,
    color: "text-blue-500"
  },
  {
    text: "Criando um ambiente seguro e acolhedor...",
    subtext: "Suas respostas são confidenciais e protegidas",
    icon: Heart,
    color: "text-pink-500"
  },
  {
    text: "Calibrando a experiência para seu perfil...",
    subtext: "Tecnologia avançada trabalhando para você",
    icon: Zap,
    color: "text-purple-500"
  },
  {
    text: "Quase pronto! Finalizando os detalhes...",
    subtext: "Sua jornada de autoconhecimento está começando",
    icon: Sparkles,
    color: "text-yellow-500"
  }
];

export default function LoadingAnimation({ 
  onComplete, 
  testName = "teste", 
  duration = 8000 
}: LoadingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const messageInterval = duration / motivationalMessages.length;
    
    // Atualizar mensagens
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < motivationalMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, messageInterval);

    // Atualizar progresso suavemente
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + (100 / (duration / 50)); // Atualiza a cada 50ms
      });
    }, 50);

    // Completar animação
    const completionTimer = setTimeout(() => {
      setIsCompleting(true);
      setTimeout(() => {
        onComplete();
      }, 1000); // Delay adicional para animação de conclusão
    }, duration);

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
      clearTimeout(completionTimer);
    };
  }, [duration, onComplete]);

  const currentMessage = motivationalMessages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center z-50"
    >
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
        {/* Logo estático centralizado */}
        <div className="mb-8 flex justify-center items-center">
          <Logo size="xl" showText={false} className="" />
        </div>

        {/* Título */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-white mb-4"
        >
          HumaniQ - {testName}
        </motion.h1>

        {/* Mensagem principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={`p-3 rounded-full bg-white/10 ${currentMessage.color}`}
              >
                <IconComponent className="h-8 w-8" />
              </motion.div>
            </div>
            
            <h2 className="text-2xl font-semibold text-white mb-2">
              {currentMessage.text}
            </h2>
            <p className="text-lg text-blue-200">
              {currentMessage.subtext}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Barra de progresso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-blue-200">Preparando experiência</span>
            <span className="text-sm text-blue-200">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Indicadores de etapas */}
        <div className="flex justify-center space-x-4">
          {motivationalMessages.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index <= currentMessageIndex ? 'bg-blue-400' : 'bg-white/30'
              }`}
              animate={{
                scale: index === currentMessageIndex ? [1, 1.3, 1] : 1
              }}
              transition={{
                duration: 1,
                repeat: index === currentMessageIndex ? Infinity : 0
              }}
            />
          ))}
        </div>

        {/* Animação de conclusão */}
        <AnimatePresence>
          {isCompleting && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1 }}
                className="p-6 rounded-full bg-green-500 shadow-2xl"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensagem de rapport */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-blue-300 mt-6 italic"
        >
          "Você está prestes a descobrir insights valiosos sobre si mesmo"
        </motion.p>
      </div>
    </motion.div>
  );
}