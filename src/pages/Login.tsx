import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Lock, Mail, Sparkles, Shield, Zap, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 [LOGIN] Componente Login montado');
    console.log('🔍 [LOGIN] User atual:', user);
    console.log('🔍 [LOGIN] Location:', window.location.href);
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    console.log('🔍 [LOGIN] Tentativa de login iniciada');
    
    try {
      const result = await login(email, password);
      console.log('🔍 [LOGIN] Resultado do login:', result);
      
      if (result.success && result.user) {
        console.log('🔍 [LOGIN] Login bem-sucedido, redirecionando para animação pós-login');
        navigate('/post-login-animation');
      } else {
        console.log('🔍 [LOGIN] Login falhou:', result.message);
        setError(result.message || 'Ocorreu um erro ao fazer login');
      }
    } catch (loginError) {
      console.error('❌ [LOGIN] Erro no processo de login:', loginError);
      setError('Erro interno no sistema de login');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('🔍 [LOGIN] Renderizando componente Login');

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Trust Indicators - PNL: Social Proof */}
          <div className="mb-8 text-center space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-6 text-white/60 text-xs">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Acesso Instantâneo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Confiável</span>
              </div>
            </div>
          </div>

          {/* Login Card - Glassmorphism */}
          <div 
            className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-500/20 hover:shadow-3xl"
            style={{
              animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Gradient Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-500 hover:opacity-100 pointer-events-none" />
            
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 text-center">
              {/* Logo/Icon with Glow */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 transform hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              {/* PNL: Presupposition & Sensory Language */}
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Bem-vindo de Volta
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                Sua jornada transformadora continua aqui.<br />
                <span className="text-blue-300">Desbloqueie seu potencial completo.</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="px-8 pb-8 space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                  Email
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'email' || email ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </div>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`pl-11 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                      focusedField === 'email' || email
                        ? 'bg-white text-slate-900 placeholder:text-slate-400 border-blue-400/50 shadow-lg shadow-blue-500/20'
                        : 'bg-slate-700/40 border-slate-600/30 text-slate-300 placeholder:text-slate-400'
                    }`}
                  />
                  {/* Focus Indicator */}
                  <div className={`absolute inset-0 rounded-xl border-2 border-blue-400 pointer-events-none transition-opacity duration-300 ${
                    focusedField === 'email' ? 'opacity-50' : 'opacity-0'
                  }`} style={{ filter: 'blur(8px)' }} />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 text-sm font-medium">
                  Senha
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'password' || password ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </div>
                  <Input
                    id="password"
                    data-testid="input-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`pl-11 pr-11 h-12 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                      focusedField === 'password' || password
                        ? 'bg-white text-slate-900 placeholder:text-slate-400 border-purple-400/50 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-700/40 border-slate-600/30 text-slate-300 placeholder:text-slate-400'
                    }`}
                  />
                  {/* Toggle Password Visibility */}
                  <button
                    type="button"
                    data-testid="button-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors duration-200 ${
                      focusedField === 'password' || password ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {/* Focus Indicator */}
                  <div className={`absolute inset-0 rounded-xl border-2 border-purple-400 pointer-events-none transition-opacity duration-300 ${
                    focusedField === 'password' ? 'opacity-50' : 'opacity-0'
                  }`} style={{ filter: 'blur(8px)' }} />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  data-testid="text-error"
                  className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm animate-shake"
                  style={{
                    animation: 'shake 0.5s ease-in-out',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Esqueceu a senha link */}
              <div className="text-right">
                <button
                  type="button"
                  data-testid="link-forgot-password"
                  onClick={() => navigate('/recuperar-senha')}
                  className="text-sm text-blue-300 hover:text-blue-200 transition-colors duration-200 hover:underline"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {/* Submit Button - PNL: Action-oriented language */}
              <Button
                type="submit"
                data-testid="button-submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Acessando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Entrar Agora</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
              </Button>

              {/* Rapport Building - Reassurance */}
              <div className="pt-4 text-center">
                <p className="text-white/50 text-xs leading-relaxed">
                  🔒 Suas informações estão protegidas com criptografia de ponta
                </p>
              </div>
            </form>
          </div>

          {/* Footer - Psychology: Trust & Credibility */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-white/40 text-xs">
              Tecnologia de ponta para transformação humana
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
