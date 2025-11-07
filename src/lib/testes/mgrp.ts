// Teste HumaniQ MGRP – Maturidade em Gestão de Riscos Psicossociais
// Base científica: NR 01 (Avaliação de Riscos Psicossociais), ISO 45003, OIT
// Modelos de maturidade organizacional e gestão contínua

export interface DimensaoMGRP {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaMGRP[];
  pontuacaoMaxima: number;
}

export interface PerguntaMGRP {
  id: number;
  texto: string;
  dimensao: string;
  escala: "likert5";
}

export interface DimensaoResultadoMGRP {
  pontuacao: number;
  percentual: number;
  nivel: 'inicial' | 'em-desenvolvimento' | 'estruturado' | 'otimizado';
  classificacao: string;
  descricao: string;
}

export interface ResultadoMGRP {
  dimensoes: Record<string, DimensaoResultadoMGRP>;
  maturidadeGeral: {
    pontuacao: number;
    percentual: number;
    nivel: 'inicial' | 'em-desenvolvimento' | 'estruturado' | 'otimizado';
    classificacao: string;
  };
  recomendacoes: string[];
  interpretacao: string;
}

// Escala Likert de 5 pontos para MGRP
export const escalaLikertMGRP = [
  { valor: 1, texto: "Discordo totalmente" },
  { valor: 2, texto: "Discordo" },
  { valor: 3, texto: "Neutro" },
  { valor: 4, texto: "Concordo" },
  { valor: 5, texto: "Concordo totalmente" }
];

// Classificação dos níveis de maturidade
export const classificacaoMaturidadeMGRP = {
  inicial: { min: 0, max: 40, label: "Inicial" },
  'em-desenvolvimento': { min: 41, max: 60, label: "Em Desenvolvimento" },
  estruturado: { min: 61, max: 80, label: "Estruturado" },
  otimizado: { min: 81, max: 100, label: "Otimizado" }
};

// Dimensões e perguntas do teste MGRP
export const dimensoesMGRP: DimensaoMGRP[] = [
  {
    id: "identificacao-riscos",
    nome: "Identificação de Riscos",
    descricao: "Capacidade de identificar e mapear riscos psicossociais no ambiente de trabalho",
    pontuacaoMaxima: 35, // 7 perguntas × 5 pontos
    perguntas: [
      { id: 1, texto: "A empresa identifica sistematicamente os riscos psicossociais em suas avaliações periódicas.", dimensao: "identificacao-riscos", escala: "likert5" },
      { id: 2, texto: "Existem ferramentas estruturadas para mapear fatores de estresse no ambiente de trabalho.", dimensao: "identificacao-riscos", escala: "likert5" },
      { id: 3, texto: "Os colaboradores são consultados regularmente sobre riscos psicossociais percebidos.", dimensao: "identificacao-riscos", escala: "likert5" },
      { id: 4, texto: "A empresa possui metodologia clara para identificar situações de assédio moral ou sexual.", dimensao: "identificacao-riscos", escala: "likert5" },
      { id: 5, texto: "São realizadas pesquisas internas para avaliar o clima organizacional e saúde mental.", dimensao: "identificacao-riscos", escala: "likert5" },
      { id: 6, texto: "A organização monitora indicadores relacionados a absenteísmo e rotatividade como sinais de risco.", dimensao: "identificacao-riscos", escala: "likert5" },
      { id: 7, texto: "Existe processo formal para identificar grupos ou áreas com maior exposição a riscos psicossociais.", dimensao: "identificacao-riscos", escala: "likert5" }
    ]
  },
  {
    id: "avaliacao-impacto",
    nome: "Avaliação de Impacto",
    descricao: "Análise do impacto dos riscos psicossociais na organização e nos colaboradores",
    pontuacaoMaxima: 30, // 6 perguntas × 5 pontos
    perguntas: [
      { id: 8, texto: "A empresa avalia sistematicamente o impacto dos riscos psicossociais na produtividade.", dimensao: "avaliacao-impacto", escala: "likert5" },
      { id: 9, texto: "São mensurados os custos organizacionais relacionados a problemas de saúde mental.", dimensao: "avaliacao-impacto", escala: "likert5" },
      { id: 10, texto: "A organização analisa a correlação entre riscos psicossociais e acidentes de trabalho.", dimensao: "avaliacao-impacto", escala: "likert5" },
      { id: 11, texto: "Existe avaliação do impacto dos riscos psicossociais no engajamento dos colaboradores.", dimensao: "avaliacao-impacto", escala: "likert5" },
      { id: 12, texto: "A empresa monitora o impacto dos riscos psicossociais na qualidade dos produtos/serviços.", dimensao: "avaliacao-impacto", escala: "likert5" },
      { id: 13, texto: "São avaliados os efeitos dos riscos psicossociais na imagem e reputação organizacional.", dimensao: "avaliacao-impacto", escala: "likert5" }
    ]
  },
  {
    id: "medidas-preventivas",
    nome: "Medidas Preventivas",
    descricao: "Implementação de ações preventivas e políticas de proteção",
    pontuacaoMaxima: 40, // 8 perguntas × 5 pontos
    perguntas: [
      { id: 14, texto: "A empresa possui políticas claras e documentadas contra assédio moral e sexual.", dimensao: "medidas-preventivas", escala: "likert5" },
      { id: 15, texto: "Existem ações planejadas e estruturadas para prevenir situações de estresse ocupacional.", dimensao: "medidas-preventivas", escala: "likert5" },
      { id: 16, texto: "A organização implementa programas de promoção do bem-estar e qualidade de vida.", dimensao: "medidas-preventivas", escala: "likert5" },
      { id: 17, texto: "São oferecidos treinamentos regulares sobre prevenção de riscos psicossociais.", dimensao: "medidas-preventivas", escala: "likert5" },
      { id: 18, texto: "A empresa adota medidas para promover o equilíbrio entre vida pessoal e profissional.", dimensao: "medidas-preventivas", escala: "likert5" },
      { id: 19, texto: "Existem protocolos estabelecidos para intervenção em situações de crise psicológica.", dimensao: "medidas-preventivas", escala: "likert5" },
      { id: 20, texto: "A organização promove ambiente de trabalho psicologicamente seguro e inclusivo.", dimensao: "medidas-preventivas", escala: "likert5" },
      { id: 21, texto: "São implementadas medidas ergonômicas e organizacionais para reduzir fatores de estresse.", dimensao: "medidas-preventivas", escala: "likert5" }
    ]
  },
  {
    id: "monitoramento-controle",
    nome: "Monitoramento e Controle",
    descricao: "Sistemas de monitoramento contínuo e controle de riscos psicossociais",
    pontuacaoMaxima: 35, // 7 perguntas × 5 pontos
    perguntas: [
      { id: 22, texto: "Os casos identificados de risco psicossocial são acompanhados sistematicamente.", dimensao: "monitoramento-controle", escala: "likert5" },
      { id: 23, texto: "Existem registros formais e organizados de ocorrências e intervenções realizadas.", dimensao: "monitoramento-controle", escala: "likert5" },
      { id: 24, texto: "A empresa oferece canais de denúncia acessíveis, confidenciais e eficazes.", dimensao: "monitoramento-controle", escala: "likert5" },
      { id: 25, texto: "São realizados acompanhamentos pós-intervenção para avaliar a eficácia das medidas.", dimensao: "monitoramento-controle", escala: "likert5" },
      { id: 26, texto: "A organização possui indicadores de desempenho para gestão de riscos psicossociais.", dimensao: "monitoramento-controle", escala: "likert5" },
      { id: 27, texto: "Existe sistema de alerta precoce para identificação de situações de risco emergentes.", dimensao: "monitoramento-controle", escala: "likert5" },
      { id: 28, texto: "A comunicação sobre ações e resultados é transparente e regular para os colaboradores.", dimensao: "monitoramento-controle", escala: "likert5" }
    ]
  },
  {
    id: "cultura-organizacional",
    nome: "Cultura Organizacional",
    descricao: "Desenvolvimento de cultura organizacional voltada para saúde mental e bem-estar",
    pontuacaoMaxima: 30, // 6 perguntas × 5 pontos
    perguntas: [
      { id: 29, texto: "A liderança demonstra comprometimento visível com a saúde mental dos colaboradores.", dimensao: "cultura-organizacional", escala: "likert5" },
      { id: 30, texto: "Os valores organizacionais incluem explicitamente o cuidado com o bem-estar psicológico.", dimensao: "cultura-organizacional", escala: "likert5" },
      { id: 31, texto: "Existe cultura de abertura para discussão sobre temas relacionados à saúde mental.", dimensao: "cultura-organizacional", escala: "likert5" },
      { id: 32, texto: "A organização promove ambiente de confiança e apoio mútuo entre colaboradores.", dimensao: "cultura-organizacional", escala: "likert5" },
      { id: 33, texto: "São reconhecidas e valorizadas as iniciativas de promoção do bem-estar no trabalho.", dimensao: "cultura-organizacional", escala: "likert5" },
      { id: 34, texto: "A empresa investe consistentemente em programas de saúde mental e bem-estar.", dimensao: "cultura-organizacional", escala: "likert5" }
    ]
  },
  {
    id: "capacitacao-desenvolvimento",
    nome: "Capacitação e Desenvolvimento",
    descricao: "Programas de capacitação e desenvolvimento em gestão de riscos psicossociais",
    pontuacaoMaxima: 30, // 6 perguntas × 5 pontos
    perguntas: [
      { id: 35, texto: "Os gestores são capacitados regularmente para identificar e lidar com riscos psicossociais.", dimensao: "capacitacao-desenvolvimento", escala: "likert5" },
      { id: 36, texto: "Existe programa estruturado de desenvolvimento de competências em saúde mental.", dimensao: "capacitacao-desenvolvimento", escala: "likert5" },
      { id: 37, texto: "A organização oferece treinamentos sobre comunicação empática e escuta ativa.", dimensao: "capacitacao-desenvolvimento", escala: "likert5" },
      { id: 38, texto: "São promovidos workshops e palestras sobre prevenção de burnout e estresse.", dimensao: "capacitacao-desenvolvimento", escala: "likert5" },
      { id: 39, texto: "A empresa investe na formação de multiplicadores em saúde mental no trabalho.", dimensao: "capacitacao-desenvolvimento", escala: "likert5" },
      { id: 40, texto: "Existe programa de desenvolvimento de lideranças com foco em bem-estar da equipe.", dimensao: "capacitacao-desenvolvimento", escala: "likert5" }
    ]
  }
];

// Função para calcular resultado do teste MGRP
export function calcularResultadoMGRP(respostas: Record<number, number>): ResultadoMGRP {
  const resultadoDimensoes: Record<string, DimensaoResultadoMGRP> = {};
  let pontuacaoTotal = 0;
  let pontuacaoMaximaTotal = 0;

  // Calcular resultado por dimensão
  dimensoesMGRP.forEach(dimensao => {
    let pontuacaoDimensao = 0;
    
    dimensao.perguntas.forEach(pergunta => {
      const resposta = respostas[pergunta.id];
      if (resposta !== undefined) {
        pontuacaoDimensao += resposta;
      }
    });
    
    const percentual = Math.round((pontuacaoDimensao / dimensao.pontuacaoMaxima) * 100);
    const nivel = obterNivelMaturidade(percentual);
    
    resultadoDimensoes[dimensao.id] = {
      pontuacao: pontuacaoDimensao,
      percentual,
      nivel,
      classificacao: classificacaoMaturidadeMGRP[nivel].label,
      descricao: dimensao.descricao
    };

    pontuacaoTotal += pontuacaoDimensao;
    pontuacaoMaximaTotal += dimensao.pontuacaoMaxima;
  });

  // Calcular resultado geral
  const percentualGeral = Math.round((pontuacaoTotal / pontuacaoMaximaTotal) * 100);
  const nivelGeral = obterNivelMaturidade(percentualGeral);

  return {
    dimensoes: resultadoDimensoes,
    maturidadeGeral: {
      pontuacao: pontuacaoTotal,
      percentual: percentualGeral,
      nivel: nivelGeral,
      classificacao: classificacaoMaturidadeMGRP[nivelGeral].label
    },
    recomendacoes: gerarRecomendacoesMGRP(resultadoDimensoes, nivelGeral),
    interpretacao: gerarInterpretacaoMGRP(nivelGeral, percentualGeral)
  };
}

// Função para determinar nível de maturidade baseado no percentual
function obterNivelMaturidade(percentual: number): 'inicial' | 'em-desenvolvimento' | 'estruturado' | 'otimizado' {
  if (percentual <= 40) return 'inicial';
  if (percentual <= 60) return 'em-desenvolvimento';
  if (percentual <= 80) return 'estruturado';
  return 'otimizado';
}

// Função para gerar recomendações baseadas no resultado
function gerarRecomendacoesMGRP(
  dimensoes: Record<string, DimensaoResultadoMGRP>, 
  nivelGeral: 'inicial' | 'em-desenvolvimento' | 'estruturado' | 'otimizado'
): string[] {
  const recomendacoes: string[] = [];

  // Recomendações baseadas no nível geral
  switch (nivelGeral) {
    case 'inicial':
      recomendacoes.push(
        "Estabeleça uma política formal de gestão de riscos psicossociais",
        "Implemente processos básicos de identificação e avaliação de riscos",
        "Desenvolva programas de conscientização sobre saúde mental no trabalho"
      );
      break;
    case 'em-desenvolvimento':
      recomendacoes.push(
        "Fortaleça os processos de monitoramento e controle existentes",
        "Implemente indicadores de desempenho para gestão de riscos psicossociais",
        "Desenvolva programas de capacitação para lideranças"
      );
      break;
    case 'estruturado':
      recomendacoes.push(
        "Implemente processos de melhoria contínua baseados em dados",
        "Desenvolva programas avançados de promoção do bem-estar",
        "Estabeleça parcerias estratégicas para inovação em saúde ocupacional"
      );
      break;
    case 'otimizado':
      recomendacoes.push(
        "Mantenha a excelência através de revisões periódicas dos processos",
        "Compartilhe boas práticas com outras organizações do setor",
        "Torne-se referência em gestão de riscos psicossociais"
      );
      break;
  }

  // Recomendações específicas para dimensões com baixa maturidade
  Object.entries(dimensoes).forEach(([chave, dimensao]) => {
    if (dimensao.percentual < 50) {
      switch (chave) {
        case 'identificacao-riscos':
          recomendacoes.push("Desenvolva ferramentas sistemáticas para identificação de riscos psicossociais");
          break;
        case 'avaliacao-impacto':
          recomendacoes.push("Implemente metodologias estruturadas para avaliação de impacto dos riscos");
          break;
        case 'medidas-preventivas':
          recomendacoes.push("Estabeleça programas abrangentes de prevenção de riscos psicossociais");
          break;
        case 'monitoramento-controle':
          recomendacoes.push("Crie sistemas de monitoramento contínuo e controle de riscos");
          break;
        case 'cultura-organizacional':
          recomendacoes.push("Fortaleça a cultura organizacional voltada para saúde mental e bem-estar");
          break;
        case 'capacitacao-desenvolvimento':
          recomendacoes.push("Invista em programas de capacitação e desenvolvimento em gestão de riscos");
          break;
      }
    }
  });

  return recomendacoes.slice(0, 8);
}

// Função para gerar interpretação do resultado
function gerarInterpretacaoMGRP(
  nivel: 'inicial' | 'em-desenvolvimento' | 'estruturado' | 'otimizado',
  percentual: number
): string {
  let interpretacao = `Sua organização apresenta nível de maturidade "${nivel.replace('-', ' ')}" na gestão de riscos psicossociais, com ${percentual}% de desenvolvimento. `;
  
  switch (nivel) {
    case 'inicial':
      interpretacao += "A organização está nos estágios iniciais da gestão de riscos psicossociais. É fundamental estabelecer bases sólidas e processos estruturados para evoluir na maturidade.";
      break;
    case 'em-desenvolvimento':
      interpretacao += "A organização demonstra progresso na implementação de práticas de gestão de riscos psicossociais, mas ainda há oportunidades significativas de melhoria.";
      break;
    case 'estruturado':
      interpretacao += "A organização possui processos bem definidos e estruturados para gestão de riscos psicossociais, com práticas consistentes e resultados mensuráveis.";
      break;
    case 'otimizado':
      interpretacao += "A organização demonstra excelência na gestão de riscos psicossociais, com processos maduros, cultura preventiva consolidada e melhoria contínua.";
      break;
  }
  
  return interpretacao;
}

// Função para obter todas as perguntas em ordem
export function obterTodasPerguntasMGRP(): PerguntaMGRP[] {
  return dimensoesMGRP.flatMap(dimensao => dimensao.perguntas);
}

// Informações do teste
export const infoTesteMGRP = {
  id: "maturidade-gestao-riscos",
  nome: "HumaniQ MGRP - Maturidade em Gestão de Riscos Psicossociais",
  categoria: "Gestão de Riscos",
  descricao: "Avalia o grau de maturidade da organização na gestão de riscos psicossociais, com foco em prevenção, conformidade legal e cultura organizacional.",
  duracao: "15-20 minutos",
  questoes: 40,
  totalPerguntas: 40,
  dimensoes: 6,
  baseCientifica: "NR 01, ISO 45003, OIT e modelos de maturidade organizacional",
  versao: "1.0"
};