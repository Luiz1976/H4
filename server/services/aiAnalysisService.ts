import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface TestResult {
  testeNome: string;
  testeCategoria: string;
  pontuacaoTotal: number;
  metadados: any;
}

interface AnalysisData {
  indiceGeralBemEstar: number;
  totalColaboradores: number;
  totalTestesRealizados: number;
  testesUltimos30Dias: number;
  cobertura: number;
  dimensoes: Array<{
    nome: string;
    percentual: number;
    nivel: string;
  }>;
  nr1Fatores: Array<{
    fator: string;
    nivel: string;
    percentual: number;
  }>;
  alertasCriticos: string[];
}

interface Recomendacao {
  categoria: string;
  prioridade: string;
  titulo: string;
  descricao: string;
  acoesPraticas: string[];
  prazo: string;
  responsavel: string;
  impactoEsperado: string;
  recursos: string[];
}

export async function generatePsychosocialAnalysis(data: AnalysisData): Promise<{
  recomendacoes: Recomendacao[];
  sintese: string;
}> {
  try {
    console.log('🧠 [IA] Iniciando análise psicossocial com Google Gemini...');
    
    // Se não há dados suficientes, retornar recomendações padrão
    if (data.totalTestesRealizados === 0) {
      return {
        recomendacoes: [{
          categoria: 'Dados Insuficientes',
          prioridade: 'Média',
          titulo: 'Coletar Mais Dados',
          descricao: 'Não há testes realizados ainda. Incentive os colaboradores a participarem das avaliações psicossociais.',
          acoesPraticas: [
            'Comunicar a importância dos testes em reuniões e canais internos',
            'Garantir anonimato e confidencialidade absoluta dos dados',
            'Facilitar acesso através de múltiplos dispositivos',
            'Liberar tempo do horário de trabalho para realização dos testes'
          ],
          prazo: '30 dias',
          responsavel: 'RH + Comunicação',
          impactoEsperado: 'Alcançar 80% de participação em 1 mês',
          recursos: ['Material de comunicação', 'Tempo de equipe']
        }],
        sintese: 'Aguardando dados para análise detalhada.'
      };
    }

    // Usar modelo correto do Gemini (versão v1)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro-latest',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    // Criar prompt APRIMORADO para análise técnica e profissional
    const prompt = `
Você é Dr. Thiago Mendes, PhD em Psicologia Organizacional (USP), Especialista Sênior em Saúde Mental no Trabalho, certificado ISO 45003:2021, NR-01 e Modelo Karasek-Theorell. Possui 15+ anos de experiência em diagnóstico e intervenção psicossocial organizacional.

CONTEXTO TÉCNICO:
Você está realizando uma análise psicossocial quantitativa e qualitativa para um Programa de Gestão de Riscos (PGR) conforme NR-01 (Portaria MTP nº 6.730/2020). Os dados abaixo foram coletados através de instrumentos psicométricos validados.

DADOS ORGANIZACIONAIS REAIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 MÉTRICAS PRINCIPAIS:
- Índice Global de Bem-Estar Psicossocial: ${data.indiceGeralBemEstar}% (n=${data.totalColaboradores})
- Amostra Válida: ${data.totalTestesRealizados} testes concluídos
- Taxa de Participação: ${data.cobertura}% (últimos 30 dias: ${data.testesUltimos30Dias} testes)
- Intervalo de Confiança: 95% | Margem de Erro: ±${Math.round(100/Math.sqrt(data.totalTestesRealizados))}%

🧠 DIMENSÕES PSICOSSOCIAIS MENSURADAS:
${data.dimensoes.map(d => `  • ${d.nome}: ${d.percentual}% [${d.nivel}] ${d.percentual < 40 ? '⚠️ CRÍTICO' : d.percentual < 60 ? '⚡ ATENÇÃO' : '✓'}`).join('\n')}

⚖️ FATORES DE RISCO NR-01 (Anexo II):
${data.nr1Fatores.map(f => `  • ${f.fator}: ${f.percentual}% [${f.nivel}] ${f.nivel === 'Crítico' ? '🔴 ALTA SEVERIDADE' : f.nivel === 'Atenção' ? '🟡' : '🟢'}`).join('\n')}

🚨 ALERTAS DETECTADOS:
${data.alertasCriticos.length > 0 ? data.alertasCriticos.map(a => `  ⚠️ ${a}`).join('\n') : '  ✓ Nenhum alerta crítico no momento'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SOLICITAÇÃO:
Gere uma análise TÉCNICA e PROFISSIONAL com:
1. **Síntese Executiva (insights)**: 3-4 parágrafos robustos (300-400 palavras) incluindo:
   - Interpretação clínica dos índices (use terminologia técnica quando apropriado)
   - Correlações identificadas entre dimensões e fatores NR-01
   - Classificação do perfil de risco organizacional (Baixo/Moderado/Alto/Crítico)
   - Análise preditiva: tendências e riscos emergentes
   - Comparação com benchmarks setoriais (se índice geral estiver abaixo de 60%, mencionar padrões de risco)
   - Referencie frameworks científicos: ISO 45003, Modelo Demanda-Controle (Karasek), NR-01, OMS

2. **Recomendações Estratégicas**: 4-6 ações PRIORIZADAS e ESPECÍFICAS baseadas nos dados

Retorne APENAS JSON válido (sem markdown):
{
  "sintese": "Síntese executiva técnica e profissional de 300-400 palavras, formatada em parágrafos claros, com terminologia científica adequada, correlações estatísticas, análise preditiva e referências normativas (ISO 45003, NR-01, Karasek-Theorell). Use dados REAIS fornecidos.",
  "recomendacoes": [
    {
      "categoria": "Categoria técnica (ex: Intervenção Urgente, Compliance NR-01, Gestão Preventiva, Capacitação Técnica)",
      "prioridade": "Alta/Média (use Alta APENAS se: índice<50, fatores críticos detectados, ou alertas graves)",
      "titulo": "Título técnico impactante (máx. 70 chars)",
      "descricao": "Ação específica, mensurável e acionável com KPIs quando possível (máx. 250 chars)"
    }
  ]
}

DIRETRIZES OBRIGATÓRIAS:
✓ Use APENAS dados fornecidos (não invente estatísticas)
✓ Cite índices reais com precisão: "${data.indiceGeralBemEstar}%" em vez de "baixo"
✓ Linguagem: técnica, empática, baseada em evidências científicas
✓ Mantenha tom profissional consultivo (evite alarmismo, mas seja honesto sobre riscos)
✓ Correlacione dimensões: ex: "Baixo Apoio Social (${data.dimensoes.find(d => d.nome.includes('Apoio'))?.percentual || 'N/A'}%) correlacionado com Alto Estresse..."
✓ Priorize ações por ROI em saúde mental e compliance legal
✓ JSON puro sem formatação markdown
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('✅ [IA] Resposta recebida do Google Gemini');
    console.log('📄 [IA] Texto bruto:', text.substring(0, 200) + '...');

    // Limpar resposta (remover markdown se houver)
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(cleanText);
    
    console.log('✅ [IA] Análise processada com sucesso');
    console.log(`📊 [IA] Recomendações geradas: ${analysis.recomendacoes?.length || 0}`);

    return analysis;

  } catch (error) {
    console.error('❌ [IA] Erro ao gerar análise:', error);
    
    // Fallback: Recomendações ROBUSTAS baseadas em regras se IA falhar
    const recomendacoes: Recomendacao[] = [];
    
    if (data.indiceGeralBemEstar < 50) {
      recomendacoes.push({
        categoria: 'Intervenção Urgente',
        prioridade: 'Alta',
        titulo: 'Programa de Apoio Psicológico Imediato',
        descricao: `Índice de bem-estar em ${data.indiceGeralBemEstar}% indica necessidade de intervenção imediata para prevenir agravamento dos riscos psicossociais.`,
        acoesPraticas: [
          'Contratar serviço de psicologia organizacional ou ampliar equipe interna',
          'Disponibilizar atendimento psicológico individual para colaboradores',
          'Realizar rodas de conversa em grupos pequenos (8-12 pessoas)',
          'Implementar canal de escuta anônimo e sigiloso',
          'Revisar carga de trabalho e redistribuir demandas quando necessário'
        ],
        prazo: 'Iniciar em 15 dias',
        responsavel: 'RH + Liderança + SESMT',
        impactoEsperado: 'Redução de 15-20% nos índices de estresse em 90 dias',
        recursos: ['Psicólogo organizacional', 'Sala privativa para atendimentos', 'Sistema de agendamento', 'Orçamento: R$ 3.000-5.000/mês']
      });
    }

    if (data.nr1Fatores.some(f => f.nivel === 'Crítico')) {
      const fatoresCrit = data.nr1Fatores.filter(f => f.nivel === 'Crítico');
      recomendacoes.push({
        categoria: 'Compliance Legal (NR-01)',
        prioridade: 'Alta',
        titulo: 'Plano de Ação para Fatores de Risco Críticos',
        descricao: `Detectados ${fatoresCrit.length} fatores de risco psicossociais críticos. Implementação de medidas corretivas é obrigatória conforme NR-01 (Portaria MTP nº 6.730/2020).`,
        acoesPraticas: [
          'Documentar todos os fatores de risco identificados em relatório técnico',
          'Elaborar Plano de Ação com cronograma detalhado (NR-01 Anexo II)',
          'Designar responsáveis específicos para cada ação corretiva',
          'Estabelecer metas quantitativas de redução de risco (min. 30% em 6 meses)',
          'Comunicar plano à CIPA e colaboradores de forma transparente',
          'Implementar sistema de monitoramento mensal dos indicadores'
        ],
        prazo: 'Documentação: 7 dias / Implementação: 30 dias',
        responsavel: 'SESMT + RH + Direção',
        impactoEsperado: 'Compliance legal + redução de 30-40% dos fatores críticos em 6 meses',
        recursos: ['Consultor NR-01', 'Software de gestão de riscos', 'Tempo de equipe: 40h/mês', 'Orçamento: R$ 8.000-15.000']
      });
    }

    // Recomendação de capacitação de lideranças (sempre importante)
    recomendacoes.push({
      categoria: 'Capacitação Preventiva',
      prioridade: 'Alta',
      titulo: 'Treinamento de Lideranças em Saúde Mental',
      descricao: 'Capacitar gestores e líderes para identificar sinais precoces de sofrimento psíquico e criar ambiente de trabalho saudável.',
      acoesPraticas: [
        'Realizar workshop de 8h sobre saúde mental no trabalho (ISO 45003)',
        'Treinar líderes em comunicação não-violenta e escuta ativa',
        'Ensinar identificação de sinais de burnout, ansiedade e depressão',
        'Criar protocolo de ação para situações de crise emocional',
        'Estabelecer reuniões individuais periódicas (1-on-1) com cada colaborador',
        'Implementar sistema de feedback 360° com foco em bem-estar'
      ],
      prazo: 'Iniciar em 30 dias / Ciclos trimestrais',
      responsavel: 'RH + Consultoria Externa',
      impactoEsperado: '40% de melhoria na percepção de suporte da liderança em 4 meses',
      recursos: ['Instrutor especializado', 'Material didático', 'Espaço de treinamento', 'Orçamento: R$ 5.000-10.000']
    });

    // Recomendação de programas de bem-estar
    recomendacoes.push({
      categoria: 'Qualidade de Vida',
      prioridade: 'Média',
      titulo: 'Programa Integrado de Bem-Estar (ISO 45003)',
      descricao: 'Implementar iniciativas regulares de promoção de saúde física e mental baseadas em evidências científicas.',
      acoesPraticas: [
        'Ginástica laboral 2x por semana (15 min) com profissional de educação física',
        'Meditação e mindfulness guiados 1x por semana (horário de trabalho)',
        'Palestras mensais sobre gestão de estresse, sono e alimentação',
        'Criar espaço de descompressão (sala do bem-estar) com poltronas e música',
        'Flexibilização de horários quando possível (trabalho híbrido)',
        'Incentivo a pausas regulares (técnica Pomodoro institucionalizada)'
      ],
      prazo: 'Implementação gradual: 60 dias',
      responsavel: 'RH + SESMT + Comitê de Bem-Estar',
      impactoEsperado: '25% de redução no estresse ocupacional em 6 meses',
      recursos: ['Profissional de educação física', 'Instrutor de mindfulness', 'Espaço físico', 'Orçamento: R$ 2.000-4.000/mês']
    });

    if (data.cobertura < 80) {
      recomendacoes.push({
        categoria: 'Engajamento',
        prioridade: 'Média',
        titulo: 'Campanha de Aumento de Participação nos Testes',
        descricao: `Cobertura atual de ${data.cobertura}% está abaixo do ideal (meta: 85%). Aumentar participação é essencial para diagnóstico preciso.`,
        acoesPraticas: [
          'Comunicar importância dos testes em reuniões gerais e e-mails',
          'Garantir anonimato absoluto e confidencialidade dos dados',
          'Liberar 30 min do horário de trabalho para realização dos testes',
          'Criar incentivos não-financeiros (reconhecimento, sorteios)',
          'Facilitar acesso (múltiplos dispositivos, suporte técnico)',
          'Apresentar resultados agregados para demonstrar transparência'
        ],
        prazo: '30 dias',
        responsavel: 'RH + Comunicação Interna',
        impactoEsperado: 'Aumentar cobertura para 85-90% em 2 meses',
        recursos: ['Material de comunicação', 'Tempo de equipe', 'Orçamento: R$ 1.000-2.000']
      });
    }

    // Gerar insights robustos baseados nos dados reais (fallback profissional)
    let insights = `RESUMO EXECUTIVO\n\n`;
    
    insights += `Foram avaliados ${data.totalColaboradores} colaboradores através de ${data.totalTestesRealizados} testes psicossociais, alcançando uma cobertura de ${data.cobertura}% da população. O Índice Global de Bem-Estar identificado foi de ${data.indiceGeralBemEstar}%.\n\n`;
    
    // Classificação do índice
    insights += `DIAGNÓSTICO\n\n`;
    if (data.indiceGeralBemEstar < 40) {
      insights += `O índice encontra-se em nível CRÍTICO segundo os parâmetros da ISO 45003:2021. Esta situação demanda intervenção imediata da gestão. É necessário implementar ações corretivas urgentes para prevenir agravamento dos riscos psicossociais.\n\n`;
    } else if (data.indiceGeralBemEstar < 60) {
      insights += `O índice situa-se em nível de ATENÇÃO conforme as diretrizes da NR-01. Recomenda-se a implementação de ações preventivas estruturadas para evitar deterioração do ambiente psicossocial.\n\n`;
    } else if (data.indiceGeralBemEstar < 75) {
      insights += `O índice encontra-se em nível MODERADO. A organização apresenta bases sólidas, porém é recomendado fortalecer as políticas de saúde mental e bem-estar para alcançar excelência.\n\n`;
    } else {
      insights += `O índice demonstra condição SAUDÁVEL do ambiente psicossocial. A organização possui práticas efetivas de gestão de pessoas. Recomenda-se manter e aprimorar continuamente estas políticas.\n\n`;
    }
    
    // Análise das dimensões críticas
    const dimensoesCriticas = data.dimensoes.filter(d => d.percentual < 50);
    if (dimensoesCriticas.length > 0) {
      insights += `ÁREAS PRIORITÁRIAS PARA INTERVENÇÃO\n\n`;
      insights += `Foram identificadas ${dimensoesCriticas.length} dimensões que requerem atenção especial:\n`;
      dimensoesCriticas.forEach(d => {
        insights += `• ${d.nome}: ${d.percentual}% (${d.nivel})\n`;
      });
      insights += `\nEstas áreas demandam ações específicas para melhoria dos indicadores.\n\n`;
    }
    
    // Análise dos fatores NR-01
    const fatoresCriticos = data.nr1Fatores.filter(f => f.nivel === 'Crítico');
    if (fatoresCriticos.length > 0) {
      insights += `FATORES DE RISCO CRÍTICOS (NR-01)\n\n`;
      insights += `Conforme Anexo II da Portaria MTP nº 6.730/2020, foram detectados fatores de risco críticos:\n`;
      fatoresCriticos.forEach(f => {
        insights += `• ${f.fator}\n`;
      });
      insights += `\nEstes fatores exigem elaboração de plano de ação imediato.\n\n`;
    }
    
    // Recomendação técnica
    insights += `RECOMENDAÇÃO TÉCNICA\n\n`;
    insights += `Implementar Programa de Gestão de Riscos Psicossociais (PRG) alinhado às diretrizes da NR-01. O programa deve incluir:\n\n`;
    insights += `• Monitoramento contínuo através de indicadores quantitativos\n`;
    insights += `• Intervenções baseadas no Modelo Demanda-Controle-Suporte (Karasek-Theorell, 1990)\n`;
    insights += `• Capacitação de lideranças em gestão de saúde mental\n`;
    insights += `• Revisão periódica dos resultados com periodicidade trimestral\n`;
    insights += `• Canais de escuta e suporte aos colaboradores\n\n`;
    insights += `Todas as ações devem estar documentadas e acompanhadas de cronograma de execução, conforme exigências da legislação vigente.`;
    
    return {
      recomendacoes,
      sintese: insights
    };
  }
}
