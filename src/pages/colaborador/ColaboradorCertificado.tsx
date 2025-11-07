import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cursos } from "@/data/cursosData.ts";
import CertificadoView from "@/components/cursos/CertificadoView";
import { Loader2 } from "lucide-react";

export default function ColaboradorCertificado() {
  const { slug } = useParams<{ slug: string }>();

  // Buscar certificado do colaborador para este curso
  const { data: certificados, isLoading } = useQuery<any[]>({
    queryKey: ['/api/cursos/meus-certificados'],
  });

  // Encontrar o certificado específico deste curso
  const certificado = certificados?.find(cert => cert.cursoSlug === slug);
  
  // Encontrar informações do curso
  const curso = cursos.find(c => c.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando certificado...</p>
        </div>
      </div>
    );
  }

  if (!certificado || !curso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Certificado não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Este certificado não está disponível ou você ainda não concluiu este curso.
          </p>
          <a
            href="/colaborador/cursos"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Voltar para Cursos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <CertificadoView certificado={certificado} curso={curso} />
    </div>
  );
}
