// HumaniQ Insight – Clima Organizacional e Bem-Estar Psicológico
// Base científica: Segurança Psicológica (Amy Edmondson, 1999), Comunicação Organizacional (Clampitt, 2012),
// Teoria do Pertencimento (Baumeister & Leary, 1995), Justiça Organizacional (Greenberg, 1990)

export interface PerguntaHumaniQInsight {
  id: number;
  texto: string;
  dimensao: string;
}

export interface DimensaoHumaniQInsight {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaHumaniQInsight[];
}

export interface ResultadoDimensao {
  pontuacao: number;
  media: number;
  classificacao: string;
  nivel: 'problematico' | 'moderado' | 'saudavel';
}

export interface ResultadoHumaniQInsight {
  dimensoes: Record<string, ResultadoDimensao>;
  pontuacaoGeral: number;
  mediaGeral: number;
  classificacaoGeral: string;
  nivelGeral: 'problematico' | 'moderado' | 'saudavel';
}

// Dimensões do teste com as 48 perguntas
export const dimensoesHumaniQInsight: DimensaoHumaniQInsight[] = [
  {
    id: "seguranca-psicologica",
    nome: "Segurança Psicológica",
    descricao: "Liberdade para se expressar sem medo de julgamento ou retaliação",
    perguntas: [
      { id: 1, texto: "Sinto-me à vontade para expressar minhas opiniões no trabalho sem medo de represálias.", dimensao: "seguranca-psicologica" },
      { id: 2, texto: "Quando cometo erros, sinto que minha equipe me apoia para aprender com eles.", dimensao: "seguranca-psicologica" },
      { id: 3, texto: "Posso compartilhar ideias novas sem receio de ser julgado negativamente.", dimensao: "seguranca-psicologica" },
      { id: 4, texto: "Me sinto seguro(a) para questionar decisões da liderança sem medo de consequências.", dimensao: "seguranca-psicologica" },
      { id: 5, texto: "Minhas preocupações são levadas a sério pela equipe e gestores.", dimensao: "seguranca-psicologica" },
      { id: 6, texto: "A cultura do meu local de trabalho incentiva o diálogo aberto.", dimensao: "seguranca-psicologica" },
      { id: 7, texto: "Sou encorajado(a) a falar sobre dificuldades emocionais ou psicológicas.", dimensao: "seguranca-psicologica" },
      { id: 8, texto: "A equipe aceita diferentes pontos de vista e opiniões divergentes.", dimensao: "seguranca-psicologica" },
      { id: 9, texto: "Sinto que posso pedir ajuda quando estou com problemas no trabalho.", dimensao: "seguranca-psicologica" },
      { id: 10, texto: "Erros são tratados como oportunidades para melhorar, não para punir.", dimensao: "seguranca-psicologica" },
      { id: 11, texto: "Sinto que minha saúde mental é respeitada e valorizada pela equipe.", dimensao: "seguranca-psicologica" },
      { id: 12, texto: "Posso falar abertamente sobre minhas limitações sem sofrer preconceito.", dimensao: "seguranca-psicologica" }
    ]
  },
  {
    id: "comunicacao-interna",
    nome: "Comunicação Interna",
    descricao: "Clareza, abertura e fluxo de informação entre times e lideranças",
    perguntas: [
      { id: 13, texto: "As informações importantes chegam até mim de forma clara e oportuna.", dimensao: "comunicacao-interna" },
      { id: 14, texto: "Sinto que posso comunicar meus problemas de saúde mental à liderança sem constrangimento.", dimensao: "comunicacao-interna" },
      { id: 15, texto: "Existe transparência na comunicação sobre decisões que impactam minha função.", dimensao: "comunicacao-interna" },
      { id: 16, texto: "Recebo feedbacks frequentes e construtivos sobre meu desempenho.", dimensao: "comunicacao-interna" },
      { id: 17, texto: "A comunicação entre diferentes departamentos é eficiente e colaborativa.", dimensao: "comunicacao-interna" },
      { id: 18, texto: "Tenho acesso a canais adequados para expressar minhas dúvidas e preocupações.", dimensao: "comunicacao-interna" },
      { id: 19, texto: "Sinto que as informações compartilhadas são confiáveis e coerentes.", dimensao: "comunicacao-interna" },
      { id: 20, texto: "A liderança se comunica de forma aberta e acessível.", dimensao: "comunicacao-interna" },
      { id: 21, texto: "Recebo suporte adequado quando informo sobre dificuldades relacionadas ao trabalho.", dimensao: "comunicacao-interna" },
      { id: 22, texto: "As reuniões são produtivas e ajudam a esclarecer questões importantes.", dimensao: "comunicacao-interna" },
      { id: 23, texto: "A empresa promove iniciativas que facilitam a comunicação entre colegas.", dimensao: "comunicacao-interna" },
      { id: 24, texto: "A comunicação interna contribui para um ambiente de trabalho positivo.", dimensao: "comunicacao-interna" }
    ]
  },
  {
    id: "pertencimento",
    nome: "Pertencimento e Inclusão",
    descricao: "Sentimento de ser aceito, valorizado e integrado à equipe",
    perguntas: [
      { id: 25, texto: "Sinto que faço parte de uma equipe que valoriza minha contribuição.", dimensao: "pertencimento" },
      { id: 26, texto: "Me sinto conectado(a) com os valores e a missão da empresa.", dimensao: "pertencimento" },
      { id: 27, texto: "Minha equipe me inclui nas decisões que afetam nosso trabalho.", dimensao: "pertencimento" },
      { id: 28, texto: "Tenho boas relações interpessoais com meus colegas de trabalho.", dimensao: "pertencimento" },
      { id: 29, texto: "Sinto que sou aceito(a) como sou no ambiente de trabalho.", dimensao: "pertencimento" },
      { id: 30, texto: "Posso contar com meus colegas em momentos de dificuldade.", dimensao: "pertencimento" },
      { id: 31, texto: "Sinto orgulho de trabalhar nesta empresa.", dimensao: "pertencimento" },
      { id: 32, texto: "A empresa valoriza a diversidade e respeita as diferenças individuais.", dimensao: "pertencimento" },
      { id: 33, texto: "Participo ativamente das atividades e eventos da equipe ou empresa.", dimensao: "pertencimento" },
      { id: 34, texto: "Sinto que faço parte de algo maior do que meu trabalho individual.", dimensao: "pertencimento" },
      { id: 35, texto: "A cultura da empresa promove a colaboração e o apoio mútuo.", dimensao: "pertencimento" },
      { id: 36, texto: "Sinto-me valorizado(a) como membro da equipe.", dimensao: "pertencimento" }
    ]
  },
  {
    id: "justica-organizacional",
    nome: "Justiça Organizacional",
    descricao: "Percepção de equidade, ética, transparência e reconhecimento",
    perguntas: [
      { id: 37, texto: "As políticas da empresa são aplicadas de forma justa para todos.", dimensao: "justica-organizacional" },
      { id: 38, texto: "Sinto que a liderança age com integridade e transparência.", dimensao: "justica-organizacional" },
      { id: 39, texto: "Recebo reconhecimento adequado pelo meu trabalho e esforço.", dimensao: "justica-organizacional" },
      { id: 40, texto: "As decisões da empresa são comunicadas de forma clara e honesta.", dimensao: "justica-organizacional" },
      { id: 41, texto: "A empresa oferece oportunidades iguais para crescimento e desenvolvimento.", dimensao: "justica-organizacional" },
      { id: 42, texto: "Os procedimentos para resolver conflitos são justos e eficazes.", dimensao: "justica-organizacional" },
      { id: 43, texto: "Sinto que minhas preocupações são tratadas de forma imparcial.", dimensao: "justica-organizacional" },
      { id: 44, texto: "A liderança promove um ambiente de trabalho ético e respeitável.", dimensao: "justica-organizacional" },
      { id: 45, texto: "A empresa mantém confidencialidade em relação a assuntos pessoais e delicados.", dimensao: "justica-organizacional" },
      { id: 46, texto: "Sinto que as regras e políticas internas são claras e bem aplicadas.", dimensao: "justica-organizacional" },
      { id: 47, texto: "Recebo feedback justo sobre meu desempenho.", dimensao: "justica-organizacional" },
      { id: 48, texto: "A empresa promove um ambiente de trabalho transparente em todos os níveis.", dimensao: "justica-organizacional" }
    ]
  }
];

// Mapeamento de classificações
export const classificacaoMedia = {
  problematico: {
    label: "Clima Problemático",
    cor: "text-red-600",
    bgCor: "bg-red-100",
    descricao: "Ambiente de trabalho com sérios desafios que requerem atenção imediata"
  },
  moderado: {
    label: "Clima Moderado/Neutro",
    cor: "text-yellow-600",
    bgCor: "bg-yellow-100",
    descricao: "Ambiente de trabalho com pontos de melhoria e oportunidades de desenvolvimento"
  },
  saudavel: {
    label: "Clima Positivo e Saudável",
    cor: "text-green-600",
    bgCor: "bg-green-100",
    descricao: "Ambiente de trabalho saudável e propício ao bem-estar e engajamento"
  }
};

// Função para calcular resultado do teste
export function calcularResultadoHumaniQInsight(
  respostas: Record<number, number>
): ResultadoHumaniQInsight {
  const resultado: ResultadoHumaniQInsight = {
    dimensoes: {},
    pontuacaoGeral: 0,
    mediaGeral: 0,
    classificacaoGeral: "",
    nivelGeral: "moderado"
  };

  let somaTotalPontuacao = 0;
  let totalPerguntas = 0;

  // Calcular por dimensão
  dimensoesHumaniQInsight.forEach(dimensao => {
    const perguntasDimensao = dimensao.perguntas;
    let somaPontuacao = 0;
    let countPerguntas = 0;

    perguntasDimensao.forEach(pergunta => {
      if (respostas[pergunta.id]) {
        somaPontuacao += respostas[pergunta.id];
        countPerguntas++;
      }
    });

    if (countPerguntas > 0) {
      const media = somaPontuacao / countPerguntas;
      const nivel = obterNivelPorMedia(media);
      
      resultado.dimensoes[dimensao.id] = {
        pontuacao: somaPontuacao,
        media: Number(media.toFixed(2)),
        classificacao: classificacaoMedia[nivel].label,
        nivel
      };

      somaTotalPontuacao += somaPontuacao;
      totalPerguntas += countPerguntas;
    }
  });

  // Calcular resultado geral
  if (totalPerguntas > 0) {
    resultado.pontuacaoGeral = somaTotalPontuacao;
    resultado.mediaGeral = Number((somaTotalPontuacao / totalPerguntas).toFixed(2));
    resultado.nivelGeral = obterNivelPorMedia(resultado.mediaGeral);
    resultado.classificacaoGeral = classificacaoMedia[resultado.nivelGeral].label;
  }

  return resultado;
}

// Função auxiliar para obter nível por média
function obterNivelPorMedia(media: number): 'problematico' | 'moderado' | 'saudavel' {
  if (media >= 3.6) return 'saudavel';
  if (media >= 2.6) return 'moderado';
  return 'problematico';
}

// Função para obter todas as perguntas em ordem
export function obterTodasPerguntasHumaniQInsight(): PerguntaHumaniQInsight[] {
  return dimensoesHumaniQInsight.flatMap(dimensao => dimensao.perguntas);
}

// Informações do teste
export const infoTesteHumaniQInsight = {
  id: "humaniq-insight",
  nome: "HumaniQ Insight",
  nomeCompleto: "HumaniQ Insight – Clima Organizacional e Bem-Estar Psicológico",
  descricao: "Avalia a percepção dos colaboradores sobre aspectos psicossociais do ambiente de trabalho que influenciam diretamente o bem-estar, a motivação e o engajamento, com foco especial em segurança psicológica, pertencimento e justiça.",
  duracao: "15-20 min",
  questoes: 48,
  categoria: "Clima e Cultura",
  dimensoes: dimensoesHumaniQInsight.length,
  basesCientificas: [
    "Segurança Psicológica (Amy Edmondson, 1999)",
    "Comunicação Organizacional (Clampitt, 2012)",
    "Teoria do Pertencimento (Baumeister & Leary, 1995)",
    "Justiça Organizacional (Greenberg, 1990)"
  ],
  instrucoes: [
    "Leia cada afirmação com atenção",
    "Responda com base na sua percepção atual do ambiente de trabalho",
    "Use a escala de 1 (Discordo totalmente) a 5 (Concordo totalmente)",
    "Seja honesto e objetivo em suas respostas",
    "Não há respostas certas ou erradas"
  ],
  beneficios: [
    "Fortalece cultura de segurança psicológica",
    "Melhora comunicação e colaboração entre equipes",
    "Promove ambiente saudável e mais engajado",
    "Reduz conflitos e rotatividade por clima tóxico",
    "Serve de base para ações em ESG, QVT e liderança humanizada"
  ]
};
