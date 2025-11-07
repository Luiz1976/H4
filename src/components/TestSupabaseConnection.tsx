import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';
import { testConnection } from '@/lib/supabase';
import { testesService, resultadosService } from '@/lib/database';

export default function TestSupabaseConnection() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    connection: { success: boolean; message: string } | null;
    testesRead: { success: boolean; message: string; count?: number } | null;
    resultadosRead: { success: boolean; message: string; count?: number } | null;
  }>({
    connection: null,
    testesRead: null,
    resultadosRead: null
  });

  const runTests = async () => {
    setTesting(true);
    setResults({ connection: null, testesRead: null, resultadosRead: null });

    try {
      // Teste 1: Conexão básica
      console.log('Testando conexão com Supabase...');
      const connectionResult = await testConnection();
      setResults(prev => ({ ...prev, connection: connectionResult }));

      // Teste 2: Leitura de testes
      console.log('Testando leitura de testes...');
      try {
        const testes = await testesService.buscarTestes();
        setResults(prev => ({ 
          ...prev, 
          testesRead: { 
            success: true, 
            message: `Leitura de testes bem-sucedida`, 
            count: testes.length 
          } 
        }));
      } catch (error) {
        setResults(prev => ({ 
          ...prev, 
          testesRead: { 
            success: false, 
            message: `Erro ao ler testes: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
          } 
        }));
      }

      // Teste 3: Leitura de resultados
      console.log('Testando leitura de resultados...');
      try {
        // Tentamos buscar resultados de um teste inexistente para testar a funcionalidade
        const resultados = await resultadosService.buscarResultadosPorTeste('test-id');
        setResults(prev => ({ 
          ...prev, 
          resultadosRead: { 
            success: true, 
            message: `Leitura de resultados bem-sucedida`, 
            count: resultados.length 
          } 
        }));
      } catch (error) {
        setResults(prev => ({ 
          ...prev, 
          resultadosRead: { 
            success: false, 
            message: `Erro ao ler resultados: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
          } 
        }));
      }

    } catch (error) {
      console.error('Erro durante os testes:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (result: { success: boolean } | null) => {
    if (!result) return <Loader2 className="h-4 w-4 animate-spin" />;
    return result.success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (result: { success: boolean } | null) => {
    if (!result) return <Badge variant="secondary">Aguardando</Badge>;
    return result.success ? 
      <Badge variant="default" className="bg-green-500">Sucesso</Badge> : 
      <Badge variant="destructive">Falha</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste de Conexão Supabase
        </CardTitle>
        <CardDescription>
          Valide a configuração e conectividade com o banco de dados
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executando Testes...
            </>
          ) : (
            'Executar Testes de Conexão'
          )}
        </Button>

        <div className="space-y-3">
          {/* Teste de Conexão */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(results.connection)}
              <span className="font-medium">Conexão Básica</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(results.connection)}
            </div>
          </div>
          {results.connection && (
            <p className="text-sm text-muted-foreground ml-6">
              {results.connection.message}
            </p>
          )}

          {/* Teste de Leitura de Testes */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(results.testesRead)}
              <span className="font-medium">Leitura de Testes</span>
            </div>
            <div className="flex items-center gap-2">
              {results.testesRead?.count !== undefined && (
                <Badge variant="outline">{results.testesRead.count} registros</Badge>
              )}
              {getStatusBadge(results.testesRead)}
            </div>
          </div>
          {results.testesRead && (
            <p className="text-sm text-muted-foreground ml-6">
              {results.testesRead.message}
            </p>
          )}

          {/* Teste de Leitura de Resultados */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(results.resultadosRead)}
              <span className="font-medium">Leitura de Resultados</span>
            </div>
            <div className="flex items-center gap-2">
              {results.resultadosRead?.count !== undefined && (
                <Badge variant="outline">{results.resultadosRead.count} registros</Badge>
              )}
              {getStatusBadge(results.resultadosRead)}
            </div>
          </div>
          {results.resultadosRead && (
            <p className="text-sm text-muted-foreground ml-6">
              {results.resultadosRead.message}
            </p>
          )}
        </div>

        {/* Instruções */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Instruções para Configuração:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env</li>
            <li>Crie as tabelas necessárias no seu projeto Supabase</li>
            <li>Execute este teste para validar a configuração</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}