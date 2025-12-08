import { useMemo, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface CircularRiskGaugeProps {
    value: number; // 0-100
    totalTests?: number;
    size?: 'small' | 'medium' | 'large';
}

interface RiskLevel {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    min: number;
    max: number;
}

const RISK_LEVELS: RiskLevel[] = [
    {
        label: 'Excelente',
        shortLabel: 'A+',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500',
        min: 90,
        max: 100
    },
    {
        label: 'Bom',
        shortLabel: 'A',
        color: 'text-green-400',
        bgColor: 'bg-green-500',
        min: 70,
        max: 89
    },
    {
        label: 'Atenção',
        shortLabel: 'B',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500',
        min: 50,
        max: 69
    },
    {
        label: 'Crítico',
        shortLabel: 'C',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500',
        min: 30,
        max: 49
    },
    {
        label: 'Muito Crítico',
        shortLabel: 'D',
        color: 'text-red-400',
        bgColor: 'bg-red-500',
        min: 0,
        max: 29
    }
];

export default function CircularRiskGauge({ value, totalTests, size = 'medium' }: CircularRiskGaugeProps) {
    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);
    const [animatedValue, setAnimatedValue] = useState(0);

    const riskLevel = useMemo(() => {
        return RISK_LEVELS.find(level => value >= level.min && value <= level.max) || RISK_LEVELS[4];
    }, [value]);

    useEffect(() => {
        // Start animation after a short delay
        const timer = setTimeout(() => {
            setAnimatedValue(value);
        }, 100);
        return () => clearTimeout(timer);
    }, [value]);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    const sizes = {
        small: {
            container: 'w-32 h-32',
            strokeWidth: 6,
            fontSize: 'text-2xl',
            labelSize: 'text-[10px]',
            badgeSize: 'text-[10px] px-2 py-0.5'
        },
        medium: {
            container: 'w-56 h-56',
            strokeWidth: 8,
            fontSize: 'text-5xl',
            labelSize: 'text-sm',
            badgeSize: 'text-sm px-4 py-1.5'
        },
        large: {
            container: 'w-72 h-72',
            strokeWidth: 10,
            fontSize: 'text-6xl',
            labelSize: 'text-base',
            badgeSize: 'text-base px-5 py-2'
        }
    };

    const config = sizes[size];
    // Calculate stroke dashoffset for a 75% circle (270 degrees) or full circle? 
    // Image looks like 75% or open at bottom? No, image looks like a full 360 ring, possibly with a small gap?
    // Let's assume a full circle for now, starting from top (rotate -90deg)
    // Actually image shows a gap at top? No, looks like a standard progress ring.
    // "Energy Efficiency" usually has a gap at the bottom. The screenshot shows a gap at the top?
    // Looking at the screenshot provided: it's a 3/4 circle open at the top? No, it looks like a full 360 ring with a trail.
    // Let's do a standard full SVG circle.

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-6" data-testid="circular-risk-gauge">
            <div className={`relative ${config.container} flex items-center justify-center`}>

                {/* Main SVG Gauge */}
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
                    <defs>
                        <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#4ade80" />
                        </linearGradient>
                    </defs>

                    {/* Background Track */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={config.strokeWidth}
                        className="opacity-30"
                    />

                    {/* Progress Circle with Neon Glow */}
                    <circle
                        ref={pathRef as any}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={riskLevel.color.replace('text-', '') === 'emerald-400' ? '#34d399' :
                            riskLevel.color.replace('text-', '') === 'green-400' ? '#4ade80' :
                                riskLevel.color.replace('text-', '') === 'yellow-400' ? '#facc15' :
                                    riskLevel.color.replace('text-', '') === 'orange-400' ? '#fb923c' : '#f87171'}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (animatedValue / 100) * circumference}
                        strokeWidth={config.strokeWidth}
                        className={`transition-all duration-[1500ms] ease-out ${riskLevel.color}`}
                        style={{
                            filter: `drop-shadow(0 0 10px ${riskLevel.color.replace('text-', '') === 'emerald-400' ? 'rgba(52, 211, 153, 0.8)' : 'currentColor'})`
                        }}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`${config.fontSize} font-bold text-emerald-400 drop-shadow-md`}>
                        {Math.round(value)}%
                    </div>
                    <div className={`text-gray-400 font-bold uppercase tracking-wider ${config.labelSize}`}>
                        BEM-ESTAR
                    </div>
                    {totalTests && totalTests > 0 && (
                        <div className={`text-gray-500 font-medium ${size === 'small' ? 'text-[8px]' : 'text-xs'}`}>
                            {totalTests} avaliações
                        </div>
                    )}
                </div>
            </div>

            {/* Level Badge - Styled like the screenshot (Green pill with 'Bom') */}
            <Badge
                className={`${riskLevel.bgColor} text-white hover:${riskLevel.bgColor} border-0 px-8 py-1.5 text-lg font-bold rounded-full`}
            >
                {riskLevel.label}
            </Badge>

            {/* Scale List */}
            <div className="w-full max-w-[280px] space-y-1 bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm">
                {RISK_LEVELS.map((level) => {
                    const isActive = level.label === riskLevel.label;
                    return (
                        <div
                            key={level.label}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${isActive ? level.bgColor + ' text-white scale-105 shadow-lg' : 'bg-transparent text-gray-400 hover:bg-white/5'
                                }`}
                        >
                            <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{level.shortLabel}</span>
                            <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>{level.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
