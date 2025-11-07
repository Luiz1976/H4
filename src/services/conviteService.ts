// Serviço para gerenciamento de convites
// Este arquivo será integrado com o banco de dados posteriormente

import { hybridInvitationService } from './invitationServiceHybrid';

export interface ConviteData {
  id: string;
  nomeEmpresa: string;
  emailContato: string;
  numeroColaboradores: number;
  tipoLiberacao: 'unico' | 'prazo';
  prazoDias?: number;
  dataCriacao: Date;
  dataExpiracao?: Date;
  status: 'ativo' | 'expirado' | 'usado';
  colaboradoresUsaram: number;
  colaboradoresRestantes: number;
  codigoConvite: string;
}

export interface ColaboradorConvite {
  id: string;
  conviteId: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  dataAcesso: Date;
  testesRealizados: string[];
}

export interface ConviteMetrics {
  totalConvites: number;
  convitesAtivos: number;
  convitesExpirados: number;
  totalColaboradores: number;
  taxaUtilizacao: number;
  convitesPorMes: { mes: string; quantidade: number }[];
}

class ConviteService {
  private convites: Map<string, ConviteData> = new Map();
  private colaboradores: Map<string, ColaboradorConvite> = new Map();

  constructor() {
    this.carregarDados();
  }

  // Gerar código único para convite
  gerarCodigoConvite(): string {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }

  // Criar novo convite
  async criarConvite(dados: Omit<ConviteData, 'id' | 'dataCriacao' | 'status' | 'colaboradoresUsaram' | 'colaboradoresRestantes' | 'codigoConvite'>): Promise<ConviteData> {
    const codigo = this.gerarCodigoConvite();
    const agora = new Date();
    
    const convite: ConviteData = {
      id: codigo,
      codigoConvite: codigo,
      dataCriacao: agora,
      status: 'ativo',
      colaboradoresUsaram: 0,
      colaboradoresRestantes: dados.numeroColaboradores,
      dataExpiracao: dados.tipoLiberacao === 'prazo' && dados.prazoDias 
        ? new Date(agora.getTime() + dados.prazoDias * 24 * 60 * 60 * 1000)
        : undefined,
      ...dados
    };

    this.convites.set(codigo, convite);
    this.salvarDados();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return convite;
  }

  // Criar convite com código específico (para correções)
  async criarConviteComCodigo(dados: Omit<ConviteData, 'id' | 'dataCriacao' | 'status' | 'colaboradoresUsaram' | 'colaboradoresRestantes'>, codigoEspecifico: string): Promise<ConviteData> {
    const agora = new Date();
    
    const convite: ConviteData = {
      id: codigoEspecifico,
      codigoConvite: codigoEspecifico,
      dataCriacao: agora,
      status: 'ativo',
      colaboradoresUsaram: 0,
      colaboradoresRestantes: dados.numeroColaboradores,
      dataExpiracao: dados.tipoLiberacao === 'prazo' && dados.prazoDias 
        ? new Date(agora.getTime() + dados.prazoDias * 24 * 60 * 60 * 1000)
        : undefined,
      ...dados
    };

    // Simular persistência (será substituído por banco de dados)
    this.convites.set(codigoEspecifico, convite);
    this.salvarDados();
    
    // Simular delay de criação
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return convite;
  }

  // Validar convite por código
  async validarConvite(codigo: string): Promise<{ valido: boolean; convite?: ConviteData; motivo?: string }> {
    console.log('🔍 [DEBUG] Validando convite:', codigo);
    console.log('🔍 [DEBUG] Total de convites carregados:', this.convites.size);
    console.log('🔍 [DEBUG] Códigos disponíveis:', Array.from(this.convites.keys()));
    
    // Simular delay de validação
    await new Promise(resolve => setTimeout(resolve, 300));

    const convite = this.convites.get(codigo);
    
    if (!convite) {
      console.log('❌ [DEBUG] Convite não encontrado no Map');
      return { valido: false, motivo: 'Código de convite não encontrado' };
    }

    console.log('✅ [DEBUG] Convite encontrado:', convite);

    if (convite.status === 'expirado') {
      console.log('❌ [DEBUG] Convite expirado');
      return { valido: false, convite, motivo: 'Convite expirado' };
    }

    if (convite.status === 'usado' && convite.tipoLiberacao === 'unico') {
      console.log('❌ [DEBUG] Convite já usado (tipo único)');
      return { valido: false, convite, motivo: 'Convite já foi utilizado' };
    }

    if (convite.dataExpiracao && new Date() > convite.dataExpiracao) {
      console.log('❌ [DEBUG] Convite vencido por data');
      convite.status = 'expirado';
      this.convites.set(codigo, convite);
      this.salvarDados();
      return { valido: false, convite, motivo: 'Convite vencido' };
    }

    if (convite.colaboradoresRestantes <= 0) {
      return { valido: false, motivo: 'Limite de colaboradores atingido', convite };
    }

    console.log('✅ [DEBUG] Convite válido!');
    return { valido: true, convite };
  }

  // Registrar colaborador no convite
  async registrarColaborador(codigoConvite: string, dadosColaborador: Omit<ColaboradorConvite, 'id' | 'conviteId' | 'dataAcesso' | 'testesRealizados'>): Promise<{ sucesso: boolean; colaborador?: ColaboradorConvite; erro?: string }> {
    // Simular delay de registro
    await new Promise(resolve => setTimeout(resolve, 500));

    const validacao = await this.validarConvite(codigoConvite);
    
    if (!validacao.valido || !validacao.convite) {
      return { sucesso: false, erro: validacao.motivo };
    }

    // Verificar se o colaborador já está registrado
    const colaboradorExistente = Array.from(this.colaboradores.values())
      .find(c => c.conviteId === codigoConvite && c.email === dadosColaborador.email);

    if (colaboradorExistente) {
      return { sucesso: false, erro: 'Colaborador já registrado neste convite' };
    }

    const colaborador: ColaboradorConvite = {
      id: `COL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conviteId: codigoConvite,
      dataAcesso: new Date(),
      testesRealizados: [],
      ...dadosColaborador
    };

    // Registrar colaborador
    this.colaboradores.set(colaborador.id, colaborador);

    // Atualizar contadores do convite
    const convite = validacao.convite;
    convite.colaboradoresUsaram += 1;
    convite.colaboradoresRestantes -= 1;

    // Se for convite único, marcar como usado
    if (convite.tipoLiberacao === 'unico') {
      convite.status = 'usado';
    }

    this.convites.set(codigoConvite, convite);
    this.salvarDados();

    return { sucesso: true, colaborador };
  }

  // Listar todos os convites
  async listarConvites(): Promise<ConviteData[]> {
    // Simular delay de consulta
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return Array.from(this.convites.values())
      .sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime());
  }

  // Obter convite por código
  async obterConvite(codigo: string): Promise<ConviteData | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.convites.get(codigo) || null;
  }

  // Listar colaboradores de um convite
  async listarColaboradoresConvite(codigoConvite: string): Promise<ColaboradorConvite[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return Array.from(this.colaboradores.values())
      .filter(c => c.conviteId === codigoConvite)
      .sort((a, b) => b.dataAcesso.getTime() - a.dataAcesso.getTime());
  }

  // Obter métricas dos convites
  async obterMetricas(): Promise<ConviteMetrics> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const convites = Array.from(this.convites.values());
    const colaboradores = Array.from(this.colaboradores.values());

    const totalConvites = convites.length;
    const convitesAtivos = convites.filter(c => c.status === 'ativo').length;
    const convitesExpirados = convites.filter(c => c.status === 'expirado').length;
    const totalColaboradores = colaboradores.length;
    
    const totalPossivel = convites.reduce((acc, c) => acc + c.numeroColaboradores, 0);
    const taxaUtilizacao = totalPossivel > 0 ? (totalColaboradores / totalPossivel) * 100 : 0;

    // Agrupar convites por mês
    const convitesPorMes = convites.reduce((acc, convite) => {
      const mes = convite.dataCriacao.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' });
      const existente = acc.find(item => item.mes === mes);
      
      if (existente) {
        existente.quantidade += 1;
      } else {
        acc.push({ mes, quantidade: 1 });
      }
      
      return acc;
    }, [] as { mes: string; quantidade: number }[]);

    return {
      totalConvites,
      convitesAtivos,
      convitesExpirados,
      totalColaboradores,
      taxaUtilizacao: Math.round(taxaUtilizacao * 100) / 100,
      convitesPorMes: convitesPorMes.sort((a, b) => a.mes.localeCompare(b.mes))
    };
  }

  // Verificar convites próximos do vencimento
  async verificarConvitesProximosVencimento(diasAntecedencia: number = 3): Promise<ConviteData[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const agora = new Date();
    const limiteData = new Date(agora.getTime() + diasAntecedencia * 24 * 60 * 60 * 1000);

    return Array.from(this.convites.values())
      .filter(convite => 
        convite.status === 'ativo' &&
        convite.dataExpiracao &&
        convite.dataExpiracao <= limiteData &&
        convite.dataExpiracao > agora
      );
  }

  // Expirar convites vencidos (função de manutenção)
  async expirarConvitesVencidos(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const agora = new Date();
    let convitesExpirados = 0;

    for (const [codigo, convite] of this.convites.entries()) {
      if (convite.status === 'ativo' && convite.dataExpiracao && convite.dataExpiracao < agora) {
        convite.status = 'expirado';
        this.convites.set(codigo, convite);
        convitesExpirados++;
      }
    }
    
    if (convitesExpirados > 0) {
      this.salvarDados();
    }

    return convitesExpirados;
  }

  // Configuração de persistência
  private configuracao = {
    tipo: 'localStorage' as 'memoria' | 'localStorage' | 'api',
    apiUrl: import.meta.env.VITE_API_URL,
    apiKey: import.meta.env.VITE_API_KEY
  };

  // Funções de persistência
  private salvarDados(): void {
    if (this.configuracao.tipo === 'localStorage') {
      try {
        const convitesArray = Array.from(this.convites.values());
        const colaboradoresArray = Array.from(this.colaboradores.values());
        localStorage.setItem('humaniq_convites', JSON.stringify(convitesArray));
        localStorage.setItem('humaniq_colaboradores', JSON.stringify(colaboradoresArray));
      } catch (error) {
        console.warn('Erro ao salvar dados no localStorage:', error);
      }
    }
  }

  private carregarDados(): void {
    console.log('🔄 [DEBUG] Iniciando carregamento de dados...');
    
    if (this.configuracao.tipo === 'localStorage') {
      try {
        const convitesData = localStorage.getItem('humaniq_convites');
        const colaboradoresData = localStorage.getItem('humaniq_colaboradores');
        
        console.log('🔄 [DEBUG] Dados brutos do localStorage - convites:', convitesData);
        console.log('🔄 [DEBUG] Dados brutos do localStorage - colaboradores:', colaboradoresData);

        if (convitesData) {
          const convites = JSON.parse(convitesData);
          console.log('🔄 [DEBUG] Convites parseados:', convites.length);
          
          convites.forEach((convite: any) => {
            // Converter strings de data para objetos Date
            convite.dataCriacao = new Date(convite.dataCriacao);
            if (convite.dataExpiracao) {
              convite.dataExpiracao = new Date(convite.dataExpiracao);
            }
            this.convites.set(convite.codigoConvite, convite);
            console.log('🔄 [DEBUG] Convite carregado:', convite.codigoConvite, '-', convite.nomeEmpresa);
          });
        }

        if (colaboradoresData) {
          const colaboradores = JSON.parse(colaboradoresData);
          console.log('🔄 [DEBUG] Colaboradores parseados:', colaboradores.length);
          
          colaboradores.forEach((colaborador: any) => {
            colaborador.dataAcesso = new Date(colaborador.dataAcesso);
            this.colaboradores.set(colaborador.id, colaborador);
          });
        }
        
        console.log('✅ [DEBUG] Carregamento concluído. Total de convites:', this.convites.size);
        console.log('✅ [DEBUG] Códigos carregados:', Array.from(this.convites.keys()));
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao carregar dados do localStorage:', error);
      }
    }
  }

  // Simular dados iniciais para demonstração
  async inicializarDadosDemo(): Promise<void> {
    console.log('[conviteService] Iniciando inicialização de dados de demonstração...');

    const hasBastosTech = this.convites.has('ap5p6bxzw3j3oowac7et8i');
    const hasOtherDemos = this.convites.size > 1;

    // Garante que o convite da Bastos Tech sempre exista
    if (!hasBastosTech) {
        console.log('[conviteService] Convite Bastos Tech não encontrado. Criando agora...');
        await this.criarConviteBastosTech();
    }

    // Garante que o convite da Bastos Tech tenha dados de uso para demonstração
    let conviteBastosTech = this.convites.get('ap5p6bxzw3j3oowac7et8i')!;
    if (conviteBastosTech && conviteBastosTech.colaboradoresUsaram === 0) {
        console.log('[conviteService] Aplicando dados de uso de demonstração ao convite Bastos Tech...');
        conviteBastosTech.colaboradoresUsaram = 342;
        conviteBastosTech.colaboradoresRestantes = conviteBastosTech.numeroColaboradores - 342;
        this.convites.set('ap5p6bxzw3j3oowac7et8i', conviteBastosTech);
        console.log('[conviteService] Convite Bastos Tech atualizado com dados de uso.');
    }

    // Se não houver outros convites de demonstração, cria-os.
    if (!hasOtherDemos) {
      console.log('[conviteService] Nenhum outro convite de demonstração encontrado. Criando agora...');
      await this.criarConvitesDemo();
    }

    this.salvarDados();

    console.log('[conviteService] Finalizada a inicialização de dados de demonstração.');
  }

  private async criarConviteBastosTech(): Promise<void> {
    const codigoBastosTech = 'ap5p6bxzw3j3oowac7et8i';
    const dadosConviteBastosTech = {
      nomeEmpresa: "Bastos Tech",
      emailContato: "contato@bastostech.com",
      numeroColaboradores: 1000,
      tipoLiberacao: "prazo" as const,
      prazoDias: 90
    };
    await this.criarConviteComCodigo(dadosConviteBastosTech, codigoBastosTech);
    console.log(`[conviteService] Convite Bastos Tech (${codigoBastosTech}) criado com sucesso.`);
    
    // Criar também o convite específico z6enelo43isyy79oj6xno8 para Rocha Tech
    const codigoEspecifico = 'z6enelo43isyy79oj6xno8';
    const dadosConviteEspecifico = {
      nomeEmpresa: "Rocha Tech",
      emailContato: "contato@rochatech.com",
      numeroColaboradores: 50,
      tipoLiberacao: "prazo" as const,
      prazoDias: 30
    };
    await this.criarConviteComCodigo(dadosConviteEspecifico, codigoEspecifico);
    console.log(`[conviteService] Convite específico Rocha Tech (${codigoEspecifico}) criado com sucesso.`);
  }

  private async criarConvitesDemo(): Promise<void> {
    const convitesDemo = [
      {
        nomeEmpresa: "TechCorp Solutions",
        emailContato: "rh@techcorp.com",
        numeroColaboradores: 25,
        tipoLiberacao: 'prazo' as const,
        prazoDias: 30
      },
      {
        nomeEmpresa: "Inovação Digital Ltda",
        emailContato: "gestao@inovacaodigital.com",
        numeroColaboradores: 15,
        tipoLiberacao: 'prazo' as const,
        prazoDias: 15
      },
      {
        nomeEmpresa: "Consultoria Estratégica",
        emailContato: "contato@consultoriaestrategica.com",
        numeroColaboradores: 8,
        tipoLiberacao: 'unico' as const
      }
    ];

    for (const dados of convitesDemo) {
      await this.criarConvite(dados);
    }
    
    this.salvarDados();
  }
}

// Instância singleton do serviço
export const conviteService = new ConviteService();

// Inicializar dados demo em desenvolvimento
if (import.meta.env.DEV) {
  conviteService.inicializarDadosDemo();
}