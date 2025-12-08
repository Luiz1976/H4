import { GraduationCap, BookOpen, Clock, Award, ChevronRight, Play, Lock, Download, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCursoBySlug } from "@/data/cursosData";
import type { Curso } from "@/data/cursosData";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CertificadoView from "@/components/cursos/CertificadoView";
import { useState } from "react";

interface CursoDisponivel {
  id: number;
  slug: string;
  titulo?: string;
  subtitulo?: string;
  descricao?: string;
  duracao?: string;
  nivel?: string;
  categoria?: string;
  icone?: string;
  cor?: string;
  modulos?: unknown[];
  disponivel: boolean;
  motivo?: string | null;
  proximaDisponibilidade?: string | null;
  dataConclusao?: string | null;
  pontuacao?: number | null;
  periodicidadeDias?: number | null;
}

interface Certificado {
  id: string;
  cursoSlug: string;
  cursoTitulo: string;
  dataEmissao: string;
  codigoAutenticacao: string;
}

interface ProgressoCurso {
  cursoSlug: string;
  progressoPorcentagem?: number;
  modulosCompletados?: string[];
}

export default function ColaboradorCursos() {
  const navigate = useNavigate();
  const [certificadoSelecionado, setCertificadoSelecionado] = useState<Certificado | null>(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState<Certificado | null>(null);

  // Buscar cursos com informações de disponibilidade
  const { data: responseCursos, isLoading } = useQuery<{ cursos: CursoDisponivel[], total: number }>({
    queryKey: ['/api/curso-disponibilidade/colaborador/cursos'],
  });

  // Buscar certificados (cursos concluídos)
  const { data: certificados = [] } = useQuery<Certificado[]>({
    queryKey: ['/api/cursos/meus-certificados'],
  });

  // Buscar progresso dos cursos para calcular tempo de estudo
  const { data: progressoCursos = [] } = useQuery<ProgressoCurso[]>({
    queryKey: ['/api/cursos/progresso'],
  });

  const cursosDisponiveis = responseCursos?.cursos || [];
  const cursosLiberados = cursosDisponiveis.filter((c) => {
    const concluidoPorCertificado = certificados.some((cert) => cert.cursoSlug === c.slug);
    // Mostrar cursos mesmo se concluídos por avaliação, para evitar que sumam se não tiverem certificado ainda
    return c.disponivel && !concluidoPorCertificado;
  });
  const cursosConcluidosSet = new Set(certificados.map(c => c.cursoSlug));
  cursosDisponiveis.forEach(c => {
    if (c.dataConclusao) cursosConcluidosSet.add(c.slug);
  });
  const cursosConcluidos = cursosConcluidosSet.size;

  // Calcular tempo total de estudo (estimado com base no progresso)
  const tempoTotalEstudo = progressoCursos.reduce((total, progresso) => {
    // Estimar tempo baseado no progresso e duração do curso
    const progressoPorcentagem = progresso.progressoPorcentagem || 0;
    const modulosCompletados = Array.isArray(progresso.modulosCompletados)
      ? progresso.modulosCompletados.length
      : 0;

    // Assumir ~15 minutos por módulo completado
    return total + (modulosCompletados * 15);
  }, 0);

  const tempoEstudoFormatado = tempoTotalEstudo >= 60
    ? `${Math.floor(tempoTotalEstudo / 60)}h ${tempoTotalEstudo % 60}min`
    : `${tempoTotalEstudo}min`;

  const normalizarPalavra = (s: string) => {
    const map: Record<string, string> = {
      Tecnicos: "Técnicos",
      Tecnicas: "Técnicas",
      Tecnica: "Técnica",
      Gestao: "Gestão",
      Inteligencia: "Inteligência",
      Lideranca: "Liderança",
      Comunicacao: "Comunicação",
      Nao: "Não",
      Prevencao: "Prevenção",
      Assedio: "Assédio",
      Saude: "Saúde",
      Relacoes: "Relações",
      Inclusao: "Inclusão",
      Intermediario: "Intermediário",
      Avancado: "Avançado",
    };
    return map[s] || s;
  };

  const normalizarLinha = (texto: unknown): string => {
    const s = String(texto || "");
    return s
      .split(/([A-Za-zÀ-ÿ]+)/)
      .map((p) => normalizarPalavra(p))
      .join("");
  };

  const normalizarCategoria = (cat: string) => {
    const c = String(cat || "");
    return c
      .replace("Comunicacao", "Comunicação")
      .replace("Saude Ocupacional", "Saúde Ocupacional")
      .replace("Lideranca", "Liderança")
      .replace("Compliance e Etica", "Compliance e Ética")
      .replace("Diversidade e Inclusao", "Diversidade e Inclusão");
  };

  const normalizarNivel = (nivel: string) => {
    const n = String(nivel || "");
    return n
      .replace("Intermediario", "Intermediário")
      .replace("Avancado", "Avançado");
  };

  const getNivelColor = (nivel: string) => {
    const n = normalizarNivel(nivel);
    switch (n) {
      case "Iniciante":
        return "bg-green-100 text-green-700 border-green-200";
      case "Intermediário":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Avançado":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cursos de Desenvolvimento
            </h1>
            <p className="text-gray-600 mt-1">
              Invista no seu crescimento pessoal e profissional
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-100 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {cursosLiberados.length}
                  </p>
                  <p className="text-sm text-gray-600">Cursos Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-cursos-concluidos">
                    {cursosConcluidos}
                  </p>
                  <p className="text-sm text-gray-600">Cursos Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-tempo-estudo">
                    {tempoTotalEstudo === 0 ? '0h' : tempoEstudoFormatado}
                  </p>
                  <p className="text-sm text-gray-600">Tempo de Estudo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Certificados (oculta por padrão) */}

        {/* Cursos Disponíveis */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Cursos Disponíveis ({cursosLiberados.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando cursos...</p>
            </div>
          ) : cursosLiberados.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum curso disponível</h3>
              <p className="text-gray-600">
                Entre em contato com sua empresa para liberar o acesso aos cursos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cursosLiberados.map((curso) => (
                <Card
                  key={curso.id}
                  className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 bg-white/90 backdrop-blur overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/colaborador/cursos/${curso.slug}`)}
                  data-testid={`card-curso-${curso.id}`}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-5xl">
                          {(() => {
                            const info = getCursoBySlug(curso.slug) as Curso | undefined;
                            const iconStr = curso.icone ?? info?.['ícone'] ?? '';
                            return iconStr || '🎓';
                          })()}
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="w-fit text-xs">
                              {(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; const cat = curso.categoria || info?.['categoria'] || ''; return normalizarCategoria(cat); })()}
                            </Badge>
                            {!!curso.dataConclusao && (
                              <Badge variant="secondary" className="w-fit text-xs bg-green-100 text-green-700 border-green-200">
                                Concluído
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className={`w-fit text-xs ${getNivelColor(curso.nivel)}`}>
                            {(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; const niv = curso.nivel || info?.['nível'] || ''; return normalizarNivel(niv); })()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                        {(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; const t = curso.titulo || info?.['título'] || ''; return normalizarLinha(t); })()}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed line-clamp-2">
                        {(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; const s = curso.subtitulo || info?.['subtítulo'] || ''; return normalizarLinha(s); })()}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; const d = curso.duracao || info?.['duração'] || ''; return d; })()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{(() => { const info = getCursoBySlug(curso.slug) as Curso | undefined; const m = Array.isArray(curso.modulos) ? curso.modulos.length : Array.isArray(info?.['módulos']) ? (info as Curso)['módulos'].length : 0; return `${m} módulos`; })()}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/colaborador/cursos/${curso.slug}`);
                      }}
                      data-testid={`button-iniciar-curso-${curso.id}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Ver Detalhes
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cursos Concluídos */}
        {certificados.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Meus Certificados ({certificados.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {certificados.map((cert) => {
                const cursoInfo = getCursoBySlug(cert.cursoSlug);

                return (
                  <Card
                    key={cert.id}
                    className="group border border-green-200 bg-green-50/50 hover:bg-green-50 transition-all duration-300"
                    data-testid={`card-certificado-${cert.id}`}
                  >
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="h-16 w-16 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200 flex-shrink-0">
                          <Award className="h-8 w-8 text-white" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {(() => {
                              const t = cursoInfo?.título || cursoInfo?.titulo || cert.cursoTitulo || 'Curso';
                              return normalizarLinha(t);
                            })()}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span>Emitido em {format(new Date(cert.dataEmissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                            </div>
                            {cursoInfo && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span>{cursoInfo.duração || cursoInfo.duracao || 'N/A'}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                              Certificado Emitido
                            </Badge>
                            <span className="text-xs font-mono text-green-600/80 uppercase tracking-wider">
                              {cert.codigoAutenticacao}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 md:flex-none border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 bg-white"
                              onClick={() => setCertificadoSelecionado(cert)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl w-[95vw] h-[90vh] overflow-y-auto p-0 bg-gray-50">
                            <DialogHeader>
                              <DialogTitle>Certificado</DialogTitle>
                            </DialogHeader>
                            {certificadoSelecionado && cursoInfo && (
                              <div className="p-4 md:p-8">
                                <CertificadoView
                                  certificado={certificadoSelecionado}
                                  curso={cursoInfo}
                                />
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                          onClick={() => setDownloadingCertificate(cert)}
                          disabled={!!downloadingCertificate}
                        >
                          {downloadingCertificate?.id === cert.id ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                              Baixando...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Baixar PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Hidden Certificate View for Downloading */}
        {downloadingCertificate && (() => {
          const cursoInfo = getCursoBySlug(downloadingCertificate.cursoSlug);
          if (!cursoInfo) return null;
          return (
            <div className="absolute -left-[9999px] top-0">
              <CertificadoView
                certificado={downloadingCertificate}
                curso={cursoInfo}
                autoDownload={true}
                onDownloadComplete={() => setDownloadingCertificate(null)}
              />
            </div>
          );
        })()}

        {/* Call to Action */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎓 Trilha de Capacitação Completa
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>Conforme NR01</strong> - Liderança e Saúde Psicossocial
            </p>
            <p className="text-sm text-gray-500">
              {cursosDisponiveis.length} cursos disponíveis | Conteúdo baseado em PNL e Rapport | Integração com PGR
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
