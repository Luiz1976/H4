// Tipos para o banco de dados Supabase

export interface Database {
  public: {
    Tables: {
      testes: {
        Row: Teste;
        Insert: Omit<Teste, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Teste, 'id' | 'created_at'>>;
      };
      perguntas: {
        Row: Pergunta;
        Insert: Omit<Pergunta, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Pergunta, 'id' | 'created_at'>>;
      };
      resultados: {
        Row: Resultado;
        Insert: Omit<Resultado, 'id' | 'data_realizacao'>;
        Update: Partial<Omit<Resultado, 'id' | 'data_realizacao'>>;
      };
      respostas: {
        Row: Resposta;
        Insert: Omit<Resposta, 'id' | 'created_at'>;
        Update: Partial<Omit<Resposta, 'id' | 'created_at'>>;
      };
    };
  };
}

// Tipos das entidades
export interface Teste {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  duracao_estimada: number; // em minutos
  instrucoes: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pergunta {
  id: string;
  teste_id: string;
  texto: string;
  tipo: 'multipla_escolha' | 'escala' | 'texto_livre';
  opcoes?: string[]; // Para perguntas de múltipla escolha
  escala_min?: number; // Para perguntas de escala
  escala_max?: number; // Para perguntas de escala
  obrigatoria: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface Resultado {
  id: string;
  teste_id: string;
  usuario_id?: string; // UUID do usuário ou null para anônimos
  pontuacao_total?: number;
  tempo_gasto?: number; // em segundos
  data_realizacao: string;
  status: string; // 'concluido', 'em_andamento', etc.
  metadados?: Record<string, any>; // JSONB para dados adicionais
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
}

export interface Resposta {
  id: string;
  resultado_id: string;
  pergunta_id: string;
  valor: string | number;
  created_at: string;
}

// Tipos para análise e relatórios
export interface AnaliseResultado {
  dimensoes: {
    [key: string]: {
      pontuacao: number;
      percentil: number;
      interpretacao: string;
    };
  };
  pontuacao_geral: number;
  nivel: 'baixo' | 'medio' | 'alto';
  pontos_fortes: string[];
  areas_desenvolvimento: string[];
}

// Tipos para estatísticas
export interface EstatisticasTeste {
  total_realizacoes: number;
  media_pontuacao: number;
  media_tempo: number;
  distribuicao_pontuacoes: {
    baixo: number;
    medio: number;
    alto: number;
  };
}

// Tipos específicos para o teste PAS (Percepção de Assédio)
export interface DimensaoPercepacaoAssedio {
  nome: string;
  pontuacao: number;
  nivel: 'Baixo Risco' | 'Risco Moderado' | 'Alto Risco' | 'Risco Crítico';
  descricao: string;
  interpretacao: string;
  alertaCritico: boolean;
  recomendacoes: string[];
  cor: string;
}

export interface ResultadoPercepacaoAssedio {
  id: string;
  testeId: string;
  nomeTeste: string;
  dataRealizacao: string;
  indiceGeralAssedio: number;
  nivelRiscoGeral: 'Baixo Risco' | 'Risco Moderado' | 'Alto Risco' | 'Risco Crítico';
  dimensoes: DimensaoPercepacaoAssedio[];
  alertasCriticos: string[];
  insights: string[];
  recomendacoesEducativas: string[];
  recomendacoesDisciplinares: string[];
  relatorioESG: {
    conformidadeLegal: boolean;
    riscosIdentificados: string[];
    acoesPreventivasRecomendadas: string[];
  };
}

// Tipos para alertas críticos
export interface AlertaCritico {
  tipo: 'assedio-moral' | 'assedio-sexual' | 'ambiente-toxico' | 'risco-legal';
  nivel: 'Alto' | 'Crítico';
  dimensao: string;
  mensagem: string;
  acaoImediata: string;
  prazoAcao: string;
  responsavel: string;
}

// Tipos para relatório ESG
export interface RelatorioESG {
  conformidadeLegal: boolean;
  indicadoresRisco: {
    assedioMoral: number;
    assedioSexual: number;
    ambienteTrabalho: number;
    canaisDenuncia: number;
    impactoEmocional: number;
  };
  riscosIdentificados: string[];
  acoesPreventivasRecomendadas: string[];
  statusCompliance: 'Conforme' | 'Não Conforme' | 'Atenção Requerida';
  proximaAuditoria: string;
}

// Tipos específicos para o teste QVT (Qualidade de Vida no Trabalho)
export type DimensaoQVT = 
  | 'Satisfação com a Função'
  | 'Relação com Liderança'
  | 'Estrutura e Condições de Trabalho'
  | 'Recompensas e Remuneração'
  | 'Equilíbrio Vida-Trabalho';

export interface DimensaoResultadoQVT {
  dimensao: DimensaoQVT;
  pontuacao: number;
  nivel: string;
  percentual: number;
}

export interface ResultadoQVT {
  indiceGeral: number;
  nivelGeral: string;
  percentualGeral: number;
  dimensoes: DimensaoResultadoQVT[];
  dimensoesCriticas: DimensaoResultadoQVT[];
  pontoFortes: DimensaoResultadoQVT[];
  riscoTurnover: boolean;
  recomendacoes: string[];
  insights: string[];
}

// Tipos para análise comparativa QVT
export interface AnaliseComparativaQVT {
  porArea: {
    [area: string]: {
      indiceGeral: number;
      participantes: number;
      dimensoesCriticas: string[];
    };
  };
  porFuncao: {
    [funcao: string]: {
      indiceGeral: number;
      participantes: number;
      dimensoesCriticas: string[];
    };
  };
  tendencias: {
    melhorias: string[];
    declínios: string[];
  };
}

// Tipos para mapa de calor QVT
export interface MapaCalorQVT {
  setor: string;
  dimensoes: {
    [dimensao in DimensaoQVT]: {
      pontuacao: number;
      cor: string;
      nivel: string;
    };
  };
  indiceGeral: number;
  participantes: number;
  alertas: string[];
}

// Tipos específicos para o teste RPO (Riscos Psicossociais Ocupacionais)
export type DimensaoRPO = 
  | 'Demandas do trabalho'
  | 'Autonomia e controle'
  | 'Relações interpessoais e apoio social'
  | 'Reconhecimento e recompensas'
  | 'Justiça e clima organizacional'
  | 'Segurança no trabalho e futuro'
  | 'Interface trabalho-vida pessoal'
  | 'Violência, assédio e pressão';

export type NivelRiscoRPO = 'Elevado' | 'Moderado' | 'Aceitável' | 'Reduzido';

export interface DimensaoResultadoRPO {
  dimensao: DimensaoRPO;
  pontuacao: number;
  nivel: NivelRiscoRPO;
  percentual: number;
  cor: string;
  interpretacao: string;
  recomendacoes: string[];
}

export interface ResultadoRPO {
  indiceGlobalRisco: number;
  nivelGlobalRisco: NivelRiscoRPO;
  percentualGlobalRisco: number;
  dimensoes: DimensaoResultadoRPO[];
  dimensoesCriticas: DimensaoResultadoRPO[];
  dimensoesSeguras: DimensaoResultadoRPO[];
  alertasCriticos: string[];
  recomendacoesPrioritarias: string[];
  planoAcao: string[];
  mapeamentoRiscos: {
    individual: boolean;
    coletivo: boolean;
    setorial: boolean;
  };
}

// Tipos para análise comparativa RPO
export interface AnaliseComparativaRPO {
  porArea: {
    [area: string]: {
      indiceGlobalRisco: number;
      participantes: number;
      dimensoesCriticas: string[];
      nivelRisco: NivelRiscoRPO;
    };
  };
  porFuncao: {
    [funcao: string]: {
      indiceGlobalRisco: number;
      participantes: number;
      dimensoesCriticas: string[];
      nivelRisco: NivelRiscoRPO;
    };
  };
  tendenciasRisco: {
    aumentando: string[];
    diminuindo: string[];
    estavel: string[];
  };
}

// Tipos para mapa de calor RPO
export interface MapaCalorRPO {
  setor: string;
  dimensoes: {
    [dimensao in DimensaoRPO]: {
      pontuacao: number;
      cor: string;
      nivel: NivelRiscoRPO;
      criticidade: 'baixa' | 'media' | 'alta' | 'critica';
    };
  };
  indiceGlobalRisco: number;
  participantes: number;
  alertasCriticos: string[];
  acoesPrioritarias: string[];
}
