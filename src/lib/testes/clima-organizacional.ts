// Teste de Clima Organizacional - HumaniQ
// Base científica: Chiavenato (2014), Likert (1961), Bass (1990), Spector (1997), 
// Herzberg (1966), Maslow (1954), Litwin & Stringer (1968), Greenhaus & Beutell (1985), 
// Schaufeli & Bakker (2004)

export interface DimensaoClimaOrganizacional {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaClimaOrganizacional[];
}

export interface PerguntaClimaOrganizacional {
  id: number;
  texto: string;
  dimensao: string;
}

export interface ResultadoClimaOrganizacional {
  dimensoes: Record<string, {
    pontuacao: number;
    media: number;
    classificacao: string;
    nivel: 'critico' | 'ruim' | 'regular' | 'bom' | 'excelente';
  }>;
  pontuacaoGeral: number;
  mediaGeral: number;
  classificacaoGeral: string;
  nivelGeral: 'critico' | 'ruim' | 'regular' | 'bom' | 'excelente';
}

// Escala Likert de 5 pontos
export const escalaLikert = [
  "Discordo totalmente",
  "Discordo", 
  "Neutro",
  "Concordo",
  "Concordo totalmente"
];

// Classificação das médias
export const classificacaoMedia = {
  critico: { min: 1.00, max: 1.50, label: "Clima crítico" },
  ruim: { min: 1.51, max: 2.50, label: "Clima ruim" },
  regular: { min: 2.51, max: 3.50, label: "Clima regular" },
  bom: { min: 3.51, max: 4.20, label: "Clima bom" },
  excelente: { min: 4.21, max: 5.00, label: "Clima excelente" }
};

// Dimensões e perguntas do teste
export const dimensoesClimaOrganizacional: DimensaoClimaOrganizacional[] = [
  {
    id: "comunicacao",
    nome: "Comunicação",
    descricao: "Avalia a eficiência e clareza da comunicação organizacional",
    perguntas: [
      { id: 1, texto: "Recebo informações claras sobre o que é esperado de mim.", dimensao: "comunicacao" },
      { id: 2, texto: "A comunicação entre líderes e equipes é eficiente.", dimensao: "comunicacao" },
      { id: 3, texto: "Tenho acesso fácil às informações relevantes para meu trabalho.", dimensao: "comunicacao" },
      { id: 4, texto: "Existe abertura para diálogo com a liderança.", dimensao: "comunicacao" },
      { id: 5, texto: "As decisões da empresa são comunicadas com clareza.", dimensao: "comunicacao" },
      { id: 6, texto: "Sinto que sou ouvido quando expresso minha opinião.", dimensao: "comunicacao" }
    ]
  },
  {
    id: "lideranca",
    nome: "Liderança",
    descricao: "Mede a qualidade e efetividade da liderança organizacional",
    perguntas: [
      { id: 7, texto: "Minha liderança demonstra respeito pelos colaboradores.", dimensao: "lideranca" },
      { id: 8, texto: "Sinto que posso confiar na minha liderança.", dimensao: "lideranca" },
      { id: 9, texto: "Meu líder dá feedbacks construtivos regularmente.", dimensao: "lideranca" },
      { id: 10, texto: "Minha liderança motiva a equipe a alcançar bons resultados.", dimensao: "lideranca" },
      { id: 11, texto: "A gestão é justa e imparcial nas decisões.", dimensao: "lideranca" },
      { id: 12, texto: "Me sinto apoiado(a) pelos meus superiores diretos.", dimensao: "lideranca" }
    ]
  },
  {
    id: "relacionamento",
    nome: "Relacionamento Interpessoal",
    descricao: "Avalia a qualidade dos relacionamentos no ambiente de trabalho",
    perguntas: [
      { id: 13, texto: "Tenho um bom relacionamento com meus colegas.", dimensao: "relacionamento" },
      { id: 14, texto: "O ambiente de trabalho é respeitoso.", dimensao: "relacionamento" },
      { id: 15, texto: "Há espírito de cooperação entre as equipes.", dimensao: "relacionamento" },
      { id: 16, texto: "Conflitos são tratados de forma adequada.", dimensao: "relacionamento" },
      { id: 17, texto: "As pessoas se ajudam mutuamente no dia a dia.", dimensao: "relacionamento" },
      { id: 18, texto: "Me sinto à vontade para pedir ajuda aos colegas.", dimensao: "relacionamento" }
    ]
  },
  {
    id: "reconhecimento",
    nome: "Reconhecimento e Recompensas",
    descricao: "Mede a percepção sobre valorização e recompensas",
    perguntas: [
      { id: 19, texto: "Me sinto valorizado(a) pelo que entrego.", dimensao: "reconhecimento" },
      { id: 20, texto: "Recebo reconhecimento quando atinjo bons resultados.", dimensao: "reconhecimento" },
      { id: 21, texto: "Os critérios de promoção são justos e claros.", dimensao: "reconhecimento" },
      { id: 22, texto: "O sistema de recompensas é motivador.", dimensao: "reconhecimento" },
      { id: 23, texto: "Sinto que meu esforço é recompensado adequadamente.", dimensao: "reconhecimento" },
      { id: 24, texto: "O reconhecimento vai além do financeiro.", dimensao: "reconhecimento" }
    ]
  },
  {
    id: "desenvolvimento",
    nome: "Desenvolvimento Profissional",
    descricao: "Avalia oportunidades de crescimento e capacitação",
    perguntas: [
      { id: 25, texto: "Tenho oportunidades de crescimento na empresa.", dimensao: "desenvolvimento" },
      { id: 26, texto: "A empresa investe em treinamentos e capacitações.", dimensao: "desenvolvimento" },
      { id: 27, texto: "Meus talentos são percebidos pela liderança.", dimensao: "desenvolvimento" },
      { id: 28, texto: "Tenho um plano de carreira claro.", dimensao: "desenvolvimento" },
      { id: 29, texto: "Recebo apoio para me desenvolver profissionalmente.", dimensao: "desenvolvimento" },
      { id: 30, texto: "Tenho acesso a feedbacks sobre meu desempenho.", dimensao: "desenvolvimento" }
    ]
  },
  {
    id: "condicoes",
    nome: "Condições de Trabalho e Infraestrutura",
    descricao: "Mede a adequação das condições físicas e recursos de trabalho",
    perguntas: [
      { id: 31, texto: "Os equipamentos de trabalho são adequados.", dimensao: "condicoes" },
      { id: 32, texto: "Tenho as ferramentas necessárias para realizar minhas tarefas.", dimensao: "condicoes" },
      { id: 33, texto: "O ambiente físico é confortável e seguro.", dimensao: "condicoes" },
      { id: 34, texto: "A carga de trabalho é razoável.", dimensao: "condicoes" },
      { id: 35, texto: "As condições de ergonomia são respeitadas.", dimensao: "condicoes" },
      { id: 36, texto: "Os processos da empresa facilitam meu trabalho.", dimensao: "condicoes" }
    ]
  },
  {
    id: "equilibrio",
    nome: "Equilíbrio Trabalho x Vida Pessoal",
    descricao: "Avalia o equilíbrio entre demandas profissionais e pessoais",
    perguntas: [
      { id: 37, texto: "Consigo equilibrar trabalho e vida pessoal.", dimensao: "equilibrio" },
      { id: 38, texto: "A empresa respeita meus momentos de descanso.", dimensao: "equilibrio" },
      { id: 39, texto: "Minha jornada de trabalho é adequada.", dimensao: "equilibrio" },
      { id: 40, texto: "Não me sinto sobrecarregado(a) com frequência.", dimensao: "equilibrio" },
      { id: 41, texto: "Sinto que a empresa valoriza minha saúde mental.", dimensao: "equilibrio" },
      { id: 42, texto: "A flexibilidade no trabalho é incentivada.", dimensao: "equilibrio" }
    ]
  },
  {
    id: "engajamento",
    nome: "Engajamento e Pertencimento",
    descricao: "Mede o nível de engajamento e senso de pertencimento",
    perguntas: [
      { id: 43, texto: "Sinto orgulho de trabalhar aqui.", dimensao: "engajamento" },
      { id: 44, texto: "Tenho vontade de permanecer na empresa.", dimensao: "engajamento" },
      { id: 45, texto: "Me identifico com os valores da organização.", dimensao: "engajamento" },
      { id: 46, texto: "Me sinto parte importante da equipe.", dimensao: "engajamento" },
      { id: 47, texto: "Meus colegas demonstram comprometimento.", dimensao: "engajamento" },
      { id: 48, texto: "A empresa se preocupa com o bem-estar dos colaboradores.", dimensao: "engajamento" },
      { id: 49, texto: "Vejo sentido no que faço.", dimensao: "engajamento" },
      { id: 50, texto: "Tenho entusiasmo ao iniciar minhas atividades.", dimensao: "engajamento" },
      { id: 51, texto: "Estou disposto a me esforçar além do esperado.", dimensao: "engajamento" },
      { id: 52, texto: "Sinto que meu trabalho tem impacto positivo.", dimensao: "engajamento" },
      { id: 53, texto: "Sinto-me emocionalmente envolvido com a empresa.", dimensao: "engajamento" },
      { id: 54, texto: "A empresa reconhece a diversidade e inclusão.", dimensao: "engajamento" },
      { id: 55, texto: "Me sinto seguro(a) sendo quem eu sou no ambiente de trabalho.", dimensao: "engajamento" },
      { id: 56, texto: "Meus valores pessoais são respeitados aqui.", dimensao: "engajamento" }
    ]
  }
];

// Função para calcular resultado do teste
export function calcularResultadoClimaOrganizacional(
  respostas: Record<number, number>
): ResultadoClimaOrganizacional {
  const resultado: ResultadoClimaOrganizacional = {
    dimensoes: {},
    pontuacaoGeral: 0,
    mediaGeral: 0,
    classificacaoGeral: "",
    nivelGeral: "regular"
  };

  let somaTotalPontuacao = 0;
  let totalPerguntas = 0;

  // Calcular por dimensão
  dimensoesClimaOrganizacional.forEach(dimensao => {
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
function obterNivelPorMedia(media: number): 'critico' | 'ruim' | 'regular' | 'bom' | 'excelente' {
  if (media >= 4.21) return 'excelente';
  if (media >= 3.51) return 'bom';
  if (media >= 2.51) return 'regular';
  if (media >= 1.51) return 'ruim';
  return 'critico';
}

// Função para obter todas as perguntas em ordem
export function obterTodasPerguntas(): PerguntaClimaOrganizacional[] {
  return dimensoesClimaOrganizacional.flatMap(dimensao => dimensao.perguntas);
}

// Informações do teste
export const infoTesteClimaOrganizacional = {
  id: "clima-organizacional",
  nome: "Pesquisa de Clima Organizacional",
  descricao: "Avalia a percepção dos colaboradores sobre o ambiente de trabalho através de 8 dimensões fundamentais baseadas em modelos científicos validados.",
  duracao: "12-18 min",
  questoes: 56,
  categoria: "Organizacional",
  dimensoes: dimensoesClimaOrganizacional.length,
  basesCientificas: [
    "Comunicação (Chiavenato, 2014)",
    "Liderança (Likert, 1961; Bass, 1990)",
    "Relacionamento Interpessoal (Spector, 1997)",
    "Reconhecimento e Recompensas (Herzberg, 1966)",
    "Desenvolvimento Profissional (Maslow, 1954)",
    "Condições de Trabalho (Litwin & Stringer, 1968)",
    "Equilíbrio Trabalho-Vida (Greenhaus & Beutell, 1985)",
    "Engajamento (Schaufeli & Bakker, 2004)"
  ],
  objetivos: [
    "Identificar pontos fortes e oportunidades de melhoria no clima organizacional",
    "Medir a percepção dos colaboradores sobre diferentes aspectos do ambiente de trabalho",
    "Fornecer insights para ações de melhoria organizacional",
    "Acompanhar a evolução do clima ao longo do tempo"
  ],
  instrucoes: [
    "Leia cada afirmação com atenção",
    "Responda com base na sua experiência atual na organização",
    "Use a escala de 1 a 5 conforme seu nível de concordância",
    "Seja honesto e objetivo em suas respostas",
    "Não há respostas certas ou erradas"
  ]
};