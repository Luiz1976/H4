import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Calendar, Clock, CheckCircle, AlertTriangle, Copy, Send, Eye, Trash2, Plus, Database, Upload, FileSpreadsheet, Link as LinkIcon, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { hybridInvitationService } from '../../services/invitationServiceHybrid';
import { useAuth } from '../../hooks/AuthContext';
import { StatusConvite } from '../../lib/enums';

interface ConviteColaborador {
  id: string;
  token: string;
  email: string;
  nome: string;
  status: StatusConvite;
  validade: string;
  created_at: string;
}

interface ErpColaborador {
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  sexo?: string;
  selected?: boolean;
}

interface ColaboradorPlanilha {
  nome: string;
  cargo: string;
  setor: string;
  idade: number;
  sexo: string;
}

interface ConviteGerado {
  nome: string;
  cargo: string;
  setor: string;
  link: string;
}

const EmpresaGerarConvite: React.FC = () => {
  const [convites, setConvites] = useState<ConviteColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNovoConviteModal, setShowNovoConviteModal] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | StatusConvite>('todos');
  const [novoConvite, setNovoConvite] = useState({
    email: '',
    nome: '',
    cargo: '',
    departamento: '',
    dias_expiracao: 7
  });
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const { user } = useAuth();
  
  const [showErpLoginModal, setShowErpLoginModal] = useState(false);
  const [erpLoginForm, setErpLoginForm] = useState({
    erpType: 'TOTVS',
    username: '',
    password: '',
    customUrl: '', // URL customizada para Oracle, Microsoft, Benner, etc.
  });
  const [erpColaboradores, setErpColaboradores] = useState<ErpColaborador[]>([]);
  const [showColaboradoresTable, setShowColaboradoresTable] = useState(false);
  const [fetchingColaboradores, setFetchingColaboradores] = useState(false);
  const [generatingInvites, setGeneratingInvites] = useState(false);
  
  // Estados para importação via Excel
  const [processandoPlanilha, setProcessandoPlanilha] = useState(false);
  const [convitesGerados, setConvitesGerados] = useState<ConviteGerado[]>([]);
  const [showConvitesGerados, setShowConvitesGerados] = useState(false);

  useEffect(() => {
    carregarConvites();
  }, []);

  const fazerLoginERP = async () => {
    try {
      setFetchingColaboradores(true);
      
      if (!user?.empresaId) {
        toast.error('ID da empresa não encontrado');
        return;
      }

      if (!erpLoginForm.username || !erpLoginForm.password) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const response = await fetch('/api/erp/login-and-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erpType: erpLoginForm.erpType,
          username: erpLoginForm.username,
          password: erpLoginForm.password,
          empresaId: user.empresaId,
          ...(erpLoginForm.customUrl && { customUrl: erpLoginForm.customUrl }), // Envia URL customizada se fornecida
        }),
      });

      const data = await response.json();

      if (data.success) {
        const colaboradoresComSelecao = data.data.colaboradores.map((col: ErpColaborador) => ({
          ...col,
          selected: true,
        }));
        
        setErpColaboradores(colaboradoresComSelecao);
        setShowErpLoginModal(false);
        setShowColaboradoresTable(true);
        
        toast.success(`${data.data.totalColaboradores} colaboradores encontrados!`, {
          description: 'Selecione quais deseja convidar',
        });
      } else {
        toast.error('Erro ao conectar com o ERP', {
          description: data.error || 'Verifique suas credenciais',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer login no ERP:', error);
      toast.error('Erro ao conectar com o ERP');
    } finally {
      setFetchingColaboradores(false);
    }
  };

  const gerarConvitesEmMassa = async () => {
    try {
      setGeneratingInvites(true);
      
      if (!user?.empresaId) {
        toast.error('ID da empresa não encontrado');
        return;
      }

      const selecionados = erpColaboradores.filter(col => col.selected);
      
      if (selecionados.length === 0) {
        toast.error('Selecione pelo menos um colaborador');
        return;
      }

      const response = await fetch('/api/erp/bulk-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: user.empresaId,
          colaboradores: selecionados,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Convites gerados com sucesso!', {
          description: `${data.data.invited} convites criados, ${data.data.skipped} ignorados`,
        });
        
        setShowColaboradoresTable(false);
        setErpColaboradores([]);
        setErpLoginForm({
          erpType: 'TOTVS',
          username: '',
          password: '',
          customUrl: '',
        });
        
        carregarConvites();
      } else {
        toast.error('Erro ao gerar convites', {
          description: data.error,
        });
      }
    } catch (error) {
      console.error('Erro ao gerar convites em massa:', error);
      toast.error('Erro ao gerar convites');
    } finally {
      setGeneratingInvites(false);
    }
  };

  const toggleColaboradorSelecao = (email: string) => {
    setErpColaboradores(prev => 
      prev.map(col => 
        col.email === email ? { ...col, selected: !col.selected } : col
      )
    );
  };

  const toggleTodosColaboradores = () => {
    const todosSelecionados = erpColaboradores.every(col => col.selected);
    setErpColaboradores(prev => 
      prev.map(col => ({ ...col, selected: !todosSelecionados }))
    );
  };

  // Funções para importação via Excel
  const baixarModeloPlanilha = () => {
    // Criar dados de exemplo para o modelo
    const dadosModelo = [
      { Nome: 'João Silva', Cargo: 'Analista de TI', Setor: 'Tecnologia', Idade: 30, Sexo: 'Masculino' },
      { Nome: 'Maria Santos', Cargo: 'Gerente de RH', Setor: 'Recursos Humanos', Idade: 35, Sexo: 'Feminino' },
      { Nome: 'Pedro Oliveira', Cargo: 'Contador', Setor: 'Financeiro', Idade: 28, Sexo: 'Masculino' },
    ];

    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(dadosModelo);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');

    // Baixar arquivo
    XLSX.writeFile(wb, 'modelo_convites_colaboradores.xlsx');
    
    toast.success('Modelo baixado com sucesso!', {
      description: 'Preencha a planilha e faça o upload',
    });
  };

  const processarPlanilha = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ [EXCEL] Nenhum arquivo selecionado');
      return;
    }

    console.log('📄 [EXCEL] Arquivo selecionado:', file.name, file.size, 'bytes');

    try {
      setProcessandoPlanilha(true);

      // Ler arquivo
      console.log('📖 [EXCEL] Lendo arquivo...');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      console.log(`✅ [EXCEL] Planilha lida: ${jsonData.length} linhas encontradas`);

      if (jsonData.length === 0) {
        toast.error('Planilha vazia', {
          description: 'A planilha não contém dados',
        });
        return;
      }

      // Validar colunas
      const primeiraLinha = jsonData[0];
      const colunasEsperadas = ['Nome', 'Cargo', 'Setor', 'Idade', 'Sexo'];
      const colunasFaltando = colunasEsperadas.filter(col => !primeiraLinha.hasOwnProperty(col));

      console.log('📋 [EXCEL] Colunas encontradas:', Object.keys(primeiraLinha));
      console.log('📋 [EXCEL] Colunas esperadas:', colunasEsperadas);

      if (colunasFaltando.length > 0) {
        console.error('❌ [EXCEL] Colunas faltando:', colunasFaltando);
        toast.error('Planilha inválida', {
          description: `Colunas faltando: ${colunasFaltando.join(', ')}`,
        });
        return;
      }

      // Processar dados e gerar convites
      if (!user?.empresaId) {
        console.error('❌ [EXCEL] ID da empresa não encontrado');
        toast.error('ID da empresa não encontrado');
        return;
      }

      console.log('🏢 [EXCEL] ID da empresa:', user.empresaId);

      const convitesParaGerar = jsonData.map((linha: any) => ({
        nome: String(linha.Nome || '').trim(),
        cargo: String(linha.Cargo || '').trim(),
        setor: String(linha.Setor || '').trim(),
        idade: parseInt(linha.Idade) || 0,
        sexo: String(linha.Sexo || '').trim(),
      }));

      // Filtrar linhas vazias
      const colaboradoresValidos = convitesParaGerar.filter(c => c.nome && c.cargo && c.setor);

      console.log(`✅ [EXCEL] Colaboradores válidos: ${colaboradoresValidos.length} de ${convitesParaGerar.length}`);

      if (colaboradoresValidos.length === 0) {
        toast.error('Nenhum colaborador válido encontrado', {
          description: 'Verifique os dados da planilha',
        });
        return;
      }

      // Gerar convites
      const convitesComLinks: ConviteGerado[] = [];
      const erros: string[] = [];

      for (const colaborador of colaboradoresValidos) {
        try {
          console.log(`📤 [EXCEL] Gerando convite para: ${colaborador.nome}`);
          
          const response = await fetch('/api/convites/colaborador', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              nome: colaborador.nome,
              email: `${colaborador.nome.toLowerCase().replace(/\s+/g, '.')}@temp.com`,
              cargo: colaborador.cargo,
              departamento: colaborador.setor,
              diasValidade: 30,
            }),
          });

          const data = await response.json();
          console.log(`📥 [EXCEL] Resposta para ${colaborador.nome}:`, data);

          if (data.success && data.data?.token) {
            const linkConvite = `${window.location.origin}/convite/colaborador/${data.data.token}`;
            convitesComLinks.push({
              nome: colaborador.nome,
              cargo: colaborador.cargo,
              setor: colaborador.setor,
              link: linkConvite,
            });
            console.log(`✅ [EXCEL] Convite criado para: ${colaborador.nome}`);
          } else {
            const erro = data.error || data.message || 'Erro desconhecido';
            console.error(`❌ [EXCEL] Falha para ${colaborador.nome}:`, erro);
            erros.push(`${colaborador.nome}: ${erro}`);
          }
        } catch (error) {
          console.error(`❌ [EXCEL] Exceção ao gerar convite para ${colaborador.nome}:`, error);
          erros.push(`${colaborador.nome}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      console.log(`📊 [EXCEL] Resultado final: ${convitesComLinks.length} convites criados, ${erros.length} erros`);

      if (erros.length > 0) {
        console.error('❌ [EXCEL] Erros encontrados:', erros);
      }

      setConvitesGerados(convitesComLinks);
      setShowConvitesGerados(true);

      if (convitesComLinks.length > 0) {
        toast.success('Convites gerados!', {
          description: `${convitesComLinks.length} de ${colaboradoresValidos.length} convites criados${erros.length > 0 ? ` (${erros.length} falhas)` : ''}`,
        });
      } else {
        toast.error('Nenhum convite foi criado', {
          description: erros.length > 0 ? erros[0] : 'Erro desconhecido',
        });
      }

      // Limpar input
      event.target.value = '';
      
      // Recarregar lista de convites
      if (convitesComLinks.length > 0) {
        carregarConvites();
      }
    } catch (error) {
      console.error('❌ [EXCEL] Erro fatal ao processar planilha:', error);
      toast.error('Erro ao processar planilha', {
        description: error instanceof Error ? error.message : 'Verifique se o arquivo está no formato correto',
      });
    } finally {
      setProcessandoPlanilha(false);
    }
  };

  const copiarLink = (link: string, nome: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!', {
      description: `Link de ${nome} copiado para área de transferência`,
    });
  };

  const copiarTodosLinks = () => {
    const todosLinks = convitesGerados.map(c => `${c.nome}: ${c.link}`).join('\n\n');
    navigator.clipboard.writeText(todosLinks);
    toast.success('Todos os links copiados!', {
      description: `${convitesGerados.length} links copiados para área de transferência`,
    });
  };

  const carregarConvites = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando convites da empresa...');
      
      if (!user?.empresaId) {
        console.error('❌ ID da empresa não encontrado');
        toast.error('Erro ao carregar convites', {
          description: 'ID da empresa não encontrado'
        });
        return;
      }

      const response = await hybridInvitationService.listarConvites('colaborador', user.empresaId);
      console.log('✅ Convites carregados:', response);
      
      if (response.success && response.data) {
        setConvites(response.data as ConviteColaborador[]);
      } else {
        console.error('❌ Erro na resposta:', response.message);
        setConvites([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar convites:', error);
      toast.error('Erro ao carregar convites', {
        description: 'Tente novamente em alguns instantes'
      });
      setConvites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarConvite = async () => {
    try {
      setEnviandoConvite(true);

      if (!user?.empresaId) {
        toast.error('ID da empresa não encontrado');
        return;
      }

      if (!novoConvite.email || !novoConvite.nome) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const response = await fetch('/api/convites/colaborador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoConvite.nome,
          email: novoConvite.email,
          cargo: novoConvite.cargo,
          departamento: novoConvite.departamento,
          empresa_id: user.empresaId,
          dias_expiracao: novoConvite.dias_expiracao
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Convite criado com sucesso!', {
          description: `Enviado para ${novoConvite.email}`
        });
        setShowNovoConviteModal(false);
        setNovoConvite({
          email: '',
          nome: '',
          cargo: '',
          departamento: '',
          dias_expiracao: 7
        });
        carregarConvites();
      } else {
        toast.error('Erro ao criar convite', {
          description: data.message || 'Erro desconhecido'
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar convite:', error);
      toast.error('Erro ao criar convite', {
        description: 'Tente novamente em alguns instantes'
      });
    } finally {
      setEnviandoConvite(false);
    }
  };

  const handleCopiarLink = (token: string) => {
    const link = `${window.location.origin}/aceitar-convite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!', {
      description: 'Link do convite copiado para a área de transferência'
    });
  };

  const handleDeletarConvite = async (id: string) => {
    try {
      const response = await fetch(`/api/convites/colaborador/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Convite deletado com sucesso');
        carregarConvites();
      } else {
        toast.error('Erro ao deletar convite');
      }
    } catch (error) {
      console.error('Erro ao deletar convite:', error);
      toast.error('Erro ao deletar convite');
    }
  };

  const getStatusConvite = (convite: ConviteColaborador): StatusConvite => {
    if (convite.status === StatusConvite.ACEITO) {
      return StatusConvite.ACEITO;
    }
    
    const agora = new Date();
    const validade = new Date(convite.validade);
    
    if (agora > validade) {
      return StatusConvite.EXPIRADO;
    }
    
    return StatusConvite.PENDENTE;
  };

  const getStatusBadge = (status: StatusConvite) => {
    switch (status) {
      case StatusConvite.PENDENTE:
        return <Badge className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">Pendente</Badge>;
      case StatusConvite.ACEITO:
        return <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30">Aceito</Badge>;
      case StatusConvite.EXPIRADO:
        return <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300">Desconhecido</Badge>;
    }
  };

  const convitesFiltrados = convites.filter(convite => {
    const matchFiltro = !filtro || 
      convite.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      convite.email.toLowerCase().includes(filtro.toLowerCase());
    
    const status = getStatusConvite(convite);
    const matchStatus = statusFiltro === 'todos' || status === statusFiltro;
    
    return matchFiltro && matchStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white/60">Carregando convites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-purple-300 font-medium">Sistema Ativo e Operacional</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Central de Convites Inteligente
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Escolha o método ideal para sua empresa e gere convites profissionais em segundos.
            <span className="block text-purple-300 font-medium mt-2">
              3 formas poderosas, resultados imediatos.
            </span>
          </p>
        </div>

        {/* Seção destacando as 3 formas */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 text-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Convite Individual</h3>
            <p className="text-white/60 text-sm">Personalização total para colaboradores específicos</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">2</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Integração ERP</h3>
            <p className="text-white/60 text-sm">Importação automática e sincronizada</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6 text-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">3</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Importação Excel</h3>
            <p className="text-white/60 text-sm">Escala e praticidade em segundos</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* CARD 1: Convites Individuais */}
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group">
            <CardHeader className="border-b border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl text-white" data-testid="text-card-individual-title">Convite Personalizado</CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs">Método 1</Badge>
                  </div>
                  <CardDescription className="text-white/70 leading-relaxed">
                    <strong className="text-purple-300">Atenção individual,</strong> resultados excepcionais.
                    <br />
                    Ideal para colaboradores VIP e casos especiais.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Dialog open={showNovoConviteModal} onOpenChange={setShowNovoConviteModal}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 mb-6 font-semibold text-base py-6 transition-all duration-300"
                    data-testid="button-novo-convite"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Criar Convite Agora
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Convite</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do colaborador para gerar o convite
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        placeholder="João Silva"
                        value={novoConvite.nome}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, nome: e.target.value }))}
                        data-testid="input-nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="joao@empresa.com"
                        value={novoConvite.email}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, email: e.target.value }))}
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        placeholder="Analista"
                        value={novoConvite.cargo}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, cargo: e.target.value }))}
                        data-testid="input-cargo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input
                        id="departamento"
                        placeholder="TI"
                        value={novoConvite.departamento}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, departamento: e.target.value }))}
                        data-testid="input-departamento"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dias_expiracao">Dias de Validade</Label>
                      <Input
                        id="dias_expiracao"
                        type="number"
                        min="1"
                        max="30"
                        value={novoConvite.dias_expiracao}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, dias_expiracao: parseInt(e.target.value) }))}
                        data-testid="input-dias-expiracao"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowNovoConviteModal(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCriarConvite}
                        disabled={enviandoConvite || !novoConvite.email || !novoConvite.nome}
                        data-testid="button-enviar-convite"
                      >
                        {enviandoConvite ? 'Enviando...' : 'Enviar Convite'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-white/60">Total</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-convites">{convites.length}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm text-white/60">Pendentes</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-pendentes">
                    {convites.filter(c => getStatusConvite(c) === StatusConvite.PENDENTE).length}
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-sm text-white/60">Usados</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-usados">
                    {convites.filter(c => getStatusConvite(c) === StatusConvite.ACEITO).length}
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-white/60">Expirados</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-expirados">
                    {convites.filter(c => getStatusConvite(c) === StatusConvite.EXPIRADO).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: Integração com ERP */}
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 group">
            <CardHeader className="border-b border-white/10 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl text-white" data-testid="text-card-erp-title">Conexão ERP</CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Método 2</Badge>
                  </div>
                  <CardDescription className="text-white/70 leading-relaxed">
                    <strong className="text-emerald-300">Automação inteligente,</strong> zero esforço manual.
                    <br />
                    Sincronize com TOTVS, SAP, Senior e mais.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {showColaboradoresTable ? (
                <div className="space-y-4">
                  {/* Header com seleção e botão */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={erpColaboradores.every(col => col.selected)}
                        onCheckedChange={toggleTodosColaboradores}
                        data-testid="checkbox-select-all"
                      />
                      <span className="text-white text-sm">
                        {erpColaboradores.filter(col => col.selected).length} de {erpColaboradores.length} selecionados
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        setShowColaboradoresTable(false);
                        setErpColaboradores([]);
                      }}
                      variant="ghost"
                      className="text-white/60 hover:text-white"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>

                  {/* Tabela de colaboradores */}
                  <div className="bg-white/5 border border-white/10 rounded-lg max-h-96 overflow-y-auto">
                    {erpColaboradores.map((col, index) => (
                      <div 
                        key={col.email}
                        className="flex items-center gap-3 p-3 border-b border-white/5 last:border-0 hover:bg-white/5"
                        data-testid={`colaborador-row-${index}`}
                      >
                        <Checkbox
                          checked={col.selected}
                          onCheckedChange={() => toggleColaboradorSelecao(col.email)}
                          data-testid={`checkbox-${col.email}`}
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{col.nome}</p>
                          <p className="text-white/60 text-sm">{col.email}</p>
                          {(col.cargo || col.departamento) && (
                            <p className="text-white/40 text-xs mt-1">
                              {[col.cargo, col.departamento].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botão de ação */}
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                    onClick={gerarConvitesEmMassa}
                    disabled={generatingInvites || erpColaboradores.filter(col => col.selected).length === 0}
                    data-testid="button-gerar-convites-massa"
                  >
                    {generatingInvites ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Gerando Convites...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Gerar {erpColaboradores.filter(col => col.selected).length} Convites
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Informativo */}
                  <Alert className="bg-emerald-500/10 border-emerald-500/20">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <AlertDescription className="text-white/70">
                      <strong className="text-white">Faça login no seu ERP</strong> e importe colaboradores automaticamente.
                    </AlertDescription>
                  </Alert>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <LinkIcon className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-white">Login Direto</h4>
                        <p className="text-sm text-white/60">Use suas credenciais habituais do ERP</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <Upload className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-white">Importação em Lote</h4>
                        <p className="text-sm text-white/60">Busque e selecione múltiplos colaboradores</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-white">Validação Automática</h4>
                        <p className="text-sm text-white/60">Verifica duplicatas e dados inválidos</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Dialog open={showErpLoginModal} onOpenChange={setShowErpLoginModal}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/50 font-semibold text-base py-6 transition-all duration-300"
                        data-testid="button-conectar-erp"
                      >
                        <Database className="h-5 w-5 mr-2" />
                        Conectar Agora
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Login no ERP</DialogTitle>
                        <DialogDescription>
                          Entre com suas credenciais do sistema ERP
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tipo de ERP</Label>
                          <Select 
                            value={erpLoginForm.erpType} 
                            onValueChange={(value) => setErpLoginForm(prev => ({ 
                              ...prev, 
                              erpType: value,
                              customUrl: '' // Limpa URL ao trocar de ERP
                            }))}
                          >
                            <SelectTrigger data-testid="select-tipo-erp">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TOTVS">✅ TOTVS (Protheus/RM/Datasul)</SelectItem>
                              <SelectItem value="SAP">✅ SAP (S/4HANA/Business One)</SelectItem>
                              <SelectItem value="SENIOR">🔐 Senior Sistemas</SelectItem>
                              <SelectItem value="SANKHYA">🔐 Sankhya</SelectItem>
                              <SelectItem value="MICROSOFT">⚙️ Microsoft Dynamics 365</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Campo de URL Customizada - Apenas para Microsoft */}
                        {erpLoginForm.erpType === 'MICROSOFT' && (
                          <div className="space-y-2">
                            <Label>URL do Tenant Dynamics 365 *</Label>
                            <Input
                              placeholder="https://suaorg.crm4.dynamics.com"
                              value={erpLoginForm.customUrl}
                              onChange={(e) => setErpLoginForm(prev => ({ ...prev, customUrl: e.target.value }))}
                              data-testid="input-custom-url"
                            />
                            <Alert className="bg-blue-50 border-blue-200">
                              <AlertDescription className="text-sm text-blue-800">
                                <strong>Como obter a URL Dynamics 365:</strong>
                                <br />
                                1. Faça login no Dynamics 365
                                <br />
                                2. A URL no navegador é algo como: <code className="bg-blue-100 px-1 rounded">https://contoso.crm4.dynamics.com</code>
                                <br />
                                3. Copie até <code className="bg-blue-100 px-1 rounded">.dynamics.com</code>
                                <br />
                                <br />
                                <strong>Formato:</strong> <code className="bg-blue-100 px-1 rounded">https://{'{'}{'{'}organização{'}'}.{'{'}{'{'}região{'}'}.dynamics.com</code>
                                <br />
                                <strong>Regiões:</strong> crm (EUA), crm2 (América do Sul), crm4 (EMEA), crm5 (Ásia)
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Usuário</Label>
                          <Input
                            placeholder="Seu usuário do ERP"
                            value={erpLoginForm.username}
                            onChange={(e) => setErpLoginForm(prev => ({ ...prev, username: e.target.value }))}
                            data-testid="input-username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Senha</Label>
                          <Input
                            type="password"
                            placeholder="Sua senha do ERP"
                            value={erpLoginForm.password}
                            onChange={(e) => setErpLoginForm(prev => ({ ...prev, password: e.target.value }))}
                            data-testid="input-password"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowErpLoginModal(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            onClick={fazerLoginERP}
                            disabled={
                              fetchingColaboradores || 
                              !erpLoginForm.username || 
                              !erpLoginForm.password ||
                              // Requer URL customizada para Microsoft
                              (erpLoginForm.erpType === 'MICROSOFT' && !erpLoginForm.customUrl)
                            }
                            data-testid="button-login-erp"
                          >
                            {fetchingColaboradores ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Conectando...
                              </>
                            ) : (
                              <>
                                <Database className="h-4 w-4 mr-2" />
                                Conectar e Buscar
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 3: Importação via Planilha Excel */}
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 group">
            <CardHeader className="border-b border-white/10 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl text-white" data-testid="text-card-excel-title">Importação em Massa</CardTitle>
                    <Badge className="bg-orange-500/20 text-orange-300 text-xs">Método 3</Badge>
                  </div>
                  <CardDescription className="text-white/70 leading-relaxed">
                    <strong className="text-orange-300">Escala total,</strong> centenas em minutos.
                    <br />
                    Perfeito para onboarding de grandes equipes.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {showConvitesGerados ? (
                <div className="space-y-4">
                  {/* Header com total e botão fechar */}
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">
                      {convitesGerados.length} convites gerados
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={copiarTodosLinks}
                        variant="outline"
                        className="text-orange-400 border-orange-400/50 hover:bg-orange-400/10"
                        size="sm"
                        data-testid="button-copiar-todos-links"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Todos
                      </Button>
                      <Button
                        onClick={() => {
                          setShowConvitesGerados(false);
                          setConvitesGerados([]);
                        }}
                        variant="ghost"
                        className="text-white/60 hover:text-white"
                        size="sm"
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>

                  {/* Lista de links gerados */}
                  <div className="bg-white/5 border border-white/10 rounded-lg max-h-96 overflow-y-auto">
                    {convitesGerados.map((convite, index) => (
                      <div 
                        key={index}
                        className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5"
                        data-testid={`convite-gerado-${index}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{convite.nome}</p>
                            <p className="text-white/60 text-sm">{convite.cargo} • {convite.setor}</p>
                            <p className="text-white/40 text-xs mt-1 truncate">{convite.link}</p>
                          </div>
                          <Button
                            onClick={() => copiarLink(convite.link, convite.nome)}
                            variant="ghost"
                            size="sm"
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 flex-shrink-0"
                            data-testid={`button-copiar-link-${index}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Alert className="bg-orange-500/10 border-orange-500/20">
                    <AlertDescription className="text-white/80 text-sm">
                      <strong>Próximos passos:</strong> Copie os links e envie para cada colaborador por email, WhatsApp ou outro meio de comunicação.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Seção 1: Download do Modelo */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 font-medium text-sm">Passo 1: Obtenha o Modelo</span>
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs">Gratuito</Badge>
                    </div>
                    <Button 
                      onClick={baixarModeloPlanilha}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-orange-500/50 font-semibold text-base py-6 transition-all duration-300"
                      data-testid="button-baixar-modelo"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Baixar Modelo Excel
                    </Button>
                    <p className="text-white/50 text-xs text-center">Arquivo .XLSX com 5 colunas prontas</p>
                  </div>

                  {/* Divisor */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 px-4 text-sm text-white/40">Em seguida</span>
                    </div>
                  </div>

                  {/* Seção 2: Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 font-medium text-sm">Passo 2: Faça o Upload</span>
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs">Automático</Badge>
                    </div>
                    
                    {/* Upload Area */}
                    <div className="relative">
                      <input
                        id="upload-excel"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={processarPlanilha}
                        disabled={processandoPlanilha}
                        className="hidden"
                        data-testid="input-upload-excel"
                      />
                      <label 
                        htmlFor="upload-excel"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-500/30 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Upload className="h-8 w-8 text-orange-400 group-hover:text-orange-300 transition-colors" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-white/90">
                              Clique para selecionar o arquivo
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              ou arraste e solte aqui
                            </p>
                            <p className="text-xs text-orange-400/80 mt-2">
                              Arquivos .XLSX ou .XLS
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Status de processamento */}
                    {processandoPlanilha && (
                      <div className="flex items-center gap-3 text-orange-300 text-sm bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent" />
                        <div>
                          <p className="font-medium">Processando planilha...</p>
                          <p className="text-xs text-white/60 mt-0.5">Gerando convites automaticamente</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divisor */}
                  <div className="border-t border-white/10"></div>

                  {/* Seção 3: Informações */}
                  <div className="space-y-4">
                    {/* Requisitos do Arquivo */}
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                      <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-orange-400" />
                        Requisitos da Planilha
                      </h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                          <p className="text-xs text-white/50 mb-1">Formato</p>
                          <p className="text-white font-bold">.XLSX</p>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                          <p className="text-xs text-white/50 mb-1">Colunas</p>
                          <p className="text-white font-bold">5</p>
                        </div>
                      </div>
                      <div className="text-xs text-white/60 space-y-1">
                        <p>✓ Nome, Cargo, Setor, Idade, Sexo</p>
                        <p>✓ Preencha todos os campos</p>
                        <p>✓ Uma linha por colaborador</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista de Convites Existentes */}
        <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Convites Criados</CardTitle>
            <CardDescription className="text-white/60">
              Gerencie todos os convites enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  data-testid="input-filtro"
                />
                <Select value={statusFiltro} onValueChange={(value: any) => setStatusFiltro(value)}>
                  <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white" data-testid="select-status-filtro">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value={StatusConvite.PENDENTE}>Pendentes</SelectItem>
                    <SelectItem value={StatusConvite.ACEITO}>Aceitos</SelectItem>
                    <SelectItem value={StatusConvite.EXPIRADO}>Expirados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {convitesFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Nenhum convite encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {convitesFiltrados.map((convite) => {
                    const status = getStatusConvite(convite);
                    return (
                      <div
                        key={convite.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                        data-testid={`convite-${convite.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">{convite.nome}</h3>
                              {getStatusBadge(status)}
                            </div>
                            <p className="text-sm text-white/60 mb-1">
                              <Mail className="inline h-3 w-3 mr-1" />
                              {convite.email}
                            </p>
                            <p className="text-xs text-white/40">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              Expira em: {new Date(convite.validade).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopiarLink(convite.token)}
                              className="bg-white/5 border-white/20 hover:bg-white/10 text-white"
                              data-testid={`button-copiar-${convite.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {status === StatusConvite.PENDENTE && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletarConvite(convite.id)}
                                className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
                                data-testid={`button-deletar-${convite.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmpresaGerarConvite;
