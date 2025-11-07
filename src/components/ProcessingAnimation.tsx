import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  CheckCircle, 
  Sparkles, 
  TrendingUp,
  Zap,
  Target,
  Award
} from 'lucide-react';
import Logo from './Logo';

interface ProcessingAnimationProps {
  onComplete: () => void;
}

const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = [
    {
      icon: () => <Logo size="sm" showText={false} />,
      title: "Analisando Respostas",
      description: "Processando suas respostas com inteligência artificial",
      color: "hsl(217 91% 60%)", // --primary
      duration: 1800
    },
    {
      icon: BarChart3,
      title: "Calculando Métricas",
      description: "Gerando insights personalizados para seu perfil",
      color: "hsl(142 71% 45%)", // --success
      duration: 2000
    },
    {
      icon: TrendingUp,
      title: "Criando Relatório",
      description: "Compilando análises detalhadas e recomendações",
      color: "hsl(234 89% 74%)", // gradient color
      duration: 1800
    },
    {
      icon: Award,
      title: "Finalizando",
      description: "Preparando seus resultados personalizados",
      color: "hsl(262 83% 58%)", // gradient end color
      duration: 1400
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        setCurrentStage(prev => prev + 1);
        setProgress(0);
      } else {
        // Animação completa
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }, stages[currentStage].duration);

    return () => clearTimeout(timer);
  }, [currentStage, onComplete]);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (stages[currentStage].duration / 50);
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => clearInterval(progressTimer);
  }, [currentStage]);

  const currentStageData = stages[currentStage];
  const IconComponent = currentStageData.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, hsl(217 91% 60% / 0.95) 0%, hsl(234 89% 74% / 0.95) 50%, hsl(262 83% 58% / 0.95) 100%)'
        }}
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
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Ondas de fundo */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border border-white/10 rounded-full"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: "easeOut"
              }}
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>

        {/* Conteúdo principal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center text-white max-w-md mx-auto px-8"
        >
          {/* Ícone central animado */}
          <motion.div
            key={currentStage}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15 
            }}
            className="mb-8 flex justify-center"
          >
            <div 
              className="p-6 rounded-full shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${currentStageData.color}, white)`,
                boxShadow: `0 0 40px ${currentStageData.color}40`
              }}
            >
              <IconComponent 
                size={48} 
                className="text-white drop-shadow-lg" 
              />
            </div>
          </motion.div>

          {/* Título e descrição */}
          <motion.div
            key={`text-${currentStage}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">
              {currentStageData.title}
            </h2>
            <p className="text-lg opacity-90 mb-8 drop-shadow">
              {currentStageData.description}
            </p>
          </motion.div>

          {/* Barra de progresso */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-white rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>

          {/* Indicadores de estágio */}
          <div className="flex justify-center space-x-3">
            {stages.map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStage 
                    ? 'bg-white shadow-lg' 
                    : index < currentStage 
                      ? 'bg-white/70' 
                      : 'bg-white/30'
                }`}
                animate={{
                  scale: index === currentStage ? 1.2 : 1,
                }}
              />
            ))}
          </div>

          {/* Efeito de brilho */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
            }}
          />
        </motion.div>

        {/* Efeitos de canto */}
        <div className="absolute top-8 left-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="text-white/30" size={24} />
          </motion.div>
        </div>
        
        <div className="absolute bottom-8 right-8">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="text-white/30" size={24} />
          </motion.div>
        </div>

        <div className="absolute top-1/4 right-16">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Target className="text-white/20" size={20} />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProcessingAnimation;