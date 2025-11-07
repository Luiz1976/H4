import { DimensaoRPO, DimensaoResultadoRPO, ResultadoRPO, NivelRiscoRPO } from '../types';

// Perguntas do teste RPO organizadas por dimensão
export const perguntasRPO = {
  'Demandas do trabalho': [
    { id: 1, texto: 'Tenho tempo suficiente para realizar minhas tarefas com qualidade.' },
    { id: 2, texto: 'A quantidade de trabalho que recebo é adequada.' },
    { id: 3, texto: 'Consigo cumprir os prazos sem me sentir sobrecarregado.' },
    { id: 4, texto: 'As demandas do meu trabalho são claras e bem definidas.' },
    { id: 5, texto: 'Tenho os recursos necessários para executar minhas funções.' },
    { id: 6, texto: 'As interrupções constantes prejudicam minha produtividade.' },
    { id: 7, texto: 'Sinto-me pressionado a trabalhar em ritmo acelerado.' },
    { id: 8, texto: 'As tarefas que executo exigem concentração intensa.' },
    { id: 9, texto: 'Preciso lidar com informações complexas frequentemente.' },
    { id: 10, texto: 'Meu trabalho exige que eu tome decisões difíceis regularmente.' },
    { id: 11, texto: 'Sinto que as expectativas sobre meu desempenho são realistas.' },
    { id: 12, texto: 'Consigo manter a qualidade do trabalho mesmo sob pressão.' }
  ],
  'Autonomia e controle': [
    { id: 13, texto: 'Tenho liberdade para decidir como executar minhas tarefas.' },
    { id: 14, texto: 'Posso influenciar as decisões que afetam meu trabalho.' },
    { id: 15, texto: 'Tenho controle sobre meu ritmo de trabalho.' },
    { id: 16, texto: 'Posso escolher a ordem em que realizo minhas atividades.' },
    { id: 17, texto: 'Sou consultado sobre mudanças que impactam minha função.' },
    { id: 18, texto: 'Tenho autonomia para resolver problemas do dia a dia.' },
    { id: 19, texto: 'Posso expressar minhas opiniões sobre métodos de trabalho.' },
    { id: 20, texto: 'Tenho flexibilidade para adaptar meus horários quando necessário.' },
    { id: 21, texto: 'Sinto que tenho voz ativa nas decisões da equipe.' },
    { id: 22, texto: 'Posso usar minha criatividade no trabalho.' },
    { id: 23, texto: 'Tenho oportunidade de aprender coisas novas.' },
    { id: 24, texto: 'Meu trabalho me permite desenvolver minhas habilidades.' }
  ],
  'Relações interpessoais e apoio social': [
    { id: 25, texto: 'Tenho um bom relacionamento com meus colegas de trabalho.' },
    { id: 26, texto: 'Recebo apoio dos colegas quando preciso.' },
    { id: 27, texto: 'Meu supervisor me oferece suporte adequado.' },
    { id: 28, texto: 'Existe cooperação entre os membros da equipe.' },
    { id: 29, texto: 'Me sinto integrado ao grupo de trabalho.' },
    { id: 30, texto: 'Posso contar com ajuda em situações difíceis.' },
    { id: 31, texto: 'A comunicação com minha chefia é eficaz.' },
    { id: 32, texto: 'Recebo feedback construtivo sobre meu desempenho.' },
    { id: 33, texto: 'Existe um ambiente de confiança na equipe.' },
    { id: 34, texto: 'Os conflitos são resolvidos de forma adequada.' },
    { id: 35, texto: 'Me sinto respeitado pelos colegas e superiores.' },
    { id: 36, texto: 'Existe solidariedade entre os membros da equipe.' }
  ],
  'Reconhecimento e recompensas': [
    { id: 37, texto: 'Meu trabalho é reconhecido e valorizado.' },
    { id: 38, texto: 'Recebo elogios quando faço um bom trabalho.' },
    { id: 39, texto: 'Minha remuneração é justa pelo trabalho que realizo.' },
    { id: 40, texto: 'Tenho oportunidades de crescimento profissional.' },
    { id: 41, texto: 'Os benefícios oferecidos são adequados.' },
    { id: 42, texto: 'Sinto que meu esforço é recompensado adequadamente.' },
    { id: 43, texto: 'As recompensas estão alinhadas com os desafios do cargo.' },
    { id: 44, texto: 'Meus resultados são acompanhados e avaliados com justiça.' },
    { id: 45, texto: 'A empresa demonstra apreço pelo meu comprometimento.' },
    { id: 46, texto: 'Os critérios de recompensa são transparentes.' },
    { id: 47, texto: 'As avaliações de desempenho refletem minha realidade.' },
    { id: 48, texto: 'O reconhecimento é equilibrado entre os membros da equipe.' }
  ],
  'Justiça e clima organizacional': [
    { id: 49, texto: 'As decisões da empresa são tomadas de forma transparente.' },
    { id: 50, texto: 'Sinto que sou tratado com justiça na organização.' },
    { id: 51, texto: 'A cultura da empresa é coerente com os valores que ela divulga.' },
    { id: 52, texto: 'A comunicação interna é clara e eficiente.' },
    { id: 53, texto: 'As políticas da empresa são aplicadas igualmente a todos.' },
    { id: 54, texto: 'Me sinto seguro para relatar irregularidades.' },
    { id: 55, texto: 'As regras são respeitadas por todos os níveis hierárquicos.' },
    { id: 56, texto: 'O ambiente organizacional favorece o respeito mútuo.' },
    { id: 57, texto: 'O clima organizacional é positivo.' },
    { id: 58, texto: 'Existe confiança entre os níveis da organização.' },
    { id: 59, texto: 'A liderança é ética e transparente em suas decisões.' },
    { id: 60, texto: 'As normas e processos são justos e acessíveis.' }
  ],
  'Segurança no trabalho e futuro': [
    { id: 61, texto: 'Sinto que meu emprego está seguro a curto e médio prazo.' },
    { id: 62, texto: 'Tenho clareza sobre minhas possibilidades de crescimento.' },
    { id: 63, texto: 'A empresa investe no meu desenvolvimento profissional.' },
    { id: 64, texto: 'Me sinto preparado para os desafios futuros no trabalho.' },
    { id: 65, texto: 'Recebo treinamentos para atualizar minhas competências.' },
    { id: 66, texto: 'A empresa se preocupa com meu bem-estar.' },
    { id: 67, texto: 'Tenho perspectiva de carreira nesta organização.' },
    { id: 68, texto: 'Meus direitos como trabalhador são respeitados.' },
    { id: 69, texto: 'Tenho acesso a equipamentos de trabalho seguros e adequados.' },
    { id: 70, texto: 'As normas de segurança são aplicadas corretamente.' },
    { id: 71, texto: 'Me sinto fisicamente seguro no ambiente de trabalho.' },
    { id: 72, texto: 'Sei a quem recorrer em caso de risco ou emergência.' }
  ],
  'Interface trabalho-vida pessoal': [
    { id: 73, texto: 'Consigo equilibrar minhas responsabilidades profissionais e pessoais.' },
    { id: 74, texto: 'O trabalho não prejudica meus relacionamentos familiares.' },
    { id: 75, texto: 'Tenho tempo suficiente para descansar fora do expediente.' },
    { id: 76, texto: 'Posso tirar folgas ou férias sem constrangimento.' },
    { id: 77, texto: 'O excesso de trabalho afeta minha saúde mental.' },
    { id: 78, texto: 'Me sinto exausto mesmo nos dias de folga.' },
    { id: 79, texto: 'Recebo apoio da empresa em momentos pessoais delicados.' },
    { id: 80, texto: 'Tenho liberdade para negociar horários quando necessário.' },
    { id: 81, texto: 'A empresa respeita meus limites fora do horário de trabalho.' },
    { id: 82, texto: 'Posso cuidar da minha saúde sem comprometer o trabalho.' },
    { id: 83, texto: 'As exigências do trabalho não afetam minha qualidade de vida.' },
    { id: 84, texto: 'Sinto que consigo "desligar" do trabalho ao final do dia.' }
  ],
  'Violência, assédio e pressão': [
    { id: 85, texto: 'Já presenciei comportamentos abusivos no ambiente de trabalho.' },
    { id: 86, texto: 'Já fui vítima de agressão verbal ou psicológica na empresa.' },
    { id: 87, texto: 'Existe um canal seguro para denunciar assédio.' },
    { id: 88, texto: 'A empresa age quando há denúncias de abuso.' },
    { id: 89, texto: 'Me sinto protegido contra qualquer tipo de violência no trabalho.' },
    { id: 90, texto: 'Sinto que posso discordar de superiores sem medo.' },
    { id: 91, texto: 'O ambiente tolera comentários ofensivos ou discriminatórios.' },
    { id: 92, texto: 'As metas são impostas com ameaças ou punições.' },
    { id: 93, texto: 'Já me senti humilhado por líderes ou colegas.' },
    { id: 94, texto: 'Existe pressão para manter silêncio sobre irregularidades.' },
    { id: 95, texto: 'A cultura da empresa combate o assédio moral.' },
    { id: 96, texto: 'A organização zela pela saúde mental dos colaboradores.' }
  ]
};

// Perguntas invertidas (onde concordar indica maior risco)
const perguntasInvertidas = [6, 7, 77, 78, 85, 86, 91, 92, 93, 94];

// Função para determinar o nível de risco baseado na pontuação
function determinarNivelRisco(pontuacao: number): NivelRiscoRPO {
  if (pontuacao >= 4.0) return 'Elevado';
  if (pontuacao >= 3.0) return 'Moderado';
  if (pontuacao >= 2.0) return 'Aceitável';
  return 'Reduzido';
}

// Função para determinar a cor baseada no nível de risco
function determinarCor(nivel: NivelRiscoRPO): string {
  switch (nivel) {
    case 'Elevado': return '#dc2626'; // Vermelho
    case 'Moderado': return '#ea580c'; // Laranja
    case 'Aceitável': return '#eab308'; // Amarelo
    case 'Reduzido': return '#16a34a'; // Verde
  }
}

// Função para gerar interpretação da dimensão
function gerarInterpretacao(dimensao: DimensaoRPO, nivel: NivelRiscoRPO): string {
  const interpretacoes = {
    'Demandas do trabalho': {
      'Elevado': 'Sobrecarga de trabalho crítica. Demandas excessivas podem levar ao esgotamento.',
      'Moderado': 'Carga de trabalho elevada. Necessário monitoramento e ajustes.',
      'Aceitável': 'Demandas de trabalho dentro de limites aceitáveis.',
      'Reduzido': 'Carga de trabalho bem equilibrada e gerenciável.'
    },
    'Autonomia e controle': {
      'Elevado': 'Falta crítica de autonomia. Controle excessivo pode gerar estresse.',
      'Moderado': 'Autonomia limitada. Necessário maior empoderamento.',
      'Aceitável': 'Nível adequado de autonomia e controle.',
      'Reduzido': 'Excelente nível de autonomia e controle sobre o trabalho.'
    },
    'Relações interpessoais e apoio social': {
      'Elevado': 'Relações interpessoais problemáticas. Falta de apoio social.',
      'Moderado': 'Relacionamentos precisam de melhoria. Apoio limitado.',
      'Aceitável': 'Relacionamentos satisfatórios com apoio adequado.',
      'Reduzido': 'Excelentes relações interpessoais e forte apoio social.'
    },
    'Reconhecimento e recompensas': {
      'Elevado': 'Falta crítica de reconhecimento. Sistema de recompensas inadequado.',
      'Moderado': 'Reconhecimento insuficiente. Recompensas precisam de revisão.',
      'Aceitável': 'Reconhecimento e recompensas adequados.',
      'Reduzido': 'Excelente sistema de reconhecimento e recompensas.'
    },
    'Justiça e clima organizacional': {
      'Elevado': 'Clima organizacional tóxico. Percepção de injustiça elevada.',
      'Moderado': 'Clima organizacional tenso. Questões de justiça presentes.',
      'Aceitável': 'Clima organizacional satisfatório com justiça adequada.',
      'Reduzido': 'Excelente clima organizacional com alta percepção de justiça.'
    },
    'Segurança no trabalho e futuro': {
      'Elevado': 'Insegurança crítica no trabalho. Futuro profissional incerto.',
      'Moderado': 'Preocupações com segurança no emprego. Futuro incerto.',
      'Aceitável': 'Segurança no trabalho satisfatória.',
      'Reduzido': 'Alta segurança no trabalho e perspectivas futuras positivas.'
    },
    'Interface trabalho-vida pessoal': {
      'Elevado': 'Desequilíbrio crítico entre trabalho e vida pessoal.',
      'Moderado': 'Dificuldades para equilibrar trabalho e vida pessoal.',
      'Aceitável': 'Equilíbrio adequado entre trabalho e vida pessoal.',
      'Reduzido': 'Excelente equilíbrio entre trabalho e vida pessoal.'
    },
    'Violência, assédio e pressão': {
      'Elevado': 'Presença crítica de violência, assédio ou pressão excessiva.',
      'Moderado': 'Sinais de violência, assédio ou pressão preocupantes.',
      'Aceitável': 'Baixa incidência de violência, assédio ou pressão.',
      'Reduzido': 'Ambiente livre de violência, assédio e pressão excessiva.'
    }
  };

  return interpretacoes[dimensao][nivel];
}

// Função para gerar recomendações específicas por dimensão e nível
function gerarRecomendacoes(dimensao: DimensaoRPO, nivel: NivelRiscoRPO): string[] {
  const recomendacoes = {
    'Demandas do trabalho': {
      'Elevado': [
        'Revisar imediatamente a distribuição de tarefas',
        'Implementar análise de carga de trabalho',
        'Contratar pessoal adicional se necessário',
        'Estabelecer prazos mais realistas'
      ],
      'Moderado': [
        'Monitorar carga de trabalho regularmente',
        'Otimizar processos para maior eficiência',
        'Treinar equipe em gestão do tempo',
        'Revisar prioridades das tarefas'
      ],
      'Aceitável': [
        'Manter monitoramento periódico',
        'Buscar melhorias contínuas nos processos'
      ],
      'Reduzido': [
        'Manter as práticas atuais',
        'Compartilhar boas práticas com outras áreas'
      ]
    },
    'Autonomia e controle': {
      'Elevado': [
        'Implementar programa de empoderamento imediato',
        'Revisar estrutura hierárquica',
        'Delegar mais responsabilidades',
        'Criar comitês de participação'
      ],
      'Moderado': [
        'Aumentar gradualmente a autonomia',
        'Treinar líderes em delegação',
        'Implementar feedback 360°',
        'Criar canais de participação'
      ],
      'Aceitável': [
        'Manter nível atual de autonomia',
        'Buscar oportunidades de melhoria'
      ],
      'Reduzido': [
        'Manter práticas atuais',
        'Ser referência para outras áreas'
      ]
    },
    'Relações interpessoais e apoio social': {
      'Elevado': [
        'Implementar programa de mediação de conflitos',
        'Treinar líderes em comunicação',
        'Criar grupos de apoio',
        'Revisar dinâmica de equipe'
      ],
      'Moderado': [
        'Promover atividades de integração',
        'Treinar equipe em comunicação',
        'Implementar mentoring',
        'Melhorar canais de comunicação'
      ],
      'Aceitável': [
        'Manter atividades de integração',
        'Monitorar clima da equipe'
      ],
      'Reduzido': [
        'Manter práticas atuais',
        'Compartilhar boas práticas'
      ]
    },
    'Reconhecimento e recompensas': {
      'Elevado': [
        'Revisar sistema de reconhecimento imediatamente',
        'Implementar programa de recompensas',
        'Treinar líderes em feedback positivo',
        'Criar múltiplas formas de reconhecimento'
      ],
      'Moderado': [
        'Melhorar sistema de reconhecimento',
        'Implementar feedback regular',
        'Revisar critérios de avaliação',
        'Criar programa de meritocracia'
      ],
      'Aceitável': [
        'Manter sistema atual',
        'Buscar melhorias incrementais'
      ],
      'Reduzido': [
        'Manter práticas atuais',
        'Ser modelo para outras áreas'
      ]
    },
    'Justiça e clima organizacional': {
      'Elevado': [
        'Implementar auditoria de clima organizacional',
        'Revisar políticas e procedimentos',
        'Criar ouvidoria interna',
        'Treinar líderes em ética'
      ],
      'Moderado': [
        'Melhorar transparência nas decisões',
        'Implementar pesquisa de clima regular',
        'Treinar equipe em valores organizacionais',
        'Criar canais de comunicação'
      ],
      'Aceitável': [
        'Manter práticas atuais',
        'Monitorar clima regularmente'
      ],
      'Reduzido': [
        'Manter excelência atual',
        'Ser referência organizacional'
      ]
    },
    'Segurança no trabalho e futuro': {
      'Elevado': [
        'Revisar políticas de segurança no emprego',
        'Implementar plano de carreira claro',
        'Melhorar comunicação sobre futuro da empresa',
        'Criar programa de desenvolvimento'
      ],
      'Moderado': [
        'Melhorar comunicação sobre estabilidade',
        'Implementar programa de capacitação',
        'Criar planos de sucessão',
        'Revisar benefícios'
      ],
      'Aceitável': [
        'Manter políticas atuais',
        'Comunicar regularmente sobre futuro'
      ],
      'Reduzido': [
        'Manter excelência atual',
        'Compartilhar boas práticas'
      ]
    },
    'Interface trabalho-vida pessoal': {
      'Elevado': [
        'Implementar programa de equilíbrio vida-trabalho',
        'Revisar políticas de horário',
        'Criar programa de bem-estar',
        'Implementar trabalho flexível'
      ],
      'Moderado': [
        'Melhorar flexibilidade de horários',
        'Implementar pausas regulares',
        'Criar programa de qualidade de vida',
        'Treinar líderes em gestão do tempo'
      ],
      'Aceitável': [
        'Manter políticas atuais',
        'Monitorar equilíbrio regularmente'
      ],
      'Reduzido': [
        'Manter excelência atual',
        'Ser modelo para outras organizações'
      ]
    },
    'Violência, assédio e pressão': {
      'Elevado': [
        'Implementar política anti-assédio imediatamente',
        'Criar canal de denúncia seguro',
        'Treinar toda liderança em prevenção',
        'Implementar investigação rigorosa'
      ],
      'Moderado': [
        'Reforçar políticas de prevenção',
        'Melhorar canais de denúncia',
        'Treinar equipe em respeito',
        'Monitorar comportamentos'
      ],
      'Aceitável': [
        'Manter políticas preventivas',
        'Monitorar ambiente regularmente'
      ],
      'Reduzido': [
        'Manter excelência atual',
        'Ser referência em ambiente saudável'
      ]
    }
  };

  return recomendacoes[dimensao][nivel];
}

// Função principal para calcular o resultado do teste RPO
export function calcularResultadoRPO(respostas: Record<number, number>): ResultadoRPO {
  const dimensoes: DimensaoResultadoRPO[] = [];
  let somaGeral = 0;
  let totalPerguntas = 0;

  // Calcular pontuação por dimensão
  Object.entries(perguntasRPO).forEach(([nomeDimensao, perguntas]) => {
    let somaDimensao = 0;
    let perguntasRespondidas = 0;

    perguntas.forEach(pergunta => {
      if (respostas[pergunta.id] !== undefined) {
        let valor = respostas[pergunta.id];
        
        // Inverter pontuação para perguntas invertidas
        if (perguntasInvertidas.includes(pergunta.id)) {
          valor = 6 - valor; // Inverte escala 1-5
        }
        
        somaDimensao += valor;
        perguntasRespondidas++;
      }
    });

    if (perguntasRespondidas > 0) {
      const pontuacao = somaDimensao / perguntasRespondidas;
      const nivel = determinarNivelRisco(pontuacao);
      const percentual = (pontuacao / 5) * 100;
      const cor = determinarCor(nivel);
      const interpretacao = gerarInterpretacao(nomeDimensao as DimensaoRPO, nivel);
      const recomendacoes = gerarRecomendacoes(nomeDimensao as DimensaoRPO, nivel);

      dimensoes.push({
        dimensao: nomeDimensao as DimensaoRPO,
        pontuacao,
        nivel,
        percentual,
        cor,
        interpretacao,
        recomendacoes
      });

      somaGeral += pontuacao;
      totalPerguntas++;
    }
  });

  // Calcular índice global de risco
  const indiceGlobalRisco = totalPerguntas > 0 ? somaGeral / totalPerguntas : 0;
  const nivelGlobalRisco = determinarNivelRisco(indiceGlobalRisco);
  const percentualGlobalRisco = (indiceGlobalRisco / 5) * 100;

  // Identificar dimensões críticas (risco elevado ou moderado)
  const dimensoesCriticas = dimensoes.filter(d => 
    d.nivel === 'Elevado' || d.nivel === 'Moderado'
  );

  // Identificar dimensões seguras (risco reduzido)
  const dimensoesSeguras = dimensoes.filter(d => d.nivel === 'Reduzido');

  // Gerar alertas críticos
  const alertasCriticos: string[] = [];
  if (dimensoesCriticas.some(d => d.nivel === 'Elevado')) {
    alertasCriticos.push('⚠️ ATENÇÃO: Foram identificados riscos psicossociais ELEVADOS que requerem ação imediata.');
  }
  if (dimensoesCriticas.some(d => d.dimensao === 'Violência, assédio e pressão' && d.nivel !== 'Reduzido')) {
    alertasCriticos.push('🚨 CRÍTICO: Sinais de violência, assédio ou pressão detectados. Intervenção urgente necessária.');
  }
  if (indiceGlobalRisco >= 4.0) {
    alertasCriticos.push('📊 RISCO GLOBAL ELEVADO: O ambiente de trabalho apresenta múltiplos fatores de risco.');
  }

  // Gerar recomendações prioritárias
  const recomendacoesPrioritarias: string[] = [];
  dimensoesCriticas.forEach(dimensao => {
    if (dimensao.nivel === 'Elevado') {
      recomendacoesPrioritarias.push(`${dimensao.dimensao}: ${dimensao.recomendacoes[0]}`);
    }
  });

  // Gerar plano de ação
  const planoAcao: string[] = [
    '1. Priorizar intervenções nas dimensões de risco elevado',
    '2. Implementar monitoramento contínuo dos fatores de risco',
    '3. Estabelecer cronograma de reavaliação em 3-6 meses',
    '4. Envolver liderança e RH nas ações corretivas',
    '5. Comunicar resultados e ações para toda a equipe'
  ];

  return {
    indiceGlobalRisco,
    nivelGlobalRisco,
    percentualGlobalRisco,
    dimensoes,
    dimensoesCriticas,
    dimensoesSeguras,
    alertasCriticos,
    recomendacoesPrioritarias,
    planoAcao,
    mapeamentoRiscos: {
      individual: true,
      coletivo: dimensoesCriticas.length > 2,
      setorial: indiceGlobalRisco >= 3.5
    }
  };
}

// Função para obter todas as perguntas em ordem
export function obterPerguntasRPO() {
  const todasPerguntas: Array<{id: number, texto: string, dimensao: DimensaoRPO}> = [];
  
  Object.entries(perguntasRPO).forEach(([dimensao, perguntas]) => {
    perguntas.forEach(pergunta => {
      todasPerguntas.push({
        ...pergunta,
        dimensao: dimensao as DimensaoRPO
      });
    });
  });
  
  return todasPerguntas.sort((a, b) => a.id - b.id);
}

// Função para obter informações do teste
export function obterInfoTesteRPO() {
  return {
    titulo: 'HumaniQ RPO - Riscos Psicossociais Ocupacionais',
    nome: 'HumaniQ RPO - Riscos Psicossociais Ocupacionais',
    descricao: 'Avaliação científica dos fatores psicossociais no ambiente de trabalho baseada em normas ISO 10075 e diretrizes da OIT.',
    categoria: 'Riscos Psicossociais',
    duracaoEstimada: 15,
    tempoEstimado: '15-20 min',
    totalPerguntas: 96,
    numeroPerguntas: 96,
    dimensoes: 8,
    instrucoes: `
      Este teste avalia os riscos psicossociais no seu ambiente de trabalho através de 96 questões organizadas em 8 dimensões:
      
      1. **Demandas do trabalho** - Carga e pressão de trabalho
      2. **Autonomia e controle** - Liberdade e influência sobre o trabalho
      3. **Relações interpessoais e apoio social** - Qualidade dos relacionamentos
      4. **Reconhecimento e recompensas** - Valorização e retribuição
      5. **Justiça e clima organizacional** - Equidade e ambiente
      6. **Segurança no trabalho e futuro** - Estabilidade e perspectivas
      7. **Interface trabalho-vida pessoal** - Equilíbrio vida-trabalho
      8. **Violência, assédio e pressão** - Comportamentos abusivos
      
      **Como responder:**
      - Leia cada afirmação com atenção
      - Escolha a opção que melhor reflete sua experiência atual
      - Seja honesto e objetivo em suas respostas
      - Não há respostas certas ou erradas
      
      **Escala de respostas:**
      - Discordo totalmente (1)
      - Discordo (2)
      - Neutro (3)
      - Concordo (4)
      - Concordo totalmente (5)
    `
  };
}