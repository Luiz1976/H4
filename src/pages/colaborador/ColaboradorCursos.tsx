import { GraduationCap, BookOpen, Clock, Award, ChevronRight, Play, Lock, Download, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ColaboradorCursos() {
  const navigate = useNavigate();

  // Buscar cursos com informações de disponibilidade
  const { data: responseCursos, isLoading } = useQuery<{cursos: any[], total: number}>({
    queryKey: ['/api/curso-disponibilidade/colaborador/cursos'],
  });

  // Buscar certificados (cursos concluídos)
  const { data: certificados = [] } = useQuery<any[]>({
    queryKey: ['/api/cursos/meus-certificados'],
  });

  // Buscar progresso dos cursos para calcular tempo de estudo
  const { data: progressoCursos = [] } = useQuery<any[]>({
    queryKey: ['/api/cursos/progresso'],
  });

  const cursosDisponiveis = responseCursos?.cursos || [];
  const cursosLiberados = cursosDisponiveis.filter((c) => c.disponivel);
  const cursosConcluidos = certificados.length;
  
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

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
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

        {/* Seção de Certificados Conquistados */}
        {certificados.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Meus Certificados ({certificados.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {certificados.map((certificado: any) => (
                <Card 
                  key={certificado.id}
                  className="border-2 border-green-200 bg-gradient-to-r from-green-50/80 to-emerald-50/80 hover:shadow-xl transition-all"
                  data-testid={`card-certificado-${certificado.cursoSlug}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Informações do Certificado */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-green-900 mb-1 truncate">
                            {certificado.cursoTitulo}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              Emitido em {format(new Date(certificado.dataEmissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Certificado Emitido
                            </Badge>
                            <span className="text-xs text-green-600 font-mono">
                              {certificado.codigoAutenticacao}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white hover:bg-green-50 border-green-300"
                          onClick={() => window.open(`/colaborador/cursos/${certificado.cursoSlug}/certificado`, '_blank')}
                          data-testid={`button-ver-certificado-${certificado.cursoSlug}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                          onClick={() => window.open(`/colaborador/cursos/${certificado.cursoSlug}/certificado`, '_blank')}
                          data-testid={`button-baixar-certificado-${certificado.cursoSlug}`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

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
                    <div className="text-5xl">{curso.icone}</div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className="w-fit text-xs">
                        {curso.categoria}
                      </Badge>
                      <Badge variant="outline" className={`w-fit text-xs ${getNivelColor(curso.nivel)}`}>
                        {curso.nivel}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                    {curso.titulo}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed line-clamp-2">
                    {curso.subtitulo}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{curso.duracao}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{curso.modulos?.length || 0} módulos</span>
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
