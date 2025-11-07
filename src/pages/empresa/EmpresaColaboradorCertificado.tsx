import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CertificadoView from '@/components/cursos/CertificadoView';
import { cursos } from '@/data/cursosData.ts';

export default function EmpresaColaboradorCertificado() {
  const { colaboradorId, cursoSlug } = useParams<{ colaboradorId: string; cursoSlug: string }>();

  // Buscar dados do certificado
  const { data: certificado, isLoading: loadingCertificado, error } = useQuery<any>({
    queryKey: [`/api/colaboradores/${colaboradorId}/certificado/${cursoSlug}`],
    enabled: !!colaboradorId && !!cursoSlug,
  });

  // Buscar dados do curso
  const curso = cursos.find(c => c.slug === cursoSlug);

  if (loadingCertificado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Card className="border-2 border-blue-200">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">Carregando certificado...</p>
            <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certificado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Card className="border-2 border-red-200 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Certificado não encontrado</h2>
            <p className="text-gray-600 mb-6">
              O certificado solicitado não foi encontrado ou o colaborador ainda não concluiu este curso.
            </p>
            <Button
              onClick={() => window.close()}
              variant="outline"
              data-testid="button-voltar"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Card className="border-2 border-red-200 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Curso não encontrado</h2>
            <p className="text-gray-600 mb-6">
              O curso solicitado não foi encontrado.
            </p>
            <Button
              onClick={() => window.close()}
              variant="outline"
              data-testid="button-voltar"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => window.close()}
            className="mb-4"
            data-testid="button-voltar-header"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Certificado do Colaborador
          </h1>
          <p className="text-gray-600">
            <span className="font-semibold">{certificado.colaboradorNome}</span> • {curso.titulo}
          </p>
        </div>

        {/* Certificado */}
        <CertificadoView certificado={certificado} curso={curso} />
      </div>
    </div>
  );
}
