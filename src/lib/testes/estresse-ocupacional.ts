// Teste de Estresse Ocupacional - HumaniQ EO
// Base científica: Conceito de Burnout (Maslach, Jackson), 
// Teoria da Resiliência Psicológica (Connor & Davidson),
// Diretrizes da OIT e ISO 45003,
// Escalas de estresse organizacional e resiliência (versões adaptadas)

export interface DimensaoEstresseOcupacional {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaEstresseOcupacional[];
}

export interface PerguntaEstresseOcupacional {
  id: number;
  texto: string;
  dimensao: string;
}

export interface ResultadoEstresseOcupacional {
  dimensoes: Record<string, {
    pontuacao: number;
    media: number;
    classificacao: string;
    nivel: 'baixo' | 'medio' | 'alto';
  }>;
  indiceVulnerabilidade: number;
  classificacaoVulnerabilidade: string;
  nivelVulnerabilidade: 'baixa' | 'media' | 'alta';
  classificacaoGeral: string;
  nivelGeral: 'baixo' | 'moderado' | 'alto' | 'muito_alto';
  recomendacoes: string[];
}

// Escala Likert de 5 pontos
export const escalaLikert = [
  "Discordo totalmente",
  "Discordo", 
  "Neutro",
  "Concordo",
  "Concordo totalmente"
];

// Classificação do Índice de Vulnerabilidade ao Estresse
export const classificacaoVulnerabilidade = {
  baixa: { min: 1.0, max: 2.0, label: "Baixa vulnerabilidade" },
  media: { min: 2.1, max: 3.5, label: "Média vulnerabilidade" },
  alta: { min: 3.6, max: 5.0, label: "Alta vulnerabilidade" }
};

// Dimensões e perguntas do teste
export const dimensoesEstresseOcupacional: DimensaoEstresseOcupacional[] = [
  {
    id: "estresse",
    nome: "Estresse Ocupacional",
    descricao: "Pressão contínua, sobrecarga e dificuldades para desligar-se do trabalho",
    perguntas: [
      { id: 1, texto: "Sinto que a pressão no meu trabalho é constante e difícil de manejar.", dimensao: "estresse" },
      { id: 2, texto: "Tenho dificuldades para desligar mentalmente das tarefas ao final do expediente.", dimensao: "estresse" },
      { id: 3, texto: "Meu trabalho exige que eu esteja sempre atento, sem momentos de pausa.", dimensao: "estresse" },
      { id: 4, texto: "Frequentemente me sinto sobrecarregado(a) com as responsabilidades profissionais.", dimensao: "estresse" },
      { id: 5, texto: "Sinto que o ritmo de trabalho é acelerado demais para mim.", dimensao: "estresse" },
      { id: 6, texto: "Tenho a impressão de que o volume de trabalho aumenta constantemente.", dimensao: "estresse" },
      { id: 7, texto: "Sinto que o meu trabalho interfere negativamente no meu descanso e sono.", dimensao: "estresse" },
      { id: 8, texto: "Perco o interesse e entusiasmo no trabalho devido à pressão constante.", dimensao: "estresse" },
      { id: 9, texto: "Tenho dificuldade em gerenciar as múltiplas tarefas simultâneas no meu trabalho.", dimensao: "estresse" },
      { id: 10, texto: "Sinto que o ambiente de trabalho me deixa tenso(a) durante a maior parte do tempo.", dimensao: "estresse" },
      { id: 11, texto: "Muitas vezes sinto que não tenho tempo suficiente para concluir minhas tarefas.", dimensao: "estresse" },
      { id: 12, texto: "Sinto que minhas demandas profissionais ultrapassam minha capacidade física e mental.", dimensao: "estresse" },
      { id: 13, texto: "É difícil para mim encontrar momentos para relaxar durante o expediente.", dimensao: "estresse" },
      { id: 14, texto: "Frequentemente sinto que estou trabalhando além das minhas forças.", dimensao: "estresse" },
      { id: 15, texto: "Minha carga de trabalho não permite que eu realize pausas regulares.", dimensao: "estresse" },
      { id: 16, texto: "Sinto que as exigências do trabalho impactam negativamente minha saúde.", dimensao: "estresse" },
      { id: 17, texto: "Me sinto emocionalmente exaurido(a) devido às demandas profissionais.", dimensao: "estresse" },
      { id: 18, texto: "Tenho a sensação de que meu trabalho consome grande parte da minha energia diária.", dimensao: "estresse" },
      { id: 19, texto: "Sinto que não consigo manter um equilíbrio saudável entre trabalho e vida pessoal.", dimensao: "estresse" },
      { id: 20, texto: "A pressão no trabalho frequentemente me causa ansiedade e preocupação.", dimensao: "estresse" }
    ]
  },
  {
    id: "burnout",
    nome: "Burnout",
    descricao: "Exaustão emocional, desmotivação, cansaço crônico",
    perguntas: [
      { id: 21, texto: "Sinto-me frequentemente exausto(a) ao final do dia de trabalho.", dimensao: "burnout" },
      { id: 22, texto: "Perco o interesse pelas tarefas que antes gostava de realizar.", dimensao: "burnout" },
      { id: 23, texto: "Sinto que não consigo realizar meu trabalho tão bem quanto antes.", dimensao: "burnout" },
      { id: 24, texto: "Tenho dificuldade em me concentrar nas minhas tarefas diárias.", dimensao: "burnout" },
      { id: 25, texto: "Sinto-me mentalmente esgotado(a) pela rotina de trabalho.", dimensao: "burnout" },
      { id: 26, texto: "Frequentemente me sinto irritado(a) ou frustrado(a) no ambiente de trabalho.", dimensao: "burnout" },
      { id: 27, texto: "Sinto que minhas emoções estão frequentemente desequilibradas devido ao trabalho.", dimensao: "burnout" },
      { id: 28, texto: "Tenho dificuldade em lidar com as exigências emocionais do meu trabalho.", dimensao: "burnout" },
      { id: 29, texto: "Sinto que meu trabalho me deixa desmotivado(a) e sem energia.", dimensao: "burnout" },
      { id: 30, texto: "Evito interagir com colegas devido ao cansaço emocional.", dimensao: "burnout" },
      { id: 31, texto: "Tenho a sensação de que estou \"queimado(a)\" profissionalmente.", dimensao: "burnout" },
      { id: 32, texto: "Sinto que minhas realizações no trabalho não são suficientes.", dimensao: "burnout" },
      { id: 33, texto: "Frequentemente sinto falta de motivação para cumprir minhas tarefas.", dimensao: "burnout" },
      { id: 34, texto: "Tenho dificuldades para recuperar minha energia mesmo após descanso.", dimensao: "burnout" },
      { id: 35, texto: "Sinto que o trabalho prejudica minha saúde mental.", dimensao: "burnout" },
      { id: 36, texto: "Tenho dificuldade em aceitar críticas no trabalho devido ao cansaço emocional.", dimensao: "burnout" },
      { id: 37, texto: "Sinto que não recebo apoio suficiente para lidar com o estresse no trabalho.", dimensao: "burnout" },
      { id: 38, texto: "Sinto que minhas emoções estão sob controle, mesmo sob pressão.", dimensao: "burnout" },
      { id: 39, texto: "Tenho medo de falhar ou cometer erros devido ao cansaço emocional.", dimensao: "burnout" },
      { id: 40, texto: "Sinto que estou próximo(a) de um colapso emocional por causa do trabalho.", dimensao: "burnout" }
    ]
  },
  {
    id: "resiliencia",
    nome: "Resiliência Emocional",
    descricao: "Capacidade de lidar com pressão, manter equilíbrio e recuperar-se emocionalmente",
    perguntas: [
      { id: 41, texto: "Mesmo diante de dificuldades no trabalho, consigo manter a calma.", dimensao: "resiliencia" },
      { id: 42, texto: "Consigo me adaptar rapidamente a mudanças inesperadas no ambiente profissional.", dimensao: "resiliencia" },
      { id: 43, texto: "Sinto-me capaz de lidar com a pressão e os desafios do meu trabalho.", dimensao: "resiliencia" },
      { id: 44, texto: "Tenho facilidade para encontrar soluções criativas para problemas no trabalho.", dimensao: "resiliencia" },
      { id: 45, texto: "Mesmo em situações estressantes, mantenho uma atitude positiva.", dimensao: "resiliencia" },
      { id: 46, texto: "Posso contar comigo mesmo(a) para superar obstáculos profissionais.", dimensao: "resiliencia" },
      { id: 47, texto: "Tenho confiança na minha capacidade de enfrentar desafios no trabalho.", dimensao: "resiliencia" },
      { id: 48, texto: "Sou capaz de me recuperar rapidamente de situações difíceis no trabalho.", dimensao: "resiliencia" },
      { id: 49, texto: "Mantenho o equilíbrio emocional mesmo quando enfrento pressão intensa.", dimensao: "resiliencia" },
      { id: 50, texto: "Tenho habilidades para controlar meu estresse e ansiedade no ambiente profissional.", dimensao: "resiliencia" },
      { id: 51, texto: "Sinto-me preparado(a) para lidar com críticas e feedbacks negativos.", dimensao: "resiliencia" },
      { id: 52, texto: "Busco apoio quando sinto que o estresse está aumentando.", dimensao: "resiliencia" },
      { id: 53, texto: "Consegui desenvolver estratégias pessoais para manter meu bem-estar emocional.", dimensao: "resiliencia" },
      { id: 54, texto: "Consigo manter a motivação mesmo quando enfrento dificuldades.", dimensao: "resiliencia" },
      { id: 55, texto: "Tenho facilidade para comunicar minhas emoções e necessidades no trabalho.", dimensao: "resiliencia" },
      { id: 56, texto: "Acredito que posso melhorar minha capacidade de enfrentar o estresse no futuro.", dimensao: "resiliencia" }
    ]
  }
];

// Função para calcular o resultado do teste
export function calcularResultadoEstresseOcupacional(
  respostas: Record<number, number>
): ResultadoEstresseOcupacional {
  const resultadoDimensoes: Record<string, any> = {};
  
  // Calcular médias por dimensão
  for (const dimensao of dimensoesEstresseOcupacional) {
    const perguntasDimensao = dimensao.perguntas;
    const somaRespostas = perguntasDimensao.reduce((soma, pergunta) => {
      return soma + (respostas[pergunta.id] || 0);
    }, 0);
    
    const media = somaRespostas / perguntasDimensao.length;
    const pontuacao = Math.round(media * 100) / 100;
    
    let classificacao = "";
    let nivel: 'baixo' | 'medio' | 'alto' = 'baixo';
    
    if (dimensao.id === 'resiliencia') {
      // Para resiliência, valores altos são positivos
      if (media >= 4.0) {
        classificacao = "Alta resiliência";
        nivel = 'alto';
      } else if (media >= 3.0) {
        classificacao = "Resiliência moderada";
        nivel = 'medio';
      } else {
        classificacao = "Baixa resiliência";
        nivel = 'baixo';
      }
    } else {
      // Para estresse e burnout, valores altos são negativos
      if (media >= 4.0) {
        classificacao = dimensao.id === 'estresse' ? "Estresse alto" : "Burnout alto";
        nivel = 'alto';
      } else if (media >= 3.0) {
        classificacao = dimensao.id === 'estresse' ? "Estresse moderado" : "Burnout moderado";
        nivel = 'medio';
      } else {
        classificacao = dimensao.id === 'estresse' ? "Estresse baixo" : "Burnout baixo";
        nivel = 'baixo';
      }
    }
    
    resultadoDimensoes[dimensao.id] = {
      pontuacao,
      media,
      classificacao,
      nivel
    };
  }
  
  // Calcular Índice de Vulnerabilidade ao Estresse
  const mediaEstresse = resultadoDimensoes.estresse.media;
  const mediaBurnout = resultadoDimensoes.burnout.media;
  const mediaResiliencia = resultadoDimensoes.resiliencia.media;
  
  // Fórmula: Vulnerabilidade = ((Estresse + Burnout) / 2) × (2 - (Resiliência / 5))
  const indiceVulnerabilidade = ((mediaEstresse + mediaBurnout) / 2) * (2 - (mediaResiliencia / 5));
  
  // Classificar vulnerabilidade
  let classificacaoVulnerabilidade = "";
  let nivelVulnerabilidade: 'baixa' | 'media' | 'alta' = 'baixa';
  
  if (indiceVulnerabilidade >= 3.6) {
    classificacaoVulnerabilidade = "Alta vulnerabilidade";
    nivelVulnerabilidade = 'alta';
  } else if (indiceVulnerabilidade >= 2.1) {
    classificacaoVulnerabilidade = "Média vulnerabilidade";
    nivelVulnerabilidade = 'media';
  } else {
    classificacaoVulnerabilidade = "Baixa vulnerabilidade";
    nivelVulnerabilidade = 'baixa';
  }
  
  // Gerar recomendações baseadas no nível de vulnerabilidade
  const recomendacoes = gerarRecomendacoes(nivelVulnerabilidade, resultadoDimensoes);
  
  // Determinar classificação geral baseada no índice de vulnerabilidade
  let classificacaoGeral = "";
  let nivelGeral: 'baixo' | 'moderado' | 'alto' | 'muito_alto' = 'baixo';
  
  if (indiceVulnerabilidade >= 4.0) {
    classificacaoGeral = "Muito Alto Risco";
    nivelGeral = 'muito_alto';
  } else if (indiceVulnerabilidade >= 3.6) {
    classificacaoGeral = "Alto Risco";
    nivelGeral = 'alto';
  } else if (indiceVulnerabilidade >= 2.1) {
    classificacaoGeral = "Risco Moderado";
    nivelGeral = 'moderado';
  } else {
    classificacaoGeral = "Baixo Risco";
    nivelGeral = 'baixo';
  }
  
  return {
    dimensoes: resultadoDimensoes,
    indiceVulnerabilidade: Math.round(indiceVulnerabilidade * 100) / 100,
    classificacaoVulnerabilidade,
    nivelVulnerabilidade,
    classificacaoGeral,
    nivelGeral,
    recomendacoes
  };
}

// Função para gerar recomendações personalizadas
function gerarRecomendacoes(
  nivelVulnerabilidade: 'baixa' | 'media' | 'alta',
  dimensoes: Record<string, any>
): string[] {
  const recomendacoes: string[] = [];
  
  // Recomendações baseadas no nível geral de vulnerabilidade
  if (nivelVulnerabilidade === 'alta') {
    recomendacoes.push(
      "Busque apoio profissional especializado em saúde mental ocupacional",
      "Considere conversar com RH sobre ajustes na carga de trabalho",
      "Implemente técnicas de relaxamento e mindfulness no dia a dia",
      "Estabeleça limites claros entre trabalho e vida pessoal"
    );
  } else if (nivelVulnerabilidade === 'media') {
    recomendacoes.push(
      "Desenvolva estratégias de gerenciamento de estresse",
      "Pratique exercícios físicos regulares",
      "Mantenha uma rede de apoio social forte",
      "Considere técnicas de respiração e relaxamento"
    );
  } else {
    recomendacoes.push(
      "Continue mantendo suas estratégias atuais de bem-estar",
      "Compartilhe suas práticas positivas com colegas",
      "Mantenha-se atento a mudanças no ambiente de trabalho",
      "Continue investindo em seu desenvolvimento pessoal"
    );
  }
  
  // Recomendações específicas por dimensão
  if (dimensoes.estresse.nivel === 'alto') {
    recomendacoes.push(
      "Organize melhor seu tempo e prioridades",
      "Negocie prazos mais realistas quando possível",
      "Pratique técnicas de gestão do tempo"
    );
  }
  
  if (dimensoes.burnout.nivel === 'alto') {
    recomendacoes.push(
      "Tire férias ou períodos de descanso",
      "Busque atividades que tragam prazer e significado",
      "Considere mudanças no ambiente ou função de trabalho"
    );
  }
  
  if (dimensoes.resiliencia.nivel === 'baixo') {
    recomendacoes.push(
      "Desenvolva habilidades de enfrentamento",
      "Pratique autocompaixão e aceitação",
      "Busque treinamentos em resiliência emocional"
    );
  }
  
  return recomendacoes;
}

// Função para obter todas as perguntas
export function obterTodasPerguntasEO(): PerguntaEstresseOcupacional[] {
  return dimensoesEstresseOcupacional.flatMap(dimensao => dimensao.perguntas);
}

// Informações do teste para exibição
export const infoTesteEstresseOcupacional = {
  id: "estresse-ocupacional",
  nome: "HumaniQ EO – Estresse Ocupacional, Burnout e Resiliência",
  descricao: "Avaliação científica que identifica o nível de estresse ocupacional, esgotamento emocional e capacidade de resiliência dos colaboradores, baseada em modelos validados internacionalmente.",
  duracao: "15-20 min",
  questoes: 56,
  categoria: "Saúde Mental",
  dimensoes: dimensoesEstresseOcupacional.length,
  basesCientificas: [
    "Conceito de Burnout (Maslach, Jackson)",
    "Teoria da Resiliência Psicológica (Connor & Davidson)",
    "Diretrizes da OIT e ISO 45003",
    "Escalas de estresse organizacional e resiliência (versões adaptadas)"
  ],
  objetivos: [
    "Identificar o nível de estresse ocupacional dos colaboradores",
    "Detectar sinais de esgotamento emocional e burnout",
    "Avaliar a capacidade de resiliência emocional",
    "Prevenir adoecimento mental no ambiente de trabalho",
    "Fornecer recomendações personalizadas de autocuidado"
  ],
  instrucoes: [
    "Responda com base na sua experiência atual no trabalho",
    "Use a escala de 1 (Discordo totalmente) a 5 (Concordo totalmente)",
    "Seja honesto sobre suas percepções e sentimentos",
    "Considere situações típicas do seu dia a dia profissional",
    "Suas respostas são confidenciais e protegidas"
  ],
  beneficios: [
    "Prevenção de burnout e afastamentos por transtornos mentais",
    "Apoio à construção de programas de saúde emocional",
    "Redução de passivos e melhora da produtividade",
    "Base para ações corretivas e de promoção de saúde organizacional"
  ]
};