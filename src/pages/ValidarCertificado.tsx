import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Search, Award, Calendar, Clock, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/components/Logo";

export default function ValidarCertificado() {
  const { codigo: codigoUrl } = useParams<{ codigo?: string }>();
  const [codigoInput, setCodigoInput] = useState(codigoUrl || "");
  const [codigoBusca, setCodigoBusca] = useState(codigoUrl || "");

  const { data: validacao, isLoading } = useQuery({
    queryKey: ['/api/cursos/validar-certificado', codigoBusca],
    queryFn: async () => {
      if (!codigoBusca) return null;
      
      const response = await fetch(`/api/cursos/validar-certificado/${codigoBusca}`);
      if (!response.ok) {
        if (response.status === 404) {
          return { valido: false, mensagem: 'Certificado não encontrado' };
        }
        throw new Error('Erro ao validar certificado');
      }
      return response.json();
    },
    enabled: !!codigoBusca
  });

  const handleValidar = () => {
    if (codigoInput.trim()) {
      setCodigoBusca(codigoInput.trim());
    }
  };

  const dataFormatada = validacao?.certificado?.dataEmissao 
    ? new Date(validacao.certificado.dataEmissao).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Validação de Certificado
          </h1>
          <p className="text-lg text-gray-600">
            Verifique a autenticidade de certificados emitidos pela HumaniQ AI
          </p>
        </div>

        {/* Formulário de busca */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6 text-blue-600" />
              Código de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código do certificado (ex: HQ-1234567890-ABC)"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleValidar()}
                className="text-lg"
                data-testid="input-codigo-certificado"
              />
              <Button
                onClick={handleValidar}
                disabled={!codigoInput.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="button-validar-certificado"
              >
                {isLoading ? (
                  <>Validando...</>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Validar
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              O código de autenticação está localizado no rodapé do certificado.
            </p>
          </CardContent>
        </Card>

        {/* Resultado da validação */}
        {validacao && (
          <Card className={`border-4 ${
            validacao.valido 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}>
            <CardContent className="p-8 md:p-12 space-y-6">
              {/* Status */}
              <div className="text-center">
                {validacao.valido ? (
                  <>
                    <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-3xl font-bold text-green-900 mb-2">
                      ✓ Certificado Válido e Autêntico
                    </h2>
                    <p className="text-green-700">
                      Este certificado foi emitido pela HumaniQ AI e é reconhecido oficialmente.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-20 w-20 text-red-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-red-900 mb-2">
                      ✗ Certificado Inválido
                    </h2>
                    <p className="text-red-700">
                      {validacao.mensagem || 'Este código não corresponde a nenhum certificado em nossa base de dados.'}
                    </p>
                  </>
                )}
              </div>

              {/* Informações do certificado (se válido) */}
              {validacao.valido && validacao.certificado && (
                <div className="bg-white rounded-lg p-6 space-y-4 border-2 border-green-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Curso:</span>
                      </div>
                      <p className="text-lg text-gray-900 font-medium">
                        {validacao.certificado.cursoTitulo}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Colaborador:</span>
                      </div>
                      <p className="text-lg text-gray-900 font-medium">
                        {validacao.certificado.colaboradorNome}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Carga Horária:</span>
                      </div>
                      <p className="text-lg text-gray-900 font-medium">
                        {validacao.certificado.cargaHoraria}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">Data de Emissão:</span>
                      </div>
                      <p className="text-lg text-gray-900 font-medium">
                        {dataFormatada}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Código de Autenticação:</span>
                    </div>
                    <p className="text-lg font-mono text-blue-700 font-bold">
                      {validacao.certificado.codigoAutenticacao}
                    </p>
                  </div>
                </div>
              )}

              {/* Selo de autenticidade */}
              {validacao.valido && (
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Verificado por HumaniQ AI</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Este certificado foi validado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Informações adicionais */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">ℹ️ Como validar um certificado?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>1. Localize o código de autenticação no certificado (geralmente no rodapé)</p>
            <p>2. Digite o código completo no campo acima</p>
            <p>3. Clique em "Validar" para verificar a autenticidade</p>
            <p className="text-sm text-gray-600 mt-4">
              💡 Você também pode escanear o QR Code presente no certificado para validação instantânea
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>© 2025 HumaniQ AI - Todos os direitos reservados</p>
          <p>CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </div>
  );
}
