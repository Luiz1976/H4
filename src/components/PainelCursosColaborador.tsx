import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  GraduationCap, 
  Award, 
  Clock, 
  CheckCircle, 
  Lock, 
  TrendingUp,
  Calendar,
  Download,
  ExternalLink,
  PlayCircle,
  BookOpen,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PainelCursosColaboradorProps {
  colaboradorId: string;
}

export function PainelCursosColaborador({ colaboradorId }: PainelCursosColaboradorProps) {
  const [filtro, setFiltro] = useState<'todos' | 'concluido' | 'em_andamento' | 'disponivel' | 'bloqueado'>('todos');
  const [busca, setBusca] = useState('');

  // Buscar dados dos cursos
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/colaboradores/${colaboradorId}/cursos-detalhes`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const cursosCompletos = data?.cursosCompletos || [];
  const resumo = data?.resumo || { totalCursos: 0, concluidos: 0, emAndamento: 0, disponiveis: 0 };

  // Filtrar cursos
  const cursosFiltrados = cursosCompletos.filter((curso: any) => {
    const matchFiltro = filtro === 'todos' || curso.status === filtro;
    const matchBusca = curso.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                       curso.categoria.toLowerCase().includes(busca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      concluido: { label: 'Concluído', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      em_andamento: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: PlayCircle },
      disponivel: { label: 'Disponível', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: BookOpen },
      bloqueado: { label: 'Bloqueado', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Lock },
    };
    return badges[status as keyof typeof badges] || badges.bloqueado;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas com Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/80 to-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {resumo.totalCursos}
                </p>
                <p className="text-sm text-gray-600 font-medium">Total de Cursos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50/80 to-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {resumo.concluidos}
                </p>
                <p className="text-sm text-gray-600 font-medium">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/80 to-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {resumo.emAndamento}
                </p>
                <p className="text-sm text-gray-600 font-medium">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50/80 to-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  {resumo.disponiveis}
                </p>
                <p className="text-sm text-gray-600 font-medium">Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="border-2 border-gray-100 bg-white/90 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                data-testid="input-buscar-cursos"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'todos', label: 'Todos', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
                { value: 'concluido', label: 'Concluídos', color: 'bg-green-100 hover:bg-green-200 text-green-700' },
                { value: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
                { value: 'disponivel', label: 'Disponíveis', color: 'bg-purple-100 hover:bg-purple-200 text-purple-700' },
                { value: 'bloqueado', label: 'Bloqueados', color: 'bg-gray-100 hover:bg-gray-200 text-gray-600' },
              ].map(({ value, label, color }) => (
                <Button
                  key={value}
                  variant={filtro === value ? 'default' : 'outline'}
                  onClick={() => setFiltro(value as any)}
                  className={filtro === value ? '' : color}
                  data-testid={`button-filtro-${value}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Cursos */}
      <div className="grid grid-cols-1 gap-6">
        {cursosFiltrados.map((curso: any) => {
          const statusInfo = getStatusBadge(curso.status);
          const StatusIcon = statusInfo.icon;

          // Se curso concluído e tem certificado, mostrar apenas o certificado
          if (curso.certificado && curso.status === 'concluido') {
            return (
              <Card 
                key={curso.id} 
                className="border-2 border-green-200 hover:border-green-300 hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur overflow-hidden"
                data-testid={`card-certificado-${curso.slug}`}
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
                          {curso.titulo}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            Emitido em {format(new Date(curso.certificado.dataEmissao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Certificado Emitido
                          </Badge>
                          <span className="text-xs text-green-600 font-mono">
                            {curso.certificado.codigoAutenticacao}
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
                        onClick={() => {
                          window.open(`/empresa/colaborador/${colaboradorId}/certificado/${curso.slug}`, '_blank');
                        }}
                        data-testid={`button-ver-certificado-${curso.slug}`}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        onClick={() => {
                          window.open(`/empresa/colaborador/${colaboradorId}/certificado/${curso.slug}`, '_blank');
                        }}
                        data-testid={`button-baixar-certificado-${curso.slug}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          // Para cursos não concluídos ou sem certificado, mostrar informações completas
          return (
            <Card 
              key={curso.id} 
              className="border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden group"
              data-testid={`card-curso-${curso.slug}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Ícone e Informações Principais */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                        {curso.icone}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {curso.titulo}
                          </h3>
                          <Badge className={`${statusInfo.color} border`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {curso.categoria}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {curso.subtitulo}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {curso.duracao}
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {curso.modulos?.length || 0} módulos
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {curso.nivel}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Progresso */}
                    {curso.progresso && !curso.certificado && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">Progresso do Curso</span>
                          <span className="font-bold text-blue-600">
                            {curso.progresso.progressoPorcentagem}%
                          </span>
                        </div>
                        <Progress 
                          value={curso.progresso.progressoPorcentagem} 
                          className="h-2"
                        />
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Módulos: {(curso.progresso.modulosCompletados || []).length}/{curso.modulos?.length || 0}
                          </span>
                          {curso.progresso.avaliacaoFinalPontuacao !== null && (
                            <span className="text-green-600 font-semibold">
                              Avaliação: {curso.progresso.avaliacaoFinalPontuacao}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Data de Conclusão se houver progresso */}
                    {curso.progresso?.dataConclusao && !curso.certificado && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>
                          Concluído em {format(new Date(curso.progresso.dataConclusao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensagem quando não há resultados */}
      {cursosFiltrados.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou a busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
