import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface RiskGaugeProps {
  value: number; // 0-100
  totalTests?: number;
  size?: 'small' | 'medium' | 'large';
}

interface RiskLevel {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  gradient: string;
  strokeColor: string;
  min: number;
  max: number;
}

const RISK_LEVELS: RiskLevel[] = [
  {
    label: 'Excelente',
    shortLabel: 'A+',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-green-500',
    strokeColor: '#10b981',
    min: 80,
    max: 100
  },
  {
    label: 'Bom',
    shortLabel: 'A',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
    gradient: 'from-green-400 to-lime-500',
    strokeColor: '#22c55e',
    min: 60,
    max: 79
  },
  {
    label: 'Atenção',
    shortLabel: 'B',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    gradient: 'from-yellow-400 to-amber-500',
    strokeColor: '#eab308',
    min: 40,
    max: 59
  },
  {
    label: 'Crítico',
    shortLabel: 'C',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    gradient: 'from-orange-400 to-red-500',
    strokeColor: '#f97316',
    min: 20,
    max: 39
  },
  {
    label: 'Muito Crítico',
    shortLabel: 'D',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
    gradient: 'from-red-500 to-red-700',
    strokeColor: '#ef4444',
    min: 0,
    max: 19
  }
];

export default function RiskGauge({ value, totalTests, size = 'medium' }: RiskGaugeProps) {
  const riskLevel = useMemo(() => {
    return RISK_LEVELS.find(level => value >= level.min && value <= level.max) || RISK_LEVELS[4];
  }, [value]);

  const sizes = {
    small: {
      container: 'w-32 h-32',
      strokeWidth: 8,
      fontSize: 'text-2xl',
      labelSize: 'text-xs',
      badgeSize: 'text-[10px] px-2 py-0.5'
    },
    medium: {
      container: 'w-40 h-40 md:w-48 md:h-48',
      strokeWidth: 10,
      fontSize: 'text-3xl md:text-4xl',
      labelSize: 'text-xs md:text-sm',
      badgeSize: 'text-xs px-3 py-1'
    },
    large: {
      container: 'w-56 h-56',
      strokeWidth: 12,
      fontSize: 'text-5xl',
      labelSize: 'text-sm',
      badgeSize: 'text-sm px-4 py-1.5'
    }
  };

  const config = sizes[size];
  const radius = size === 'small' ? 48 : size === 'medium' ? 60 : 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3" data-testid="risk-gauge">
      {/* Circular Gauge */}
      <div className={`relative ${config.container}`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${riskLevel.gradient} opacity-20 blur-xl animate-pulse`}></div>
        
        {/* SVG Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="text-white/10"
          />
          
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={riskLevel.strokeColor}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 8px ${riskLevel.strokeColor})`
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`${config.fontSize} font-black ${riskLevel.color} drop-shadow-lg`}>
            {Math.round(value)}%
          </div>
          <div className={`${config.labelSize} font-bold text-white/60 uppercase tracking-wider mt-1`}>
            Bem-Estar
          </div>
          {totalTests && totalTests > 0 && (
            <div className="text-[10px] text-white/40 mt-0.5">
              {totalTests} {totalTests === 1 ? 'avaliação' : 'avaliações'}
            </div>
          )}
        </div>
      </div>

      {/* Risk Level Badge */}
      <Badge 
        className={`${riskLevel.bgColor} text-white border-0 shadow-lg ${config.badgeSize} font-bold`}
        data-testid="risk-level-badge"
      >
        {riskLevel.label}
      </Badge>

      {/* Energy Efficiency Style Scale */}
      <div className="w-full max-w-[200px] space-y-1" data-testid="risk-scale">
        {RISK_LEVELS.map((level, index) => {
          const isActive = level.label === riskLevel.label;
          return (
            <div
              key={level.label}
              className={`flex items-center gap-2 transition-all duration-300 ${
                isActive ? 'scale-105' : 'opacity-50'
              }`}
            >
              {/* Arrow indicator */}
              <div className={`w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-white transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}></div>
              
              {/* Color bar */}
              <div className={`flex-1 h-5 ${level.bgColor} rounded flex items-center justify-between px-2 shadow-md ${
                isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
              }`}>
                <span className="text-white text-[10px] font-bold">{level.shortLabel}</span>
                <span className="text-white text-[10px] font-medium">{level.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
