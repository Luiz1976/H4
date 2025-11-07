import { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, TrendingUp, Users, FileCheck, Zap, 
  Award, Clock, AlertTriangle, BarChart3, Sparkles, Target, Star,
  ChevronRight, Download, Play, ArrowRight, Check, X, GraduationCap,
  BookOpen, Scale, Brain, HeartPulse, UserCheck, FileBarChart, TrendingDown, QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('rh');
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Fixo */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Logo size="md" showText={true} />
            <nav className="hidden md:flex space-x-8 items-center ml-12">
              <button onClick={() => scrollToSection('solucao')} className="text-gray-700 hover:text-indigo-600 transition-colors">
                Solução
              </button>
              <button onClick={() => scrollToSection('modulos')} className="text-gray-700 hover:text-indigo-600 transition-colors">
                Módulos
              </button>
              <button onClick={() => scrollToSection('planos')} className="text-gray-700 hover:text-indigo-600 transition-colors">
                Planos
              </button>
              <button onClick={() => scrollToSection('depoimentos')} className="text-gray-700 hover:text-indigo-600 transition-colors">
                Casos de Sucesso
              </button>
              <button
                onClick={() => {
                  try {
                    window.dispatchEvent(new CustomEvent('chatbot:open'));
                  } catch (e) {
                    console.warn('Falha ao disparar evento chatbot:open', e);
                  }
                }}
                className="text-gray-700 hover:text-indigo-600 transition-colors"
                data-testid="button-chatbot-header"
                title="Abrir Chatbot"
              >
                Chatbot
              </button>
              <Button 
                onClick={() => navigate('/quick-check')} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="button-diagnostico-header"
              >
                Diagnóstico Gratuito
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                data-testid="button-login"
              >
                Entrar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* SEÇÃO 1: HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-amber-100 text-amber-800 border-amber-200 px-4 py-2 text-sm font-medium" data-testid="badge-prazo">
              ⚠️ Prazo NR-01: Fiscalização ativa a partir de 25/05/2026
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Sua empresa está <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">protegida</span> contra os riscos psicossociais?
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              A partir de maio de 2026, mapear e controlar riscos psicossociais será obrigatório. 
              Empresas sem evidências documentadas enfrentarão <strong className="text-red-600">multas de até R$ 6.708</strong> e 
              passivos trabalhistas que podem ultrapassar <strong className="text-red-600">R$ 100 mil</strong> por caso.
            </p>

            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg" data-testid="card-estatistica">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Dado Alarmante que Exige Sua Atenção Agora
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-2xl text-red-600">472 mil afastamentos</strong> por transtornos mentais foram registrados no Brasil em 2024 — 
                    um aumento de <strong>68% em relação a 2023</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('diagnostico')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
                data-testid="button-diagnostico-hero"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Faça seu Diagnóstico Gratuito em 5 Minutos
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => scrollToSection('demo')}
                className="text-lg px-8 py-6 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                data-testid="button-demo"
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              ✓ Sem custo ✓ Sem cartão de crédito ✓ Resultado imediato
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: O PROBLEMA (DOR) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              O custo invisível que está <span className="text-red-600">consumindo sua empresa</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enquanto você lê esta página, colaboradores da sua organização podem estar enfrentando:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-red-100 hover:border-red-300 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start mb-4">
                  <div className="bg-red-100 p-3 rounded-lg mr-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Riscos que Você Não Vê</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Sobrecarga de trabalho e prazos irreais
                      </li>
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Assédio moral e conflitos não resolvidos
                      </li>
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Metas abusivas sem suporte adequado
                      </li>
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Jornadas excessivas sem previsibilidade
                      </li>
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Falta de apoio em momentos críticos
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Impacto Financeiro Real</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-orange-600 font-bold mr-2">R$ 12-20k</span>
                        por colaborador afastado
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 font-bold mr-2">20-50%</span>
                        do salário anual por turnover
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 font-bold mr-2">até 30%</span>
                        de perda de produtividade
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 font-bold mr-2">+R$ 100k</span>
                        em indenizações por caso
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 font-bold mr-2">+134%</span>
                        em afastamentos em 2 anos
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 text-center">
            <p className="text-2xl font-semibold mb-2">
              O Brasil está entre os países mais estressados do mundo
            </p>
            <p className="text-lg text-gray-300">
              54% da população reporta alta preocupação com saúde mental
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: MUDANÇA REGULATÓRIA (URGÊNCIA) */}
      <section id="urgencia" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-600 text-white px-4 py-2" data-testid="badge-nr01">
              🚨 NOVA EXIGÊNCIA NR-01
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              O que mudou na NR-01 — e por que sua empresa precisa agir <span className="text-red-600">agora</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">A NR-01 agora exige que você:</h3>
                <ul className="space-y-4">
                  {[
                    'Identifique os fatores de risco psicossociais',
                    'Avalie a intensidade e frequência desses riscos',
                    'Mensure o impacto na saúde dos colaboradores',
                    'Controle com planos de ação documentados',
                    'Monitore continuamente a evolução'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start" data-testid={`requirement-${index}`}>
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-8 shadow-xl mb-6">
                <h3 className="text-2xl font-bold mb-6">Linha do Tempo Crítica</h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-white/30 pl-6">
                    <p className="font-semibold text-lg">Hoje</p>
                    <p className="text-red-100">Fase educativa — momento ideal para implementar</p>
                  </div>
                  <div className="border-l-4 border-yellow-300 pl-6">
                    <p className="font-semibold text-lg">Até 25/05/2026</p>
                    <p className="text-red-100">Período de adaptação — construa evidências</p>
                  </div>
                  <div className="border-l-4 border-red-300 pl-6">
                    <p className="font-semibold text-lg">Após 26/05/2026</p>
                    <p className="text-red-100 font-bold">Fiscalização ativa + Multas de R$ 1.799 a R$ 6.708</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-lg mb-3 text-gray-900">Consequências para quem não cumprir:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Multas entre R$ 1.799,39 e R$ 6.708,08
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Notificações via eSocial (automático)
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Ações trabalhistas com dano moral coletivo
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Possibilidade de Ação Civil Pública (ACP)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 text-center">
            <p className="text-xl md:text-2xl font-semibold mb-4">
              ⚠️ Empresas que começarem apenas em maio de 2026 estarão <strong>12 meses atrasadas</strong> na construção de evidências
            </p>
            <p className="text-lg text-indigo-100">
              Auditores avaliarão o histórico completo de ações, não apenas a situação presente. 
              Com a HumaniQ AI, você constrói esse histórico automaticamente desde o primeiro dia.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: SOLUÇÃO COMPLETA */}
      <section id="solucao" className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-3 text-base font-bold" data-testid="badge-solucao">
              🎯 SOLUÇÃO 360° COMPLETA
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              HumaniQ AI: A Plataforma Completa para Gestão de Riscos Psicossociais
            </h2>
            <p className="text-xl md:text-2xl text-indigo-200 max-w-4xl mx-auto">
              A única solução integrada que entrega tudo o que a NR-01 exige — do mapeamento online à capacitação de lideranças — 
              em um sistema totalmente automatizado e auditável.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <p className="text-center text-2xl font-semibold mb-2">
              Não é apenas software.
            </p>
            <p className="text-center text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
              É todo o ecossistema de conformidade psicossocial.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: MÓDULOS DA PLATAFORMA */}
      <section id="modulos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              9 Módulos Integrados. Uma Solução Completa.
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para estar 100% em conformidade com a NR-01
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                titulo: 'Mapeamento Online Automatizado',
                descricao: 'Avaliação digital de riscos com alertas protegidos por sigilo. 100% online, resultados em tempo real.',
                beneficio: 'Elimina planilhas manuais e processos lentos'
              },
              {
                icon: Shield,
                titulo: 'Avaliação Individual com Sigilo',
                descricao: 'Testes psicométricos validados com proteção LGPD. Dados individuais nunca expostos.',
                beneficio: 'Identificação precoce com ética e legalidade'
              },
              {
                icon: BarChart3,
                titulo: 'Dashboard de Saúde Psicossocial',
                descricao: 'Score de maturidade, mapa de calor por setor, comparação com benchmarks setoriais.',
                beneficio: 'Diretoria visualiza tudo em 30 segundos'
              },
              {
                icon: FileCheck,
                titulo: 'Relatórios Automáticos',
                descricao: 'Relatórios gerenciais, para auditoria e PGR específico NR-01. Exportação em PDF profissional.',
                beneficio: 'Entregue ao auditor exatamente o que ele precisa'
              },
              {
                icon: Award,
                titulo: 'Relatório PGR Específico NR-01',
                descricao: 'Documento técnico formatado conforme MTE, alinhado com ISO 45003, seções obrigatórias incluídas.',
                beneficio: 'Seu PGR fica completo e em conformidade'
              },
              {
                icon: Sparkles,
                titulo: 'Propostas de Ação Inteligentes',
                descricao: 'IA analisa dados e sugere intervenções personalizadas com responsáveis e prazos definidos.',
                beneficio: 'Do diagnóstico à ação sem consultoria externa'
              },
              {
                icon: TrendingUp,
                titulo: 'Melhoria Contínua',
                descricao: 'Sistema PDCA, sugestões de políticas internas, benchmarks e alertas proativos.',
                beneficio: 'A plataforma orienta evolução constante'
              },
              {
                icon: Users,
                titulo: 'Treinamento EAD para Lideranças',
                descricao: 'Curso completo sobre gestão de riscos psicossociais com certificação digital.',
                beneficio: 'Líderes capacitados = ambientes saudáveis'
              },
              {
                icon: Clock,
                titulo: 'Histórico Auditável Completo',
                descricao: 'Registro de todas as ações, quem acessou, quando, logs completos.',
                beneficio: 'Proteção jurídica total. Você prova tudo'
              }
            ].map((modulo, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-gray-100 hover:border-indigo-300" data-testid={`card-modulo-${index}`}>
                <CardContent className="pt-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                    <modulo.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{modulo.titulo}</h3>
                  <p className="text-gray-600 mb-4">{modulo.descricao}</p>
                  <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-sm font-semibold text-indigo-900">
                      <Sparkles className="inline h-4 w-4 mr-1" />
                      {modulo.beneficio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 6.5: TRILHA DE CAPACITAÇÃO NR-01 COM CERTIFICAÇÃO PROFISSIONAL */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Cabeçalho com Âncora e Urgência */}
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 text-base font-bold animate-pulse" data-testid="badge-capacitacao">
              🎓 EXCLUSIVO: Trilha Completa NR-01 + Certificação Digital
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Capacite Suas Lideranças com a{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Única Trilha Certificada
              </span>{' '}
              para Gestão de Riscos Psicossociais
            </h2>
            
            <p className="text-xl md:text-2xl text-indigo-200 max-w-4xl mx-auto mb-8">
              <strong className="text-yellow-300">8 cursos profissionais</strong> baseados nas exigências da NR-01, 
              com <strong className="text-yellow-300">certificação digital reconhecida</strong> que comprova a capacitação 
              de suas lideranças perante auditores do MTE e processos trabalhistas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">1.247+ Líderes Certificados</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">Certificado Aceito em Auditorias MTE</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">100% Online e Auditável</span>
              </div>
            </div>

            <div className="bg-amber-100 border-l-4 border-amber-500 text-gray-900 p-4 rounded-lg max-w-3xl mx-auto mb-8">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm font-semibold">
                  <span className="text-amber-600">ESCASSEZ:</span> Turmas limitadas a 50 empresas por trimestre. 
                  Empresas que começarem após maio/2026 não terão tempo de construir histórico completo de capacitação.
                </p>
              </div>
            </div>
          </div>

          {/* Grid dos 8 Cursos Profissionais */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">
              Conheça os 8 Cursos da Trilha NR-01
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: BookOpen,
                  titulo: 'Fundamentos da NR-01',
                  duracao: '6h',
                  nivel: 'Essencial',
                  topicos: ['Histórico e Contexto', 'Exigências Legais', 'Responsabilidades'],
                  cor: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Scale,
                  titulo: 'Identificação de Riscos',
                  duracao: '8h',
                  nivel: 'Fundamental',
                  topicos: ['Mapeamento de Fatores', 'Instrumentos Validados', 'Análise Setorial'],
                  cor: 'from-purple-500 to-pink-500'
                },
                {
                  icon: Brain,
                  titulo: 'Avaliação Psicossocial',
                  duracao: '10h',
                  nivel: 'Avançado',
                  topicos: ['Testes Validados', 'Interpretação de Dados', 'Relatórios Técnicos'],
                  cor: 'from-indigo-500 to-purple-500'
                },
                {
                  icon: Shield,
                  titulo: 'Gestão de Riscos PRG',
                  duracao: '12h',
                  nivel: 'Estratégico',
                  topicos: ['PGR Psicossocial', 'ISO 45003', 'GRO Integrado'],
                  cor: 'from-green-500 to-emerald-500'
                },
                {
                  icon: HeartPulse,
                  titulo: 'Prevenção de Burnout',
                  duracao: '8h',
                  nivel: 'Especializado',
                  topicos: ['Sinais Precoces', 'Intervenções Eficazes', 'Apoio Psicológico'],
                  cor: 'from-red-500 to-orange-500'
                },
                {
                  icon: UserCheck,
                  titulo: 'Liderança Saudável',
                  duracao: '10h',
                  nivel: 'Liderança',
                  topicos: ['Comunicação Não-Violenta', 'Gestão de Conflitos', 'Cultura Positiva'],
                  cor: 'from-yellow-500 to-amber-500'
                },
                {
                  icon: FileBarChart,
                  titulo: 'Monitoramento Contínuo',
                  duracao: '6h',
                  nivel: 'Operacional',
                  topicos: ['Indicadores-Chave', 'Dashboards', 'Tomada de Decisão'],
                  cor: 'from-teal-500 to-cyan-500'
                },
                {
                  icon: TrendingDown,
                  titulo: 'Intervenção e Melhoria',
                  duracao: '10h',
                  nivel: 'Prático',
                  topicos: ['Planos de Ação', 'PDCA Psicossocial', 'Evidências para Auditoria'],
                  cor: 'from-violet-500 to-purple-500'
                }
              ].map((curso, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 hover:bg-white/15 transition-all hover:-translate-y-2 group" data-testid={`card-curso-${index}`}>
                  <CardContent className="pt-6 pb-6">
                    <div className={`bg-gradient-to-br ${curso.cor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <curso.icon className="h-7 w-7 text-white" />
                    </div>
                    
                    <Badge className="mb-3 bg-yellow-400 text-gray-900 text-xs font-bold">
                      {curso.nivel}
                    </Badge>
                    
                    <h4 className="text-lg font-bold mb-2 text-white group-hover:text-yellow-300 transition-colors">
                      {curso.titulo}
                    </h4>
                    
                    <div className="flex items-center gap-2 mb-3 text-sm text-indigo-200">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">{curso.duracao} de conteúdo</span>
                    </div>
                    
                    <ul className="space-y-1 text-sm text-gray-300">
                      {curso.topicos.map((topico, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{topico}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Central de Reciprocidade */}
            <div className="mt-12 text-center bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 rounded-2xl p-8">
              <p className="text-2xl font-bold mb-2">
                🎁 Bônus Exclusivo: Módulo 1 "Fundamentos da NR-01" Liberado Gratuitamente
              </p>
              <p className="text-lg mb-4">
                Experimente a qualidade dos nossos cursos antes de contratar. Sem custo, sem compromisso.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/quick-check')}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 text-lg"
                data-testid="button-modulo-gratuito"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Acessar Módulo Gratuito Agora
              </Button>
            </div>
          </div>

          {/* Seção de Certificação Digital */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-green-400 to-emerald-400 text-gray-900 px-4 py-2 text-sm font-bold" data-testid="badge-certificacao">
                ✅ CERTIFICAÇÃO DIGITAL PROFISSIONAL
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Certificados Reconhecidos e Auditáveis
              </h3>
              <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
                Cada curso concluído gera um <strong className="text-white">certificado digital profissional</strong> com 
                validade jurídica, aceito em auditorias do MTE e processos trabalhistas.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: QrCode,
                  titulo: 'QR Code de Autenticação',
                  descricao: 'Cada certificado possui QR Code único que permite verificação instantânea da autenticidade em segundos.',
                  destaque: '100% Verificável'
                },
                {
                  icon: Shield,
                  titulo: 'Assinatura Digital com Timestamp',
                  descricao: 'Certificado possui assinatura digital criptografada com registro de data e hora, garantindo validade jurídica.',
                  destaque: 'Validade Jurídica'
                },
                {
                  icon: Download,
                  titulo: 'Download em PDF Profissional',
                  descricao: 'Certificado em PDF de alta qualidade, pronto para impressão ou envio digital para auditores e processos.',
                  destaque: 'Formato Universal'
                }
              ].map((item, index) => (
                <div key={index} className="text-center" data-testid={`certificacao-${index}`}>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-white">{item.titulo}</h4>
                  <p className="text-gray-300 mb-3">{item.descricao}</p>
                  <Badge className="bg-green-400 text-gray-900 font-semibold">
                    {item.destaque}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-center">
              <p className="text-lg font-semibold mb-2">
                <Star className="inline h-5 w-5 text-yellow-300 mr-2" />
                Aprovação de Auditores MTE
              </p>
              <p className="text-2xl font-bold text-white">
                97% dos auditores validam nossos certificados sem ressalvas
              </p>
              <p className="text-sm text-green-100 mt-2">
                Baseado em 1.247 certificados apresentados em auditorias fiscais entre 2024-2025
              </p>
            </div>
          </div>

          {/* Âncoragem de Valor */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-3xl mx-auto">
              <p className="text-xl mb-2 text-indigo-200">
                <span className="line-through">Valor de Mercado: R$ 12.800</span>
              </p>
              <p className="text-4xl font-bold text-yellow-300 mb-4">
                INCLUSO em todos os planos HumaniQ AI
              </p>
              <p className="text-lg text-gray-300">
                Economize <strong className="text-white">R$ 12.800</strong> em capacitação externa + 
                elimine custos de consultoria para elaboração de PGR Psicossocial
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO 7: BENEFÍCIOS POR PÚBLICO */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Benefícios para Cada Área da Sua Empresa
            </h2>
            <p className="text-xl text-gray-600">
              Uma solução que atende todos os stakeholders
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-2 shadow-lg inline-flex gap-2">
              {[
                { id: 'rh', label: 'RH' },
                { id: 'juridico', label: 'Jurídico' },
                { id: 'diretoria', label: 'Diretoria' },
                { id: 'compliance', label: 'Compliance' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {activeTab === 'rh' && (
              <div data-testid="content-rh">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Para o RH</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    'Diagnóstico preciso do clima organizacional',
                    'Identificação precoce de áreas críticas',
                    'Planos de ação inteligentes e personalizados',
                    'Acompanhamento da evolução em tempo real',
                    'Redução de turnover e absenteísmo'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'juridico' && (
              <div data-testid="content-juridico">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Para o Jurídico</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    'Evidências documentadas para defesa em processos',
                    'Relatórios probatórios com rastreabilidade completa',
                    'Conformidade com NR-01 e ISO 45003',
                    'Histórico de ações preventivas e corretivas',
                    'Proteção contra dano moral coletivo'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'diretoria' && (
              <div data-testid="content-diretoria">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Para a Diretoria</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    'ROI claro: economia em afastamentos e turnover',
                    'Reputação fortalecida (ESG e Employer Branding)',
                    'Dashboard executivo com indicadores estratégicos',
                    'Redução de passivos trabalhistas',
                    'Score de maturidade organizacional'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div data-testid="content-compliance">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Para Compliance e SESMT</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    'Integração automática com PGR e GRO',
                    'Relatórios prontos para fiscalização do MTE',
                    'Atendimento às orientações técnicas oficiais',
                    'Logs de auditoria completos',
                    'Capacitação contínua de lideranças'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO 10: PROVA SOCIAL */}
      <section id="depoimentos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Empresas que já transformaram sua gestão de riscos
            </h2>
            <div className="flex justify-center items-center gap-2 text-yellow-500">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-6 w-6 fill-current" />)}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                depoimento: "A HumaniQ AI entregou tudo: o mapeamento, os relatórios para o PGR e ainda capacitou nossas lideranças. Reduzimos 23% dos riscos críticos em 90 dias.",
                autor: "Gestora de RH",
                empresa: "Indústria Alimentícia",
                colaboradores: "450 colaboradores"
              },
              {
                depoimento: "Quando o auditor pediu evidências sobre riscos psicossociais, abri a plataforma e exportei o relatório PGR em 2 minutos. Ele ficou impressionado com o nível de detalhamento.",
                autor: "Coordenador SESMT",
                empresa: "Logística",
                colaboradores: "1.200 colaboradores"
              },
              {
                depoimento: "O treinamento EAD para líderes foi fundamental. Eles agora sabem identificar sinais de sobrecarga e agir preventivamente. Nosso clima melhorou 40% em 6 meses.",
                autor: "Diretor de Pessoas",
                empresa: "Varejo",
                colaboradores: "800 colaboradores"
              }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all" data-testid={`card-depoimento-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-current text-yellow-500" />)}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{item.depoimento}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{item.autor}</p>
                    <p className="text-sm text-gray-600">{item.empresa} | {item.colaboradores}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 11: ROI E ECONOMIA */}
      <section id="preco" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Quanto sua empresa pode <span className="text-green-600">economizar</span> com a HumaniQ AI?
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-red-600 mb-6">Cenário Atual (sem gestão completa)</h3>
              <div className="space-y-4">
                {[
                  { item: '5 afastamentos/ano × R$ 15.000', valor: 'R$ 75.000' },
                  { item: '3 turnover/ano × R$ 25.000', valor: 'R$ 75.000' },
                  { item: '1 ação trabalhista × R$ 120.000', valor: 'R$ 120.000' },
                  { item: 'Consultoria para PGR × R$ 30.000', valor: 'R$ 30.000' },
                  { item: 'Treinamentos externos × R$ 20.000', valor: 'R$ 20.000' },
                  { item: 'Perda de produtividade estimada', valor: 'R$ 80.000' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700">{item.item}</span>
                    <span className="font-bold text-red-600">{item.valor}</span>
                  </div>
                ))}
                <div className="bg-red-100 p-4 rounded-lg mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total de custos evitáveis:</span>
                    <span className="text-3xl font-bold text-red-600">R$ 400.000/ano</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Com HumaniQ AI (Plataforma Completa)</h3>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <p className="text-lg mb-2">Investimento Anual</p>
                  <p className="text-5xl font-bold">R$ 29.900</p>
                  <p className="text-green-200 mt-2">Tudo incluído. Sem custos extras.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <p className="text-lg mb-2">Economia Potencial</p>
                  <p className="text-5xl font-bold">R$ 370.000/ano</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 p-6 rounded-xl">
                  <p className="text-lg mb-2 font-semibold">Retorno sobre Investimento</p>
                  <p className="text-6xl font-bold">1.238%</p>
                  <p className="text-gray-800 mt-2 font-medium">Para cada R$ 1 investido, você economiza R$ 12,38</p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => scrollToSection('diagnostico')}
                    className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
                    data-testid="button-diagnostico-roi"
                  >
                    Comece Seu Diagnóstico Gratuito
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 12: PLANOS E PREÇOS */}
      <section id="planos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800 border-indigo-200 px-4 py-2">
              Investimento Transparente
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Escolha o Plano Ideal para Sua Empresa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Preços claros, sem surpresas. Pague apenas pelo que usar, com todos os recursos para manter sua empresa em compliance.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* PLANO ESSENCIAL */}
            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl" data-testid="card-plano-essencial">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Essencial</h3>
                  <p className="text-gray-600 mb-4">Para pequenas empresas começando</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">R$ 15</span>
                    <span className="text-gray-600">/colaborador/mês</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Mínimo:</strong> 10 colaboradores<br/>
                      <strong>Ticket:</strong> R$ 150/mês
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">3 testes psicológicos básicos (QVT, Estresse, Clima)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Dashboard básico de resultados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Relatórios individuais e agregados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Até 50 colaboradores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Suporte por email</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">Análise com IA</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">Módulo PRG</span>
                  </li>
                </ul>

                <Button 
                  className="w-full bg-gray-600 hover:bg-gray-700" 
                  data-testid="button-plano-essencial"
                  onClick={() => window.location.href = '/checkout/essencial'}
                >
                  Começar com Essencial
                </Button>
              </CardContent>
            </Card>

            {/* PLANO PROFISSIONAL - DESTAQUE */}
            <Card className="border-4 border-indigo-500 relative hover:border-indigo-600 transition-all hover:shadow-2xl transform lg:-translate-y-4" data-testid="card-plano-profissional">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 text-sm font-bold shadow-lg">
                  ⭐ MAIS POPULAR
                </Badge>
              </div>
              
              <CardContent className="pt-12 pb-8">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Profissional
                  </h3>
                  <p className="text-gray-600 mb-4">Para empresas com foco em compliance</p>
                  <div className="mb-6">
                    <span className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      R$ 25
                    </span>
                    <span className="text-gray-600">/colaborador/mês</span>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-2 border-indigo-200">
                    <p className="text-sm text-indigo-900 font-semibold">
                      <strong>Mínimo:</strong> 20 colaboradores<br/>
                      <strong>Ticket:</strong> R$ 500/mês
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Todos os 7 testes psicológicos</strong> (QVT, RPO, Clima, Estresse, Karasek-Siegrist, PAS, MGRP)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Análise com IA</strong> (Google Gemini)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Dashboard avançado com gráficos interativos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Relatórios de compliance</strong> (NR-1, ISO 45003)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Módulo PRG completo</strong></span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Até 200 colaboradores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Exportação PDF e Excel</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Suporte prioritário (email + chat)</span>
                  </li>
                </ul>

                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6" 
                  data-testid="button-plano-profissional"
                  onClick={() => window.location.href = '/checkout/profissional'}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Escolher Profissional
                </Button>
              </CardContent>
            </Card>

            {/* PLANO ENTERPRISE */}
            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl" data-testid="card-plano-enterprise">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <p className="text-gray-600 mb-4">Para grandes empresas</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">R$ 35</span>
                    <span className="text-gray-600">/colaborador/mês</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Mínimo:</strong> 100 colaboradores<br/>
                      <strong>Ticket:</strong> R$ 3.500/mês
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Tudo do Profissional +</strong></span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Colaboradores ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">API para integração (SAP, TOTVS)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Múltiplas empresas/unidades</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">White-label personalizado</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Consultoria especializada (1h/mês)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Relatórios customizados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">SLA de suporte (4h úteis)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Gestor de contas dedicado</span>
                  </li>
                </ul>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  data-testid="button-plano-enterprise"
                  onClick={() => window.location.href = '/checkout/enterprise'}
                >
                  Falar com Especialista
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Benefícios Inclusos em Todos os Planos */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-indigo-100">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Incluído em Todos os Planos
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Setup Gratuito</h4>
                  <p className="text-sm text-gray-600">Onboarding completo sem custo adicional</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Atualizações Incluídas</h4>
                  <p className="text-sm text-gray-600">Novos recursos sem custo extra</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <Award className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Desconto Anual</h4>
                  <p className="text-sm text-gray-600">10% OFF no pagamento anual</p>
                </div>
              </div>
            </div>
          </div>

          {/* Proposta de Valor */}
          <div className="text-center mt-12">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              Gestão de Riscos Psicossociais com IA por menos de R$ 1 por dia
            </p>
            <p className="text-lg text-gray-600 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                R$ 25/mês = R$ 0,83/dia por colaborador
              </span> — investimento que se paga
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('diagnostico')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="button-testar-planos"
              >
                Testar Gratuitamente
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowComparison(true)}
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                data-testid="button-comparar-planos"
              >
                Comparar Planos em Detalhes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 14: CTA FINAL */}
      <section id="diagnostico" className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Comece Hoje. Proteja Sua Empresa Amanhã.
          </h2>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-yellow-400" />
            </div>
            <h3 className="text-3xl font-bold mb-6">Diagnóstico Gratuito Completo + Demo da Plataforma</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 p-6 rounded-xl">
                <h4 className="font-bold text-xl mb-4">O que você recebe sem custo:</h4>
                <ul className="space-y-3 text-left">
                  {[
                    'Avaliação de até 20 colaboradores',
                    'Mapa de risco psicossocial instantâneo',
                    'Página de Nível de Saúde da sua empresa',
                    'Relatório de maturidade organizacional',
                    'Demonstração ao vivo de todos os módulos',
                    'Consultoria inicial com especialista em SST'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 p-6 rounded-xl flex flex-col justify-center">
                <p className="text-2xl font-bold mb-4">Sem Riscos. Sem Complicações.</p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Sem cartão de crédito
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Sem compromisso
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Sem complicação
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <Button 
              size="lg" 
              onClick={() => navigate('/quick-check')}
              className="bg-white text-indigo-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl hover:shadow-3xl transition-all"
              data-testid="button-diagnostico-final"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Iniciar Diagnóstico Gratuito Agora
            </Button>
          </div>

          <p className="text-indigo-200 text-lg">
            Junte-se a centenas de empresas que já estão protegidas
          </p>
        </div>
      </section>

      {/* Modal de Comparação Detalhada */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Comparação Detalhada dos Planos
            </DialogTitle>
            <DialogDescription className="text-lg">
              Compare todos os recursos e escolha o plano perfeito para sua empresa
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 font-bold text-gray-900">Recursos</th>
                  <th className="text-center p-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">Essencial</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">R$ 15</p>
                      <p className="text-sm text-gray-600">/colab/mês</p>
                    </div>
                  </th>
                  <th className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="text-center">
                      <Badge className="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600">⭐ POPULAR</Badge>
                      <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Profissional</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-1">R$ 25</p>
                      <p className="text-sm text-gray-600">/colab/mês</p>
                    </div>
                  </th>
                  <th className="text-center p-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">Enterprise</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">R$ 35</p>
                      <p className="text-sm text-gray-600">/colab/mês</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Mínimo de colaboradores', essencial: '10', profissional: '20', enterprise: '100' },
                  { feature: 'Máximo de colaboradores', essencial: '50', profissional: '200', enterprise: 'Ilimitado' },
                  { feature: 'Ticket mínimo mensal', essencial: 'R$ 150', profissional: 'R$ 500', enterprise: 'R$ 3.500' },
                  { feature: 'Testes psicológicos', essencial: '3 básicos', profissional: '7 completos', enterprise: '7 completos' },
                  { feature: 'Análise com IA (Google Gemini)', essencial: false, profissional: true, enterprise: true },
                  { feature: 'Dashboard de resultados', essencial: 'Básico', profissional: 'Avançado', enterprise: 'Avançado' },
                  { feature: 'Relatórios de compliance (NR-1, ISO 45003)', essencial: false, profissional: true, enterprise: true },
                  { feature: 'Módulo PRG completo', essencial: false, profissional: true, enterprise: true },
                  { feature: 'Exportação PDF e Excel', essencial: false, profissional: true, enterprise: true },
                  { feature: 'API para integração', essencial: false, profissional: false, enterprise: true },
                  { feature: 'Múltiplas empresas/unidades', essencial: false, profissional: false, enterprise: true },
                  { feature: 'White-label personalizado', essencial: false, profissional: false, enterprise: true },
                  { feature: 'Consultoria especializada', essencial: false, profissional: false, enterprise: '1h/mês' },
                  { feature: 'Relatórios customizados', essencial: false, profissional: false, enterprise: true },
                  { feature: 'Gestor de contas dedicado', essencial: false, profissional: false, enterprise: true },
                  { feature: 'Suporte', essencial: 'Email', profissional: 'Email + Chat', enterprise: 'SLA 4h úteis' },
                  { feature: 'Setup e Onboarding', essencial: 'Gratuito', profissional: 'Gratuito + Treinamento 1h', enterprise: 'Premium + Treinamento equipe' },
                  { feature: 'Atualizações', essencial: 'Incluídas', profissional: 'Incluídas', enterprise: 'Incluídas + Preview' },
                  { feature: 'Desconto anual', essencial: '10% OFF', profissional: '10% OFF', enterprise: '10% OFF' },
                ].map((row, index) => (
                  <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.essencial === 'boolean' ? (
                        row.essencial ? (
                          <Check className="h-6 w-6 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.essencial}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                      {typeof row.profissional === 'boolean' ? (
                        row.profissional ? (
                          <Check className="h-6 w-6 text-indigo-600 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700 font-semibold">{row.profissional}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <Check className="h-6 w-6 text-purple-600 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => {
                setShowComparison(false);
                scrollToSection('diagnostico');
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Começar Teste Gratuito
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowComparison(false)}
            >
              Fechar Comparação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="md" showText={true} className="mb-4 [&>span]:text-white" />
              <p className="text-sm">
                Plataforma completa para gestão de riscos psicossociais em conformidade com a NR-01.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('modulos')} className="hover:text-white">Módulos</button></li>
                <li><button onClick={() => scrollToSection('planos')} className="hover:text-white">Planos e Preços</button></li>
                <li><button onClick={() => scrollToSection('depoimentos')} className="hover:text-white">Casos de Sucesso</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 HumaniQ AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}