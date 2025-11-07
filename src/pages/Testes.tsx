import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, FileText, Heart, Users, Shield, AlertTriangle, Star, Lock, CheckCircle2, Loader2, Calendar, Lightbulb, Scale } from "lucide-react";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { infoTesteClimaOrganizacional } from "@/lib/testes/clima-organizacional";
import { infoTesteKarasekSiegrist } from "@/lib/testes/karasek-siegrist";
import { infoTesteEstresseOcupacional } from "@/lib/testes/estresse-ocupacional";
import { infoTesteClimaBemEstar } from "@/lib/testes/clima-bem-estar";
import { infoTesteMaturidadeRiscosPsicossociais } from "@/lib/testes/maturidade-riscos-psicossociais";
import { configPercepacaoAssedio } from "@/lib/testes/percepcao-assedio";
import { configQualidadeVidaTrabalho } from "@/lib/testes/qualidade-vida-trabalho";
import { obterInfoTesteRPO } from "@/lib/testes/riscos-psicossociais-ocupacionais";
import { infoTesteHumaniQInsight } from "@/lib/testes/humaniq-insight";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

interface TesteDisponibilidade {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  tempoEstimado: number;
  instrucoes: string;
  ativo: boolean;
  disponivel: boolean;
  motivo: string | null;
  proximaDisponibilidade: string | null;
  dataConclusao: string | null;
  pontuacao: number | null;
  periodicidadeDias: number | null;
}

export default function Testes() {
  const navigate = useNavigate();
  const infoRPO = obterInfoTesteRPO();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const isColaborador = isAuthenticated && user?.role === 'colaborador';

  // 🚀 React Query: Carrega testes automaticamente com cache inteligente
  const { data, isLoading: carregando, error } = useQuery<{ testes: TesteDisponibilidade[] }>({
    queryKey: ['/api/teste-disponibilidade/colaborador/testes'],
    queryFn: () => apiRequest<{ testes: TesteDisponibilidade[] }>('/api/teste-disponibilidade/colaborador/testes'),
    enabled: isColaborador, // Só carregar se for colaborador autenticado
    staleTime: 0, // Sempre revalidar
    refetchOnWindowFocus: true, // ✅ Recarregar automaticamente ao focar na janela
    refetchOnMount: true, // ✅ Recarregar ao montar
  });

  // ✅ Listener para invalidar cache quando um teste for concluído
  useEffect(() => {
    const handleTesteConcluido = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 [TESTES] Teste concluído detectado:', customEvent.detail);
      
      // Invalidar cache para forçar recarregamento
      queryClient.invalidateQueries({ 
        queryKey: ['/api/teste-disponibilidade/colaborador/testes'] 
      });
      console.log('✅ [TESTES] Cache invalidado - dados serão recarregados automaticamente');
    };

    window.addEventListener('teste-concluido', handleTesteConcluido);
    
    return () => {
      window.removeEventListener('teste-concluido', handleTesteConcluido);
    };
  }, [queryClient]);

  const testes = data?.testes || [];

  // Logging quando os dados mudam
  if (data) {
    console.log('🔍 [TESTES-FRONTEND] Dados recebidos da API:', data);
    console.log('📊 [TESTES-FRONTEND] Total de testes:', data.testes?.length || 0);
    console.log('📋 [TESTES-FRONTEND] Resumo dos testes:', data.testes?.map((t: any) => ({
      nome: t.nome,
      disponivel: t.disponivel,
      motivo: t.motivo,
      dataConclusao: t.dataConclusao
    })));
  }

  // Mostrar erro se houver
  if (error) {
    console.error('❌ [TESTES] Erro ao carregar testes:', error);
    toast.error('Erro ao carregar testes disponíveis');
  }

  const getTesteInfo = (nome: string) => {
    const nomeNorm = nome.toLowerCase();
    if (nomeNorm.includes('humaniq insight') || nomeNorm.includes('humaniq-insight')) return infoTesteHumaniQInsight;
    if (nomeNorm.includes('clima organizacional') || nomeNorm.includes('clima-organizacional')) return infoTesteClimaOrganizacional;
    if (nomeNorm.includes('karasek') || nomeNorm.includes('siegrist')) return infoTesteKarasekSiegrist;
    if (nomeNorm.includes('estresse ocupacional') || nomeNorm.includes('estresse-ocupacional')) return infoTesteEstresseOcupacional;
    if (nomeNorm.includes('clima e bem-estar') || nomeNorm.includes('clima-bem-estar')) return infoTesteClimaBemEstar;
    if (nomeNorm.includes('maturidade') || nomeNorm.includes('mgrp')) return infoTesteMaturidadeRiscosPsicossociais;
    if (nomeNorm.includes('assédio') || nomeNorm.includes('assedio') || nomeNorm.includes('pas')) return configPercepacaoAssedio;
    if (nomeNorm.includes('qualidade de vida') || nomeNorm.includes('qvt')) return configQualidadeVidaTrabalho;
    if (nomeNorm.includes('rpo') || nomeNorm.includes('riscos psicossociais')) return infoRPO;
    return null;
  };

  const getTesteRoute = (nome: string) => {
    const nomeNorm = nome.toLowerCase();
    if (nomeNorm.includes('humaniq insight') || nomeNorm.includes('humaniq-insight')) return '/teste/humaniq-insight';
    if (nomeNorm.includes('clima organizacional') || nomeNorm.includes('clima-organizacional')) return '/teste/clima-organizacional';
    if (nomeNorm.includes('karasek') || nomeNorm.includes('siegrist')) return '/teste/karasek-siegrist';
    if (nomeNorm.includes('estresse ocupacional') || nomeNorm.includes('estresse-ocupacional')) return '/teste/estresse-ocupacional';
    if (nomeNorm.includes('clima e bem-estar') || nomeNorm.includes('clima-bem-estar')) return '/teste/clima-bem-estar';
    if (nomeNorm.includes('maturidade') || nomeNorm.includes('mgrp')) return '/teste/maturidade-riscos-psicossociais';
    if (nomeNorm.includes('assédio') || nomeNorm.includes('assedio') || nomeNorm.includes('pas')) return '/teste/percepcao-assedio';
    if (nomeNorm.includes('qualidade de vida') || nomeNorm.includes('qvt')) return '/teste/qualidade-vida-trabalho';
    if (nomeNorm.includes('rpo') || nomeNorm.includes('riscos psicossociais')) return '/teste/rpo';
    return null;
  };

  const getTesteIcon = (nome: string) => {
    const nomeNorm = nome.toLowerCase();
    if (nomeNorm.includes('humaniq insight')) return <Lightbulb className="h-8 w-8 text-white" />;
    if (nomeNorm.includes('clima organizacional')) return <Building2 className="h-8 w-8 text-white" />;
    if (nomeNorm.includes('karasek') || nomeNorm.includes('siegrist')) return <Scale className="h-8 w-8 text-white" />;
    if (nomeNorm.includes('estresse')) return <Heart className="h-8 w-8 text-white" />;
    if (nomeNorm.includes('clima e bem-estar')) return <Users className="h-8 w-8 text-white" />;
    if (nomeNorm.includes('maturidade') || nomeNorm.includes('mgrp')) return <Shield className="h-8 w-8 text-white" />;
    if (nomeNorm.includes('assédio') || nomeNorm.includes('assedio')) return <AlertTriangle className="h-8 w-8 text-white" />;
    if (nomeNorm.includes('qualidade de vida') || nomeNorm.includes('qvt')) return <Star className="h-8 w-8 text-white" />;
    if (nomeNorm.includes('rpo') || nomeNorm.includes('riscos psicossociais')) return <Shield className="h-8 w-8 text-white" />;
    return <FileText className="h-8 w-8 text-white" />;
  };

  const getTesteColor = (nome: string) => {
    const nomeNorm = nome.toLowerCase();
    if (nomeNorm.includes('clima organizacional')) return 'bg-blue-500';
    if (nomeNorm.includes('karasek') || nomeNorm.includes('siegrist')) return 'bg-purple-500';
    if (nomeNorm.includes('estresse')) return 'bg-blue-500';
    if (nomeNorm.includes('clima e bem-estar')) return 'bg-green-500';
    if (nomeNorm.includes('maturidade') || nomeNorm.includes('mgrp')) return 'bg-orange-500';
    if (nomeNorm.includes('assédio') || nomeNorm.includes('assedio')) return 'bg-red-500';
    if (nomeNorm.includes('qualidade de vida') || nomeNorm.includes('qvt')) return 'bg-yellow-500';
    if (nomeNorm.includes('rpo') || nomeNorm.includes('riscos psicossociais')) return 'bg-indigo-500';
    return 'bg-gray-500';
  };

  const getTesteBadgeColor = (nome: string) => {
    const nomeNorm = nome.toLowerCase();
    if (nomeNorm.includes('clima organizacional')) return 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    if (nomeNorm.includes('karasek') || nomeNorm.includes('siegrist')) return 'text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
    if (nomeNorm.includes('estresse')) return 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    if (nomeNorm.includes('clima e bem-estar')) return 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (nomeNorm.includes('maturidade') || nomeNorm.includes('mgrp')) return 'text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
    if (nomeNorm.includes('assédio') || nomeNorm.includes('assedio')) return 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    if (nomeNorm.includes('qualidade de vida') || nomeNorm.includes('qvt')) return 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    if (nomeNorm.includes('rpo') || nomeNorm.includes('riscos psicossociais')) return 'text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800';
    return 'text-gray-600 border-gray-200 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  };

  const getTesteButtonColor = (nome: string) => {
    const nomeNorm = nome.toLowerCase();
    if (nomeNorm.includes('clima organizacional')) return 'bg-blue-600 hover:bg-blue-700';
    if (nomeNorm.includes('karasek') || nomeNorm.includes('siegrist')) return 'bg-purple-600 hover:bg-purple-700';
    if (nomeNorm.includes('estresse')) return 'bg-blue-600 hover:bg-blue-700';
    if (nomeNorm.includes('clima e bem-estar')) return 'bg-green-600 hover:bg-green-700';
    if (nomeNorm.includes('maturidade') || nomeNorm.includes('mgrp')) return 'bg-orange-600 hover:bg-orange-700';
    if (nomeNorm.includes('assédio') || nomeNorm.includes('assedio')) return 'bg-red-600 hover:bg-red-700';
    if (nomeNorm.includes('qualidade de vida') || nomeNorm.includes('qvt')) return 'bg-yellow-600 hover:bg-yellow-700';
    if (nomeNorm.includes('rpo') || nomeNorm.includes('riscos psicossociais')) return 'bg-indigo-600 hover:bg-indigo-700';
    return 'bg-gray-600 hover:bg-gray-700';
  };

  const getMotivoTexto = (motivo: string | null, proximaDisponibilidade: string | null) => {
    if (motivo === 'teste_concluido') {
      return 'Teste já concluído';
    } else if (motivo === 'bloqueado_empresa') {
      return 'Bloqueado pela empresa';
    } else if (motivo === 'aguardando_periodicidade' && proximaDisponibilidade) {
      const data = new Date(proximaDisponibilidade);
      return `Disponível em ${format(data, "dd 'de' MMMM", { locale: ptBR })}`;
    }
    return 'Indisponível';
  };

  const renderTesteCard = (teste: TesteDisponibilidade) => {
    const info = getTesteInfo(teste.nome);
    const route = getTesteRoute(teste.nome);
    const disponivel = teste.disponivel;
    
    const displayNome = info?.nome || teste.nome;
    const displayDescricao = info?.descricao || teste.descricao;
    const displayCategoria = info?.categoria || teste.categoria;
    
    // Obter tempo estimado de forma robusta
    const displayTempo = (info as any)?.duracao || 
                         (info as any)?.tempoEstimado || 
                         (teste.tempoEstimado ? `${teste.tempoEstimado} min` : '30 min');
    
    // Obter número de questões de forma robusta
    const displayQuestoes = (info as any)?.questoes || 
                            (info as any)?.numeroPerguntas || 
                            (info as any)?.totalPerguntas || 
                            40;

    return (
      <Card 
        key={teste.id}
        className={`rounded-2xl shadow-sm transition-all duration-300 group flex flex-col p-6 ${
          disponivel 
            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md' 
            : 'bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 opacity-75'
        }`}
        data-testid={`card-teste-${teste.id}`}
      >
        <CardHeader className="space-y-6 p-0">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full ${disponivel ? getTesteColor(teste.nome) : 'bg-gray-400'} flex items-center justify-center shadow-sm ${!disponivel && 'opacity-50'}`}>
              {disponivel ? getTesteIcon(teste.nome) : <Lock className="h-8 w-8 text-white" />}
            </div>
          </div>
          <div className="text-center space-y-3">
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-xs ${disponivel ? getTesteBadgeColor(teste.nome) : 'text-gray-500 border-gray-300 bg-gray-100'}`}
              >
                {displayCategoria}
              </Badge>
              {!disponivel && (
                <Badge 
                  variant="outline" 
                  className="text-xs text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  data-testid={`badge-indisponivel-${teste.id}`}
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Indisponível
                </Badge>
              )}
              {teste.dataConclusao && (
                <Badge 
                  variant="outline" 
                  className="text-xs text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  data-testid={`badge-concluido-${teste.id}`}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              )}
            </div>
            <CardTitle className={`text-xl font-bold leading-tight ${disponivel ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              {displayNome}
            </CardTitle>
            <CardDescription className={`text-sm leading-relaxed px-2 ${disponivel ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
              {displayDescricao}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 flex flex-col justify-end p-0 mt-6">
          <div className="flex justify-center gap-6 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{displayTempo}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{displayQuestoes} questões</span>
            </div>
          </div>

          {!disponivel && teste.dataConclusao && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2" data-testid={`info-indisponivel-${teste.id}`}>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Concluído em: {format(new Date(teste.dataConclusao), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
              {teste.pontuacao !== null && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pontuação: {teste.pontuacao.toFixed(1)}%
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                {getMotivoTexto(teste.motivo, teste.proximaDisponibilidade)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Aguardando nova liberação pela empresa
              </div>
            </div>
          )}

          {disponivel ? (
            <Button 
              className={`w-full ${getTesteButtonColor(teste.nome)} text-white rounded-xl py-3 font-medium transition-colors duration-200`}
              onClick={() => route && navigate(route)}
              data-testid={`button-iniciar-${teste.id}`}
            >
              Iniciar Teste
            </Button>
          ) : (
            <Button 
              className="w-full bg-gray-400 text-gray-700 rounded-xl py-3 font-medium cursor-not-allowed"
              disabled
              data-testid={`button-bloqueado-${teste.id}`}
            >
              <Lock className="h-4 w-4 mr-2" />
              Teste Bloqueado
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const testesEstaticos = [
    { info: infoTesteClimaOrganizacional, route: '/teste/clima-organizacional', icon: <Building2 className="h-8 w-8 text-white" />, color: 'bg-blue-500', badgeColor: 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', buttonColor: 'bg-blue-600 hover:bg-blue-700' },
    { info: infoTesteKarasekSiegrist, route: '/teste/karasek-siegrist', icon: <Logo size="sm" showText={false} />, color: 'bg-purple-500', badgeColor: 'text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', buttonColor: 'bg-purple-600 hover:bg-purple-700', badges: ['OMS', 'OIT'] },
    { info: infoTesteEstresseOcupacional, route: '/teste/estresse-ocupacional', icon: <Heart className="h-8 w-8 text-white" />, color: 'bg-blue-500', badgeColor: 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', buttonColor: 'bg-blue-600 hover:bg-blue-700' },
    { info: infoTesteClimaBemEstar, route: '/teste/clima-bem-estar', icon: <Users className="h-8 w-8 text-white" />, color: 'bg-green-500', badgeColor: 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', buttonColor: 'bg-green-600 hover:bg-green-700' },
    { info: infoTesteMaturidadeRiscosPsicossociais, route: '/teste/maturidade-riscos-psicossociais', icon: <Shield className="h-8 w-8 text-white" />, color: 'bg-orange-500', badgeColor: 'text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', buttonColor: 'bg-orange-600 hover:bg-orange-700', badges: ['Organizacional', 'Gestão'] },
    { info: configPercepacaoAssedio, route: '/teste/percepcao-assedio', icon: <AlertTriangle className="h-8 w-8 text-white" />, color: 'bg-red-500', badgeColor: 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', buttonColor: 'bg-red-600 hover:bg-red-700', questoes: 48, badges: ['Proteção', 'Assédio'], buttonText: 'Iniciar Avaliação' },
    { info: configQualidadeVidaTrabalho, route: '/teste/qualidade-vida-trabalho', icon: <Star className="h-8 w-8 text-white" />, color: 'bg-yellow-500', badgeColor: 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800', buttonColor: 'bg-yellow-600 hover:bg-yellow-700', questoes: configQualidadeVidaTrabalho.numeroPerguntas, badges: ['Qualidade', 'Bem-estar'] },
    { info: infoRPO, route: '/teste/rpo', icon: <Shield className="h-8 w-8 text-white" />, color: 'bg-indigo-500', badgeColor: 'text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800', buttonColor: 'bg-indigo-600 hover:bg-indigo-700', badges: ['Diagnóstico', 'Psicossocial'] }
  ];

  if (carregando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-300">Carregando testes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Testes Disponíveis
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
          Descubra seus traços de personalidade, competências e potencial através de nossos testes cientificamente validados
        </p>
      </div>

      {/* Grid de Testes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {isColaborador && testes.length > 0 ? (
          testes.map(teste => renderTesteCard(teste))
        ) : (
          testesEstaticos.map((testeConfig, index) => (
            <Card 
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col p-6"
              data-testid={`card-teste-estatico-${index}`}
            >
              <CardHeader className="space-y-6 p-0">
                <div className="flex justify-center">
                  <div className={`w-16 h-16 rounded-full ${testeConfig.color} flex items-center justify-center shadow-sm`}>
                    {testeConfig.icon}
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <Badge variant="outline" className={`text-xs ${testeConfig.badgeColor}`}>
                      {testeConfig.info.categoria}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {testeConfig.info.nome}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed px-2">
                    {testeConfig.info.descricao}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 flex-1 flex flex-col justify-end p-0 mt-6">
                <div className="flex justify-center gap-6 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{(testeConfig.info as any).duracao || (testeConfig.info as any).tempoEstimado || '30 min'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{testeConfig.questoes || (testeConfig.info as any).questoes || (testeConfig.info as any).numeroPerguntas || 40} questões</span>
                  </div>
                </div>
                {testeConfig.badges && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {testeConfig.badges.map((badge, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-gray-600 border-gray-200 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button 
                  className={`w-full ${testeConfig.buttonColor} text-white rounded-xl py-3 font-medium transition-colors duration-200`}
                  onClick={() => navigate(testeConfig.route)}
                  data-testid={`button-iniciar-estatico-${index}`}
                >
                  {testeConfig.buttonText || 'Iniciar Teste'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
