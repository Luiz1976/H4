// Teste de Riscos Psicossociais Ocupacionais - HumaniQ RPO
// Base científica: Modelo de Demandas-Controle-Apoio Social (Karasek & Theorell),
// Modelo de Desequilíbrio Esforço-Recompensa (Siegrist),
// Diretrizes da OIT sobre Fatores Psicossociais no Trabalho,
// ISO 45003 - Gestão de Saúde e Segurança Ocupacional - Riscos Psicossociais

export interface DimensaoRPO {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaRPO[];
}

export interface PerguntaRPO {
  id: number;
  texto: string;
  dimensao: string;
}

export interface ResultadoRPO {
  dimensoes: Record<string, {
    pontuacao: number;
    media: number;
    classificacao: string;
    nivel: 'baixo' | 'medio' | 'alto';
  }>;
  indiceGeralRisco: number;
  classificacaoGeral: string;
  nivelGeral: 'baixo' | 'moderado' | 'alto' | 'critico';
  recomendacoes: string[];
}

// Escala Likert de 5 pontos
export const escalaLikert = [
  "Nunca",
  "Raramente", 
  "Às vezes",
  "Frequentemente",
  "Sempre"
];

// Classificação do Índice Geral de Risco Psicossocial
export const classificacaoRisco = {
  baixo: { min: 1.0, max: 2.0, label: "Baixo risco" },
  moderado: { min: 2.1, max: 3.0, label: "Risco moderado" },
  alto: { min: 3.1, max: 4.0, label: "Alto risco" },
  critico: { min: 4.1, max: 5.0, label: "Risco crítico" }
};

// Dimensões e perguntas do teste RPO
export const dimensoesRPO: DimensaoRPO[] = [
  {
    id: "demandas_trabalho",
    nome: "Demandas do Trabalho",
    descricao: "Pressão temporal, carga de trabalho, complexidade das tarefas e exigências cognitivas",
    perguntas: [
      { id: 1, texto: "Tenho que trabalhar muito rapidamente para cumprir os prazos.", dimensao: "demandas_trabalho" },
      { id: 2, texto: "Meu trabalho exige que eu trabalhe muito intensamente.", dimensao: "demandas_trabalho" },
      { id: 3, texto: "Não tenho tempo suficiente para fazer meu trabalho.", dimensao: "demandas_trabalho" },
      { id: 4, texto: "Meu trabalho tem demandas conflitantes ou discordantes.", dimensao: "demandas_trabalho" },
      { id: 5, texto: "Meu trabalho requer atenção constante.", dimensao: "demandas_trabalho" },
      { id: 6, texto: "Sou interrompido frequentemente durante meu trabalho.", dimensao: "demandas_trabalho" },
      { id: 7, texto: "Meu trabalho requer que eu me concentre por longos períodos.", dimensao: "demandas_trabalho" },
      { id: 8, texto: "Minha carga de trabalho é imprevisível.", dimensao: "demandas_trabalho" },
      { id: 9, texto: "Tenho que fazer várias tarefas ao mesmo tempo.", dimensao: "demandas_trabalho" },
      { id: 10, texto: "Meu trabalho envolve tarefas muito complexas.", dimensao: "demandas_trabalho" },
      { id: 11, texto: "Preciso trabalhar horas extras para completar minhas tarefas.", dimensao: "demandas_trabalho" },
      { id: 12, texto: "Meu trabalho me exige física e mentalmente.", dimensao: "demandas_trabalho" }
    ]
  },
  {
    id: "autonomia_controle",
    nome: "Autonomia e Controle",
    descricao: "Capacidade de tomar decisões, influenciar o trabalho e usar habilidades criativas",
    perguntas: [
      { id: 13, texto: "Meu trabalho me permite tomar decisões por conta própria.", dimensao: "autonomia_controle" },
      { id: 14, texto: "Tenho muito pouco a dizer sobre o que acontece no meu trabalho.", dimensao: "autonomia_controle" },
      { id: 15, texto: "Tenho liberdade para decidir como fazer meu trabalho.", dimensao: "autonomia_controle" },
      { id: 16, texto: "Posso escolher quando fazer pausas durante o trabalho.", dimensao: "autonomia_controle" },
      { id: 17, texto: "Tenho influência sobre como meu trabalho é organizado.", dimensao: "autonomia_controle" },
      { id: 18, texto: "Posso desenvolver minhas próprias habilidades no trabalho.", dimensao: "autonomia_controle" },
      { id: 19, texto: "Meu trabalho me permite ser criativo.", dimensao: "autonomia_controle" },
      { id: 20, texto: "Tenho oportunidade de aprender coisas novas no trabalho.", dimensao: "autonomia_controle" },
      { id: 21, texto: "Posso definir meu próprio ritmo de trabalho.", dimensao: "autonomia_controle" },
      { id: 22, texto: "Tenho controle sobre a qualidade do meu trabalho.", dimensao: "autonomia_controle" },
      { id: 23, texto: "Posso influenciar as decisões que afetam meu trabalho.", dimensao: "autonomia_controle" },
      { id: 24, texto: "Meu trabalho me permite usar minhas habilidades ao máximo.", dimensao: "autonomia_controle" }
    ]
  },
  {
    id: "apoio_social",
    nome: "Apoio Social",
    descricao: "Suporte dos colegas, supervisores e qualidade dos relacionamentos no trabalho",
    perguntas: [
      { id: 25, texto: "Meus colegas de trabalho são amigáveis.", dimensao: "apoio_social" },
      { id: 26, texto: "Meus colegas me ajudam a realizar o trabalho.", dimensao: "apoio_social" },
      { id: 27, texto: "Meu supervisor se preocupa com o bem-estar dos subordinados.", dimensao: "apoio_social" },
      { id: 28, texto: "Meu supervisor presta atenção ao que eu digo.", dimensao: "apoio_social" },
      { id: 29, texto: "Meu supervisor me ajuda a realizar o trabalho.", dimensao: "apoio_social" },
      { id: 30, texto: "É fácil conversar com meus colegas de trabalho.", dimensao: "apoio_social" },
      { id: 31, texto: "Posso contar com meus colegas quando tenho problemas no trabalho.", dimensao: "apoio_social" },
      { id: 32, texto: "Meu supervisor é bem-sucedido em fazer as pessoas trabalharem juntas.", dimensao: "apoio_social" },
      { id: 33, texto: "Recebo feedback construtivo sobre meu desempenho.", dimensao: "apoio_social" },
      { id: 34, texto: "Sinto que faço parte de uma equipe no trabalho.", dimensao: "apoio_social" },
      { id: 35, texto: "Há um bom espírito de equipe no meu local de trabalho.", dimensao: "apoio_social" },
      { id: 36, texto: "Posso discutir problemas de trabalho com meu supervisor.", dimensao: "apoio_social" }
    ]
  },
  {
    id: "reconhecimento",
    nome: "Reconhecimento e Recompensas",
    descricao: "Valorização do trabalho, feedback positivo, oportunidades de crescimento e recompensas justas",
    perguntas: [
      { id: 37, texto: "Recebo o reconhecimento que mereço pelo meu trabalho.", dimensao: "reconhecimento" },
      { id: 38, texto: "Meu trabalho é valorizado pela organização.", dimensao: "reconhecimento" },
      { id: 39, texto: "Recebo feedback positivo quando faço um bom trabalho.", dimensao: "reconhecimento" },
      { id: 40, texto: "Minhas contribuições são reconhecidas pelos superiores.", dimensao: "reconhecimento" },
      { id: 41, texto: "Tenho oportunidades de promoção no meu trabalho.", dimensao: "reconhecimento" },
      { id: 42, texto: "Meu salário é justo pelo trabalho que realizo.", dimensao: "reconhecimento" },
      { id: 43, texto: "Recebo recompensas adequadas pelo meu esforço.", dimensao: "reconhecimento" },
      { id: 44, texto: "Meu trabalho oferece boas perspectivas de carreira.", dimensao: "reconhecimento" },
      { id: 45, texto: "Sinto que meu trabalho é importante para a organização.", dimensao: "reconhecimento" },
      { id: 46, texto: "Recebo elogios quando faço um trabalho bem feito.", dimensao: "reconhecimento" },
      { id: 47, texto: "Meus esforços são recompensados de forma justa.", dimensao: "reconhecimento" },
      { id: 48, texto: "Tenho oportunidades de desenvolvimento profissional.", dimensao: "reconhecimento" }
    ]
  },
  {
    id: "seguranca_emprego",
    nome: "Segurança no Emprego",
    descricao: "Estabilidade, previsibilidade e segurança na continuidade do trabalho",
    perguntas: [
      { id: 49, texto: "Meu trabalho oferece boa segurança no emprego.", dimensao: "seguranca_emprego" },
      { id: 50, texto: "Tenho medo de perder meu emprego.", dimensao: "seguranca_emprego" },
      { id: 51, texto: "Meu emprego é estável e seguro.", dimensao: "seguranca_emprego" },
      { id: 52, texto: "Preocupo-me com mudanças indesejadas no meu trabalho.", dimensao: "seguranca_emprego" },
      { id: 53, texto: "Minha posição no trabalho é segura.", dimensao: "seguranca_emprego" },
      { id: 54, texto: "Tenho certeza de que terei trabalho no próximo ano.", dimensao: "seguranca_emprego" },
      { id: 55, texto: "Sinto-me inseguro sobre o futuro do meu emprego.", dimensao: "seguranca_emprego" },
      { id: 56, texto: "Meu trabalho tem perspectivas de longo prazo.", dimensao: "seguranca_emprego" },
      { id: 57, texto: "Preocupo-me com a possibilidade de demissão.", dimensao: "seguranca_emprego" },
      { id: 58, texto: "Confio na estabilidade da minha empresa.", dimensao: "seguranca_emprego" },
      { id: 59, texto: "Meu contrato de trabalho me oferece segurança.", dimensao: "seguranca_emprego" },
      { id: 60, texto: "Sinto que meu emprego está ameaçado.", dimensao: "seguranca_emprego" }
    ]
  },
  {
    id: "ambiente_fisico",
    nome: "Ambiente Físico e Recursos",
    descricao: "Condições físicas do trabalho, recursos disponíveis e ergonomia do ambiente",
    perguntas: [
      { id: 61, texto: "Meu local de trabalho tem boa iluminação.", dimensao: "ambiente_fisico" },
      { id: 62, texto: "O nível de ruído no meu trabalho é aceitável.", dimensao: "ambiente_fisico" },
      { id: 63, texto: "A temperatura no meu local de trabalho é confortável.", dimensao: "ambiente_fisico" },
      { id: 64, texto: "Tenho espaço suficiente para trabalhar confortavelmente.", dimensao: "ambiente_fisico" },
      { id: 65, texto: "Meu local de trabalho é ergonomicamente adequado.", dimensao: "ambiente_fisico" },
      { id: 66, texto: "Tenho acesso aos equipamentos necessários para meu trabalho.", dimensao: "ambiente_fisico" },
      { id: 67, texto: "Os recursos tecnológicos disponíveis são adequados.", dimensao: "ambiente_fisico" },
      { id: 68, texto: "Meu ambiente de trabalho é seguro.", dimensao: "ambiente_fisico" },
      { id: 69, texto: "A qualidade do ar no meu local de trabalho é boa.", dimensao: "ambiente_fisico" },
      { id: 70, texto: "Tenho privacidade suficiente no meu local de trabalho.", dimensao: "ambiente_fisico" },
      { id: 71, texto: "Os móveis do meu local de trabalho são confortáveis.", dimensao: "ambiente_fisico" },
      { id: 72, texto: "Meu ambiente de trabalho é limpo e organizado.", dimensao: "ambiente_fisico" }
    ]
  },
  {
    id: "conflito_trabalho_familia",
    nome: "Conflito Trabalho-Família",
    descricao: "Equilíbrio entre demandas profissionais e vida pessoal/familiar",
    perguntas: [
      { id: 73, texto: "Meu trabalho interfere na minha vida familiar.", dimensao: "conflito_trabalho_familia" },
      { id: 74, texto: "Tenho dificuldade em equilibrar trabalho e vida pessoal.", dimensao: "conflito_trabalho_familia" },
      { id: 75, texto: "Meu horário de trabalho é flexível.", dimensao: "conflito_trabalho_familia" },
      { id: 76, texto: "Posso cuidar de assuntos pessoais durante o horário de trabalho quando necessário.", dimensao: "conflito_trabalho_familia" },
      { id: 77, texto: "Meu trabalho me impede de passar tempo com minha família.", dimensao: "conflito_trabalho_familia" },
      { id: 78, texto: "Consigo desligar do trabalho quando estou em casa.", dimensao: "conflito_trabalho_familia" },
      { id: 79, texto: "Meu trabalho causa tensão na minha vida familiar.", dimensao: "conflito_trabalho_familia" },
      { id: 80, texto: "Tenho tempo suficiente para atividades pessoais.", dimensao: "conflito_trabalho_familia" },
      { id: 81, texto: "Meu empregador compreende quando tenho responsabilidades familiares.", dimensao: "conflito_trabalho_familia" },
      { id: 82, texto: "Sinto-me culpado por não dedicar mais tempo à família devido ao trabalho.", dimensao: "conflito_trabalho_familia" },
      { id: 83, texto: "Meu trabalho permite que eu mantenha um bom equilíbrio vida-trabalho.", dimensao: "conflito_trabalho_familia" },
      { id: 84, texto: "Preocupações familiares afetam meu desempenho no trabalho.", dimensao: "conflito_trabalho_familia" }
    ]
  },
  {
    id: "cultura_organizacional",
    nome: "Cultura Organizacional",
    descricao: "Valores, comunicação, justiça organizacional e clima de trabalho",
    perguntas: [
      { id: 85, texto: "A comunicação na minha organização é clara e eficaz.", dimensao: "cultura_organizacional" },
      { id: 86, texto: "Sou tratado com justiça no meu trabalho.", dimensao: "cultura_organizacional" },
      { id: 87, texto: "As decisões na minha organização são tomadas de forma justa.", dimensao: "cultura_organizacional" },
      { id: 88, texto: "Confio na liderança da minha organização.", dimensao: "cultura_organizacional" },
      { id: 89, texto: "Os valores da organização estão alinhados com os meus.", dimensao: "cultura_organizacional" },
      { id: 90, texto: "Sinto-me orgulhoso de trabalhar nesta organização.", dimensao: "cultura_organizacional" },
      { id: 91, texto: "Há transparência nas decisões organizacionais.", dimensao: "cultura_organizacional" },
      { id: 92, texto: "A organização se preocupa com o bem-estar dos funcionários.", dimensao: "cultura_organizacional" },
      { id: 93, texto: "Existe respeito mútuo entre colegas na organização.", dimensao: "cultura_organizacional" },
      { id: 94, texto: "A organização promove um ambiente de trabalho saudável.", dimensao: "cultura_organizacional" },
      { id: 95, texto: "Sinto que posso expressar minhas opiniões livremente no trabalho.", dimensao: "cultura_organizacional" },
      { id: 96, texto: "A organização valoriza a diversidade e inclusão.", dimensao: "cultura_organizacional" }
    ]
  }
];

// Função para calcular o resultado do teste RPO
export function calcularResultadoRPO(
  respostas: Record<number, number>
): ResultadoRPO {
  const resultadoDimensoes: Record<string, any> = {};
  
  // Calcular médias por dimensão
  for (const dimensao of dimensoesRPO) {
    const perguntasDimensao = dimensao.perguntas;
    const somaRespostas = perguntasDimensao.reduce((soma, pergunta) => {
      return soma + (respostas[pergunta.id] || 0);
    }, 0);
    
    const media = somaRespostas / perguntasDimensao.length;
    const pontuacao = Math.round(media * 100) / 100;
    
    let classificacao = "";
    let nivel: 'baixo' | 'medio' | 'alto' = 'baixo';
    
    // Para dimensões positivas (autonomia_controle, apoio_social, reconhecimento, ambiente_fisico)
    // valores altos são bons
    if (['autonomia_controle', 'apoio_social', 'reconhecimento', 'ambiente_fisico'].includes(dimensao.id)) {
      if (media >= 4.0) {
        classificacao = "Excelente";
        nivel = 'baixo'; // baixo risco
      } else if (media >= 3.0) {
        classificacao = "Adequado";
        nivel = 'medio';
      } else {
        classificacao = "Inadequado";
        nivel = 'alto'; // alto risco
      }
    } 
    // Para segurança no emprego, algumas perguntas são invertidas
    else if (dimensao.id === 'seguranca_emprego') {
      // Perguntas 50, 52, 55, 57, 60 são negativas (medo, preocupação, insegurança)
      const perguntasNegativas = [50, 52, 55, 57, 60];
      let somaAjustada = 0;
      
      perguntasDimensao.forEach(pergunta => {
        const resposta = respostas[pergunta.id] || 0;
        if (perguntasNegativas.includes(pergunta.id)) {
          somaAjustada += (6 - resposta); // Inverte a escala
        } else {
          somaAjustada += resposta;
        }
      });
      
      const mediaAjustada = somaAjustada / perguntasDimensao.length;
      
      if (mediaAjustada >= 4.0) {
        classificacao = "Alta segurança";
        nivel = 'baixo';
      } else if (mediaAjustada >= 3.0) {
        classificacao = "Segurança moderada";
        nivel = 'medio';
      } else {
        classificacao = "Baixa segurança";
        nivel = 'alto';
      }
    }
    // Para conflito trabalho-família, algumas perguntas são negativas
    else if (dimensao.id === 'conflito_trabalho_familia') {
      // Perguntas 73, 74, 77, 79, 82, 84 são negativas (conflito, interferência)
      const perguntasNegativas = [73, 74, 77, 79, 82, 84];
      let somaAjustada = 0;
      
      perguntasDimensao.forEach(pergunta => {
        const resposta = respostas[pergunta.id] || 0;
        if (perguntasNegativas.includes(pergunta.id)) {
          somaAjustada += (6 - resposta); // Inverte a escala
        } else {
          somaAjustada += resposta;
        }
      });
      
      const mediaAjustada = somaAjustada / perguntasDimensao.length;
      
      if (mediaAjustada >= 4.0) {
        classificacao = "Excelente equilíbrio";
        nivel = 'baixo';
      } else if (mediaAjustada >= 3.0) {
        classificacao = "Equilíbrio adequado";
        nivel = 'medio';
      } else {
        classificacao = "Conflito elevado";
        nivel = 'alto';
      }
    }
    // Para demandas do trabalho, valores altos são negativos (mais risco)
    else if (dimensao.id === 'demandas_trabalho') {
      if (media >= 4.0) {
        classificacao = "Demandas excessivas";
        nivel = 'alto';
      } else if (media >= 3.0) {
        classificacao = "Demandas moderadas";
        nivel = 'medio';
      } else {
        classificacao = "Demandas baixas";
        nivel = 'baixo';
      }
    }
    // Para cultura organizacional, valores altos são positivos
    else {
      if (media >= 4.0) {
        classificacao = "Cultura excelente";
        nivel = 'baixo';
      } else if (media >= 3.0) {
        classificacao = "Cultura adequada";
        nivel = 'medio';
      } else {
        classificacao = "Cultura inadequada";
        nivel = 'alto';
      }
    }
    
    resultadoDimensoes[dimensao.id] = {
      pontuacao,
      media,
      classificacao,
      nivel
    };
  }
  
  // Calcular Índice Geral de Risco Psicossocial
  // Fórmula: média ponderada considerando o nível de risco de cada dimensão
  const dimensoesRisco = Object.values(resultadoDimensoes);
  const somaRiscos = dimensoesRisco.reduce((soma: number, dim: any) => {
    const pesoRisco = dim.nivel === 'alto' ? 3 : dim.nivel === 'medio' ? 2 : 1;
    return soma + (dim.media * pesoRisco);
  }, 0);
  
  const pesosTotal = dimensoesRisco.reduce((soma: number, dim: any) => {
    return soma + (dim.nivel === 'alto' ? 3 : dim.nivel === 'medio' ? 2 : 1);
  }, 0);
  
  const indiceGeralRisco = somaRiscos / pesosTotal;
  
  // Classificar risco geral
  let classificacaoGeral = "";
  let nivelGeral: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
  
  if (indiceGeralRisco >= 4.1) {
    classificacaoGeral = "Risco Crítico";
    nivelGeral = 'critico';
  } else if (indiceGeralRisco >= 3.1) {
    classificacaoGeral = "Alto Risco";
    nivelGeral = 'alto';
  } else if (indiceGeralRisco >= 2.1) {
    classificacaoGeral = "Risco Moderado";
    nivelGeral = 'moderado';
  } else {
    classificacaoGeral = "Baixo Risco";
    nivelGeral = 'baixo';
  }
  
  // Gerar recomendações baseadas no nível de risco
  const recomendacoes = gerarRecomendacoesRPO(nivelGeral, resultadoDimensoes);
  
  return {
    dimensoes: resultadoDimensoes,
    indiceGeralRisco: Math.round(indiceGeralRisco * 100) / 100,
    classificacaoGeral,
    nivelGeral,
    recomendacoes
  };
}

// Função para gerar recomendações personalizadas
export function gerarRecomendacoesRPO(
  nivelGeral: 'baixo' | 'moderado' | 'alto' | 'critico',
  dimensoes: Record<string, any>
): string[] {
  const recomendacoes: string[] = [];
  
  // Recomendações baseadas no nível geral de risco
  if (nivelGeral === 'critico') {
    recomendacoes.push(
      "Intervenção imediata necessária - busque apoio do RH e liderança",
      "Considere avaliação médica ocupacional especializada",
      "Implemente medidas de controle de riscos psicossociais urgentes",
      "Revise completamente as condições e organização do trabalho"
    );
  } else if (nivelGeral === 'alto') {
    recomendacoes.push(
      "Ação corretiva necessária - dialogue com supervisores sobre melhorias",
      "Busque apoio profissional para gestão do estresse ocupacional",
      "Implemente estratégias de enfrentamento e autocuidado",
      "Solicite revisão das demandas e condições de trabalho"
    );
  } else if (nivelGeral === 'moderado') {
    recomendacoes.push(
      "Monitore regularmente os fatores de risco identificados",
      "Desenvolva estratégias preventivas de bem-estar ocupacional",
      "Mantenha comunicação aberta com liderança sobre necessidades",
      "Participe de programas de promoção da saúde no trabalho"
    );
  } else {
    recomendacoes.push(
      "Continue mantendo as boas práticas atuais de trabalho",
      "Compartilhe experiências positivas com colegas",
      "Mantenha-se atento a mudanças no ambiente organizacional",
      "Contribua para manter o clima organizacional saudável"
    );
  }
  
  // Recomendações específicas por dimensão de alto risco
  if (dimensoes.demandas_trabalho.nivel === 'alto') {
    recomendacoes.push(
      "Negocie redistribuição de tarefas e prazos mais realistas",
      "Implemente técnicas de gestão do tempo e priorização",
      "Solicite recursos adicionais para lidar com a carga de trabalho"
    );
  }
  
  if (dimensoes.autonomia_controle.nivel === 'alto') {
    recomendacoes.push(
      "Dialogue sobre maior participação nas decisões do trabalho",
      "Busque oportunidades de desenvolvimento de habilidades",
      "Proponha melhorias nos processos e métodos de trabalho"
    );
  }
  
  if (dimensoes.apoio_social.nivel === 'alto') {
    recomendacoes.push(
      "Fortaleça relacionamentos com colegas e supervisores",
      "Participe de atividades de integração da equipe",
      "Busque feedback regular sobre seu desempenho"
    );
  }
  
  if (dimensoes.reconhecimento.nivel === 'alto') {
    recomendacoes.push(
      "Converse sobre expectativas de carreira e reconhecimento",
      "Documente suas contribuições e resultados alcançados",
      "Busque oportunidades de desenvolvimento profissional"
    );
  }
  
  if (dimensoes.seguranca_emprego.nivel === 'alto') {
    recomendacoes.push(
      "Busque esclarecimentos sobre estabilidade e perspectivas",
      "Desenvolva habilidades que aumentem sua empregabilidade",
      "Mantenha-se atualizado sobre o mercado de trabalho"
    );
  }
  
  if (dimensoes.ambiente_fisico.nivel === 'alto') {
    recomendacoes.push(
      "Reporte problemas ergonômicos e de infraestrutura",
      "Solicite melhorias nas condições físicas de trabalho",
      "Use equipamentos de proteção individual quando necessário"
    );
  }
  
  if (dimensoes.conflito_trabalho_familia.nivel === 'alto') {
    recomendacoes.push(
      "Negocie horários flexíveis ou trabalho remoto",
      "Estabeleça limites claros entre trabalho e vida pessoal",
      "Busque apoio familiar para gerenciar responsabilidades"
    );
  }
  
  if (dimensoes.cultura_organizacional.nivel === 'alto') {
    recomendacoes.push(
      "Participe de iniciativas de melhoria do clima organizacional",
      "Comunique preocupações através dos canais apropriados",
      "Busque alinhamento com os valores organizacionais"
    );
  }
  
  return recomendacoes;
}

// Função para obter todas as perguntas
export function obterTodasPerguntasRPO(): PerguntaRPO[] {
  return dimensoesRPO.flatMap(dimensao => dimensao.perguntas);
}

// Informações do teste para exibição
export const infoTesteRPO = {
  id: "rpo",
  nome: "HumaniQ RPO - Riscos Psicossociais Ocupacionais",
  descricao: "Avaliação científica abrangente dos fatores psicossociais no ambiente de trabalho que podem impactar a saúde mental e o bem-estar dos colaboradores, baseada em modelos internacionalmente validados.",
  duracao: "20-25 min",
  questoes: 96,
  categoria: "Riscos Psicossociais",
  dimensoes: dimensoesRPO.length,
  basesCientificas: [
    "Modelo de Demandas-Controle-Apoio Social (Karasek & Theorell)",
    "Modelo de Desequilíbrio Esforço-Recompensa (Siegrist)",
    "Diretrizes da OIT sobre Fatores Psicossociais no Trabalho",
    "ISO 45003 - Gestão de Saúde e Segurança Ocupacional - Riscos Psicossociais"
  ],
  objetivos: [
    "Identificar fatores de risco psicossocial no ambiente de trabalho",
    "Avaliar o impacto das condições de trabalho na saúde mental",
    "Detectar áreas prioritárias para intervenção organizacional",
    "Prevenir transtornos mentais relacionados ao trabalho",
    "Fornecer base científica para programas de bem-estar ocupacional"
  ],
  instrucoes: [
    "Responda com base na sua experiência atual no trabalho",
    "Use a escala de 1 (Nunca) a 5 (Sempre)",
    "Considere situações típicas dos últimos 6 meses",
    "Seja honesto sobre suas percepções e experiências",
    "Suas respostas são confidenciais e protegidas"
  ],
  beneficios: [
    "Prevenção de transtornos mentais relacionados ao trabalho",
    "Melhoria do clima organizacional e produtividade",
    "Redução de absenteísmo e rotatividade",
    "Compliance com normas de saúde e segurança ocupacional",
    "Base para políticas de bem-estar e qualidade de vida no trabalho"
  ]
};