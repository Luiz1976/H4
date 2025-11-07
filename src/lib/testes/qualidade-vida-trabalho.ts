import { Pergunta, ResultadoQVT, DimensaoQVT, AlertaCritico } from '../types';

export const configQualidadeVidaTrabalho = {
  id: 'qualidade-vida-trabalho',
  nome: 'HumaniQ QVT - Qualidade de Vida no Trabalho',
  categoria: 'Bem-estar e Engajamento',
  descricao: 'Avaliação da satisfação dos colaboradores em cinco dimensões-chave da vida profissional, alinhada com ISO 45001 e conceitos ESG.',
  tempoEstimado: '12-15 minutos',
  numeroPerguntas: 50,
  dimensoes: [
    'Satisfação com a Função',
    'Relação com Liderança', 
    'Estrutura e Condições de Trabalho',
    'Recompensas e Remuneração',
    'Equilíbrio Vida-Trabalho'
  ],
  perguntas: [
    // Dimensão 1: Satisfação com a Função (10 perguntas)
    {
      id: 1,
      texto: 'Sinto-me realizado(a) com as atividades que executo.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 2,
      texto: 'Minhas habilidades são bem utilizadas no meu trabalho.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 3,
      texto: 'Tenho autonomia para tomar decisões no meu trabalho.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 4,
      texto: 'Meu trabalho é desafiador e estimulante.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 5,
      texto: 'Compreendo claramente minhas responsabilidades.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 6,
      texto: 'Sinto que meu trabalho faz diferença na empresa.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 7,
      texto: 'Tenho oportunidades de aprender coisas novas.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 8,
      texto: 'Meu trabalho está alinhado com meus valores pessoais.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 9,
      texto: 'Sinto-me orgulhoso(a) do trabalho que realizo.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },
    {
      id: 10,
      texto: 'Tenho variedade suficiente nas minhas atividades diárias.',
      dimensao: 'Satisfação com a Função',
      invertida: false
    },

    // Dimensão 2: Relação com Liderança (10 perguntas)
    {
      id: 11,
      texto: 'Meu gestor me oferece suporte quando necessário.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 12,
      texto: 'Recebo feedback construtivo sobre meu desempenho.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 13,
      texto: 'Sinto-me à vontade para expressar minhas opiniões.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 14,
      texto: 'Meu gestor reconhece meus esforços e conquistas.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 15,
      texto: 'A comunicação com minha liderança é clara e eficaz.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 16,
      texto: 'Confio nas decisões tomadas pela minha liderança.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 17,
      texto: 'Meu gestor me trata com respeito e dignidade.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 18,
      texto: 'Sinto que posso contar com meu gestor em situações difíceis.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 19,
      texto: 'Minha liderança demonstra interesse no meu desenvolvimento.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },
    {
      id: 20,
      texto: 'Existe transparência nas decisões que me afetam.',
      dimensao: 'Relação com Liderança',
      invertida: false
    },

    // Dimensão 3: Estrutura e Condições de Trabalho (10 perguntas)
    {
      id: 21,
      texto: 'Tenho os recursos necessários para realizar meu trabalho.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 22,
      texto: 'O ambiente físico de trabalho é adequado e confortável.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 23,
      texto: 'As ferramentas e tecnologias disponíveis são eficientes.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 24,
      texto: 'Sinto-me seguro(a) no meu ambiente de trabalho.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 25,
      texto: 'Os processos organizacionais facilitam meu trabalho.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 26,
      texto: 'Tenho acesso às informações necessárias para trabalhar.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 27,
      texto: 'A organização do trabalho permite boa produtividade.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 28,
      texto: 'Existe colaboração efetiva entre as equipes.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 29,
      texto: 'A estrutura organizacional é clara e funcional.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },
    {
      id: 30,
      texto: 'A empresa investe na melhoria das condições de trabalho.',
      dimensao: 'Estrutura e Condições de Trabalho',
      invertida: false
    },

    // Dimensão 4: Recompensas e Remuneração (10 perguntas)
    {
      id: 31,
      texto: 'Sinto-me justamente remunerado(a) pelo meu trabalho.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 32,
      texto: 'Os benefícios oferecidos atendem minhas necessidades.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 33,
      texto: 'A política de promoções é clara e justa.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 34,
      texto: 'Existe reconhecimento não-financeiro (elogios, prêmios, etc).',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 35,
      texto: 'Tenho acesso a programas de desenvolvimento pessoal.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 36,
      texto: 'A remuneração está alinhada com o mercado.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 37,
      texto: 'Me sinto motivado(a) pelos incentivos que recebo.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 38,
      texto: 'Há possibilidade de crescimento salarial ao longo do tempo.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 39,
      texto: 'Sinto que sou recompensado(a) pelo meu desempenho.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },
    {
      id: 40,
      texto: 'A empresa valoriza talentos internos.',
      dimensao: 'Recompensas e Remuneração',
      invertida: false
    },

    // Dimensão 5: Equilíbrio Vida-Trabalho (10 perguntas)
    {
      id: 41,
      texto: 'Consigo conciliar bem trabalho e vida pessoal.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 42,
      texto: 'A carga de trabalho é compatível com minha capacidade.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 43,
      texto: 'Tenho tempo suficiente para atividades fora do trabalho.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 44,
      texto: 'A empresa respeita meu tempo pessoal.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 45,
      texto: 'Meus horários são respeitados pela liderança.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 46,
      texto: 'Tenho flexibilidade para lidar com questões pessoais urgentes.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 47,
      texto: 'Não levo preocupações de trabalho para casa com frequência.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 48,
      texto: 'Sinto que posso descansar adequadamente fora do expediente.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 49,
      texto: 'A empresa incentiva práticas de bem-estar.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    },
    {
      id: 50,
      texto: 'Meu trabalho contribui para minha qualidade de vida.',
      dimensao: 'Equilíbrio Vida-Trabalho',
      invertida: false
    }
  ] as Pergunta[]
};

// Função para calcular resultados do teste QVT
export function calcularResultadoQVT(respostas: Record<number, number>): ResultadoQVT {
  const dimensoes: DimensaoQVT[] = [
    'Satisfação com a Função',
    'Relação com Liderança', 
    'Estrutura e Condições de Trabalho',
    'Recompensas e Remuneração',
    'Equilíbrio Vida-Trabalho'
  ];

  // Calcular médias por dimensão (10 perguntas cada)
  const resultadosDimensoes = dimensoes.map((dimensao, index) => {
    const inicioBloco = index * 10 + 1;
    const fimBloco = inicioBloco + 9;
    
    let soma = 0;
    let contador = 0;
    
    for (let i = inicioBloco; i <= fimBloco; i++) {
      if (respostas[i] !== undefined) {
        soma += respostas[i];
        contador++;
      }
    }
    
    const media = contador > 0 ? soma / contador : 0;
    
    return {
      dimensao,
      pontuacao: media,
      nivel: classificarNivelQVT(media),
      percentual: (media / 5) * 100
    };
  });

  // Calcular índice geral de QVT
  const somaTotal = Object.values(respostas).reduce((acc, valor) => acc + valor, 0);
  const indiceGeral = Object.keys(respostas).length > 0 ? somaTotal / Object.keys(respostas).length : 0;

  // Identificar dimensões críticas (abaixo de 2.5)
  const dimensoesCriticas = resultadosDimensoes.filter(d => d.pontuacao < 2.5);
  
  // Identificar pontos fortes (acima de 4.0)
  const pontoFortes = resultadosDimensoes.filter(d => d.pontuacao >= 4.0);

  const resultado = {
    indiceGeral,
    nivelGeral: classificarNivelQVT(indiceGeral),
    percentualGeral: (indiceGeral / 5) * 100,
    dimensoes: resultadosDimensoes,
    dimensoesCriticas,
    pontoFortes,
    riscoTurnover: indiceGeral < 2.5,
    recomendacoes: gerarRecomendacoesQVT(resultadosDimensoes, indiceGeral),
    insights: gerarInsightsQVT(resultadosDimensoes, indiceGeral)
  };

  // Gerar alertas críticos baseados no resultado
  const alertasCriticos = gerarAlertasQVT(resultado);

  return {
    ...resultado,
    alertasCriticos
  };
}

// Função para gerar alertas críticos de QVT
export function gerarAlertasQVT(resultado: ResultadoQVT): AlertaCritico[] {
  const alertas: AlertaCritico[] = [];

  // Alerta de risco de turnover
  if (resultado.riscoTurnover) {
    alertas.push({
      id: `qvt-turnover-${Date.now()}`,
      tipo: 'critico',
      titulo: 'Alto Risco de Turnover Detectado',
      descricao: `Índice geral de QVT muito baixo (${resultado.indiceGeral.toFixed(1)}/5.0). Funcionário em risco de deixar a empresa.`,
      impacto: 'Alto',
      urgencia: 'Imediata',
      recomendacoes: [
        'Realizar reunião individual urgente com o funcionário',
        'Identificar principais fatores de insatisfação',
        'Desenvolver plano de retenção personalizado',
        'Considerar ajustes salariais ou de benefícios',
        'Avaliar possibilidade de mudança de função ou área'
      ],
      prazoAcao: '48 horas',
      responsavel: 'RH + Gestor Direto'
    });
  }

  // Alertas por dimensões críticas
  resultado.dimensoesCriticas?.forEach(dimensao => {
    let alertaEspecifico: AlertaCritico;

    switch (dimensao.dimensao) {
      case 'Satisfação com a Função':
        alertaEspecifico = {
          id: `qvt-funcao-${Date.now()}`,
          tipo: 'critico',
          titulo: 'Baixa Satisfação com a Função',
          descricao: `Score crítico em satisfação com a função (${dimensao.pontuacao.toFixed(1)}/5.0). Funcionário pode estar desmotivado ou mal alocado.`,
          impacto: 'Alto',
          urgencia: 'Alta',
          recomendacoes: [
            'Revisar descrição e responsabilidades do cargo',
            'Avaliar alinhamento entre perfil e função',
            'Considerar realocação ou promoção',
            'Implementar programa de desenvolvimento de carreira',
            'Aumentar autonomia e responsabilidades'
          ],
          prazoAcao: '1 semana',
          responsavel: 'Gestor Direto + RH'
        };
        break;

      case 'Relação com Liderança':
        alertaEspecifico = {
          id: `qvt-lideranca-${Date.now()}`,
          tipo: 'critico',
          titulo: 'Problemas na Relação com Liderança',
          descricao: `Score crítico na relação com liderança (${dimensao.pontuacao.toFixed(1)}/5.0). Possível conflito ou falta de suporte gerencial.`,
          impacto: 'Alto',
          urgencia: 'Alta',
          recomendacoes: [
            'Mediar conversa entre funcionário e gestor',
            'Avaliar estilo de liderança do gestor',
            'Implementar programa de coaching para líderes',
            'Considerar mudança de gestor ou equipe',
            'Estabelecer reuniões regulares de feedback'
          ],
          prazoAcao: '3 dias',
          responsavel: 'RH + Gestor Superior'
        };
        break;

      case 'Estrutura e Condições de Trabalho':
        alertaEspecifico = {
          id: `qvt-estrutura-${Date.now()}`,
          tipo: 'atencao',
          titulo: 'Problemas na Estrutura de Trabalho',
          descricao: `Score baixo em estrutura e condições (${dimensao.pontuacao.toFixed(1)}/5.0). Ambiente ou recursos inadequados.`,
          impacto: 'Médio',
          urgencia: 'Média',
          recomendacoes: [
            'Avaliar condições físicas do ambiente de trabalho',
            'Verificar adequação de equipamentos e tecnologia',
            'Revisar processos e fluxos de trabalho',
            'Melhorar comunicação interna',
            'Investir em infraestrutura e ferramentas'
          ],
          prazoAcao: '2 semanas',
          responsavel: 'Facilities + TI + Gestor'
        };
        break;

      case 'Recompensas e Remuneração':
        alertaEspecifico = {
          id: `qvt-recompensas-${Date.now()}`,
          tipo: 'critico',
          titulo: 'Insatisfação com Recompensas',
          descricao: `Score crítico em recompensas (${dimensao.pontuacao.toFixed(1)}/5.0). Funcionário insatisfeito com salário ou benefícios.`,
          impacto: 'Alto',
          urgencia: 'Alta',
          recomendacoes: [
            'Realizar pesquisa salarial de mercado',
            'Avaliar possibilidade de aumento salarial',
            'Revisar pacote de benefícios',
            'Implementar programa de reconhecimento',
            'Criar plano de progressão salarial'
          ],
          prazoAcao: '1 semana',
          responsavel: 'RH + Diretoria'
        };
        break;

      case 'Equilíbrio Vida-Trabalho':
        alertaEspecifico = {
          id: `qvt-equilibrio-${Date.now()}`,
          tipo: 'atencao',
          titulo: 'Desequilíbrio Vida-Trabalho',
          descricao: `Score baixo em equilíbrio vida-trabalho (${dimensao.pontuacao.toFixed(1)}/5.0). Possível sobrecarga ou burnout.`,
          impacto: 'Alto',
          urgencia: 'Média',
          recomendacoes: [
            'Avaliar carga horária e distribuição de tarefas',
            'Implementar políticas de flexibilidade',
            'Promover programas de bem-estar',
            'Estabelecer limites claros de horário',
            'Oferecer suporte psicológico se necessário'
          ],
          prazoAcao: '1 semana',
          responsavel: 'Gestor Direto + RH'
        };
        break;

      default:
        alertaEspecifico = {
          id: `qvt-geral-${Date.now()}`,
          tipo: 'atencao',
          titulo: 'Dimensão QVT Crítica',
          descricao: `Score baixo detectado em ${dimensao.dimensao} (${dimensao.pontuacao.toFixed(1)}/5.0).`,
          impacto: 'Médio',
          urgencia: 'Média',
          recomendacoes: ['Investigar causas específicas da baixa pontuação'],
          prazoAcao: '1 semana',
          responsavel: 'RH'
        };
    }

    alertas.push(alertaEspecifico);
  });

  // Alerta para múltiplas dimensões críticas
  if (resultado.dimensoesCriticas && resultado.dimensoesCriticas.length >= 3) {
    alertas.push({
      id: `qvt-multiplas-${Date.now()}`,
      tipo: 'critico',
      titulo: 'Múltiplas Dimensões Críticas',
      descricao: `${resultado.dimensoesCriticas.length} dimensões com scores críticos. Situação de alta gravidade.`,
      impacto: 'Crítico',
      urgencia: 'Imediata',
      recomendacoes: [
        'Convocar reunião de emergência com RH e gestores',
        'Desenvolver plano de ação integrado e urgente',
        'Considerar licença temporária ou mudança radical',
        'Avaliar questões de saúde mental do funcionário',
        'Implementar acompanhamento psicológico'
      ],
      prazoAcao: '24 horas',
      responsavel: 'Diretoria + RH + Gestor'
    });
  }

  return alertas;
}

function classificarNivelQVT(pontuacao: number): string {
  if (pontuacao >= 4.5) return 'Excelente';
  if (pontuacao >= 4.0) return 'Muito Bom';
  if (pontuacao >= 3.5) return 'Bom';
  if (pontuacao >= 2.5) return 'Regular';
  if (pontuacao >= 2.0) return 'Ruim';
  return 'Crítico';
}

function gerarRecomendacoesQVT(dimensoes: any[], indiceGeral: number): string[] {
  const recomendacoes: string[] = [];

  // Recomendações baseadas no índice geral
  if (indiceGeral < 2.5) {
    recomendacoes.push('🚨 Implementar plano de ação urgente para retenção de talentos');
    recomendacoes.push('📊 Realizar pesquisa detalhada para identificar causas específicas da insatisfação');
  }

  // Recomendações por dimensão
  dimensoes.forEach(dimensao => {
    if (dimensao.pontuacao < 2.5) {
      switch (dimensao.dimensao) {
        case 'Satisfação com a Função':
          recomendacoes.push('🎯 Revisar descrições de cargo e alinhamento de expectativas');
          recomendacoes.push('🔄 Implementar programa de rotação de atividades e enriquecimento de tarefas');
          break;
        case 'Relação com Liderança':
          recomendacoes.push('👥 Capacitar líderes em gestão de pessoas e comunicação eficaz');
          recomendacoes.push('🗣️ Estabelecer canais de feedback contínuo entre líderes e liderados');
          break;
        case 'Estrutura e Condições de Trabalho':
          recomendacoes.push('🏢 Investir na melhoria da infraestrutura e ambiente físico');
          recomendacoes.push('💻 Atualizar ferramentas e tecnologias de trabalho');
          break;
        case 'Recompensas e Remuneração':
          recomendacoes.push('💰 Revisar política salarial e estrutura de benefícios');
          recomendacoes.push('🏆 Implementar programa de reconhecimento não-financeiro');
          break;
        case 'Equilíbrio Vida-Trabalho':
          recomendacoes.push('⚖️ Implementar políticas de flexibilidade e bem-estar');
          recomendacoes.push('🕐 Revisar cargas de trabalho e distribuição de tarefas');
          break;
      }
    }
  });

  return recomendacoes;
}

function gerarInsightsQVT(dimensoes: any[], indiceGeral: number): string[] {
  const insights: string[] = [];

  // Insight geral
  if (indiceGeral >= 4.0) {
    insights.push('✅ Colaborador apresenta alta satisfação com a qualidade de vida no trabalho');
  } else if (indiceGeral >= 3.0) {
    insights.push('⚠️ Colaborador apresenta satisfação moderada, com oportunidades de melhoria');
  } else {
    insights.push('🚨 Colaborador apresenta baixa satisfação, indicando risco de turnover');
  }

  // Insights por dimensão
  const melhorDimensao = dimensoes.reduce((prev, current) => 
    prev.pontuacao > current.pontuacao ? prev : current
  );
  
  const piorDimensao = dimensoes.reduce((prev, current) => 
    prev.pontuacao < current.pontuacao ? prev : current
  );

  insights.push(`🌟 Ponto forte: ${melhorDimensao.dimensao} (${melhorDimensao.pontuacao.toFixed(1)}/5.0)`);
  insights.push(`⚠️ Área de atenção: ${piorDimensao.dimensao} (${piorDimensao.pontuacao.toFixed(1)}/5.0)`);

  // Insights específicos
  const diferencaMaxima = melhorDimensao.pontuacao - piorDimensao.pontuacao;
  if (diferencaMaxima > 1.5) {
    insights.push('📊 Há grande variação entre as dimensões, indicando necessidade de ações específicas');
  }

  return insights;
}