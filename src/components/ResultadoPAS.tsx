import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Users, 
  FileText, 
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { ResultadoPercepacaoAssedio, DimensaoPercepacaoAssedio } from "@/lib/types";

interface ResultadoPASProps {
  resultado: ResultadoPercepacaoAssedio;
}

const ResultadoPAS: React.FC<ResultadoPASProps> = ({ resultado }) => {
  const getRiskColor = (nivel: string) => {
    switch (nivel) {
      case 'Baixo Risco': return 'text-green-600 bg-green-50 border-green-200';
      case 'Risco Moderado': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Alto Risco': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Risco Crítico': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (nivel: string) => {
    switch (nivel) {
      case 'Baixo Risco': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Risco Moderado': return <Eye className="h-5 w-5 text-yellow-600" />;
      case 'Alto Risco': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'Risco Crítico': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const alertasCriticos = resultado.dimensoes.filter(d => d.alertaCritico);

  return (
    <div className="space-y-6">
      {/* Header com Informações Gerais */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                {resultado.nomeTeste}
              </CardTitle>
              <CardDescription className="mt-2">
                Realizado em {new Date(resultado.dataRealizacao).toLocaleDateString('pt-BR')}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Índice Geral de Assédio</div>
              <div className="text-3xl font-bold">{resultado.indiceGeralAssedio.toFixed(1)}</div>
              <Badge className={getRiskColor(resultado.nivelRiscoGeral)}>
                {resultado.nivelRiscoGeral}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertas Críticos */}
      {alertasCriticos.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Alertas Críticos Identificados</AlertTitle>
          <AlertDescription className="text-red-700">
            <div className="mt-2 space-y-1">
              {resultado.alertasCriticos.map((alerta, index) => (
                <div key={index} className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{alerta}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="dimensoes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dimensoes">Dimensões</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
          <TabsTrigger value="esg">Relatório ESG</TabsTrigger>
        </TabsList>

        {/* Tab Dimensões */}
        <TabsContent value="dimensoes" className="space-y-4">
          <div className="grid gap-4">
            {resultado.dimensoes.map((dimensao, index) => (
              <Card key={index} className={`border ${dimensao.alertaCritico ? 'border-red-200 bg-red-50/30' : 'border-border'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getRiskIcon(dimensao.nivel)}
                      {dimensao.nome}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{dimensao.pontuacao.toFixed(1)}</span>
                      <Badge className={getRiskColor(dimensao.nivel)}>
                        {dimensao.nivel}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={(dimensao.pontuacao / 5) * 100} 
                    className="h-2"
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{dimensao.descricao}</p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Interpretação:</h4>
                      <p className="text-sm">{dimensao.interpretacao}</p>
                    </div>
                    {dimensao.recomendacoes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Recomendações:</h4>
                        <ul className="text-sm space-y-1">
                          {dimensao.recomendacoes.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Insights Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resultado.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Recomendações */}
        <TabsContent value="recomendacoes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recomendações Educativas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Users className="h-5 w-5" />
                  Ações Educativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {resultado.recomendacoesEducativas.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-blue-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recomendações Disciplinares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Shield className="h-5 w-5" />
                  Ações Disciplinares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {resultado.recomendacoesDisciplinares.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab ESG */}
        <TabsContent value="esg" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório ESG e Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status de Conformidade */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {resultado.relatorioESG.conformidadeLegal ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Conformidade Legal</span>
                  </div>
                  <Badge className={resultado.relatorioESG.conformidadeLegal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {resultado.relatorioESG.conformidadeLegal ? 'Conforme' : 'Não Conforme'}
                  </Badge>
                </div>

                {/* Riscos Identificados */}
                <div>
                  <h4 className="font-medium mb-3">Riscos Identificados:</h4>
                  <div className="space-y-2">
                    {resultado.relatorioESG.riscosIdentificados.map((risco, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-orange-800">{risco}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações Preventivas */}
                <div>
                  <h4 className="font-medium mb-3">Ações Preventivas Recomendadas:</h4>
                  <div className="space-y-2">
                    {resultado.relatorioESG.acoesPreventivasRecomendadas.map((acao, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-blue-800">{acao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Baixar Relatório PDF
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Exportar para Excel
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Agendar Reavaliação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultadoPAS;