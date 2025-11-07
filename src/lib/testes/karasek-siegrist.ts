// Teste de Risco Psicossocial - HumaniQ Karasek-Siegrist
// Base científica: Karasek (1979), Siegrist (1996), Theorell & Karasek (1996)
// Modelos: Job Demand-Control-Support e Effort-Reward Imbalance

export interface DimensaoKarasekSiegrist {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaKarasekSiegrist[];
  pontuacaoMaxima: number;
}

export interface PerguntaKarasekSiegrist {
  id: number;
  texto: string;
  dimensao: string;
  escala: 'likert4' | 'likert5';
}

export interface ResultadoKarasekSiegrist {
  dimensoes: Record<string, {
    pontuacao: number;
    percentual: number;
    nivel: 'baixo' | 'moderado' | 'alto';
    classificacao: string;
    cor: string;
  }>;
  riscoGeral: {
    percentual: number;
    nivel: 'baixo' | 'moderado' | 'alto';
    classificacao: string;
    cor: string;
  };
  hipercomprometimento: {
    percentual: number;
    nivel: 'baixo' | 'moderado' | 'alto';
    classificacao: string;
    cor: string;
  };
}

// Escalas de resposta
export const escalaLikert4 = [
  "Nunca",
  "Raramente", 
  "Frequentemente",
  "Sempre"
];

export const escalaLikert5 = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente"
];

// Classificação dos níveis de risco
export const classificacaoRisco = {
  baixo: { min: 0, max: 39, label: "Baixo Risco", cor: "🟢" },
  moderado: { min: 40, max: 69, label: "Risco Moderado", cor: "🟡" },
  alto: { min: 70, max: 100, label: "Alto Risco", cor: "🔴" }
};

// Dimensões e perguntas do teste
export const dimensoesKarasekSiegrist: DimensaoKarasekSiegrist[] = [
  {
    id: "demanda-psicologica",
    nome: "Demanda Psicológica",
    descricao: "Avalia a carga psicológica e mental do trabalho",
    pontuacaoMaxima: 36, // 9 perguntas × 4 pontos
    perguntas: [
      { id: 1, texto: "Meu trabalho exige que eu trabalhe muito rapidamente.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 2, texto: "Meu trabalho exige que eu trabalhe intensamente.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 3, texto: "Não me pedem para fazer uma quantidade excessiva de trabalho.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 4, texto: "Tenho tempo suficiente para fazer meu trabalho.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 5, texto: "Meu trabalho não apresenta demandas conflitantes.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 6, texto: "Meu trabalho requer longos períodos de concentração intensa.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 7, texto: "Minhas tarefas são frequentemente interrompidas antes que eu possa completá-las.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 8, texto: "Meu trabalho é muito agitado.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 9, texto: "Esperar pelo trabalho de outros frequentemente diminui meu ritmo.", dimensao: "demanda-psicologica", escala: "likert4" }
    ]
  },
  {
    id: "controle-autonomia",
    nome: "Controle e Autonomia",
    descricao: "Mede o nível de controle e autonomia no trabalho",
    pontuacaoMaxima: 36, // 9 perguntas × 4 pontos
    perguntas: [
      { id: 10, texto: "Meu trabalho permite que eu tome muitas decisões por conta própria.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 11, texto: "Em meu trabalho, tenho muito pouco liberdade para decidir como fazer.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 12, texto: "Tenho muita influência sobre o que acontece em meu trabalho.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 13, texto: "Meu trabalho me permite desenvolver minhas próprias habilidades especiais.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 14, texto: "Meu trabalho requer que eu seja criativo.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 15, texto: "Meu trabalho envolve muita repetição.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 16, texto: "Meu trabalho requer um alto nível de habilidade.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 17, texto: "Posso escolher COMO fazer meu trabalho.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 18, texto: "Tenho oportunidade de aprender coisas novas em meu trabalho.", dimensao: "controle-autonomia", escala: "likert4" }
    ]
  },
  {
    id: "apoio-social",
    nome: "Apoio Social",
    descricao: "Avalia o suporte recebido de colegas e supervisores",
    pontuacaoMaxima: 40, // 10 perguntas × 4 pontos
    perguntas: [
      { id: 19, texto: "Meu supervisor se preocupa com o bem-estar de seus subordinados.", dimensao: "apoio-social", escala: "likert4" },
      { id: 20, texto: "Meu supervisor presta atenção ao que eu digo.", dimensao: "apoio-social", escala: "likert4" },
      { id: 21, texto: "Meu supervisor me ajuda a fazer o trabalho.", dimensao: "apoio-social", escala: "likert4" },
      { id: 22, texto: "Meu supervisor consegue fazer as pessoas trabalharem juntas.", dimensao: "apoio-social", escala: "likert4" },
      { id: 23, texto: "As pessoas com quem trabalho são competentes em fazer seus trabalhos.", dimensao: "apoio-social", escala: "likert4" },
      { id: 24, texto: "As pessoas com quem trabalho levam interesse pessoal em mim.", dimensao: "apoio-social", escala: "likert4" },
      { id: 25, texto: "As pessoas com quem trabalho são amigáveis.", dimensao: "apoio-social", escala: "likert4" },
      { id: 26, texto: "As pessoas com quem trabalho me ajudam a fazer o trabalho.", dimensao: "apoio-social", escala: "likert4" },
      { id: 27, texto: "As pessoas com quem trabalho facilitam a realização do trabalho.", dimensao: "apoio-social", escala: "likert4" },
      { id: 28, texto: "Posso contar com meus colegas quando as coisas ficam difíceis no trabalho.", dimensao: "apoio-social", escala: "likert4" }
    ]
  },
  {
    id: "esforco-exigido",
    nome: "Esforço Exigido",
    descricao: "Mede o esforço físico e mental demandado pelo trabalho",
    pontuacaoMaxima: 25, // 5 perguntas × 5 pontos
    perguntas: [
      { id: 29, texto: "Tenho pressão constante de tempo devido à carga pesada de trabalho.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 30, texto: "Sou frequentemente pressionado pelo tempo.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 31, texto: "Assim que levanto pela manhã, começo a pensar nos problemas do trabalho.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 32, texto: "Quando chego em casa, consigo relaxar e 'desligar' do trabalho facilmente.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 33, texto: "As pessoas próximas a mim dizem que me sacrifico demais pelo meu trabalho.", dimensao: "esforco-exigido", escala: "likert5" }
    ]
  },
  {
    id: "recompensas-recebidas",
    nome: "Recompensas Recebidas",
    descricao: "Avalia o reconhecimento, salário e perspectivas de carreira",
    pontuacaoMaxima: 55, // 11 perguntas × 5 pontos
    perguntas: [
      { id: 34, texto: "Recebo o respeito que mereço dos meus superiores.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 35, texto: "Recebo o respeito que mereço dos meus colegas de trabalho.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 36, texto: "Recebo o apoio adequado em situações difíceis.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 37, texto: "Sou tratado injustamente no trabalho.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 38, texto: "Minhas perspectivas de promoção no trabalho são pobres.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 39, texto: "Experimentei ou espero experimentar uma mudança indesejável em minha situação de trabalho.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 40, texto: "Minha segurança no emprego é pobre.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 41, texto: "Minha posição no trabalho está de acordo com minha educação e treinamento.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 42, texto: "Considerando todos os meus esforços e conquistas, meu salário/renda é adequado.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 43, texto: "Considerando todos os meus esforços e conquistas, recebo o reconhecimento e prestígio que mereço no trabalho.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 44, texto: "Considerando todos os meus esforços e conquistas, minhas chances de promoção no futuro são adequadas.", dimensao: "recompensas-recebidas", escala: "likert5" }
    ]
  },
  {
    id: "hipercomprometimento",
    nome: "Hipercomprometimento",
    descricao: "Avalia o excesso de comprometimento e envolvimento com o trabalho",
    pontuacaoMaxima: 30, // 6 perguntas × 5 pontos
    perguntas: [
      { id: 45, texto: "Fico facilmente sobrecarregado pelas pressões de tempo no trabalho.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 46, texto: "Assim que levanto pela manhã, começo a pensar nos problemas do trabalho.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 47, texto: "Quando chego em casa, consigo relaxar e 'desligar' do trabalho facilmente.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 48, texto: "As pessoas próximas a mim dizem que me sacrifico demais pelo meu trabalho.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 49, texto: "O trabalho raramente me deixa ir embora, ele ainda está na minha mente quando vou dormir.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 50, texto: "Se eu adio algo que deveria fazer hoje, fico inquieto.", dimensao: "hipercomprometimento", escala: "likert5" }
    ]
  }
];

// Função para calcular resultado do teste Karasek-Siegrist
export function calcularResultadoKarasekSiegrist(respostas: Record<number, number>): ResultadoKarasekSiegrist {
  const resultadoDimensoes: Record<string, any> = {};
  
  // Calcular pontuação por dimensão
  dimensoesKarasekSiegrist.forEach(dimensao => {
    let pontuacaoTotal = 0;
    
    dimensao.perguntas.forEach(pergunta => {
      const resposta = respostas[pergunta.id] || 1;
      
      // Ajustar pontuação para perguntas invertidas (específicas do modelo)
      let pontuacaoAjustada = resposta;
      
      // Perguntas invertidas que precisam ter a pontuação revertida
      const perguntasInvertidas = [3, 4, 5, 11, 15, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 47];
      
      if (perguntasInvertidas.includes(pergunta.id)) {
        if (pergunta.escala === 'likert4') {
          pontuacaoAjustada = 5 - resposta; // Inverte escala 1-4 para 4-1
        } else {
          pontuacaoAjustada = 6 - resposta; // Inverte escala 1-5 para 5-1
        }
      }
      
      pontuacaoTotal += pontuacaoAjustada;
    });
    
    // Calcular percentual
    const percentual = Math.round((pontuacaoTotal / dimensao.pontuacaoMaxima) * 100);
    
    // Determinar nível de risco
    let nivel: 'baixo' | 'moderado' | 'alto';
    let classificacao: string;
    let cor: string;
    
    if (percentual <= 39) {
      nivel = 'baixo';
      classificacao = 'Baixo Risco';
      cor = '🟢';
    } else if (percentual <= 69) {
      nivel = 'moderado';
      classificacao = 'Risco Moderado';
      cor = '🟡';
    } else {
      nivel = 'alto';
      classificacao = 'Alto Risco';
      cor = '🔴';
    }
    
    resultadoDimensoes[dimensao.id] = {
      pontuacao: pontuacaoTotal,
      percentual,
      nivel,
      classificacao,
      cor
    };
  });
  
  // Calcular risco psicossocial geral (média das primeiras 5 dimensões)
  const dimensoesRiscoGeral = ['demanda-psicologica', 'controle-autonomia', 'apoio-social', 'esforco-exigido', 'recompensas-recebidas'];
  const somaPercentuais = dimensoesRiscoGeral.reduce((soma, dim) => soma + resultadoDimensoes[dim].percentual, 0);
  const percentualGeral = Math.round(somaPercentuais / dimensoesRiscoGeral.length);
  
  let nivelGeral: 'baixo' | 'moderado' | 'alto';
  let classificacaoGeral: string;
  let corGeral: string;
  
  if (percentualGeral <= 39) {
    nivelGeral = 'baixo';
    classificacaoGeral = 'Baixo Risco';
    corGeral = '🟢';
  } else if (percentualGeral <= 69) {
    nivelGeral = 'moderado';
    classificacaoGeral = 'Risco Moderado';
    corGeral = '🟡';
  } else {
    nivelGeral = 'alto';
    classificacaoGeral = 'Alto Risco';
    corGeral = '🔴';
  }
  
  // Hipercomprometimento é analisado separadamente
  const hipercomprometimento = resultadoDimensoes['hipercomprometimento'];
  
  return {
    dimensoes: resultadoDimensoes,
    riscoGeral: {
      percentual: percentualGeral,
      nivel: nivelGeral,
      classificacao: classificacaoGeral,
      cor: corGeral
    },
    hipercomprometimento: {
      percentual: hipercomprometimento.percentual,
      nivel: hipercomprometimento.nivel,
      classificacao: hipercomprometimento.classificacao,
      cor: hipercomprometimento.cor
    }
  };
}

// Função para obter todas as perguntas em ordem
export function obterTodasPerguntasKS(): PerguntaKarasekSiegrist[] {
  return dimensoesKarasekSiegrist.flatMap(dimensao => dimensao.perguntas);
}

// Informações do teste
export const infoTesteKarasekSiegrist = {
  id: "karasek-siegrist",
  nome: "HumaniQ - Karasek-Siegrist",
  descricao: "Avaliação avançada de risco psicossocial baseada nos modelos científicos de Karasek e Siegrist, analisando demanda, controle, apoio social, esforço-recompensa e hipercomprometimento.",
  duracao: "25 min",
  questoes: 60,
  categoria: "Psicossocial",
  dimensoes: dimensoesKarasekSiegrist.length,
  basesCientificas: [
    "Modelo Demanda-Controle-Apoio Social (Karasek, 1979; Theorell & Karasek, 1996)",
    "Modelo Desequilíbrio Esforço-Recompensa (Siegrist, 1996)",
    "Teoria do Estresse Ocupacional (Lazarus & Folkman, 1984)",
    "Modelo de Recursos e Demandas do Trabalho (Bakker & Demerouti, 2007)"
  ],
  objetivos: [
    "Identificar fatores de risco psicossocial no ambiente de trabalho",
    "Avaliar o equilíbrio entre demandas e recursos disponíveis",
    "Medir o nível de controle e autonomia no trabalho",
    "Analisar a qualidade do apoio social recebido",
    "Detectar desequilíbrios entre esforço e recompensa",
    "Identificar sinais de hipercomprometimento"
  ],
  instrucoes: [
    "Responda com base na sua experiência atual no trabalho",
    "Considere situações típicas dos últimos 6 meses",
    "Use as escalas conforme sua percepção real",
    "Seja honesto sobre suas condições de trabalho",
    "Suas respostas são confidenciais e anônimas"
  ]
};