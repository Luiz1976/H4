const http = require('http');
const url = require('url');
const fs = require('fs');

// Importar sistema de bloqueio automático
const { monitor } = require('./blocked-content-monitor');

const PORT = 3001;

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5000',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Servidor HTTP simples
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let path = parsedUrl.pathname;
  if (path && path.length > 1 && path.endsWith('/')) {
    path = path.replace(/\/+$/, '');
  }
  const method = req.method;

  console.log(`[${new Date().toISOString()}] ${method} ${path}`);

  // Handle OPTIONS (CORS preflight)
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Health check
  if (path === '/health' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      status: 'OK',
      message: 'HumaniQ Backend está funcionando!',
      timestamp: new Date().toISOString(),
      port: PORT
    }));
    return;
  }

  // API Health check
  if (path === '/api/health' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      status: 'OK',
      environment: 'development',
      port: PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Auth login endpoint
  if (path === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const email = String(data.email || '').toLowerCase();
        const token = 'mock-jwt-token-' + Date.now();
        const isEmpresa = email === 'luiz@humaniq.com' && String(data.password || '') === 'Luiz@1222';
        const user = {
          id: '1',
          email: email || 'user@example.com',
          nome: 'Usuário Teste',
          role: isEmpresa ? 'empresa' : 'colaborador',
          empresaId: isEmpresa ? 'empresa-1' : undefined
        };
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ success: true, token, user }));
      } catch (error) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Colaborador: obter dados do colaborador logado
  if (path === '/api/colaboradores/me' && method === 'GET') {
    const auth = req.headers['authorization'] || '';
    const hasToken = auth && auth.toString().startsWith('Bearer ');
    if (!hasToken) {
      res.writeHead(401, corsHeaders);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const now = new Date().toISOString();
    const colaborador = {
      id: 'c657a570-8bd5-44bf-b848-aaae5574271e',
      nome: 'Colaborador Demo',
      email: 'colab@humaniq.com.br',
      cargo: 'Analista',
      departamento: 'TI',
      avatar: '',
      empresaId: 'eb081787-4868-4aa0-89d6-fe4d1445b658',
      permissoes: {},
      ativo: true,
      createdAt: now,
    };
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ colaborador }));
    return;
  }

  // Estado em memória dos testes concluídos por colaborador
  if (!global.__concludedTests) {
    global.__concludedTests = new Map();
  }

  // Marcar teste como concluído (indisponível)
  if (path === '/api/teste-disponibilidade/marcar-concluido' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const { testeId, colaboradorId } = data;
        if (typeof testeId !== 'string' || !testeId) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({ error: 'Dados inválidos: testeId obrigatório' }));
          return;
        }
        const key = colaboradorId || 'default-colab';
        const set = global.__concludedTests.get(key) || new Set();
        set.add(testeId);
        global.__concludedTests.set(key, set);
        try { fs.appendFileSync('./server/audit.log', JSON.stringify({ type: 'bloqueio', testeId, colaboradorId: key, ts: new Date().toISOString() }) + '\n'); } catch (_) { }
        saveConcluded();
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ success: true, message: 'Teste marcado como concluído' }));
      } catch (e) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Listar testes disponíveis para colaborador
  if (path === '/api/teste-disponibilidade/colaborador/testes' && method === 'GET') {
    const auth = req.headers['authorization'] || '';
    const hasToken = auth && auth.toString().startsWith('Bearer ');
    if (!hasToken) {
      res.writeHead(401, corsHeaders);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const now = new Date();
    const toISO = (d) => d.toISOString();
    const addDays = (d) => toISO(new Date(now.getTime() + d * 24 * 60 * 60 * 1000));
    // União global de bloqueios (empresa decide reativar explicitamente)
    const concludedAll = new Set();
    try {
      if (global.__concludedTests && typeof global.__concludedTests.forEach === 'function') {
        global.__concludedTests.forEach((set) => {
          if (set && typeof set.forEach === 'function') {
            set.forEach((id) => concludedAll.add(id));
          }
        });
      }
    } catch (_) { }

    const makeTeste = (id, nome, categoria, tempoEstimado, descricao) => ({
      id,
      nome,
      descricao,
      categoria,
      tempoEstimado,
      ativo: true,
    });

    const base = [
      // Clima Organizacional (clássico)
      makeTeste('clima-organizacional', 'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa', 'Organizacional', 15, 'Avaliação do clima e satisfação dos colaboradores'),
      // Karasek-Siegrist
      makeTeste('karasek-siegrist', 'HumaniQ - Karasek-Siegrist', 'Psicossocial', 25, 'Avaliação de risco psicossocial (demanda-controle, esforço-recompensa)'),
      // Estresse Ocupacional
      makeTeste('estresse-ocupacional', 'HumaniQ EO – Estresse Ocupacional', 'Saúde Ocupacional', 20, 'Indicadores de estresse, burnout e resiliência'),
      // Clima e Bem-Estar
      makeTeste('clima-bem-estar', 'Clima e Bem-Estar', 'Organizacional', 15, 'Percepção de bem-estar e ambiente organizacional'),
      // MGRP – Maturidade em Gestão de Riscos Psicossociais
      makeTeste('maturidade-riscos-psicossociais', 'Maturidade em Gestão de Riscos Psicossociais', 'Organizacional', 20, 'Avaliação da maturidade em políticas e práticas de riscos psicossociais'),
      // PAS – Percepção de Assédio Sexual
      makeTeste('percepcao-assedio', 'Percepção de Assédio Sexual (PAS)', 'Proteção', 18, 'Percepção e prevenção ao assédio sexual'),
      // QVT – Qualidade de Vida no Trabalho
      makeTeste('qualidade-vida-trabalho', 'Qualidade de Vida no Trabalho (QVT)', 'Bem-estar', 20, 'Avaliação de satisfação, estrutura e recompensas'),
      // RPO – Riscos Psicossociais Ocupacionais
      makeTeste('rpo', 'Riscos Psicossociais Ocupacionais (RPO)', 'Psicossocial', 25, 'Diagnóstico de riscos psicossociais organizacionais'),
    ];

    const testes = base.map(t => {
      const concluido = concludedAll.has(t.id);
      let periodicidadeDias = null;
      if (t.id === 'clima-bem-estar') periodicidadeDias = 120;
      if (t.id === 'qualidade-vida-trabalho') periodicidadeDias = 180;
      if (t.id === 'percepcao-assedio') periodicidadeDias = 180;
      const proximaDisponibilidade = periodicidadeDias ? addDays(periodicidadeDias) : null;
      return {
        ...t,
        disponivel: !concluido,
        motivo: concluido ? (periodicidadeDias ? 'aguardando_periodicidade' : 'teste_concluido') : null,
        proximaDisponibilidade,
        dataConclusao: concluido ? toISO(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)) : null,
        pontuacao: concluido ? 75 : null,
        periodicidadeDias,
      };
    });

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ testes }));
    return;
  }

  if (path === '/api/colaboradores' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    const now = new Date().toISOString();
    res.end(JSON.stringify({
      data: [
        {
          id: 'c1',
          nome: 'João Silva',
          email: 'joao.silva@example.com',
          cargo: 'Analista',
          departamento: 'TI',
          avatar: '',
          ativo: true,
          created_at: now,
          updated_at: now,
          total_testes: 3,
          ultimo_teste: now,
          situacaoPsicossocial: {
            status: 'bom',
            descricao: 'Risco moderado',
            cor: 'blue',
            totalTestes: 3,
            ultimoTeste: now,
            indicadores: [
              { nome: 'Clima', valor: '3.8', nivel: 'bom' }
            ]
          }
        },
        {
          id: 'c2',
          nome: 'Maria Souza',
          email: 'maria.souza@example.com',
          cargo: 'Gerente',
          departamento: 'RH',
          avatar: '',
          ativo: false,
          created_at: now,
          updated_at: now,
          total_testes: 1,
          ultimo_teste: now,
          situacaoPsicossocial: {
            status: 'atencao',
            descricao: 'Atenção recomendada',
            cor: 'yellow',
            totalTestes: 1,
            ultimoTeste: now
          }
        }
      ]
    }));
    return;
  }

  if (path === '/api/empresas/colaboradores' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    const now = new Date().toISOString();
    const colaboradores = [
      {
        id: 'col-001',
        nome: 'Carlos Silva',
        email: 'carlos@humaniq.com.br',
        cargo: 'Analista Sênior',
        departamento: 'TI',
        avatar: '',
        ativo: true,
        created_at: now,
        updated_at: now,
        total_testes: 12,
        ultimo_teste: now,
        situacaoPsicossocial: {
          status: 'bom',
          descricao: 'Risco moderado',
          cor: 'blue',
          totalTestes: 12,
          ultimoTeste: now
        }
      },
      {
        id: 'col-002',
        nome: 'Ana Pereira',
        email: 'ana.pereira@humaniq.com.br',
        cargo: 'Gerente',
        departamento: 'RH',
        avatar: '',
        ativo: true,
        created_at: now,
        updated_at: now,
        total_testes: 5,
        ultimo_teste: now,
        situacaoPsicossocial: {
          status: 'excelente',
          descricao: 'Bem-estar elevado',
          cor: 'green',
          totalTestes: 5,
          ultimoTeste: now
        }
      },
      {
        id: 'col-003',
        nome: 'Paulo Andrade',
        email: 'paulo.andrade@humaniq.com.br',
        cargo: 'Analista',
        departamento: 'Operações',
        avatar: '',
        ativo: false,
        created_at: now,
        updated_at: now,
        total_testes: 2,
        ultimo_teste: now,
        situacaoPsicossocial: {
          status: 'atencao',
          descricao: 'Atenção recomendada',
          cor: 'yellow',
          totalTestes: 2,
          ultimoTeste: now
        }
      }
    ];
    res.end(JSON.stringify({ colaboradores, total: colaboradores.length }));
    return;
  }

  if (path === '/api/empresas/estatisticas' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    const estatisticas = {
      totalColaboradores: 120,
      ativos: 95,
      inativos: 25,
      testes: {
        total: 340,
        mediaPontuacao: 78.2,
        mediaPorEmpresa: 3.6
      },
      analise: {
        tendencia: [
          { mes: '2025-07', total: 45 },
          { mes: '2025-08', total: 52 },
          { mes: '2025-09', total: 60 },
          { mes: '2025-10', total: 88 },
          { mes: '2025-11', total: 95 }
        ],
        distribuicaoTemporal: [
          { periodo: 'manhã', valor: 120 },
          { periodo: 'tarde', valor: 150 },
          { periodo: 'noite', valor: 70 }
        ],
        porCategoria: [
          { categoria: 'Clima Organizacional', total: 110 },
          { categoria: 'Karasek-Siegrist', total: 90 },
          { categoria: 'Estresse Ocupacional', total: 80 },
          { categoria: 'Outros', total: 60 }
        ]
      }
    };
    res.end(JSON.stringify({ estatisticas }));
    return;
  }

  if (path === '/api/auth/check' && method === 'GET') {
    const auth = req.headers['authorization'] || '';
    if (auth && auth.toString().startsWith('Bearer ')) {
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        authenticated: true,
        user: {
          id: '1',
          email: 'luiz@humaniq.com',
          role: 'empresa',
          empresaId: 'empresa-1'
        }
      }));
    } else {
      res.writeHead(401, corsHeaders);
      res.end(JSON.stringify({ authenticated: false, error: 'Unauthorized' }));
    }
    return;
  }

  if (path === '/api/empresas/estado-psicossocial' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    const now = new Date().toISOString();
    const analise = {
      indiceGeralBemEstar: 82,
      totalColaboradores: 95,
      totalTestesRealizados: 320,
      testesUltimos30Dias: 88,
      cobertura: 64,
      dimensoes: [
        { dimensaoId: 'comunicacao', nome: 'Comunicação', percentual: 68, nivel: 'bom', cor: 'blue', total: 88 },
        { dimensaoId: 'lideranca', nome: 'Liderança', percentual: 62, nivel: 'regular', cor: 'blue', total: 80 },
        { dimensaoId: 'apoio', nome: 'Apoio Social', percentual: 76, nivel: 'bom', cor: 'green', total: 92 },
        { dimensaoId: 'demanda', nome: 'Demanda Psicológica', percentual: 54, nivel: 'atencao', cor: 'yellow', total: 70 }
      ],
      nr1Fatores: [
        { fator: 'Carga de trabalho', nivel: 'Moderado', percentual: 58 },
        { fator: 'Autonomia', nivel: 'Bom', percentual: 72 },
        { fator: 'Assédio', nivel: 'Baixo', percentual: 12 }
      ],
      nr1Compliance: {
        status: 'em_andamento',
        ultimaAvaliacao: now,
        proximaAvaliacao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        testesRealizados: 320,
        cobertura: 64
      },
      alertasCriticos: [
        'Atenção: Sinais de sobrecarga em setores operacionais',
        'Necessidade de reforçar canais de apoio e escuta ativa'
      ],
      recomendacoes: [
        { categoria: 'Gestão', prioridade: 'Alta', titulo: 'Reduzir sobrecarga de tarefas', descricao: 'Redistribuir demandas e revisar SLAs em áreas críticas' },
        { categoria: 'Cultura', prioridade: 'Média', titulo: 'Programa de apoio entre pares', descricao: 'Implementar grupos de suporte e mentoria' }
      ],
      ultimaAtualizacao: now
    };
    res.end(JSON.stringify({ analise }));
    return;
  }

  if (path.startsWith('/api/colaboradores/') && method === 'GET') {
    const id = path.split('/')[3];
    const now = new Date().toISOString();
    const colaboradores = [
      { id: 'col-001', nome: 'Carlos Silva', email: 'carlos@humaniq.com.br', cargo: 'Analista Sênior', departamento: 'TI', ativo: true, created_at: now, avatar: '' },
      { id: 'col-002', nome: 'Ana Pereira', email: 'ana.pereira@humaniq.com.br', cargo: 'Gerente', departamento: 'RH', ativo: true, created_at: now, avatar: '' },
      { id: 'col-003', nome: 'Paulo Andrade', email: 'paulo.andrade@humaniq.com.br', cargo: 'Analista', departamento: 'Operações', ativo: false, created_at: now, avatar: '' }
    ];
    const found = colaboradores.find(c => c.id === id);
    if (found) {
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({ success: true, data: found }));
    } else {
      res.writeHead(404, corsHeaders);
      res.end(JSON.stringify({ success: false, error: 'Colaborador não encontrado' }));
    }
    return;
  }

  // Atualizar colaborador (avatar, etc.)
  if (path.startsWith('/api/colaboradores/') && method === 'PATCH') {
    const parts = path.split('/');
    const id = parts[3];
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (id === colaboradorMe.id) {
          colaboradorMe = { ...colaboradorMe, ...data };
        }
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (path.startsWith('/api/testes/resultado/') && method === 'GET') {
    const segs = path.split('/');
    const last = segs[segs.length - 1];
    const now = new Date();
    const toISO = (d) => d.toISOString();

    // Se for ID de resultado, retornar um único resultado detalhado
    if ((/^res-\w+/).test(last) || last.startsWith('result-')) {
      let resultado;
      let respostas = [];
      if (last === 'result-1763226938714') {
        resultado = {
          id: last,
          pontuacaoTotal: 68,
          dataRealizacao: toISO(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
          metadados: {
            tipo_teste: 'maturidade-riscos-psicossociais',
            teste_nome: 'MGRP – Maturidade em Gestão de Riscos Psicossociais',
            versao_teste: '1.0',
            timestamp_processamento: toISO(now),
            analise_completa: {
              maturidadeGeral: { percentual: 68 },
              dimensoes: {
                politicaGestao: { percentual: 70 },
                prevencaoAssedio: { percentual: 65 },
                apoioPsicossocial: { percentual: 72 }
              }
            }
          }
        };
      } else if (last === 'res-002') {
        // Karasek-Siegrist com análise completa
        resultado = {
          id: last,
          pontuacaoTotal: 72,
          dataRealizacao: toISO(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
          metadados: {
            tipo_teste: 'karasek-siegrist',
            teste_nome: 'HumaniQ - Karasek-Siegrist',
            versao_teste: '1.0',
            timestamp_processamento: toISO(now),
            perguntas_respondidas: 50,
            analise_completa: {
              dimensoes: {
                'demanda-psicologica': { pontuacao: 24, percentual: 67, nivel: 'moderado', classificacao: 'Risco Moderado', cor: '🟡' },
                'controle-autonomia': { pontuacao: 28, percentual: 78, nivel: 'moderado', classificacao: 'Risco Moderado', cor: '🟡' },
                'apoio-social': { pontuacao: 30, percentual: 75, nivel: 'moderado', classificacao: 'Risco Moderado', cor: '🟡' },
                'esforco-exigido': { pontuacao: 18, percentual: 72, nivel: 'moderado', classificacao: 'Risco Moderado', cor: '🟡' },
                'recompensas-recebidas': { pontuacao: 40, percentual: 73, nivel: 'moderado', classificacao: 'Risco Moderado', cor: '🟡' }
              },
              riscoGeral: { percentual: 72, nivel: 'moderado', classificacao: 'Risco Moderado', cor: '🟡' },
              hipercomprometimento: { percentual: 65, nivel: 'moderado', classificacao: 'Risco Moderado', cor: '🟡' }
            }
          }
        };
      } else if (last === 'res-001') {
        // Clima Organizacional
        resultado = {
          id: last,
          pontuacaoTotal: 210,
          dataRealizacao: toISO(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
          metadados: {
            tipo_teste: 'clima-organizacional'
          }
        };
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({ resultado, respostas }));
      return;
    }

    // Caso contrário, tratar como listagem por colaborador
    const colaboradorId = last;
    const resultados = [
      {
        id: 'res-001',
        testeId: 'clima-organizacional',
        nomeTest: 'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa',
        categoria: 'Organizacional',
        pontuacao: 210,
        pontuacaoMaxima: 280,
        percentual: 75,
        status: 'concluido',
        dataRealizacao: toISO(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
        tempoDuracao: 35,
        observacoes: 'Participação completa',
        tipoTabela: 'resultados'
      },
      {
        id: 'res-002',
        testeId: 'karasek-siegrist',
        nomeTest: 'HumaniQ - Karasek-Siegrist',
        categoria: 'Psicossocial',
        pontuacao: 180,
        pontuacaoMaxima: 250,
        percentual: 72,
        status: 'concluido',
        dataRealizacao: toISO(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
        tempoDuracao: 28,
        observacoes: 'Sem intercorrências',
        tipoTabela: 'resultados'
      },
      {
        id: 'res-003',
        testeId: 'estresse-ocupacional',
        nomeTest: 'HumaniQ EO – Estresse Ocupacional',
        categoria: 'Saúde Ocupacional',
        pontuacao: 160,
        pontuacaoMaxima: 200,
        percentual: 80,
        status: 'em_andamento',
        dataRealizacao: toISO(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
        tempoDuracao: 12,
        observacoes: 'Em progresso',
        tipoTabela: 'resultados'
      }
    ];
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ success: true, data: resultados }));
    return;
  }

  // Teste disponibilidade - empresa/colaborador
  if (path.startsWith('/api/teste-disponibilidade/empresa/colaborador/') && method === 'GET' && path.endsWith('/testes')) {
    const segs = path.split('/');
    const colaboradorId = segs[5];
    const now = new Date();
    const toISO = (d) => d.toISOString();
    const addDays = (d) => toISO(new Date(now.getTime() + d * 24 * 60 * 60 * 1000));
    const testes = [
      {
        id: 'clima-organizacional',
        nome: 'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa',
        descricao: 'Avaliação do clima e satisfação dos colaboradores',
        categoria: 'Organizacional',
        tempoEstimado: 15,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-clima`,
          disponivel: false,
          periodicidadeDias: 90,
          ultimaLiberacao: toISO(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)),
          proximaDisponibilidade: addDays(30)
        },
        ultimoResultado: {
          id: 'res-001',
          pontuacaoTotal: 210,
          dataRealizacao: toISO(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000))
        },
        foiConcluido: true
      },
      {
        id: 'karasek-siegrist',
        nome: 'HumaniQ - Karasek-Siegrist',
        descricao: 'Avaliação de risco psicossocial (demanda-controle, esforço-recompensa)',
        categoria: 'Psicossocial',
        tempoEstimado: 25,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-ks`,
          disponivel: true,
          periodicidadeDias: 180,
          ultimaLiberacao: toISO(new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000)),
          proximaDisponibilidade: null
        },
        ultimoResultado: {
          id: 'res-002',
          pontuacaoTotal: 180,
          dataRealizacao: toISO(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
        },
        foiConcluido: true
      },
      {
        id: 'estresse-ocupacional',
        nome: 'HumaniQ EO – Estresse Ocupacional',
        descricao: 'Indicadores de estresse, burnout e resiliência',
        categoria: 'Saúde Ocupacional',
        tempoEstimado: 20,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-eo`,
          disponivel: false,
          periodicidadeDias: null,
          ultimaLiberacao: null,
          proximaDisponibilidade: null
        },
        ultimoResultado: null,
        foiConcluido: false
      },
      {
        id: 'clima-bem-estar',
        nome: 'Clima e Bem-Estar',
        descricao: 'Percepção de bem-estar e ambiente organizacional',
        categoria: 'Organizacional',
        tempoEstimado: 15,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-cbe`,
          disponivel: true,
          periodicidadeDias: 120,
          ultimaLiberacao: toISO(new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000)),
          proximaDisponibilidade: null
        },
        ultimoResultado: null,
        foiConcluido: false
      },
      {
        id: 'maturidade-riscos-psicossociais',
        nome: 'Maturidade em Gestão de Riscos Psicossociais',
        descricao: 'Avaliação da maturidade em políticas e práticas de riscos psicossociais',
        categoria: 'Organizacional',
        tempoEstimado: 20,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-mgrp`,
          disponivel: true,
          periodicidadeDias: 365,
          ultimaLiberacao: null,
          proximaDisponibilidade: null
        },
        ultimoResultado: null,
        foiConcluido: false
      },
      {
        id: 'percepcao-assedio',
        nome: 'Percepção de Assédio Sexual (PAS)',
        descricao: 'Percepção e prevenção ao assédio sexual',
        categoria: 'Proteção',
        tempoEstimado: 18,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-pas`,
          disponivel: false,
          periodicidadeDias: 180,
          ultimaLiberacao: toISO(new Date(now.getTime() - 170 * 24 * 60 * 60 * 1000)),
          proximaDisponibilidade: addDays(10)
        },
        ultimoResultado: null,
        foiConcluido: false
      },
      {
        id: 'qualidade-vida-trabalho',
        nome: 'Qualidade de Vida no Trabalho (QVT)',
        descricao: 'Avaliação de satisfação, estrutura e recompensas',
        categoria: 'Bem-estar',
        tempoEstimado: 20,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-qvt`,
          disponivel: true,
          periodicidadeDias: 180,
          ultimaLiberacao: null,
          proximaDisponibilidade: null
        },
        ultimoResultado: null,
        foiConcluido: false
      },
      {
        id: 'rpo',
        nome: 'Riscos Psicossociais Ocupacionais (RPO)',
        descricao: 'Diagnóstico de riscos psicossociais organizacionais',
        categoria: 'Psicossocial',
        tempoEstimado: 25,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-rpo`,
          disponivel: true,
          periodicidadeDias: 365,
          ultimaLiberacao: null,
          proximaDisponibilidade: null
        },
        ultimoResultado: null,
        foiConcluido: false
      },
      /*
        // REMOVED
        nome: 'HumaniQ Insight',
        descricao: 'Análise comportamental e insights de desenvolvimento',
        categoria: 'Desenvolvimento Pessoal',
        tempoEstimado: 25,
        ativo: true,
        disponibilidade: {
          id: `disp-${colaboradorId}-insight`,
          disponivel: false,
          periodicidadeDias: 180,
          ultimaLiberacao: toISO(new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000)),
          proximaDisponibilidade: addDays(20)
        },
        ultimoResultado: null,
        foiConcluido: false
      */
    ];

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ testes }));
    return;
  }

  if (path.startsWith('/api/teste-disponibilidade/empresa/colaborador/') && method === 'POST' && path.includes('/liberar')) {
    const segs = path.split('/');
    const colaboradorId = segs[5];
    const testeId = segs[7];
    try {
      if (global.__concludedTests && typeof global.__concludedTests.forEach === 'function') {
        const keysToUpdate = [];
        global.__concludedTests.forEach((_set, k) => keysToUpdate.push(k));
        keysToUpdate.forEach((k) => {
          const set = global.__concludedTests.get(k) || new Set();
          if (set.has(testeId)) {
            set.delete(testeId);
            global.__concludedTests.set(k, set);
          }
        });
      }
    } catch (_) { }
    console.log(`[LIBERAR] Teste ${testeId} liberado globalmente por ${colaboradorId} em ${new Date().toISOString()}`);
    try { fs.appendFileSync('./server/audit.log', JSON.stringify({ type: 'liberacao', testeId, by: colaboradorId, ts: new Date().toISOString() }) + '\n'); } catch (_) { }
    saveConcluded();
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ success: true, message: 'Teste liberado' }));
    return;
  }

  // Bloquear todos os testes da página /testes até liberação pela empresa
  if (path === '/api/teste-disponibilidade/empresa/bloquear-todos' && method === 'POST') {
    try {
      const todosTestes = [
        'clima-organizacional',
        'karasek-siegrist',
        'estresse-ocupacional',
        'clima-bem-estar',
        'maturidade-riscos-psicossociais',
        'percepcao-assedio',
        'qualidade-vida-trabalho',
        'rpo'
      ];

      const key = 'global';
      const set = global.__concludedTests.get(key) || new Set();
      todosTestes.forEach(id => set.add(id));
      global.__concludedTests.set(key, set);
      saveConcluded();

      try { fs.appendFileSync('./server/audit.log', JSON.stringify({ type: 'bloqueio_total', testes: todosTestes, by: 'empresa', ts: new Date().toISOString() }) + '\n'); } catch (_) { }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({ success: true, message: 'Todos os testes foram bloqueados. Somente a empresa pode liberar.', totalBloqueados: todosTestes.length }));
    } catch (e) {
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({ success: false, error: 'Falha ao bloquear todos os testes' }));
    }
    return;
  }

  if (path.startsWith('/api/teste-disponibilidade/empresa/colaborador/') && method === 'PATCH' && path.includes('/periodicidade')) {
    // Configuração de periodicidade mock: apenas retorna success
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ success: true, message: 'Periodicidade atualizada' }));
    return;
  }

  if (path === '/api/testes/resultados/meus' && method === 'GET') {
    const now = new Date();
    const toISO = (d) => d.toISOString();
    const resultados = [
      {
        id: 'res-pas-001',
        testeId: 'percepcao-assedio',
        nomeTest: 'HumaniQ PAS - Percepção de Assédio Moral e Sexual',
        categoria: 'Proteção',
        pontuacaoTotal: 72,
        status: 'concluido',
        dataRealizacao: toISO(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
        metadados: {
          tipo_teste: 'percepcao-assedio',
          teste_nome: 'HumaniQ PAS - Percepção de Assédio Moral e Sexual',
          analise_completa: {
            percentualGeral: 72,
            nivelRiscoGeral: 'Risco Moderado',
            classificacaoGeral: 'Risco Moderado',
            dimensoes: [
              { id: 'assedio-moral-direto', nome: 'Assédio Moral Direto', percentual: 68, pontuacao: 3.4, nivelRisco: 'Risco Moderado', cor: 'bg-yellow-500', interpretacao: 'Sinais presentes', alertaCritico: false, recomendacoes: [] },
              { id: 'assedio-sexual', nome: 'Assédio Sexual', percentual: 30, pontuacao: 1.5, nivelRisco: 'Baixo Risco', cor: 'bg-green-500', interpretacao: 'Risco baixo', alertaCritico: false, recomendacoes: [] }
            ],
            recomendacoesEducativas: ['Promover campanhas de conscientização'],
            recomendacoesDisciplinares: []
          }
        }
      }
    ];
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ resultados, total: resultados.length }));
    return;
  }

  if (path === '/api/convites/listar' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    const now = new Date();
    const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();
    const convites = [
      {
        id: 'cv-001',
        token: 'tok-empresa-001',
        nomeEmpresa: 'HumaniQ AI',
        emailContato: 'contato@humaniq.com.br',
        validade: addDays(7),
        status: 'ativo',
        linkConvite: 'http://localhost:5000/convite/empresa/tok-empresa-001',
        createdAt: now.toISOString(),
        diasAcesso: 30
      },
      {
        id: 'cv-002',
        token: 'tok-colaborador-001',
        nome: 'Carlos Silva',
        email: 'carlos@humaniq.com.br',
        cargo: 'Analista Sênior',
        departamento: 'TI',
        validade: addDays(7),
        status: 'pendente',
        linkConvite: 'http://localhost:5000/convite/colaborador/tok-colaborador-001',
        createdAt: now.toISOString()
      }
    ];
    res.end(JSON.stringify({ convites, tipo: 'empresa' }));
    return;
  }

  if (path === '/api/convites/metricas-empresa' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    const data = {
      limiteTotal: 100,
      criados: 12,
      usados: 9,
      disponiveis: 88,
      pendentes: 3,
      cancelados: 0
    };
    res.end(JSON.stringify({ success: true, data }));
    return;
  }

  if (path === '/api/audit/logs' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const entry = JSON.parse(body);
        const line = JSON.stringify({ ...entry, receivedAt: new Date().toISOString() }) + '\n';
        try {
          fs.appendFileSync('./server/audit.log', line, 'utf8');
        } catch (e) {
          console.warn('⚠️ Falha ao gravar audit.log, apenas logando no console');
          console.log('[AUDIT]', line.trim());
        }
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Course progress endpoint
  if (path === '/api/cursos/progresso' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Course progress request:', data);

        // Mock response - simular erro de curso não liberado
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'Curso não liberado pela empresa'
        }));
      } catch (error) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Colaborador info endpoint (mock)
  if (path === '/api/colaboradores/me' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ colaborador: colaboradorMe }));
    return;
  }

  // Teste disponibilidade endpoint (mock)
  if (path === '/api/teste-disponibilidade/colaborador/testes' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify([
      {
        id: '1',
        nome: 'Teste de Clima Organizacional',
        descricao: 'Avaliação do ambiente de trabalho',
        disponivel: true,
        concluido: false
      },
      {
        id: '2',
        nome: 'Teste de Estresse Ocupacional',
        descricao: 'Avaliação de níveis de estresse',
        disponivel: true,
        concluido: false
      }
    ]));
    return;
  }

  // Perguntas de testes endpoint - carrega perguntas reais dos documentos Word
  if (path.startsWith('/api/testes/') && path.endsWith('/perguntas') && method === 'GET') {
    const testeTipo = path.split('/')[3]; // extrai o tipo do teste da URL

    try {
      // Carrega as perguntas do arquivo JSON
      const perguntasData = JSON.parse(fs.readFileSync('./server/perguntas-testes.json', 'utf8'));

      // Mapeia os tipos de teste para os nomes no JSON
      const tipoMap = {
        'clima-organizacional': 'clima-organizacional',
        'estresse-ocupacional': 'eo',
        'karasek-siegrist': 'ks',
        'insight': 'insight',
        'mgr': 'mgr',
        'pas': 'pas',
        'qvt': 'qvt',
        'rpo': 'rpo',
        'eo': 'eo',
        'ks': 'ks'
      };

      let perguntas = perguntasData[tipoMap[testeTipo]] || [];

      // Análise de segurança das perguntas antes de enviar
      const perguntasSeguras = [];
      const alertasSeguranca = [];

      perguntas.forEach((pergunta, index) => {
        if (pergunta.texto) {
          // Analisar conteúdo da pergunta para garantir que não há assédio
          const analise = monitor.analisarConteudo(
            pergunta.texto,
            `pergunta_teste_${testeTipo}`,
            'sistema',
            testeTipo
          );

          if (analise.bloqueado) {
            console.log(`🚨 [ALERTA] Pergunta bloqueada no teste ${testeTipo}: ${pergunta.texto}`);
            alertasSeguranca.push({
              perguntaId: pergunta.id,
              motivo: 'conteudo_inadequado_detectado',
              analise: analise
            });
          } else {
            perguntasSeguras.push(pergunta);
          }
        } else {
          perguntasSeguras.push(pergunta);
        }
      });

      // Se todas as perguntas foram bloqueadas, retornar erro
      if (perguntasSeguras.length === 0 && perguntas.length > 0) {
        res.writeHead(403, corsHeaders);
        res.end(JSON.stringify({
          error: 'Teste bloqueado por segurança',
          message: 'Este teste foi bloqueado automaticamente devido à detecção de conteúdo inadequado.',
          alertas: alertasSeguranca,
          support: 'Entre em contato com o suporte para revisão do teste.'
        }));
        return;
      }

      // Se não encontrar perguntas específicas, retorna perguntas genéricas
      if (perguntasSeguras.length === 0) {
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          perguntas: [
            {
              id: '1',
              texto: `Como você avalia seu ${testeTipo.replace('-', ' ')}?`,
              tipo: 'escala',
              opcoes: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente']
            }
          ],
          total: 1,
          alertasSeguranca: alertasSeguranca
        }));
        return;
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        perguntas: perguntasSeguras,
        total: perguntasSeguras.length,
        alertasSeguranca: alertasSeguranca
      }));
      return;

    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      // Em caso de erro, retorna perguntas genéricas
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        perguntas: [
          {
            id: '1',
            texto: `Como você avalia seu ${testeTipo.replace('-', ' ')}?`,
            tipo: 'escala',
            opcoes: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente']
          }
        ],
        total: 1
      }));
      return;
    }
  }

  // Submeter resultado de teste (com análise automática de conteúdo)
  if (path === '/api/testes/resultado' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Teste resultado recebido:', data);

        // Análise automática de conteúdo para detectar assédio
        if (data.respostas && Array.isArray(data.respostas)) {
          const usuarioId = data.usuarioId || 'usuario-anonimo';
          const testeId = data.testeId || 'teste-desconhecido';

          // Analisar cada resposta
          data.respostas.forEach((resposta, index) => {
            if (resposta.texto || resposta.resposta) {
              const texto = resposta.texto || resposta.resposta;
              const contexto = `pergunta_${resposta.perguntaId || index}`;

              const analise = monitor.analisarConteudo(texto, contexto, usuarioId, testeId);

              if (analise.bloqueado) {
                console.log(`🚨 [BLOQUEIO] Teste bloqueado para usuário ${usuarioId} devido a conteúdo inadequado`);
                res.writeHead(403, corsHeaders);
                res.end(JSON.stringify({
                  error: 'Conteúdo bloqueado',
                  message: 'Seu teste foi bloqueado automaticamente devido à detecção de conteúdo inadequado relacionado a assédio moral ou sexual.',
                  analise: {
                    nivelRisco: analise.nivelRisco,
                    categorias: analise.categoriasDetectadas,
                    palavrasDetectadas: analise.palavrasDetectadas
                  },
                  support: 'Entre em contato com o suporte para revisão do bloqueio.'
                }));
                return;
              }
            }
          });
        }

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          message: 'Resultado salvo com sucesso',
          resultado: {
            id: 'result-' + Date.now(),
            testeId: data.testeId,
            pontuacaoTotal: Math.floor(Math.random() * 100),
            dataRealizacao: new Date().toISOString(),
            analiseConcluida: true
          }
        }));
      } catch (error) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Resultados do colaborador (mock)
  if (path === '/api/testes/resultados/meus' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    const now = Date.now();
    const mkDate = (daysAgo) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const resultados = [
      {
        id: 'result-1763226938714',
        testeId: 'maturidade-riscos-psicossociais',
        nomeTeste: 'Maturidade em Gestão de Riscos Psicossociais (MGRP)',
        pontuacaoTotal: 68,
        dataRealizacao: mkDate(5),
        status: 'concluido',
        metadados: {
          tipo_teste: 'maturidade-riscos-psicossociais',
          teste_nome: 'MGRP – Maturidade em Gestão de Riscos Psicossociais',
          analise_completa: {
            maturidadeGeral: { percentual: 68 }
          }
        }
      },
      {
        id: 'res-001',
        testeId: 'clima-organizacional',
        nomeTeste: 'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa',
        pontuacaoTotal: 75,
        dataRealizacao: mkDate(1),
        status: 'concluido',
        metadados: {
          tipo_teste: 'clima-organizacional',
          teste_nome: 'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa',
          analise_completa: {
            pontuacaoGeral: 210,
            mediaGeral: 3.75,
            classificacaoGeral: 'Clima Positivo',
            nivelGeral: 'bom'
          }
        }
      },
      {
        id: 'res-002',
        testeId: 'karasek-siegrist',
        nomeTeste: 'HumaniQ - Karasek-Siegrist',
        pontuacaoTotal: 72,
        dataRealizacao: mkDate(30),
        status: 'concluido',
        metadados: {
          tipo_teste: 'karasek-siegrist',
          teste_nome: 'HumaniQ - Karasek-Siegrist',
          analise_completa: {
            riscoGeral: { percentual: 72, nivel: 'moderado', classificacao: 'Risco Moderado' }
          }
        }
      },
      {
        id: 'result-qa-qvt-001',
        testeId: 'qualidade-vida-trabalho',
        nomeTeste: 'Qualidade de Vida no Trabalho (QVT)',
        pontuacaoTotal: 64,
        dataRealizacao: mkDate(12),
        status: 'concluido',
        metadados: {
          tipo_teste: 'qvt',
          teste_nome: 'Qualidade de Vida no Trabalho',
          percentual_geral: 64
        }
      },
      {
        id: 'result-rpo-001',
        testeId: 'rpo',
        nomeTeste: 'Riscos Psicossociais Ocupacionais (RPO)',
        pontuacaoTotal: 3.4,
        dataRealizacao: mkDate(18),
        status: 'concluido',
        metadados: {
          tipo_teste: 'rpo',
          teste_nome: 'HumaniQ RPO',
          analise_completa: { indiceGeralRisco: 3.4, classificacaoGeral: 'Moderado', nivelGeral: 'moderado' }
        }
      },
      {
        id: 'result-eo-001',
        testeId: 'estresse-ocupacional',
        nomeTeste: 'HumaniQ EO – Estresse Ocupacional',
        pontuacaoTotal: 61,
        dataRealizacao: mkDate(2),
        status: 'em_andamento',
        metadados: {
          tipo_teste: 'estresse-ocupacional',
          teste_nome: 'HumaniQ EO – Estresse Ocupacional'
        }
      },
      {
        id: 'result-pas-001',
        testeId: 'percepcao-assedio',
        nomeTeste: 'Percepção de Assédio Sexual (PAS)',
        pontuacaoTotal: 72,
        dataRealizacao: mkDate(8),
        status: 'concluido',
        metadados: {
          tipo_teste: 'percepcao-assedio',
          teste_nome: 'PAS – Percepção de Assédio Sexual'
        }
      },
      {
        id: 'result-cbe-001',
        testeId: 'clima-bem-estar',
        nomeTeste: 'Clima e Bem-Estar',
        pontuacaoTotal: 69,
        dataRealizacao: mkDate(15),
        status: 'concluido',
        metadados: {
          tipo_teste: '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5',
          teste_nome: 'Clima e Bem-Estar',
          analise_completa: { mediaGeral: 3.45 }
        }
      }
    ];
    res.end(JSON.stringify({ resultados, total: resultados.length }));
    return;
  }

  // Dados da empresa (mock)
  if (path === '/api/empresas/me' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      empresa: {
        id: '1',
        nome: 'HumaniQ AI',
        email: 'contato@humaniq.com.br',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        numeroColaboradores: 50,
        plano: 'premium',
        createdAt: new Date().toISOString()
      }
    }));
    return;
  }

  // ===== SISTEMA DE BLOQUEIO AUTOMÁTICO HUMANIQ PAS =====

  // Verificar se usuário está bloqueado (middleware-like)
  if (req.headers['x-user-id']) {
    const userId = req.headers['x-user-id'];
    const bloqueio = monitor.isUsuarioBloqueado(userId);
    if (bloqueio) {
      res.writeHead(403, corsHeaders);
      res.end(JSON.stringify({
        error: 'Usuário bloqueado por violação das políticas de uso',
        bloqueio: {
          id: bloqueio.id,
          motivo: bloqueio.motivo,
          nivelRisco: bloqueio.nivelRisco,
          timestamp: bloqueio.timestamp,
          categorias: bloqueio.categorias
        },
        message: 'Seu acesso foi suspenso devido à detecção de conteúdo inadequado. Entre em contato com o suporte para revisão.'
      }));
      return;
    }
  }

  // Endpoint para análise de conteúdo
  if (path === '/api/bloqueio/analisar' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { texto, contexto, usuarioId, testeId } = data;

        if (!texto) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({ error: 'Texto é obrigatório para análise' }));
          return;
        }

        const resultado = monitor.analisarConteudo(texto, contexto, usuarioId, testeId);

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          analise: resultado,
          message: resultado.bloqueado ? 'Conteúdo bloqueado automaticamente' : 'Conteúdo aprovado'
        }));
      } catch (error) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Erro na análise: ' + error.message }));
      }
    });
    return;
  }

  // Endpoint para listar bloqueios
  if (path === '/api/bloqueio/listar' && method === 'GET') {
    const ativo = parsedUrl.query.ativo === 'true' ? true :
      parsedUrl.query.ativo === 'false' ? false : null;

    const bloqueios = monitor.listarBloqueios(ativo);

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      success: true,
      bloqueios: bloqueios,
      total: bloqueios.length
    }));
    return;
  }

  // Endpoint para estatísticas de bloqueio
  if (path === '/api/bloqueio/estatisticas' && method === 'GET') {
    const estatisticas = monitor.getEstatisticas();

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      success: true,
      estatisticas
    }));
    return;
  }

  // Endpoint para desbloquear conteúdo (requer autorização)
  if (path === '/api/bloqueio/desbloquear' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { blockId, revisadoPor, observacoes } = data;

        if (!blockId || !revisadoPor) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({ error: 'blockId e revisadoPor são obrigatórios' }));
          return;
        }

        const bloqueio = monitor.desbloquearConteudo(blockId, revisadoPor, observacoes);

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          message: 'Conteúdo desbloqueado com sucesso',
          bloqueio
        }));
      } catch (error) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Erro ao desbloquear: ' + error.message }));
      }
    });
    return;
  }

  // Endpoint para verificar status de bloqueio de usuário
  if (path === '/api/bloqueio/status' && method === 'GET') {
    const usuarioId = parsedUrl.query.usuarioId;

    if (!usuarioId) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'usuarioId é obrigatório' }));
      return;
    }

    const bloqueio = monitor.isUsuarioBloqueado(usuarioId);

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      success: true,
      bloqueado: bloqueio !== null,
      bloqueio: bloqueio,
      message: bloqueio ? 'Usuário está bloqueado' : 'Usuário não está bloqueado'
    }));
    return;
  }

  // 404 Not Found
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({
    error: 'Endpoint não encontrado',
    path: path,
    method: method
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HumaniQ Backend ultra-simples rodando em http://0.0.0.0:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📚 Course progress: http://localhost:${PORT}/api/cursos/progresso`);
  console.log(`✅ CORS configurado para: http://localhost:5000`);
  console.log(`🛡️  Sistema de Bloqueio Automático PAS ativado`);
  console.log(`   - Análise: POST http://localhost:${PORT}/api/bloqueio/analisar`);
  console.log(`   - Listar: GET http://localhost:${PORT}/api/bloqueio/listar`);
  console.log(`   - Estatísticas: GET http://localhost:${PORT}/api/bloqueio/estatisticas`);
  console.log(`   - Status: GET http://localhost:${PORT}/api/bloqueio/status?usuarioId=ID`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
function loadConcluded() {
  try {
    const raw = fs.readFileSync('./server/concluded-tests.json', 'utf8');
    const obj = JSON.parse(raw || '{}');
    const map = new Map();
    Object.keys(obj).forEach(k => {
      map.set(k, new Set(obj[k] || []));
    });
    global.__concludedTests = map;
  } catch (_) {
    global.__concludedTests = new Map();
  }
}

function saveConcluded() {
  try {
    const obj = {};
    if (global.__concludedTests && typeof global.__concludedTests.forEach === 'function') {
      global.__concludedTests.forEach((set, k) => {
        obj[k] = Array.from(set || []);
      });
    }
    fs.writeFileSync('./server/concluded-tests.json', JSON.stringify(obj, null, 2), 'utf8');
  } catch (_) { }
}

loadConcluded();