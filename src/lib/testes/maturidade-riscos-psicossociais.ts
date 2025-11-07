// Teste HumaniQ MGRP – Maturidade em Gestão de Riscos Psicossociais
// Base científica: NR 01 (Avaliação de Riscos Psicossociais), ISO 45003, OIT
// Modelos de maturidade organizacional e gestão contínua

export interface DimensaoMaturidadeRiscosPsicossociais {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaMaturidadeRiscosPsicossociais[];
}

export interface PerguntaMaturidadeRiscosPsicossociais {
  id: number;
  texto: string;
  dimensao: string;
}

export interface ResultadoMaturidadeRiscosPsicossociais {
  dimensoes: Record<string, {
    pontuacao: number;
    media: number;
    classificacao: string;
    nivel: 'baixa' | 'inicial' | 'intermediaria' | 'avancada' | 'otimizada';
  }>;
  pontuacaoGeral: number;
  mediaGeral: number;
  classificacaoGeral: string;
  nivelGeral: 'baixa' | 'inicial' | 'intermediaria' | 'avancada' | 'otimizada';
  recomendacoes: string[];
  planoMelhoria: string[];
}

// Escala Likert de 5 pontos
export const escalaLikert = [
  "Discordo totalmente",
  "Discordo", 
  "Neutro",
  "Concordo",
  "Concordo totalmente"
];

// Classificação dos níveis de maturidade
export const classificacaoMaturidade = {
  baixa: { min: 1.00, max: 2.00, label: "Maturidade Baixa" },
  inicial: { min: 2.01, max: 2.80, label: "Maturidade Inicial" },
  intermediaria: { min: 2.81, max: 3.60, label: "Maturidade Intermediária" },
  avancada: { min: 3.61, max: 4.20, label: "Maturidade Avançada" },
  otimizada: { min: 4.21, max: 5.00, label: "Maturidade Otimizada" }
};

// Dimensões e perguntas do teste
export const dimensoesMaturidadeRiscosPsicossociais: DimensaoMaturidadeRiscosPsicossociais[] = [
  {
    id: "prevencao-mapeamento",
    nome: "Prevenção e Mapeamento",
    descricao: "Identificação e capacitação para prevenção de riscos psicossociais",
    perguntas: [
      {
        id: 1,
        texto: "A empresa identifica os riscos psicossociais em suas avaliações periódicas.",
        dimensao: "prevencao-mapeamento"
      },
      {
        id: 2,
        texto: "Existem ações planejadas para prevenir situações de estresse ou assédio.",
        dimensao: "prevencao-mapeamento"
      },
      {
        id: 3,
        texto: "Os colaboradores são treinados para reconhecer sinais de riscos psicossociais.",
        dimensao: "prevencao-mapeamento"
      },
      {
        id: 4,
        texto: "São realizadas pesquisas internas para avaliar o clima e saúde mental.",
        dimensao: "prevencao-mapeamento"
      },
      {
        id: 5,
        texto: "A empresa adota políticas claras contra o assédio moral e sexual.",
        dimensao: "prevencao-mapeamento"
      },
      {
        id: 6,
        texto: "Os gestores são capacitados para lidar com riscos psicossociais.",
        dimensao: "prevencao-mapeamento"
      },
      {
        id: 7,
        texto: "Existe integração entre áreas para a gestão dos riscos psicossociais.",
        dimensao: "prevencao-mapeamento"
      },
      {
        id: 8,
        texto: "A empresa monitora indicadores relacionados a saúde mental e segurança psicológica.",
        dimensao: "prevencao-mapeamento"
      }
    ]
  },
  {
    id: "monitoramento-acompanhamento",
    nome: "Monitoramento e Acompanhamento",
    descricao: "Indicadores e canais de denúncia para acompanhamento contínuo",
    perguntas: [
      {
        id: 9,
        texto: "Os casos identificados de risco psicossocial são acompanhados de perto.",
        dimensao: "monitoramento-acompanhamento"
      },
      {
        id: 10,
        texto: "Há registros formais de ocorrências e intervenções realizadas.",
        dimensao: "monitoramento-acompanhamento"
      },
      {
        id: 11,
        texto: "A empresa oferece canais de denúncia acessíveis e confidenciais.",
        dimensao: "monitoramento-acompanhamento"
      },
      {
        id: 12,
        texto: "Feedbacks dos colaboradores sobre o ambiente são levados em consideração.",
        dimensao: "monitoramento-acompanhamento"
      },
      {
        id: 13,
        texto: "São realizados acompanhamentos pós-intervenção para avaliar eficácia.",
        dimensao: "monitoramento-acompanhamento"
      },
      {
        id: 14,
        texto: "Existe equipe ou profissional especializado para apoio psicológico.",
        dimensao: "monitoramento-acompanhamento"
      },
      {
        id: 15,
        texto: "A comunicação sobre ações e resultados é transparente para os colaboradores.",
        dimensao: "monitoramento-acompanhamento"
      },
      {
        id: 16,
        texto: "Indicadores de saúde mental são revisados e atualizados periodicamente.",
        dimensao: "monitoramento-acompanhamento"
      }
    ]
  },
  {
    id: "acolhimento-suporte",
    nome: "Acolhimento e Suporte",
    descricao: "Apoio psicológico e cultura de escuta ativa",
    perguntas: [
      {
        id: 17,
        texto: "Os colaboradores se sentem acolhidos ao relatarem problemas emocionais.",
        dimensao: "acolhimento-suporte"
      },
      {
        id: 18,
        texto: "A empresa promove ações de apoio psicológico e emocional.",
        dimensao: "acolhimento-suporte"
      },
      {
        id: 19,
        texto: "Existe confidencialidade garantida em casos de acolhimento.",
        dimensao: "acolhimento-suporte"
      },
      {
        id: 20,
        texto: "As lideranças são orientadas para apoiar colaboradores com dificuldades.",
        dimensao: "acolhimento-suporte"
      },
      {
        id: 21,
        texto: "Há programas de prevenção ao burnout e outras síndromes relacionadas.",
        dimensao: "acolhimento-suporte"
      },
      {
        id: 22,
        texto: "O ambiente de trabalho estimula a expressão saudável de emoções.",
        dimensao: "acolhimento-suporte"
      },
      {
        id: 23,
        texto: "São promovidas campanhas de conscientização sobre saúde mental.",
        dimensao: "acolhimento-suporte"
      },
      {
        id: 24,
        texto: "A empresa possui um plano estruturado de acolhimento psicológico.",
        dimensao: "acolhimento-suporte"
      }
    ]
  },
  {
    id: "conformidade-legal",
    nome: "Conformidade Legal e Melhoria Contínua",
    descricao: "Políticas, comitês e auditorias para conformidade legal",
    perguntas: [
      {
        id: 25,
        texto: "A empresa está atualizada e em conformidade com a NR 01 e outras normas.",
        dimensao: "conformidade-legal"
      },
      {
        id: 26,
        texto: "Existem políticas documentadas sobre riscos psicossociais.",
        dimensao: "conformidade-legal"
      },
      {
        id: 27,
        texto: "A empresa realiza auditorias internas para verificar conformidade.",
        dimensao: "conformidade-legal"
      },
      {
        id: 28,
        texto: "Os colaboradores são informados sobre seus direitos relacionados à saúde mental.",
        dimensao: "conformidade-legal"
      },
      {
        id: 29,
        texto: "Há um comitê ou grupo responsável pela gestão dos riscos psicossociais.",
        dimensao: "conformidade-legal"
      },
      {
        id: 30,
        texto: "São definidas metas e indicadores para melhoria contínua em saúde mental.",
        dimensao: "conformidade-legal"
      },
      {
        id: 31,
        texto: "O plano de ação é revisado regularmente com base em indicadores e feedback.",
        dimensao: "conformidade-legal"
      },
      {
        id: 32,
        texto: "A empresa investe em capacitação contínua sobre riscos psicossociais.",
        dimensao: "conformidade-legal"
      }
    ]
  },
  {
    id: "cultura-comunicacao",
    nome: "Cultura Organizacional e Comunicação",
    descricao: "Valorização da saúde mental e comunicação efetiva",
    perguntas: [
      {
        id: 33,
        texto: "A cultura da empresa valoriza a saúde mental dos colaboradores.",
        dimensao: "cultura-comunicacao"
      },
      {
        id: 34,
        texto: "A comunicação interna promove o respeito e a empatia entre colegas.",
        dimensao: "cultura-comunicacao"
      },
      {
        id: 35,
        texto: "Os líderes incentivam práticas que minimizam o estresse e conflitos.",
        dimensao: "cultura-comunicacao"
      },
      {
        id: 36,
        texto: "Os colaboradores se sentem seguros para falar sobre suas dificuldades.",
        dimensao: "cultura-comunicacao"
      },
      {
        id: 37,
        texto: "A empresa valoriza a diversidade e a inclusão em seu ambiente.",
        dimensao: "cultura-comunicacao"
      },
      {
        id: 38,
        texto: "Há programas de reconhecimento que valorizam o bem-estar emocional.",
        dimensao: "cultura-comunicacao"
      },
      {
        id: 39,
        texto: "As informações sobre riscos psicossociais são divulgadas com frequência.",
        dimensao: "cultura-comunicacao"
      },
      {
        id: 40,
        texto: "A organização promove um ambiente de confiança e colaboração.",
        dimensao: "cultura-comunicacao"
      }
    ]
  }
];

// Função para calcular o resultado do teste
export function calcularResultadoMaturidadeRiscosPsicossociais(respostas: Record<number, number>): ResultadoMaturidadeRiscosPsicossociais {
  console.log('🔍 [CALC-MGRP] Iniciando cálculo do resultado MGRP');
  console.log('🔍 [CALC-MGRP] Respostas recebidas:', respostas);
  console.log('🔍 [CALC-MGRP] Tipo das chaves das respostas:', typeof Object.keys(respostas)[0]);
  console.log('🔍 [CALC-MGRP] Chaves das respostas:', Object.keys(respostas));
  console.log('🔍 [CALC-MGRP] Valores das respostas:', Object.values(respostas));
  
  const resultado: ResultadoMaturidadeRiscosPsicossociais = {
    dimensoes: {},
    pontuacaoGeral: 0,
    mediaGeral: 0,
    classificacaoGeral: '',
    nivelGeral: 'baixa',
    recomendacoes: [],
    planoMelhoria: []
  };

  let pontuacaoTotal = 0;
  const totalPerguntas = 40;

  // Calcular por dimensão
  dimensoesMaturidadeRiscosPsicossociais.forEach(dimensao => {
    console.log(`🔍 [CALC-MGRP] Processando dimensão: ${dimensao.nome} (${dimensao.id})`);
    let pontuacaoDimensao = 0;
    
    dimensao.perguntas.forEach(pergunta => {
      const resposta = respostas[pergunta.id];
      console.log(`🔍 [CALC-MGRP] Pergunta ${pergunta.id}: resposta = ${resposta} (tipo: ${typeof resposta})`);
      pontuacaoDimensao += resposta || 0;
    });

    console.log(`🔍 [CALC-MGRP] Pontuação total da dimensão ${dimensao.nome}: ${pontuacaoDimensao}`);
    const mediaDimensao = pontuacaoDimensao / dimensao.perguntas.length;
    console.log(`🔍 [CALC-MGRP] Média da dimensão ${dimensao.nome}: ${mediaDimensao}`);
    
    // Determinar classificação e nível
    let classificacao = '';
    let nivel: 'baixa' | 'inicial' | 'intermediaria' | 'avancada' | 'otimizada' = 'baixa';
    
    Object.entries(classificacaoMaturidade).forEach(([key, value]) => {
      if (mediaDimensao >= value.min && mediaDimensao <= value.max) {
        classificacao = value.label;
        nivel = key as 'baixa' | 'inicial' | 'intermediaria' | 'avancada' | 'otimizada';
      }
    });

    resultado.dimensoes[dimensao.id] = {
      pontuacao: pontuacaoDimensao,
      media: Number(mediaDimensao.toFixed(2)),
      classificacao,
      nivel
    };

    pontuacaoTotal += pontuacaoDimensao;
  });

  // Calcular resultado geral
  resultado.pontuacaoGeral = pontuacaoTotal;
  resultado.mediaGeral = Number((pontuacaoTotal / totalPerguntas).toFixed(2));

  // Determinar classificação geral
  Object.entries(classificacaoMaturidade).forEach(([key, value]) => {
    if (resultado.mediaGeral >= value.min && resultado.mediaGeral <= value.max) {
      resultado.classificacaoGeral = value.label;
      resultado.nivelGeral = key as 'baixa' | 'inicial' | 'intermediaria' | 'avancada' | 'otimizada';
    }
  });

  // Gerar recomendações e plano de melhoria
  resultado.recomendacoes = gerarRecomendacoesMaturidade(resultado);
  resultado.planoMelhoria = gerarPlanoMelhoria(resultado);

  return resultado;
}

// Função para gerar recomendações baseadas no nível de maturidade
function gerarRecomendacoesMaturidade(resultado: ResultadoMaturidadeRiscosPsicossociais): string[] {
  const recomendacoes: string[] = [];

  // Recomendações gerais baseadas no nível
  switch (resultado.nivelGeral) {
    case 'baixa':
      recomendacoes.push(
        "Implementar urgentemente políticas básicas de prevenção a riscos psicossociais",
        "Estabelecer canais de denúncia e acolhimento imediatos",
        "Capacitar lideranças sobre identificação de riscos psicossociais",
        "Buscar conformidade com NR 01 e normas básicas de segurança psicológica"
      );
      break;
    case 'inicial':
      recomendacoes.push(
        "Estruturar programa formal de gestão de riscos psicossociais",
        "Implementar indicadores de monitoramento contínuo",
        "Desenvolver políticas documentadas e procedimentos claros",
        "Investir em treinamentos regulares para gestores e colaboradores"
      );
      break;
    case 'intermediaria':
      recomendacoes.push(
        "Aprimorar sistemas de monitoramento e feedback",
        "Expandir programas de apoio psicológico e bem-estar",
        "Fortalecer a cultura organizacional de saúde mental",
        "Implementar auditorias internas regulares"
      );
      break;
    case 'avancada':
      recomendacoes.push(
        "Otimizar processos de melhoria contínua",
        "Desenvolver programas inovadores de prevenção",
        "Compartilhar boas práticas com outras organizações",
        "Investir em tecnologias para monitoramento avançado"
      );
      break;
    case 'otimizada':
      recomendacoes.push(
        "Manter excelência através de revisões periódicas",
        "Liderar iniciativas setoriais em saúde mental",
        "Desenvolver pesquisas e inovações na área",
        "Servir como referência para outras organizações"
      );
      break;
  }

  // Recomendações específicas por dimensão com baixa pontuação
  Object.entries(resultado.dimensoes).forEach(([dimensaoId, dados]) => {
    if (dados.nivel === 'baixa' || dados.nivel === 'inicial') {
      const dimensao = dimensoesMaturidadeRiscosPsicossociais.find(d => d.id === dimensaoId);
      if (dimensao) {
        switch (dimensaoId) {
          case 'prevencao-mapeamento':
            recomendacoes.push(`Fortalecer ${dimensao.nome}: Implementar avaliações periódicas de riscos psicossociais`);
            break;
          case 'monitoramento-acompanhamento':
            recomendacoes.push(`Melhorar ${dimensao.nome}: Estabelecer indicadores e canais de feedback efetivos`);
            break;
          case 'acolhimento-suporte':
            recomendacoes.push(`Desenvolver ${dimensao.nome}: Criar programas estruturados de apoio psicológico`);
            break;
          case 'conformidade-legal':
            recomendacoes.push(`Adequar ${dimensao.nome}: Garantir conformidade com NR 01 e ISO 45003`);
            break;
          case 'cultura-comunicacao':
            recomendacoes.push(`Transformar ${dimensao.nome}: Promover cultura de valorização da saúde mental`);
            break;
        }
      }
    }
  });

  return recomendacoes;
}

// Função para gerar plano de melhoria contínua
function gerarPlanoMelhoria(resultado: ResultadoMaturidadeRiscosPsicossociais): string[] {
  const plano: string[] = [];

  // Ações imediatas (0-3 meses)
  plano.push("AÇÕES IMEDIATAS (0-3 meses):");
  if (resultado.nivelGeral === 'baixa' || resultado.nivelGeral === 'inicial') {
    plano.push("• Estabelecer comitê de gestão de riscos psicossociais");
    plano.push("• Implementar canais de denúncia confidenciais");
    plano.push("• Capacitar lideranças em identificação de riscos");
  }

  // Ações de curto prazo (3-6 meses)
  plano.push("AÇÕES DE CURTO PRAZO (3-6 meses):");
  plano.push("• Desenvolver políticas documentadas sobre riscos psicossociais");
  plano.push("• Implementar programa de treinamento para colaboradores");
  plano.push("• Estabelecer indicadores de monitoramento");

  // Ações de médio prazo (6-12 meses)
  plano.push("AÇÕES DE MÉDIO PRAZO (6-12 meses):");
  plano.push("• Realizar auditoria interna de conformidade");
  plano.push("• Implementar programa de apoio psicológico estruturado");
  plano.push("• Desenvolver campanhas de conscientização");

  // Ações de longo prazo (12+ meses)
  plano.push("AÇÕES DE LONGO PRAZO (12+ meses):");
  plano.push("• Estabelecer cultura organizacional de saúde mental");
  plano.push("• Implementar sistema de melhoria contínua");
  plano.push("• Buscar certificações e reconhecimentos externos");

  return plano;
}

// Função para obter todas as perguntas do teste
export function obterPerguntasMaturidadeRiscosPsicossociais(): PerguntaMaturidadeRiscosPsicossociais[] {
  return dimensoesMaturidadeRiscosPsicossociais.flatMap(dimensao => dimensao.perguntas);
}

// Informações do teste para exibição
export const infoTesteMaturidadeRiscosPsicossociais = {
  nome: "HumaniQ MGRP – Maturidade em Gestão de Riscos Psicossociais",
  categoria: "Gestão de Riscos",
  descricao: "Avalia o grau de maturidade da organização na gestão de riscos psicossociais, com foco em prevenção, conformidade legal e cultura organizacional.",
  duracao: "15-20 minutos",
  questoes: 40,
  totalPerguntas: 40,
  dimensoes: 5,
  baseCientifica: "NR 01, ISO 45003, OIT e modelos de maturidade organizacional"
};