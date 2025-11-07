import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, ArrowLeft, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RecuperarSenha = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/recuperar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailEnviado(true);
        toast({
          title: 'Email enviado!',
          description: 'Verifique sua caixa de entrada para redefinir sua senha.',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Não foi possível enviar o email de recuperação.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Voltar ao Login */}
          <button
            onClick={() => navigate('/login')}
            data-testid="button-back-to-login"
            className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao login</span>
          </button>

          {/* Card */}
          <div 
            className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-500/20 hover:shadow-3xl"
          >
            {/* Gradient Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-500 hover:opacity-100 pointer-events-none" />
            
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 text-center">
              {/* Icon with Glow */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 transform hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {emailEnviado ? 'Email Enviado!' : 'Recuperar Senha'}
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                {emailEnviado 
                  ? 'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.'
                  : 'Insira seu email e enviaremos instruções para recuperar sua senha.'}
              </p>
            </div>

            {/* Form or Success Message */}
            {emailEnviado ? (
              <div className="px-8 pb-8 space-y-5">
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400/50">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <p className="text-white/80 text-center">
                    Um email foi enviado para <br />
                    <span className="font-semibold text-blue-300">{email}</span>
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  data-testid="button-go-to-login"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Voltar ao Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  data-testid="button-submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Enviar Instruções</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {/* Reassurance */}
                <div className="pt-4 text-center">
                  <p className="text-white/50 text-xs leading-relaxed">
                    🔒 Link seguro será enviado para seu email
                  </p>
                </div>
              </form>
            )}
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

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default RecuperarSenha;
