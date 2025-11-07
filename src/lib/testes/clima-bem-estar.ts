// HumaniQ Insight – Clima Organizacional e Bem-Estar Psicológico
// Base científica: Segurança Psicológica (Amy Edmondson, 1999), 
// Comunicação Organizacional (Clampitt, 2012), Teoria do Pertencimento (Baumeister & Leary, 1995),
// Justiça Organizacional (Greenberg, 1990)

export interface DimensaoClimaBemEstar {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaClimaBemEstar[];
}

export interface PerguntaClimaBemEstar {
  id: number;
  texto: string;
  dimensao: string;
}

export interface ResultadoClimaBemEstar {
  dimensoes: Record<string, {
    pontuacao: number;
    media: number;
    classificacao: string;
    nivel: 'problematico' | 'neutro' | 'saudavel';
    // Percentual calculado a partir da média (0-100). Campo auxiliar para gráficos.
    percentual?: number;
    // Respostas por pergunta desta dimensão, usadas para distribuição por categoria.
    // Chave é o ID da pergunta e valor é a resposta (1-5)
    perguntas?: Record<number, number>;
  }>;
  pontuacaoGeral: number;
  mediaGeral: number;
  classificacaoGeral: string;
  nivelGeral: 'problematico' | 'neutro' | 'saudavel';
}

// Escala Likert de 5 pontos
export const escalaLikertInsight = [
  "Discordo totalmente",
  "Discordo", 
  "Neutro",
  "Concordo",
  "Concordo totalmente"
];

// Classificação das médias conforme especificação
export const classificacaoMediaInsight = {
  problematico: { min: 1.0, max: 2.5, label: "Clima problemático" },
  neutro: { min: 2.6, max: 3.5, label: "Clima moderado/neutro" },
  saudavel: { min: 3.6, max: 5.0, label: "Clima positivo e saudável" }
};

// Dimensões e perguntas do teste HumaniQ Insight
export const dimensoesClimaBemEstar: DimensaoClimaBemEstar[] = [
  {
    id: "segurancaPsicologica",
    nome: "Segurança Psicológica",
    descricao: "Liberdade para se expressar sem medo de julgamento ou retaliação",
    perguntas: [
      { id: 1, texto: "Sinto-me à vontade para expressar minhas opiniões no trabalho sem medo de represálias.", dimensao: "segurancaPsicologica" },
      { id: 2, texto: "Quando cometo erros, sinto que minha equipe me apoia para aprender com eles.", dimensao: "segurancaPsicologica" },
      { id: 3, texto: "Posso compartilhar ideias novas sem receio de ser julgado negativamente.", dimensao: "segurancaPsicologica" },
      { id: 4, texto: "Me sinto seguro(a) para questionar decisões da liderança sem medo de consequências.", dimensao: "segurancaPsicologica" },
      { id: 5, texto: "Minhas preocupações são levadas a sério pela equipe e gestores.", dimensao: "segurancaPsicologica" },
      { id: 6, texto: "A cultura do meu local de trabalho incentiva o diálogo aberto.", dimensao: "segurancaPsicologica" },
      { id: 7, texto: "Sou encorajado(a) a falar sobre dificuldades emocionais ou psicológicas.", dimensao: "segurancaPsicologica" },
      { id: 8, texto: "A equipe aceita diferentes pontos de vista e opiniões divergentes.", dimensao: "segurancaPsicologica" },
      { id: 9, texto: "Sinto que posso pedir ajuda quando estou com problemas no trabalho.", dimensao: "segurancaPsicologica" },
      { id: 10, texto: "Erros são tratados como oportunidades para melhorar, não para punir.", dimensao: "segurancaPsicologica" },
      { id: 11, texto: "Sinto que minha saúde mental é respeitada e valorizada pela equipe.", dimensao: "segurancaPsicologica" },
      { id: 12, texto: "Posso falar abertamente sobre minhas limitações sem sofrer preconceito.", dimensao: "segurancaPsicologica" }
    ]
  },
  {
    id: "comunicacaoInterna",
    nome: "Comunicação Interna",
    descricao: "Clareza, abertura e fluxo de informação entre times e lideranças",
    perguntas: [
      { id: 13, texto: "As informações importantes chegam até mim de forma clara e oportuna.", dimensao: "comunicacaoInterna" },
      { id: 14, texto: "Sinto que posso comunicar meus problemas de saúde mental à liderança sem constrangimento.", dimensao: "comunicacaoInterna" },
      { id: 15, texto: "Existe transparência na comunicação sobre decisões que impactam minha função.", dimensao: "comunicacaoInterna" },
      { id: 16, texto: "Recebo feedbacks frequentes e construtivos sobre meu desempenho.", dimensao: "comunicacaoInterna" },
      { id: 17, texto: "A comunicação entre diferentes departamentos é eficiente e colaborativa.", dimensao: "comunicacaoInterna" },
      { id: 18, texto: "Tenho acesso a canais adequados para expressar minhas dúvidas e preocupações.", dimensao: "comunicacaoInterna" },
      { id: 19, texto: "Sinto que as informações compartilhadas são confiáveis.", dimensao: "comunicacaoInterna" },
      { id: 20, texto: "A liderança se comunica de forma aberta e acessível.", dimensao: "comunicacaoInterna" },
      { id: 21, texto: "Recebo suporte adequado quando informo sobre dificuldades relacionadas ao trabalho.", dimensao: "comunicacaoInterna" },
      { id: 22, texto: "As reuniões são produtivas e ajudam a esclarecer questões importantes.", dimensao: "comunicacaoInterna" },
      { id: 23, texto: "A empresa promove iniciativas que facilitam a comunicação entre colegas.", dimensao: "comunicacaoInterna" },
      { id: 24, texto: "A comunicação interna contribui para um ambiente de trabalho positivo.", dimensao: "comunicacaoInterna" }
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
    id: "justicaOrganizacional",
    nome: "Justiça Organizacional",
    descricao: "Percepção de equidade, ética, transparência e reconhecimento",
    perguntas: [
      { id: 37, texto: "As políticas da empresa são aplicadas de forma justa para todos.", dimensao: "justicaOrganizacional" },
      { id: 38, texto: "Sinto que a liderança age com integridade e transparência.", dimensao: "justicaOrganizacional" },
      { id: 39, texto: "Recebo reconhecimento adequado pelo meu trabalho e esforço.", dimensao: "justicaOrganizacional" },
      { id: 40, texto: "As decisões da empresa são comunicadas de forma clara e honesta.", dimensao: "justicaOrganizacional" },
      { id: 41, texto: "A empresa oferece oportunidades iguais para crescimento e desenvolvimento.", dimensao: "justicaOrganizacional" },
      { id: 42, texto: "Os procedimentos para resolver conflitos são justos e eficazes.", dimensao: "justicaOrganizacional" },
      { id: 43, texto: "Sinto que minhas preocupações são tratadas de forma imparcial.", dimensao: "justicaOrganizacional" },
      { id: 44, texto: "A liderança promove um ambiente de trabalho ético e respeitável.", dimensao: "justicaOrganizacional" },
      { id: 45, texto: "A empresa mantém confidencialidade em relação a assuntos pessoais e delicados.", dimensao: "justicaOrganizacional" },
      { id: 46, texto: "Sinto que as regras e políticas internas são claras e bem aplicadas.", dimensao: "justicaOrganizacional" },
      { id: 47, texto: "Recebo feedback justo sobre meu desempenho.", dimensao: "justicaOrganizacional" },
      { id: 48, texto: "A empresa promove um ambiente de trabalho transparente em todos os níveis.", dimensao: "justicaOrganizacional" }
    ]
  }
];

// Função para calcular resultado do teste
export function calcularResultadoClimaBemEstar(
  respostas: Record<number, number>
): ResultadoClimaBemEstar {
  const resultado: ResultadoClimaBemEstar = {
    dimensoes: {},
    pontuacaoGeral: 0,
    mediaGeral: 0,
    classificacaoGeral: "",
    nivelGeral: 'neutro'
  };

  let somaTotal = 0;
  let totalPerguntas = 0;

  // Calcular resultado por dimensão
  dimensoesClimaBemEstar.forEach(dimensao => {
    let somaDimensao = 0;
    let perguntasRespondidas = 0;
    const respostasPorPergunta: Record<number, number> = {};

    dimensao.perguntas.forEach(pergunta => {
      if (respostas[pergunta.id]) {
        somaDimensao += respostas[pergunta.id];
        perguntasRespondidas++;
        respostasPorPergunta[pergunta.id] = respostas[pergunta.id];
      }
    });

    if (perguntasRespondidas > 0) {
      const media = somaDimensao / perguntasRespondidas;
      const nivel = obterNivelPorMediaInsight(media);
      
      resultado.dimensoes[dimensao.id] = {
        pontuacao: somaDimensao,
        media: media,
        classificacao: obterClassificacaoPorNivel(nivel),
        nivel: nivel,
        percentual: Math.round((media / 5) * 100),
        perguntas: respostasPorPergunta
      };

      somaTotal += somaDimensao;
      totalPerguntas += perguntasRespondidas;
    }
  });

  // Calcular resultado geral
  if (totalPerguntas > 0) {
    resultado.pontuacaoGeral = somaTotal;
    resultado.mediaGeral = somaTotal / totalPerguntas;
    resultado.nivelGeral = obterNivelPorMediaInsight(resultado.mediaGeral);
    resultado.classificacaoGeral = obterClassificacaoPorNivel(resultado.nivelGeral);
  }

  return resultado;
}

// Função auxiliar para obter nível por média
function obterNivelPorMediaInsight(media: number): 'problematico' | 'neutro' | 'saudavel' {
  if (media >= 1.0 && media <= 2.5) return 'problematico';
  if (media >= 2.6 && media <= 3.5) return 'neutro';
  if (media >= 3.6 && media <= 5.0) return 'saudavel';
  return 'neutro';
}

// Função auxiliar para obter classificação por nível
function obterClassificacaoPorNivel(nivel: 'problematico' | 'neutro' | 'saudavel'): string {
  switch (nivel) {
    case 'problematico': return classificacaoMediaInsight.problematico.label;
    case 'neutro': return classificacaoMediaInsight.neutro.label;
    case 'saudavel': return classificacaoMediaInsight.saudavel.label;
    default: return classificacaoMediaInsight.neutro.label;
  }
}

// Função para obter todas as perguntas
export function obterTodasPerguntasInsight(): PerguntaClimaBemEstar[] {
  return dimensoesClimaBemEstar.flatMap(dimensao => dimensao.perguntas);
}

// Função para gerar recomendações personalizadas
export function gerarRecomendacoesInsight(resultado: ResultadoClimaBemEstar): string[] {
  const recomendacoes: string[] = [];
  const add = (r: string) => { if (!recomendacoes.includes(r)) recomendacoes.push(r); };

  // 1) Recomendações baseadas no nível geral (com foco 30–60–90 dias quando necessário)
  switch (resultado.nivelGeral) {
    case 'problematico':
      add("Nos próximos 30 dias: realizar escuta ativa com grupos focais e abrir canal confidencial para relatos");
      add("Nos próximos 60 dias: treinar lideranças em segurança psicológica e comunicação empática");
      add("Nos próximos 90 dias: definir plano de ações com metas e responsáveis, monitorando indicadores de clima");
      break;
    case 'neutro':
      add("Fortalecer iniciativas de comunicação interna e transparência com cadência quinzenal de updates");
      add("Promover atividades de integração intertimes e rituais de colaboração");
      add("Implementar práticas de reconhecimento e valorização com critérios claros e visíveis");
      break;
    case 'saudavel':
      add("Manter e documentar as boas práticas que sustentam o clima positivo");
      add("Compartilhar experiências e rituais eficazes com outras equipes/unidades");
      add("Continuar investindo no desenvolvimento da liderança e no acompanhamento de indicadores de clima");
      break;
  }

  // 2) Ordenar dimensões por prioridade: problemático > neutro > saudável e por média (mais baixa primeiro)
  const prioridadeNivel: Record<'problematico' | 'neutro' | 'saudavel', number> = {
    problematico: 0,
    neutro: 1,
    saudavel: 2
  };
  const dimensoesOrdenadas = Object.entries(resultado.dimensoes)
    .sort(([, a], [, b]) => {
      const pA = prioridadeNivel[a.nivel];
      const pB = prioridadeNivel[b.nivel];
      if (pA !== pB) return pA - pB;
      return a.media - b.media; // menor média primeiro
    });

  // 3) Catálogo de recomendações específicas por dimensão e nível
  const porDimensao: Record<string, {
    problematico: string[];
    neutro: string[];
    saudavel: string[];
  }> = {
    segurancaPsicologica: {
      problematico: [
        "Segurança Psicológica: estabelecer combinados de reunião (sem interrupções, erro como aprendizado)",
        "Segurança Psicológica: criar canal confidencial para feedbacks e relatos de incidentes",
        "Segurança Psicológica: treinar líderes em vulnerabilidade, escuta ativa e reforço positivo"
      ],
      neutro: [
        "Segurança Psicológica: incluir check-ins de bem-estar em reuniões e retrospectivas",
        "Segurança Psicológica: promover sessões de compartilhamento de aprendizados sem culpabilização"
      ],
      saudavel: [
        "Segurança Psicológica: documentar e reconhecer comportamentos que mantêm abertura e respeito",
        "Segurança Psicológica: replicar rituais eficazes em outras equipes"
      ]
    },
    comunicacaoInterna: {
      problematico: [
        "Comunicação Interna: mapear fluxos e implantar canal oficial com SLA de resposta",
        "Comunicação Interna: publicar boletins semanais com decisões e prioridades da liderança",
        "Comunicação Interna: criar guia de comunicação com padrões, canais e responsáveis"
      ],
      neutro: [
        "Comunicação Interna: padronizar feedbacks quinzenais e agendas com objetivos/decisões",
        "Comunicação Interna: integrar ferramentas (Slack/Teams/Email) e centralizar documentação"
      ],
      saudavel: [
        "Comunicação Interna: monitorar engajamento e manter cadência de comunicados",
        "Comunicação Interna: revisar trimestralmente o guia de comunicação para garantir eficácia"
      ]
    },
    pertencimento: {
      problematico: [
        "Pertencimento e Inclusão: implantar buddy program no onboarding para acelerar integração",
        "Pertencimento e Inclusão: promover eventos de conexão e grupos de afinidade (DE&I)",
        "Pertencimento e Inclusão: lançar reconhecimento entre pares (kudos) focado em colaboração"
      ],
      neutro: [
        "Pertencimento e Inclusão: criar cerimônias de integração intertimes e projetos cross-function",
        "Pertencimento e Inclusão: estabelecer ciclos mensais de reconhecimento com critérios claros"
      ],
      saudavel: [
        "Pertencimento e Inclusão: incentivar mentoria de novos colegas e manter fóruns de comunidade",
        "Pertencimento e Inclusão: manter calendário de eventos e espaços de troca"
      ]
    },
    justicaOrganizacional: {
      problematico: [
        "Justiça Organizacional: auditar remuneração, promoções e distribuição de oportunidades",
        "Justiça Organizacional: publicar critérios explícitos de decisão e criar comitê de equidade",
        "Justiça Organizacional: implantar canal formal de denúncias com acompanhamento e SLA"
      ],
      neutro: [
        "Justiça Organizacional: calibrar avaliações entre áreas e divulgar faixas salariais/trilhas",
        "Justiça Organizacional: aumentar transparência de decisões com registros e comunicados padrão"
      ],
      saudavel: [
        "Justiça Organizacional: manter revisões periódicas de políticas e realizar escutas abertas",
        "Justiça Organizacional: divulgar casos de boas práticas de equidade e reconhecimento"
      ]
    }
  };

  // 4) Gerar recomendações por dimensão conforme prioridade
  dimensoesOrdenadas.forEach(([dimId, dados]) => {
    const catalogo = porDimensao[dimId];
    if (!catalogo) return;
    const lista = catalogo[dados.nivel];
    if (dados.nivel === 'problematico') {
      // maior ênfase: até 2–3 recomendações
      add(lista[0]);
      if (lista[1]) add(lista[1]);
      if (lista[2]) add(lista[2]);
    } else if (dados.nivel === 'neutro') {
      add(lista[0]);
      if (lista[1]) add(lista[1]);
    } else {
      add(lista[0]); // saudável: 1 recomendação para manutenção
    }
  });

  // 5) Recomendações integradas quando existem múltiplas dimensões problemáticas
  const qtdProblemas = dimensoesOrdenadas.filter(([, d]) => d.nivel === 'problematico').length;
  if (qtdProblemas >= 2) {
    add("Plano integrado: criar comitê de clima (RH + lideranças) para acompanhar ações e prazos");
    add("Diagnóstico complementar: aplicar pesquisa qualitativa e grupos focais para entender causas raiz");
    add("Monitoramento: definir indicadores (ex.: eNPS, engajamento, rotatividade) e revisão mensal do plano");
  }

  // 6) Limitar e retornar
  return recomendacoes.slice(0, 10);
}

// Informações do teste para exibição
export const infoTesteClimaBemEstar = {
  id: "55fc21f9-cc10-4b4a-8765-3f5087eaf1f5", // UUID do teste no banco de dados
  nome: "HumaniQ Insight – Clima Organizacional e Bem-Estar Psicológico",
  descricao: "Avalia a percepção dos colaboradores sobre aspectos psicossociais do ambiente de trabalho que influenciam diretamente o bem-estar, a motivação e o engajamento.",
  duracao: "10-15 min",
  questoes: 48,
  categoria: "Bem-estar",
  dimensoes: dimensoesClimaBemEstar.length,
  basesCientificas: [
    "Segurança Psicológica (Amy Edmondson, 1999)",
    "Comunicação Organizacional (Clampitt, 2012)",
    "Teoria do Pertencimento (Baumeister & Leary, 1995)",
    "Justiça Organizacional (Greenberg, 1990)"
  ],
  objetivos: [
    "Avaliar o nível de segurança emocional, comunicação e confiança na organização",
    "Identificar áreas críticas e potenciais de melhoria no bem-estar psicológico",
    "Fornecer recomendações específicas por dimensão psicossocial",
    "Promover ambiente saudável e mais engajado"
  ],
  beneficios: [
    "Fortalece cultura de segurança psicológica",
    "Melhora comunicação e colaboração entre equipes",
    "Promove ambiente saudável e mais engajado",
    "Reduz conflitos e rotatividade por clima tóxico",
    "Serve de base para ações em ESG, QVT e liderança humanizada"
  ],
  instrucoes: [
    "Leia cada afirmação com atenção",
    "Responda com base na sua experiência atual na organização",
    "Use a escala de 1 a 5 conforme seu nível de concordância",
    "Seja honesto e objetivo em suas respostas",
    "Não há respostas certas ou erradas"
  ]
};