import React from 'react';
import { ResultadoRPO, DimensaoResultadoRPO } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Users, 
  Heart, 
  Award,
  Scale,
  Home,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface ResultadoRPOProps {
  resultado: ResultadoRPO;
}

const iconesRisco = {
  'Elevado': <XCircle className="h-5 w-5 text-red-600" />,
  'Moderado': <AlertCircle className="h-5 w-5 text-orange-600" />,
  'Aceitável': <Clock className="h-5 w-5 text-yellow-600" />,
  'Reduzido': <CheckCircle className="h-5 w-5 text-green-600" />
};

const iconesDimensao = {
  'Demandas do trabalho': <TrendingUp className="h-6 w-6" />,
  'Autonomia e controle': <Shield className="h-6 w-6" />,
  'Relações interpessoais e apoio social': <Users className="h-6 w-6" />,
  'Reconhecimento e recompensas': <Award className="h-6 w-6" />,
  'Justiça e clima organizacional': <Scale className="h-6 w-6" />,
  'Segurança no trabalho e futuro': <Shield className="h-6 w-6" />,
  'Interface trabalho-vida pessoal': <Home className="h-6 w-6" />,
  'Violência, assédio e pressão': <AlertTriangle className="h-6 w-6" />
};

export default function ResultadoRPO({ resultado }: ResultadoRPOProps) {
  const {
    indiceGlobalRisco,
    nivelGlobalRisco,
    percentualGlobalRisco,
    dimensoes,
    dimensoesCriticas,
    dimensoesSeguras,
    alertasCriticos,
    recomendacoesPrioritarias,
    planoAcao,
    mapeamentoRiscos
  } = resultado;

  const corNivelGlobal = dimensoes.find(d => d.nivel === nivelGlobalRisco)?.cor || '#6b7280';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header com resultado geral */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Resultado - Riscos Psicossociais Ocupacionais
        </h1>
        <div className="flex items-center justify-center space-x-4">
          {iconesRisco[nivelGlobalRisco]}
          <div>
            <div className="text-4xl font-bold" style={{ color: corNivelGlobal }}>
              {indiceGlobalRisco.toFixed(1)}
            </div>
            <div className="text-lg text-gray-600">
              Índice Global de Risco: <span className="font-semibold">{nivelGlobalRisco}</span>
            </div>
          </div>
        </div>
        <Progress 
          value={percentualGlobalRisco} 
          className="w-full max-w-md mx-auto h-3"
          style={{ 
            background: `linear-gradient(to right, ${corNivelGlobal}22 0%, ${corNivelGlobal} 100%)`
          }}
        />
      </div>

      {/* Alertas críticos */}
      {alertasCriticos.length > 0 && (
        <div className="space-y-3">
          {alertasCriticos.map((alerta, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Alerta Crítico</AlertTitle>
              <AlertDescription>{alerta}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Resumo executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Dimensões Críticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {dimensoesCriticas.length}
            </div>
            <div className="text-sm text-gray-600">
              {dimensoesCriticas.length === 0 
                ? 'Nenhuma dimensão crítica identificada'
                : `${dimensoesCriticas.length} de 8 dimensões requerem atenção`
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Dimensões Seguras</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {dimensoesSeguras.length}
            </div>
            <div className="text-sm text-gray-600">
              {dimensoesSeguras.length === 0 
                ? 'Nenhuma dimensão com risco reduzido'
                : `${dimensoesSeguras.length} de 8 dimensões com baixo risco`
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Heart className="h-5 w-5 text-blue-600" />
              <span>Mapeamento de Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Individual</span>
                <Badge variant={mapeamentoRiscos.individual ? "destructive" : "secondary"}>
                  {mapeamentoRiscos.individual ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Coletivo</span>
                <Badge variant={mapeamentoRiscos.coletivo ? "destructive" : "secondary"}>
                  {mapeamentoRiscos.coletivo ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Setorial</span>
                <Badge variant={mapeamentoRiscos.setorial ? "destructive" : "secondary"}>
                  {mapeamentoRiscos.setorial ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap das dimensões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mapa de Calor - Riscos por Dimensão</CardTitle>
          <CardDescription>
            Visualização dos níveis de risco psicossocial em cada dimensão avaliada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dimensoes.map((dimensao) => (
              <div
                key={dimensao.dimensao}
                className="p-4 rounded-lg border-2 transition-all hover:shadow-md"
                style={{ 
                  borderColor: dimensao.cor,
                  backgroundColor: `${dimensao.cor}10`
                }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div style={{ color: dimensao.cor }}>
                    {iconesDimensao[dimensao.dimensao]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight">
                      {dimensao.dimensao}
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{ color: dimensao.cor }}>
                      {dimensao.pontuacao.toFixed(1)}
                    </span>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        borderColor: dimensao.cor,
                        color: dimensao.cor
                      }}
                    >
                      {dimensao.nivel}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={dimensao.percentual} 
                    className="h-2"
                    style={{ 
                      background: `${dimensao.cor}22`
                    }}
                  />
                  
                  <div className="text-xs text-gray-600">
                    {dimensao.percentual.toFixed(0)}% de risco
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise detalhada por dimensão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Análise Detalhada por Dimensão</CardTitle>
          <CardDescription>
            Interpretação e recomendações específicas para cada dimensão avaliada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dimensoes.map((dimensao) => (
              <div key={dimensao.dimensao} className="border-l-4 pl-4" style={{ borderColor: dimensao.cor }}>
                <div className="flex items-center space-x-3 mb-3">
                  <div style={{ color: dimensao.cor }}>
                    {iconesDimensao[dimensao.dimensao]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{dimensao.dimensao}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Pontuação:</span>
                      <span className="font-semibold" style={{ color: dimensao.cor }}>
                        {dimensao.pontuacao.toFixed(1)}
                      </span>
                      <Badge variant="outline" style={{ borderColor: dimensao.cor, color: dimensao.cor }}>
                        {dimensao.nivel}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 mb-3">{dimensao.interpretacao}</p>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recomendações:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {dimensao.recomendacoes.map((recomendacao, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {recomendacao}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações prioritárias */}
      {recomendacoesPrioritarias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Recomendações Prioritárias</span>
            </CardTitle>
            <CardDescription>
              Ações imediatas recomendadas para as dimensões de maior risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recomendacoesPrioritarias.map((recomendacao, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{recomendacao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plano de ação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Plano de Ação</CardTitle>
          <CardDescription>
            Roteiro estruturado para implementação das melhorias necessárias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {planoAcao.map((acao, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700">{acao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rodapé com informações técnicas */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              <strong>HumaniQ RPO - Riscos Psicossociais Ocupacionais</strong>
            </p>
            <p>
              Avaliação baseada em normas ISO 10075 e diretrizes da Organização Internacional do Trabalho (OIT)
            </p>
            <p>
              Este relatório deve ser interpretado por profissionais qualificados em saúde ocupacional e psicologia organizacional
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <Badge variant="outline">96 questões avaliadas</Badge>
              <Badge variant="outline">8 dimensões psicossociais</Badge>
              <Badge variant="outline">Baseado em evidências científicas</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}