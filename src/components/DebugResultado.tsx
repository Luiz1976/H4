import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Database, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { resultadosService } from '@/lib/database';
import { SessionService } from '@/lib/services/session-service';

interface DebugInfo {
  resultadoExiste: boolean;
  resultado?: any;
  sessionIdResultado?: string;
  sessionIdAtual: string;
  sessionMatch: boolean;
  erro?: string;
  testeBusca?: any[];
}

export function DebugResultado() {
  const [resultadoId, setResultadoId] = useState('965efe18-a576-4964-8770-31c58e978d21');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [carregando, setCarregando] = useState(false);

  const sessionService = new SessionService();

  const investigarResultado = async () => {
    setCarregando(true);
    setDebugInfo(null);

    try {
      console.log('🔍 [DEBUG] Iniciando investigação do resultado:', resultadoId);
      
      // 1. Obter session ID atual
      const sessionIdAtual = sessionService.getSessionId();
      console.log('🔍 [DEBUG] Session ID atual:', sessionIdAtual);

      // 2. Verificar se o resultado existe usando a função correta
      console.log('🔍 [DEBUG] Verificando resultado por ID...');
      const verificacao = await resultadosService.verificarResultadoPorId(resultadoId);
      console.log('🔍 [DEBUG] Verificação do resultado:', verificacao);
      const resultado = verificacao.resultado;

      // 3. Testar busca por sessão
      console.log('🔍 [DEBUG] Testando busca por sessão...');
      const resultadosPorSessao = await resultadosService.buscarResultadosPorSessao(sessionIdAtual, {
        limite: 10,
        offset: 0
      });
      console.log('🔍 [DEBUG] Resultados por sessão:', resultadosPorSessao);

      const info: DebugInfo = {
        resultadoExiste: verificacao.existe,
        resultado,
        sessionIdResultado: verificacao.sessionId,
        sessionIdAtual,
        sessionMatch: verificacao.sessionId === sessionIdAtual,
        testeBusca: resultadosPorSessao
      };

      setDebugInfo(info);

    } catch (error) {
      console.error('🚨 [DEBUG] Erro na investigação:', error);
      setDebugInfo({
        resultadoExiste: false,
        sessionIdAtual: sessionService.getSessionId(),
        sessionMatch: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    investigarResultado();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Debug - Investigação de Resultado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input para ID do resultado */}
          <div className="flex gap-2">
            <Input
              value={resultadoId}
              onChange={(e) => setResultadoId(e.target.value)}
              placeholder="ID do resultado para investigar"
              className="flex-1"
            />
            <Button onClick={investigarResultado} disabled={carregando}>
              {carregando ? 'Investigando...' : 'Investigar'}
            </Button>
          </div>

          {debugInfo && (
            <div className="space-y-4">
              {/* Status geral */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Status do Resultado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {debugInfo.resultadoExiste ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Resultado existe: </span>
                      <Badge variant={debugInfo.resultadoExiste ? "default" : "destructive"}>
                        {debugInfo.resultadoExiste ? 'SIM' : 'NÃO'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {debugInfo.sessionMatch ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Session Match: </span>
                      <Badge variant={debugInfo.sessionMatch ? "default" : "destructive"}>
                        {debugInfo.sessionMatch ? 'SIM' : 'NÃO'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações de sessão */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações de Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <strong>Session ID Atual:</strong>
                      <code className="ml-2 p-1 bg-gray-100 rounded text-sm">
                        {debugInfo.sessionIdAtual}
                      </code>
                    </div>
                    {debugInfo.sessionIdResultado && (
                      <div>
                        <strong>Session ID do Resultado:</strong>
                        <code className="ml-2 p-1 bg-gray-100 rounded text-sm">
                          {debugInfo.sessionIdResultado}
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Detalhes do resultado */}
              {debugInfo.resultado && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Detalhes do Resultado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {debugInfo.resultado.id}</div>
                      <div><strong>Tipo:</strong> {debugInfo.resultado.tipo_teste}</div>
                      <div><strong>Criado em:</strong> {new Date(debugInfo.resultado.data_realizacao).toLocaleString()}</div>
                      <div><strong>Session ID:</strong> {debugInfo.resultado.session_id || 'NULL'}</div>
                      <div><strong>Usuario ID:</strong> {debugInfo.resultado.usuario_id || 'NULL'}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Teste de busca por sessão */}
              {debugInfo.testeBusca && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Resultados da Busca por Sessão ({debugInfo.testeBusca.length} encontrados)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {debugInfo.testeBusca.length === 0 ? (
                      <p className="text-muted-foreground">Nenhum resultado encontrado para esta sessão.</p>
                    ) : (
                      <div className="space-y-2">
                        {debugInfo.testeBusca.slice(0, 5).map((resultado, index) => (
                          <div key={index} className="p-2 border rounded text-sm">
                            <div><strong>ID:</strong> {resultado.id}</div>
                            <div><strong>Tipo:</strong> {resultado.tipo_teste}</div>
                            <div><strong>Data:</strong> {new Date(resultado.data_realizacao).toLocaleString()}</div>
                          </div>
                        ))}
                        {debugInfo.testeBusca.length > 5 && (
                          <p className="text-muted-foreground">... e mais {debugInfo.testeBusca.length - 5} resultados</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Erro */}
              {debugInfo.erro && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Erro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-red-600 text-sm">{debugInfo.erro}</code>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}