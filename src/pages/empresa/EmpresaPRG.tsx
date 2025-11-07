import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Download,
  QrCode,
  FileSpreadsheet,
  
  Users,
  Shield,
  Activity,
  Target,
  MessageSquare,
  Coffee,
  GraduationCap,
  Calendar,
  Loader2,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Briefcase,
  Clock
} from "lucide-react";
import Logo from '@/components/Logo';
import MatrizRisco from "@/components/prg/MatrizRisco";
import GraficoDistribuicaoRiscos from "@/components/prg/GraficoDistribuicaoRiscos";
import GraficoRadarDimensoes from "@/components/prg/GraficoRadarDimensoes";
import GraficoParliament from "@/components/prg/GraficoParliament";
import GraficoSankey from "@/components/prg/GraficoSankey";
import AreasPrioritarias from "@/components/prg/AreasPrioritarias";
import RiskGauge from "@/components/RiskGauge";

interface EmpresaData {
  nome: string;
  cnpj: string;
  endereco: string;
  setor: string;
}

interface PRGData {
  indiceGlobal: number;
  kpis: {
    indiceEstresse: number;
    climaPositivo: number;
    satisfacaoChefia: number;
    riscoBurnout: number;
    maturidadePRG: number;
    segurancaPsicologica: number;
  };
  totalColaboradores: number;
  totalTestes: number;
  cobertura: number;
  dadosPorTipo: {
    clima: number;
    estresse: number;
    burnout: number;
    qvt: number;
    assedio: number;
    disc: number;
  };
  aiAnalysis: {
    sintese: string;
    dataGeracao: string;
  };
  recomendacoes: Array<{
    categoria: string;
    prioridade: string;
    titulo: string;
    descricao: string;
    acoesPraticas?: string[];
    prazo?: string;
    responsavel?: string;
    impactoEsperado?: string;
    recursos?: string[];
  }>;
  matrizRiscos: Array<{
    nome: string;
    probabilidade: 'A' | 'B' | 'C' | 'D' | 'E';
    severidade: 1 | 2 | 3 | 4 | 5;
    categoria: string;
  }>;
  distribuicaoRiscos: Array<{
    categoria: string;
    critico: number;
    alto: number;
    moderado: number;
    baixo: number;
  }>;
  dimensoesPsicossociais: Array<{
    dimensao: string;
    valor: number;
    meta: number;
    nivel?: string; // Opcional: Crítico, Atenção, Moderado, Bom
    cor?: string;   // Opcional: red, orange, yellow, green
  }>;
  dadosParliament: Array<{
    categoria: string;
    quantidade: number;
    cor: string;
    label?: string;
  }>;
  dadosSankey: {
    nodes: Array<{ name: string }>;
    links: Array<{ source: number; target: number; value: number }>;
  };
}

export default function EmpresaPRG() {
  const [periodo, setPeriodo] = useState("90");
  const [setor, setSetor] = useState("todos");
  const [activeTab, setActiveTab] = useState("geral");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prgData, setPrgData] = useState<PRGData | null>(null);
  const [empresaData, setEmpresaData] = useState<EmpresaData | null>(null);
  const [recomendacoesExpandidas, setRecomendacoesExpandidas] = useState<Set<number>>(new Set());

  // Buscar dados do PRG ao carregar a página
  useEffect(() => {
    const fetchPRGData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        console.log('📊 [PRG Frontend] Buscando dados do PRG...');
        
        const response = await fetch('/api/empresas/prg', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [PRG Frontend] Dados recebidos COMPLETOS:', JSON.stringify(data, null, 2));
        console.log('✅ [PRG Frontend] data.empresa existe?', !!data.empresa);
        console.log('✅ [PRG Frontend] data.prg existe?', !!data.prg);
        console.log('✅ [PRG Frontend] Chaves do objeto data:', Object.keys(data));
        
        setPrgData(data.prg);
        setEmpresaData(data.empresa);
        console.log('✅ [PRG Frontend] Estados atualizados');
      } catch (err) {
        console.error('❌ [PRG Frontend] Erro:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchPRGData();
  }, [periodo, setor]); // Recarregar quando filtros mudarem

  // Toggle expansão de recomendação
  const toggleRecomendacao = (index: number) => {
    setRecomendacoesExpandidas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Mapear ícones para recomendações
  const getIconForRecomendacao = (categoria: string) => {
    const iconMap: Record<string, any> = {
      'comunicação': MessageSquare,
      'comunicacao': MessageSquare,
      'bem-estar': Coffee,
      'liderança': GraduationCap,
      'lideranca': GraduationCap,
      'governança': Calendar,
      'governanca': Calendar
    };
    return iconMap[categoria.toLowerCase()] || Target;
  };

  // Funções de exportação
  const handleExportarPlanoAcao = () => {
    if (!prgData) return;

    // Gerar documento HTML completo com todas as recomendações
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plano de Ação - PRG HumaniQ</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 40px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #f97316;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #f97316;
      margin: 0;
      font-size: 32px;
    }
    .header p {
      color: #666;
      margin: 10px 0 0 0;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #f97316;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #f97316;
      margin-top: 5px;
    }
    .recomendacao {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .rec-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    .rec-title {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      flex: 1;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-alta {
      background: #ef4444;
      color: white;
    }
    .badge-media {
      background: #f59e0b;
      color: white;
    }
    .badge-categoria {
      background: #3b82f6;
      color: white;
    }
    .rec-descricao {
      color: #4b5563;
      margin-bottom: 20px;
      font-size: 15px;
    }
    .rec-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f3f4f6;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
    }
    .info-label {
      font-weight: 600;
      color: #374151;
    }
    .section {
      margin-top: 20px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #059669;
      margin-bottom: 10px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .acoes-list {
      list-style: none;
      padding: 0;
    }
    .acoes-list li {
      padding: 8px 0 8px 20px;
      position: relative;
      color: #4b5563;
    }
    .acoes-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #059669;
      font-weight: bold;
    }
    .impacto-box {
      background: #d1fae5;
      border-left: 4px solid #059669;
      padding: 12px;
      border-radius: 6px;
      margin-top: 15px;
    }
    .recursos-box {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 12px;
      border-radius: 6px;
      margin-top: 15px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body { margin: 20px; }
      .recomendacao { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Plano de Ação - Programa de Gestão de Riscos Psicossociais</h1>
    <p>HumaniQ | Gerado em ${new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="metrics">
    <div class="metric-card">
      <div class="metric-label">Colaboradores</div>
      <div class="metric-value">${prgData.totalColaboradores}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Testes Realizados</div>
      <div class="metric-value">${prgData.totalTestes}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Índice Global PRG</div>
      <div class="metric-value">${prgData.indiceGlobal}%</div>
    </div>
  </div>

  ${prgData.recomendacoes.map((rec, index) => `
    <div class="recomendacao">
      <div class="rec-header">
        <div class="rec-title">${index + 1}. ${rec.titulo}</div>
        <span class="badge ${rec.prioridade === 'Alta' || rec.prioridade === 'alta' ? 'badge-alta' : 'badge-media'}">${rec.prioridade}</span>
        <span class="badge badge-categoria">${rec.categoria}</span>
      </div>
      
      <div class="rec-descricao">${rec.descricao}</div>
      
      ${rec.prazo || rec.responsavel ? `
        <div class="rec-info">
          ${rec.prazo ? `<div class="info-item"><span class="info-label">⏱️ Prazo:</span> ${rec.prazo}</div>` : ''}
          ${rec.responsavel ? `<div class="info-item"><span class="info-label">👥 Responsável:</span> ${rec.responsavel}</div>` : ''}
        </div>
      ` : ''}
      
      ${rec.acoesPraticas && rec.acoesPraticas.length > 0 ? `
        <div class="section">
          <div class="section-title">✅ Passos para Implementação</div>
          <ul class="acoes-list">
            ${rec.acoesPraticas.map(acao => `<li>${acao}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${rec.impactoEsperado ? `
        <div class="impacto-box">
          <strong>📈 Impacto Esperado:</strong> ${rec.impactoEsperado}
        </div>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p><strong>HumaniQ</strong> - Plataforma de Avaliação Psicológica</p>
    <p>Documento gerado automaticamente pelo sistema PRG</p>
  </div>
</body>
</html>
    `;

    // Criar blob e baixar
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plano-de-Acao-PRG-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportarExcel = () => {
    if (!prgData) return;
    
    // Criar dados CSV simples
    let csv = 'Métrica,Valor,Status\n';
    csv += `Índice Global,${prgData.indiceGlobal}%,${getStatusBadge(prgData.indiceGlobal).label}\n`;
    csv += `Índice de Estresse,${prgData.kpis.indiceEstresse}%,${getStatusBadge(prgData.kpis.indiceEstresse).label}\n`;
    csv += `Clima Positivo,${prgData.kpis.climaPositivo}%,${getStatusBadge(prgData.kpis.climaPositivo).label}\n`;
    csv += `Satisfação com Chefia,${prgData.kpis.satisfacaoChefia}%,${getStatusBadge(prgData.kpis.satisfacaoChefia).label}\n`;
    csv += `Risco de Burnout,${prgData.kpis.riscoBurnout}%,${getStatusBadge(prgData.kpis.riscoBurnout).label}\n`;
    csv += `Maturidade PRG,${prgData.kpis.maturidadePRG}%,${getStatusBadge(prgData.kpis.maturidadePRG).label}\n`;
    csv += `Segurança Psicológica,${prgData.kpis.segurancaPsicologica}%,${getStatusBadge(prgData.kpis.segurancaPsicologica).label}\n`;
    
    // Criar blob e download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prg_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportarPDF = () => {
    console.log('🔍 [PDF] Iniciando exportação do PDF...');
    console.log('🔍 [PDF] prgData existe?', !!prgData);
    console.log('🔍 [PDF] empresaData existe?', !!empresaData);
    console.log('🔍 [PDF] empresaData:', empresaData);
    
    if (!prgData || !empresaData) {
      console.error('❌ [PDF] Dados faltando! prgData:', !!prgData, 'empresaData:', !!empresaData);
      alert('Erro: Dados da empresa ou PRG não carregados. Por favor, recarregue a página.');
      return;
    }

    console.log('✅ [PDF] Dados OK, gerando PDF...');
    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const dataInicial = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
    const dataFinal = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PGR – Programa de Gerenciamento de Riscos Ocupacionais</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.8; color: #1e293b; background: white; }
    
    .cover { 
      padding: 40px 60px; 
      background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 50%, #6366f1 100%); 
      color: white; min-height: 100vh; 
      display: flex; flex-direction: column; justify-content: flex-start; 
      page-break-after: always; position: relative; overflow: hidden;
    }
    .cover::before {
      content: ''; position: absolute; top: -50%; right: -20%; 
      width: 800px; height: 800px; 
      background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
      border-radius: 50%;
    }
    .cover-header { 
      display: flex; justify-content: space-between; align-items: flex-start; 
      margin-bottom: 40px; padding-bottom: 20px; z-index: 1; position: relative;
      border-bottom: 2px solid rgba(255,255,255,0.4);
    }
    .cover-logo { 
      width: 80px; height: 80px; background: rgba(255,255,255,0.95); 
      border-radius: 16px; display: flex; align-items: center; 
      justify-content: center; font-size: 36px; font-weight: 900; 
      color: #0ea5e9; box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2);
    }
    .cover-title-section { text-align: center; flex: 1; margin: 60px 0; }
    .cover h1 { font-size: 42px; margin-bottom: 16px; font-weight: 900; letter-spacing: -0.5px; }
    .cover h2 { font-size: 20px; margin-bottom: 40px; font-weight: 300; opacity: 0.95; line-height: 1.4; }
    .cover-info-grid { 
      background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); 
      padding: 30px; border-radius: 16px; margin-top: 40px; 
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .cover-info-row { 
      display: flex; justify-content: space-between; 
      padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.2); 
    }
    .cover-info-row:last-child { border-bottom: none; }
    .cover-info-label { font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
    .cover-info-value { font-weight: 400; font-size: 15px; text-align: right; }
    .cover-footer { 
      margin-top: auto; padding-top: 30px; 
      border-top: 2px solid rgba(255,255,255,0.3); 
      font-size: 12px; opacity: 0.8; text-align: center; 
      line-height: 1.6;
    }
    
    .page { padding: 50px 60px; max-width: 210mm; margin: 0 auto; page-break-after: always; }
    
    h1 { color: #0ea5e9; font-size: 32px; margin: 40px 0 20px; border-bottom: 4px solid #0ea5e9; padding-bottom: 12px; font-weight: 800; }
    h2 { color: #7c3aed; font-size: 24px; margin: 30px 0 16px; border-bottom: 2px solid #e0e7ff; padding-bottom: 8px; font-weight: 700; }
    h3 { color: #475569; font-size: 18px; margin: 20px 0 12px; font-weight: 600; }
    
    .indice { margin: 40px 0; }
    .indice-item { margin: 12px 0; padding: 16px; background: linear-gradient(to right, #f0f9ff, #faf5ff); border-radius: 12px; border-left: 4px solid #0ea5e9; transition: transform 0.2s; }
    .indice-item a { color: #0369a1; text-decoration: none; font-weight: 600; }
    
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 30px 0; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 30px 0; }
    
    .kpi-card { 
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); 
      padding: 28px; border-radius: 16px; text-align: center; 
      border-left: 6px solid #0ea5e9; box-shadow: 0 4px 16px rgba(14,165,233,0.15), 0 2px 8px rgba(0,0,0,0.08);
    }
    .kpi-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; font-weight: 600; }
    .kpi-value { font-size: 48px; font-weight: 900; color: #0ea5e9; margin: 12px 0; background: linear-gradient(135deg, #0ea5e9, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .kpi-status { display: inline-block; padding: 8px 18px; border-radius: 24px; font-size: 12px; font-weight: 700; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-saudavel { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .status-atencao { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    .status-critico { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
    
    .ai-section { 
      background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%); 
      padding: 32px; border-radius: 20px; margin: 24px 0; 
      border-left: 8px solid #7c3aed; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.12), inset 0 1px 0 rgba(255,255,255,0.8);
    }
    .ai-section p { margin: 14px 0; font-size: 15px; color: #334155; }
    
    .dimensao-item { 
      background: white; border: 2px solid #e2e8f0; 
      border-radius: 16px; padding: 24px; margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06); transition: transform 0.2s;
    }
    .dimensao-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .dimensao-nome { font-weight: 700; font-size: 16px; color: #1e293b; }
    .dimensao-valores { font-size: 14px; color: #64748b; font-weight: 600; }
    .progress-bar { background: #e2e8f0; height: 28px; border-radius: 14px; overflow: hidden; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
    .progress-fill { background: linear-gradient(90deg, #0ea5e9 0%, #7c3aed 100%); height: 100%; transition: width 0.3s; box-shadow: 0 0 8px rgba(14,165,233,0.4); }
    
    .rec-item { 
      background: white; border: 2px solid #e2e8f0; 
      border-radius: 20px; padding: 32px; margin-bottom: 24px; 
      page-break-inside: avoid; box-shadow: 0 8px 20px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    }
    .rec-header { display: flex; gap: 14px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
    .rec-numero { 
      background: linear-gradient(135deg, #0ea5e9, #7c3aed); color: white; 
      width: 40px; height: 40px; border-radius: 12px; 
      display: flex; align-items: center; justify-content: center; 
      font-weight: 900; font-size: 18px; box-shadow: 0 4px 12px rgba(14,165,233,0.3);
    }
    .rec-titulo { flex: 1; font-size: 19px; font-weight: 800; color: #1e293b; }
    .badge { padding: 8px 16px; border-radius: 24px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .badge-alta { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
    .badge-media { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 2px 8px rgba(245,158,11,0.3); }
    .badge-baixa { background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
    
    .rec-section { margin: 18px 0; }
    .rec-section-title { font-weight: 700; color: #0ea5e9; margin-bottom: 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
    .rec-section-content { color: #475569; line-height: 1.9; }
    
    .acoes-list { margin: 12px 0 12px 20px; }
    .acoes-list li { margin: 8px 0; color: #555; }
    
    .matriz-table { width: 100%; border-collapse: collapse; margin: 24px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .matriz-table th, .matriz-table td { border: 1px solid #e2e8f0; padding: 14px 16px; text-align: left; }
    .matriz-table th { background: linear-gradient(135deg, #0ea5e9, #7c3aed); color: white; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.8px; }
    .matriz-table tr:nth-child(even) { background: #f8fafc; }
    .matriz-table tr:hover { background: #f1f5f9; }
    
    .compliance-section { background: linear-gradient(135deg, #f8fafc, #fefce8); padding: 28px; border-radius: 16px; margin: 24px 0; border: 2px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .compliance-item { margin: 18px 0; padding: 20px; background: white; border-radius: 12px; border-left: 5px solid #10b981; box-shadow: 0 2px 8px rgba(16,185,129,0.1); }
    
    .footer { text-align: center; padding: 48px; background: linear-gradient(to bottom, #f8fafc, #f1f5f9); color: #64748b; font-size: 13px; margin-top: 60px; border-top: 2px solid #e2e8f0; }
    
    @media print { 
      .page { padding: 15mm; } 
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- CAPA PROFISSIONAL PGR -->
  <div class="cover">
    <!-- Logos -->
    <div class="cover-header">
      <div class="cover-logo">🏢</div>
      <div class="cover-logo" style="background: transparent; border: 2px solid white; color: white;">AI</div>
    </div>

    <!-- Título Principal -->
    <div class="cover-title-section">
      <h1>PGR – Programa de Gerenciamento de Riscos Ocupacionais</h1>
      <h2>Relatório Analítico Gerado pela Plataforma HumaniQ AI – Inteligência em Saúde e Segurança Psicossocial</h2>
    </div>

    <!-- Informações da Empresa e do Relatório -->
    <div class="cover-info-grid">
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid rgba(255,255,255,0.3);">
        <h3 style="font-size: 18px; margin-bottom: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Empresa Avaliada</h3>
        <div class="cover-info-row">
          <span class="cover-info-label">Nome</span>
          <span class="cover-info-value">${empresaData.nome}</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">CNPJ</span>
          <span class="cover-info-value">${empresaData.cnpj}</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Endereço</span>
          <span class="cover-info-value">${empresaData.endereco}</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Setor / Unidade</span>
          <span class="cover-info-value">${empresaData.setor}</span>
        </div>
      </div>

      <div>
        <h3 style="font-size: 18px; margin-bottom: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Informações do Relatório</h3>
        <div class="cover-info-row">
          <span class="cover-info-label">Data do Relatório</span>
          <span class="cover-info-value">${dataAtual}</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Versão</span>
          <span class="cover-info-value">1.0</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Período de Análise</span>
          <span class="cover-info-value">${dataInicial} – ${dataFinal}</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Responsável Técnico</span>
          <span class="cover-info-value">Sistema HumaniQ AI</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Plataforma Geradora</span>
          <span class="cover-info-value">HumaniQ AI</span>
        </div>
        <div class="cover-info-row">
          <span class="cover-info-label">Tipo de Relatório</span>
          <span class="cover-info-value">PGR – Programa de Gerenciamento de Riscos (NR-01)</span>
        </div>
      </div>
    </div>

    <!-- Rodapé de Confidencialidade -->
    <div class="cover-footer">
      <p><strong>DOCUMENTO CONFIDENCIAL</strong></p>
      <p>Uso exclusivo da empresa avaliada e do responsável técnico conforme NR-01 e NR-09.</p>
      <p>Este documento contém informações sensíveis e protegidas pela LGPD (Lei 13.709/2018).</p>
    </div>
  </div>

  <!-- ÍNDICE -->
  <div class="page">
    <h1>📑 Índice</h1>
    <div class="indice">
      <div class="indice-item"><a href="#sumario">1. Sumário Executivo</a></div>
      <div class="indice-item"><a href="#indicadores">2. Indicadores-Chave (KPIs)</a></div>
      <div class="indice-item"><a href="#parliament">2.1. Distribuição de Colaboradores</a></div>
      <div class="indice-item"><a href="#sankey">2.2. Fluxo de Transição entre Estados</a></div>
      <div class="indice-item"><a href="#dimensoes">3. Análise por Dimensão Psicossocial</a></div>
      <div class="indice-item"><a href="#matriz">4. Matriz de Riscos</a></div>
      <div class="indice-item"><a href="#distribuicao">5. Distribuição de Riscos por Categoria</a></div>
      <div class="indice-item"><a href="#ia-analise">6. Análise Inteligente (IA)</a></div>
      <div class="indice-item"><a href="#recomendacoes">7. Recomendações Completas</a></div>
      <div class="indice-item"><a href="#compliance">8. Compliance e Regulamentações</a></div>
    </div>
  </div>

  <!-- 1. SUMÁRIO EXECUTIVO -->
  <div class="page">
    <h1 id="sumario">📈 1. Sumário Executivo</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Visão panorâmica dos principais indicadores de saúde psicossocial da organização.
    </p>
    
    <div class="grid-3">
      <div class="kpi-card">
        <div class="kpi-label">Índice Global PRG</div>
        <div class="kpi-value">${prgData.indiceGlobal}%</div>
        <div class="kpi-status ${prgData.indiceGlobal >= 80 ? 'status-saudavel' : prgData.indiceGlobal >= 60 ? 'status-atencao' : 'status-critico'}">
          ${prgData.indiceGlobal >= 80 ? 'Saudável' : prgData.indiceGlobal >= 60 ? 'Atenção' : 'Crítico'}
        </div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-label">Total de Colaboradores</div>
        <div class="kpi-value">${prgData.totalColaboradores}</div>
        <div class="kpi-status status-saudavel">Avaliados</div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-label">Cobertura da Avaliação</div>
        <div class="kpi-value">${prgData.cobertura}%</div>
        <div class="kpi-status ${prgData.cobertura >= 80 ? 'status-saudavel' : prgData.cobertura >= 60 ? 'status-atencao' : 'status-critico'}">
          ${prgData.cobertura >= 80 ? 'Excelente' : prgData.cobertura >= 60 ? 'Bom' : 'Insuficiente'}
        </div>
      </div>
    </div>

    <div class="grid-3" style="margin-top: 24px;">
      <div class="kpi-card">
        <div class="kpi-label">Total de Testes Realizados</div>
        <div class="kpi-value">${prgData.totalTestes}</div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-label">Testes de Clima</div>
        <div class="kpi-value">${prgData.dadosPorTipo.clima}</div>
      </div>
      
      <div class="kpi-card">
        <div class="kpi-label">Testes de Estresse</div>
        <div class="kpi-value">${prgData.dadosPorTipo.estresse}</div>
      </div>
    </div>
  </div>

  <!-- 2. INDICADORES-CHAVE -->
  <div class="page">
    <h1 id="indicadores">📊 2. Indicadores-Chave (KPIs)</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Principais métricas para monitoramento dos riscos psicossociais.
    </p>

    <div class="grid-2">
      <div class="kpi-card">
        <div class="kpi-label">⚡ Índice de Estresse Ocupacional</div>
        <div class="kpi-value">${prgData.kpis.indiceEstresse}%</div>
        <div class="kpi-status ${prgData.kpis.indiceEstresse >= 80 ? 'status-saudavel' : prgData.kpis.indiceEstresse >= 60 ? 'status-atencao' : 'status-critico'}">
          ${prgData.kpis.indiceEstresse >= 80 ? 'Saudável' : prgData.kpis.indiceEstresse >= 60 ? 'Atenção' : 'Crítico'}
        </div>
        <p style="margin-top: 12px; font-size: 14px; color: #666;">
          Mede o nível geral de estresse na organização
        </p>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">☀️ Clima Organizacional Positivo</div>
        <div class="kpi-value">${prgData.kpis.climaPositivo}%</div>
        <div class="kpi-status ${prgData.kpis.climaPositivo >= 80 ? 'status-saudavel' : prgData.kpis.climaPositivo >= 60 ? 'status-atencao' : 'status-critico'}">
          ${prgData.kpis.climaPositivo >= 80 ? 'Saudável' : prgData.kpis.climaPositivo >= 60 ? 'Atenção' : 'Crítico'}
        </div>
        <p style="margin-top: 12px; font-size: 14px; color: #666;">
          Percepção de ambiente de trabalho positivo
        </p>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">👔 Satisfação com Chefia</div>
        <div class="kpi-value">${prgData.kpis.satisfacaoChefia}%</div>
        <div class="kpi-status ${prgData.kpis.satisfacaoChefia >= 80 ? 'status-saudavel' : prgData.kpis.satisfacaoChefia >= 60 ? 'status-atencao' : 'status-critico'}">
          ${prgData.kpis.satisfacaoChefia >= 80 ? 'Saudável' : prgData.kpis.satisfacaoChefia >= 60 ? 'Atenção' : 'Crítico'}
        </div>
        <p style="margin-top: 12px; font-size: 14px; color: #666;">
          Qualidade da liderança e gestão
        </p>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">🔥 Risco de Burnout</div>
        <div class="kpi-value">${prgData.kpis.riscoBurnout}%</div>
        <div class="kpi-status ${prgData.kpis.riscoBurnout < 40 ? 'status-saudavel' : prgData.kpis.riscoBurnout < 60 ? 'status-atencao' : 'status-critico'}">
          ${prgData.kpis.riscoBurnout < 40 ? 'Baixo' : prgData.kpis.riscoBurnout < 60 ? 'Moderado' : 'Alto'}
        </div>
        <p style="margin-top: 12px; font-size: 14px; color: #666;">
          Probabilidade de esgotamento profissional
        </p>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">📈 Maturidade do PRG</div>
        <div class="kpi-value">${prgData.kpis.maturidadePRG}%</div>
        <div class="kpi-status ${prgData.kpis.maturidadePRG >= 80 ? 'status-saudavel' : prgData.kpis.maturidadePRG >= 60 ? 'status-atencao' : 'status-critico'}">
          ${prgData.kpis.maturidadePRG >= 80 ? 'Maduro' : prgData.kpis.maturidadePRG >= 60 ? 'Em Desenvolvimento' : 'Inicial'}
        </div>
        <p style="margin-top: 12px; font-size: 14px; color: #666;">
          Nível de implementação do programa
        </p>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">🛡️ Segurança Psicológica</div>
        <div class="kpi-value">${prgData.kpis.segurancaPsicologica}%</div>
        <div class="kpi-status ${prgData.kpis.segurancaPsicologica >= 80 ? 'status-saudavel' : prgData.kpis.segurancaPsicologica >= 60 ? 'status-atencao' : 'status-critico'}">
          ${prgData.kpis.segurancaPsicologica >= 80 ? 'Saudável' : prgData.kpis.segurancaPsicologica >= 60 ? 'Atenção' : 'Crítico'}
        </div>
        <p style="margin-top: 12px; font-size: 14px; color: #666;">
          Liberdade para expressar opiniões sem medo
        </p>
      </div>
    </div>
  </div>

  <!-- 2.1 GRÁFICO PARLIAMENT - Distribuição de Colaboradores -->
  <div class="page">
    <h1 id="parliament">👥 2.1. Distribuição de Colaboradores por Nível de Risco</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Visualização em semicírculo da distribuição dos colaboradores classificados por nível de risco psicossocial.
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <svg width="100%" height="350" viewBox="0 0 500 300" style="max-width: 700px; margin: 0 auto;">
        ${(() => {
          const total = prgData.dadosParliament.reduce((acc, d) => acc + d.quantidade, 0);
          let currentIndex = 0;
          const circles: string[] = [];
          
          prgData.dadosParliament.forEach(categoria => {
            for (let i = 0; i < categoria.quantidade; i++) {
              const angle = Math.PI - (currentIndex / total) * Math.PI;
              const radius = 120 + (Math.floor(currentIndex / 15) * 20);
              const x = 250 + radius * Math.cos(angle);
              const y = 240 - radius * Math.sin(angle);
              circles.push(`<circle cx="${x}" cy="${y}" r="5" fill="${categoria.cor}" opacity="0.85" />`);
              currentIndex++;
            }
          });
          
          return circles.join('') + `
            <text x="250" y="230" text-anchor="middle" font-size="48" font-weight="900" fill="#667eea">${total}</text>
            <text x="250" y="255" text-anchor="middle" font-size="14" fill="#666">colaboradores avaliados</text>
          `;
        })()}
      </svg>
    </div>

    <div class="grid-2" style="margin-top: 30px;">
      ${prgData.dadosParliament.map(cat => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: ${cat.cor};"></div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #1e293b;">${cat.label || cat.categoria}</div>
            <div style="font-size: 13px; color: #64748b;">${cat.quantidade} colaboradores (${((cat.quantidade / prgData.dadosParliament.reduce((acc, d) => acc + d.quantidade, 0)) * 100).toFixed(1)}%)</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- 2.2 GRÁFICO SANKEY - Fluxo entre Estados -->
  <div class="page">
    <h1 id="sankey">🔄 2.2. Fluxo de Transição entre Estados de Bem-Estar</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Diagrama de fluxo mostrando a transição dos colaboradores entre diferentes níveis de risco e clima organizacional.
    </p>

    <div style="background: linear-gradient(135deg, #667eea20 0%, #764ba250 100%); padding: 40px; border-radius: 12px; margin: 20px 0;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h3 style="color: #667eea; font-size: 18px; margin-bottom: 8px;">Interpretação do Fluxo</h3>
        <p style="color: #666; font-size: 14px;">
          Os fluxos mostram como os colaboradores em diferentes níveis de risco psicossocial se correlacionam 
          com a percepção do clima organizacional. Quanto maior o fluxo, maior a correlação entre os estados.
        </p>
      </div>

      <div class="grid-2" style="gap: 20px;">
        ${prgData.dadosSankey.links.map((link, idx) => {
          const sourceNode = prgData.dadosSankey.nodes[link.source];
          const targetNode = prgData.dadosSankey.nodes[link.target];
          const colors = ['#60a5fa', '#f97316', '#10b981'];
          const color = colors[idx % colors.length];
          
          return `
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${color};">
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 8px;">
                ${sourceNode.name} → ${targetNode.name}
              </div>
              <div style="font-size: 24px; font-weight: 900; color: ${color}; margin: 8px 0;">
                ${link.value} <span style="font-size: 14px; font-weight: 500; color: #64748b;">colaboradores</span>
              </div>
              <div style="font-size: 13px; color: #64748b;">
                Fluxo de transição identificado
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.9); border-radius: 8px;">
        <h4 style="color: #667eea; font-size: 14px; margin-bottom: 12px;">📋 Estados Mapeados:</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          ${prgData.dadosSankey.nodes.map(node => `
            <span style="padding: 6px 12px; background: #f1f5f9; border-radius: 6px; font-size: 13px; color: #475569; font-weight: 500;">
              ${node.name}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- 4. DIMENSÕES PSICOSSOCIAIS -->
  <div class="page">
    <h1 id="dimensoes">🧠 3. Análise por Dimensão Psicossocial</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Detalhamento de todas as dimensões avaliadas com valores atuais e metas estabelecidas.
    </p>

    ${prgData.dimensoesPsicossociais.map((dim, i) => `
      <div class="dimensao-item">
        <div class="dimensao-header">
          <span class="dimensao-nome">${i + 1}. ${dim.dimensao}</span>
          <span class="dimensao-valores">
            <strong style="color: #667eea;">${dim.valor}%</strong> / 
            <span style="color: #999;">Meta: ${dim.meta}%</span>
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${dim.valor}%"></div>
        </div>
        <p style="margin-top: 8px; font-size: 13px; color: ${dim.valor >= dim.meta ? '#10b981' : '#ef4444'};">
          ${dim.valor >= dim.meta 
            ? `✓ Meta atingida (${(dim.valor - dim.meta).toFixed(1)}% acima)` 
            : `⚠ Abaixo da meta (${(dim.meta - dim.valor).toFixed(1)}% para atingir)`
          }
        </p>
      </div>
    `).join('')}
  </div>

  <!-- 5. MATRIZ DE RISCOS -->
  <div class="page">
    <h1 id="matriz">⚠️ 4. Matriz de Riscos</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Mapeamento completo dos riscos psicossociais identificados com probabilidade e severidade.
    </p>

    <table class="matriz-table">
      <thead>
        <tr>
          <th>Risco Identificado</th>
          <th>Categoria</th>
          <th>Probabilidade</th>
          <th>Severidade</th>
          <th>Classificação</th>
        </tr>
      </thead>
      <tbody>
        ${prgData.matrizRiscos.map(risco => {
          const nivel = risco.probabilidade <= 'B' && risco.severidade <= 2 ? 'Baixo' 
                      : risco.probabilidade <= 'C' && risco.severidade <= 3 ? 'Moderado'
                      : risco.probabilidade <= 'D' && risco.severidade <= 4 ? 'Alto' 
                      : 'Crítico';
          const cor = nivel === 'Baixo' ? '#10b981' : nivel === 'Moderado' ? '#f59e0b' : nivel === 'Alto' ? '#ef4444' : '#991b1b';
          
          return `
            <tr>
              <td><strong>${risco.nome}</strong></td>
              <td>${risco.categoria}</td>
              <td style="text-align: center;">${risco.probabilidade}</td>
              <td style="text-align: center;">${risco.severidade}</td>
              <td style="color: ${cor}; font-weight: 600; text-align: center;">${nivel}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  <!-- 6. DISTRIBUIÇÃO DE RISCOS -->
  <div class="page">
    <h1 id="distribuicao">📊 5. Distribuição de Riscos por Categoria</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Quantidade de riscos por categoria e nível de criticidade.
    </p>

    ${prgData.distribuicaoRiscos.map((dist, i) => `
      <div class="dimensao-item">
        <h3>${i + 1}. ${dist.categoria}</h3>
        <div class="grid-2" style="margin-top: 16px;">
          <div style="text-align: center; padding: 16px; background: #fee2e2; border-radius: 8px;">
            <div style="font-size: 32px; font-weight: 900; color: #991b1b;">${dist.critico}</div>
            <div style="font-size: 13px; color: #7f1d1d; margin-top: 4px;">Crítico</div>
          </div>
          <div style="text-align: center; padding: 16px; background: #fed7aa; border-radius: 8px;">
            <div style="font-size: 32px; font-weight: 900; color: #c2410c;">${dist.alto}</div>
            <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">Alto</div>
          </div>
          <div style="text-align: center; padding: 16px; background: #fef3c7; border-radius: 8px;">
            <div style="font-size: 32px; font-weight: 900; color: #b45309;">${dist.moderado}</div>
            <div style="font-size: 13px; color: #78350f; margin-top: 4px;">Moderado</div>
          </div>
          <div style="text-align: center; padding: 16px; background: #d1fae5; border-radius: 8px;">
            <div style="font-size: 32px; font-weight: 900; color: #047857;">${dist.baixo}</div>
            <div style="font-size: 13px; color: #065f46; margin-top: 4px;">Baixo</div>
          </div>
        </div>
      </div>
    `).join('')}
  </div>

  <!-- 7. ANÁLISE INTELIGENTE -->
  <div class="page">
    <h1 id="ia-analise">🤖 6. Análise Inteligente (IA)</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Análise automatizada utilizando Inteligência Artificial para interpretação dos dados coletados.
    </p>
    
    <div class="ai-section">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <div style="font-size: 32px;">🧠</div>
        <div>
          <div style="font-weight: 700; font-size: 18px; color: #667eea;">Síntese da Análise</div>
          <div style="font-size: 13px; color: #666;">Gerado em ${new Date(prgData.aiAnalysis.dataGeracao).toLocaleDateString('pt-BR')}</div>
        </div>
      </div>
      
      ${prgData.aiAnalysis.sintese.split('\n\n').map(paragrafo => 
        `<p style="margin: 16px 0; text-align: justify;">${paragrafo}</p>`
      ).join('')}
    </div>
  </div>

  <!-- 8. RECOMENDAÇÕES COMPLETAS -->
  <div class="page">
    <h1 id="recomendacoes">💡 7. Recomendações Completas</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Plano de ação detalhado com todas as recomendações priorizadas e estruturadas.
    </p>

    ${prgData.recomendacoes.map((rec, i) => `
      <div class="rec-item">
        <div class="rec-header">
          <div class="rec-numero">${i + 1}</div>
          <div class="rec-titulo">${rec.titulo}</div>
          <span class="badge badge-${rec.prioridade.toLowerCase()}">${rec.prioridade}</span>
          <span class="badge" style="background: #e0e7ff; color: #4338ca;">${rec.categoria}</span>
        </div>

        <div class="rec-section">
          <div class="rec-section-title">📝 Descrição</div>
          <div class="rec-section-content">${rec.descricao}</div>
        </div>

        ${rec.acoesPraticas && rec.acoesPraticas.length > 0 ? `
          <div class="rec-section">
            <div class="rec-section-title">✅ Ações Práticas</div>
            <ol class="acoes-list">
              ${rec.acoesPraticas.map(acao => `<li>${acao}</li>`).join('')}
            </ol>
          </div>
        ` : ''}

        <div class="grid-2" style="margin-top: 16px;">
          ${rec.prazo ? `
            <div class="rec-section">
              <div class="rec-section-title">⏰ Prazo</div>
              <div class="rec-section-content">${rec.prazo}</div>
            </div>
          ` : ''}

          ${rec.responsavel ? `
            <div class="rec-section">
              <div class="rec-section-title">👤 Responsável</div>
              <div class="rec-section-content">${rec.responsavel}</div>
            </div>
          ` : ''}
        </div>

        ${rec.impactoEsperado ? `
          <div class="rec-section">
            <div class="rec-section-title">🎯 Impacto Esperado</div>
            <div class="rec-section-content">${rec.impactoEsperado}</div>
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>

  <!-- 9. COMPLIANCE -->
  <div class="page">
    <h1 id="compliance">📋 8. Compliance e Regulamentações</h1>
    <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
      Conformidade com normas e regulamentações aplicáveis.
    </p>

    <div class="compliance-section">
      <div class="compliance-item">
        <h3 style="color: #10b981; margin-bottom: 12px;">✓ NR-01 - Disposições Gerais e Gerenciamento de Riscos Ocupacionais</h3>
        <p style="color: #555; line-height: 1.8;">
          Este relatório está em conformidade com a NR-01, atualizada pela Portaria MTP n.º 6.730/2020, 
          que estabelece as diretrizes para o gerenciamento de riscos ocupacionais, incluindo os riscos psicossociais. 
          O PRG (Programa de Gestão de Riscos Psicossociais) integra o PGR (Programa de Gerenciamento de Riscos) 
          da organização, conforme determinado pela legislação brasileira.
        </p>
      </div>

      <div class="compliance-item">
        <h3 style="color: #10b981; margin-bottom: 12px;">✓ ISO 45003:2021 - Gestão de Saúde e Segurança Ocupacional</h3>
        <p style="color: #555; line-height: 1.8;">
          As diretrizes deste relatório seguem as recomendações da norma ISO 45003:2021, que fornece orientações 
          específicas para o gerenciamento de riscos psicossociais no ambiente de trabalho. A norma estabelece 
          um framework internacional para identificação, avaliação e controle desses riscos.
        </p>
      </div>

      <div class="compliance-item">
        <h3 style="color: #10b981; margin-bottom: 12px;">✓ LGPD - Lei Geral de Proteção de Dados (Lei 13.709/2018)</h3>
        <p style="color: #555; line-height: 1.8;">
          Todos os dados coletados e apresentados neste relatório foram tratados em conformidade com a LGPD. 
          As informações são anonimizadas e agregadas, garantindo a privacidade dos colaboradores. 
          Nenhum dado individual identificável é divulgado neste documento, respeitando os princípios 
          de finalidade, adequação, necessidade e segurança da informação.
        </p>
      </div>
    </div>

    <div style="margin-top: 40px; padding: 24px; background: #f0f4ff; border-radius: 12px; border-left: 6px solid #667eea;">
      <h3 style="color: #667eea; margin-bottom: 12px;">📌 Observações Importantes</h3>
      <ul style="margin-left: 24px; color: #555; line-height: 2;">
        <li>Este relatório deve ser revisado periodicamente (mínimo semestral)</li>
        <li>As recomendações devem ser implementadas conforme cronograma estabelecido</li>
        <li>É fundamental o envolvimento da alta gestão na execução do PRG</li>
        <li>Recomenda-se comunicar os resultados de forma transparente aos colaboradores</li>
        <li>Mantenha registros de todas as ações implementadas para auditorias futuras</li>
      </ul>
    </div>
  </div>

  <!-- SOBRE A HUMANIQ AI -->
  <div class="page">
    <h1>📱 Sobre a HumaniQ AI</h1>
    
    <div class="ai-section" style="background: linear-gradient(135deg, #f0f4ff 0%, #e3f2fd 100%); margin-bottom: 30px;">
      <h3 style="color: #667eea; font-size: 20px; margin-bottom: 16px;">🧠 Plataforma Inteligente de Gestão Psicossocial</h3>
      <p>
        A <strong>HumaniQ AI</strong> é uma plataforma inteligente especializada na análise e gestão de riscos psicossociais 
        e ocupacionais, desenvolvida com base na NR-01 e demais normativas vigentes de Saúde e Segurança do Trabalho (SST).
      </p>
      <p>
        Utilizando inteligência artificial e metodologia científica, a HumaniQ AI realiza diagnósticos automatizados, 
        cruzamento de dados de testes psicossociais e comportamentais, e gera relatórios técnicos que subsidiam a construção 
        do PGR – Programa de Gerenciamento de Riscos, de forma precisa, ética e em conformidade com os princípios da 
        prevenção e melhoria contínua.
      </p>
    </div>

    <div class="compliance-section">
      <h3 style="color: #667eea; margin-bottom: 16px;">🔒 Compromissos e Garantias</h3>
      
      <div class="compliance-item" style="border-left-color: #10b981;">
        <strong>✓ Autonomia e Imparcialidade</strong>
        <p style="margin-top: 8px; color: #666;">
          Todos os relatórios da HumaniQ AI são produzidos de forma autônoma e imparcial, sem interferência externa, 
          baseando-se exclusivamente nos resultados dos colaboradores vinculados à empresa analisada.
        </p>
      </div>

      <div class="compliance-item" style="border-left-color: #3b82f6;">
        <strong>✓ Sigilo e Confidencialidade</strong>
        <p style="margin-top: 8px; color: #666;">
          Garantimos sigilo absoluto das informações individuais, com acesso restrito e proteção integral dos dados 
          conforme LGPD (Lei 13.709/2018).
        </p>
      </div>

      <div class="compliance-item" style="border-left-color: #f59e0b;">
        <strong>✓ Integridade dos Dados</strong>
        <p style="margin-top: 8px; color: #666;">
          Todos os dados são processados com rigorosos controles de qualidade, validação cruzada e rastreabilidade 
          completa do processo avaliativo.
        </p>
      </div>

      <div class="compliance-item" style="border-left-color: #8b5cf6;">
        <strong>✓ Conformidade Normativa</strong>
        <p style="margin-top: 8px; color: #666;">
          Metodologia alinhada com NR-01, NR-09, ISO 45003:2021, diretrizes da OMS e legislação brasileira de SST.
        </p>
      </div>
    </div>

    <div style="background: #f8f9fa; padding: 24px; border-radius: 12px; margin-top: 24px; border: 2px solid #e0e0e0;">
      <p style="font-size: 14px; color: #666; line-height: 1.8; margin: 0;">
        <strong>Nota Técnica:</strong> Este relatório foi gerado automaticamente pelo sistema HumaniQ AI através da 
        análise integrada de ${prgData.totalTestes} avaliações psicossociais realizadas com ${prgData.totalColaboradores} 
        colaboradores, utilizando algoritmos de inteligência artificial validados cientificamente e processamento 
        estatístico avançado. Os resultados refletem o estado psicossocial atual da organização com base nos dados 
        coletados no período de análise especificado.
      </p>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p style="font-weight: 600; margin-bottom: 8px;">HumaniQ AI - Plataforma de Avaliação Psicológica</p>
    <p>Programa de Gestão de Riscos Psicossociais (PRG)</p>
    <p style="margin-top: 16px; font-size: 12px;">
      Relatório gerado automaticamente em ${new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </p>
    <p style="margin-top: 8px; font-size: 11px; color: #999;">
      © ${new Date().getFullYear()} HumaniQ AI. Todos os direitos reservados. | Conforme NR-01, ISO 45003 e LGPD
    </p>
  </div>

</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio-PRG-Completo-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGerarQRCode = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Erro: Token de autenticação não encontrado');
        return;
      }

      // Buscar dados da empresa para obter o ID
      const empresaResponse = await fetch('/api/empresas/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!empresaResponse.ok) {
        alert('Erro ao buscar dados da empresa');
        return;
      }

      const empresaData = await empresaResponse.json();
      const empresaId = empresaData.empresa.id;

      // Gerar token compartilhável: empresaId-timestamp
      const shareToken = `${empresaId}-${Date.now()}`;
      
      // URL pública para compartilhamento
      const publicUrl = `${window.location.origin}/prg/compartilhado/${shareToken}`;
      
      // Gerar QR Code
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}`;
      
      const modal = document.createElement('div');
      modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';
      
      const content = document.createElement('div');
      content.style.cssText = 'background: white; padding: 30px; border-radius: 16px; text-align: center; max-width: 90%; max-height: 90%; overflow: auto;';
      content.innerHTML = `
        <h2 style="color: #667eea; margin-bottom: 12px;">📱 QR Code - Dashboard PRG Público</h2>
        <p style="color: #10b981; margin-bottom: 16px; font-weight: 600; background: #d4edda; padding: 12px; border-radius: 8px;">
          ✓ Acesso LIVRE sem login - Somente via QR Code
        </p>
        <p style="color: #666; margin-bottom: 20px;">
          Compartilhe este QR Code para visualização pública do dashboard PRG
        </p>
        <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 400px; width: 100%; border: 8px solid #f0f0f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        <div style="margin-top: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
          <p style="color: #666; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Link de Acesso Público:</p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all; font-family: monospace;">${publicUrl}</p>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 12px 30px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600;">Fechar</button>
          <a href="${qrCodeUrl}" download="QRCode-PRG-Publico.png" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Baixar QR Code</a>
        </div>
      `;
      
      modal.appendChild(content);
      document.body.appendChild(modal);
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

      console.log('✅ [QR Code] Token de compartilhamento gerado:', shareToken);
      console.log('✅ [QR Code] URL pública:', publicUrl);
      
    } catch (error) {
      console.error('❌ [QR Code] Erro ao gerar QR Code:', error);
      alert('Erro ao gerar QR Code. Tente novamente.');
    }
  };

  const getStatusBadge = (valor: number) => {
    if (valor >= 80) {
      return { label: "Saudável", color: "bg-green-500/20 text-green-300 border-green-500/30" };
    } else if (valor >= 60) {
      return { label: "Atenção", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
    } else {
      return { label: "Crítico", color: "bg-red-500/20 text-red-300 border-red-500/30" };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
          <p className="text-white/70 text-lg">Carregando dados do PRG...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6 flex items-center justify-center">
        <Card className="border-red-500/50 bg-red-950/20 backdrop-blur-xl max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-white font-semibold">Erro ao carregar dados</p>
            <p className="text-white/60 text-sm">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="bg-white/10">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const indiceGlobal = prgData?.indiceGlobal || 0;
  const statusGlobal = getStatusBadge(indiceGlobal);

  // Preparar KPIs com dados reais
  const kpis = prgData ? [
    {
      titulo: "Índice de Estresse Ocupacional",
      valor: prgData.kpis.indiceEstresse,
      icon: Activity,
      color: prgData.kpis.indiceEstresse >= 60 ? "text-yellow-500" : "text-green-500",
      bgColor: prgData.kpis.indiceEstresse >= 60 ? "bg-yellow-500/10" : "bg-green-500/10"
    },
    {
      titulo: "Clima Organizacional Positivo",
      valor: prgData.kpis.climaPositivo,
      icon: Users,
      color: prgData.kpis.climaPositivo >= 60 ? "text-yellow-500" : "text-green-500",
      bgColor: prgData.kpis.climaPositivo >= 60 ? "bg-yellow-500/10" : "bg-green-500/10"
    },
    {
      titulo: "Satisfação com Chefia",
      valor: prgData.kpis.satisfacaoChefia,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      titulo: "Risco de Burnout",
      valor: prgData.kpis.riscoBurnout,
      icon: AlertTriangle,
      color: prgData.kpis.riscoBurnout >= 60 ? "text-red-500" : "text-yellow-500",
      bgColor: prgData.kpis.riscoBurnout >= 60 ? "bg-red-500/10" : "bg-yellow-500/10"
    },
    {
      titulo: "Maturidade do PRG",
      valor: prgData.kpis.maturidadePRG,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      titulo: "Percepção de Segurança Psicológica",
      valor: prgData.kpis.segurancaPsicologica,
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* IDENTIFICAÇÃO DA EMPRESA */}
        {empresaData && (
          <Card className="border-0 bg-white/5 backdrop-blur-md shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{empresaData.nome}</h2>
                  <div className="flex gap-4 text-sm text-white/70 mt-1">
                    <span>CNPJ: {empresaData.cnpj}</span>
                    {empresaData.setor !== 'Não informado' && <span>Setor: {empresaData.setor}</span>}
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border-white/20">
                  Relatório PRG
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HEADER - Inspirado no EmpresaEstadoPsicossocial */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl -z-10"></div>
          
          <Card className="border-0 bg-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
            
            <CardContent className="p-12">
              <div className="flex items-start justify-between gap-8 flex-wrap">
                <div className="flex-1 min-w-[300px] space-y-6">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                      <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                        <FileText className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black text-white" data-testid="text-page-title">
                          PRG
                        </h1>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-xl">
                          <Sparkles className="h-3 w-3 mr-1" />
                          IA Ativa
                        </Badge>
                      </div>
                      <p className="text-white/70 text-lg font-medium">
                        Programa de Gestão de Riscos Psicossociais
                      </p>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white/90">
                      Análise integrada da condição psicossocial da sua empresa
                    </h2>
                    <p className="text-white/70 text-base leading-relaxed">
                      Conforme a NR-01 e diretrizes da OMS
                    </p>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="bg-white/5 border-white/20 text-white/80 backdrop-blur-xl">
                      <Shield className="h-3 w-3 mr-1" />
                      NR-01 Compliant
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 border-white/20 text-white/80 backdrop-blur-xl">
                      <Heart className="h-3 w-3 mr-1" />
                      OMS Guidelines
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 border-white/20 text-white/80 backdrop-blur-xl">
                      <Logo size="sm" showText={false} className="h-3 w-3 mr-1" />
                      ISO 45003
                    </Badge>
                  </div>
                </div>

                {/* Risk Gauge - Energy Efficiency Style */}
                <div className="flex items-center justify-center">
                  <RiskGauge 
                    value={indiceGlobal}
                    totalTests={prgData?.totalTestes || 0}
                    size="medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILTROS DINÂMICOS */}
        <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Período</label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-periodo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="180">Últimos 180 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Setor / Unidade</label>
                <Select value={setor} onValueChange={setSetor}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-setor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os setores</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Cargo</label>
                <Select defaultValue="todos">
                  <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-cargo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os cargos</SelectItem>
                    <SelectItem value="gestao">Gestão</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Tipo de Teste</label>
                <Select defaultValue="todos">
                  <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-teste">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os testes</SelectItem>
                    <SelectItem value="clima">Clima Organizacional</SelectItem>
                    <SelectItem value="estresse">Estresse Ocupacional</SelectItem>
                    <SelectItem value="burnout">Burnout</SelectItem>
                    <SelectItem value="qvt">QVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIS - INDICADORES-CHAVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index} className="border-0 bg-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all" data-testid={`card-kpi-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                  <Badge className={getStatusBadge(kpi.valor).color + " backdrop-blur-xl"}>
                    {getStatusBadge(kpi.valor).label}
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-white/80 mb-3">{kpi.titulo}</h3>
                <div className="space-y-2">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{kpi.valor}%</span>
                  </div>
                  <Progress value={kpi.valor} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ANÁLISE INTELIGENTE DA IA - VERSÃO REVOLUCIONÁRIA */}
        <div className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 backdrop-blur-xl shadow-2xl">
          {/* Partículas de fundo animadas */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
            ))}
          </div>

          {/* Header futurista */}
          <div className="relative p-8 border-b border-white/10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl backdrop-blur-xl border border-white/20">
                    <Logo size="sm" showText={false} className="h-8 w-8 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-1 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    HumaniQ AI - Análise Inteligente
                  </h2>
                  <p className="text-white/80 font-medium text-sm">
                    Powered by Google Gemini AI • ISO 45003:2021 • NR-01 Compliant
                  </p>
                </div>
              </div>

              {/* Badges de credibilidade */}
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/30 text-green-100 backdrop-blur-xl px-3 py-1">
                  <Target className="h-3 w-3 mr-1" />
                  ISO 45003
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/30 text-blue-100 backdrop-blur-xl px-3 py-1">
                  <Shield className="h-3 w-3 mr-1" />
                  NR-01
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/30 text-purple-100 backdrop-blur-xl px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </div>

            {/* Mini KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
                <p className="text-white/70 text-xs font-medium mb-1">Colaboradores Avaliados</p>
                <p className="text-white text-2xl font-bold">{prgData?.totalColaboradores || 0}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
                <p className="text-white/70 text-xs font-medium mb-1">Testes Realizados</p>
                <p className="text-white text-2xl font-bold">{prgData?.totalTestes || 0}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
                <p className="text-white/70 text-xs font-medium mb-1">Cobertura Populacional</p>
                <p className="text-white text-2xl font-bold">{prgData?.cobertura || 0}%</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
                <p className="text-white/70 text-xs font-medium mb-1">Índice Global PRG</p>
                <p className={`text-2xl font-bold ${prgData && prgData.indiceGlobal < 40 ? 'text-red-400' : prgData && prgData.indiceGlobal < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {prgData?.indiceGlobal || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo principal da análise */}
          <div className="relative p-8 space-y-6">
            {/* Análise Visual Organizada */}
            {prgData?.aiAnalysis.sintese ? (
              <div className="space-y-4">
                {/* Processar e exibir a análise de forma estruturada */}
                {(() => {
                  const texto = prgData.aiAnalysis.sintese
                    .replace(/\*\*/g, '') // Remover asteriscos
                    .replace(/\*/g, '');
                  
                  // Dividir por parágrafos
                  const paragrafos = texto.split('\n\n').filter(p => p.trim());
                  
                  // Filtrar para remover a seção de "ÁREAS PRIORITÁRIAS PARA INTERVENÇÃO"
                  // pois agora temos um componente visual moderno para isso
                  let pularProximo = false;
                  
                  return paragrafos.map((paragrafo, idx) => {
                    // Detectar se é a seção de áreas prioritárias
                    const ehSecaoAreasPrioritarias = paragrafo.includes('ÁREAS PRIORITÁRIAS') || 
                                                      paragrafo.includes('áreas prioritárias') ||
                                                      paragrafo.includes('Foram identificadas') && paragrafo.includes('dimensões');
                    
                    // Se encontrou o título, pular este e o próximo (que é a lista)
                    if (ehSecaoAreasPrioritarias) {
                      pularProximo = true;
                      return null;
                    }
                    
                    // Se deve pular este parágrafo (é a lista de áreas prioritárias)
                    if (pularProximo) {
                      const linhas = paragrafo.split('\n');
                      const temListaDePercentuais = linhas.some(l => l.match(/\d+%\s*\(/));
                      
                      if (temListaDePercentuais) {
                        pularProximo = false;
                        return null;
                      }
                      pularProximo = false;
                    }
                    
                    // Detectar se é um título (começa com letra maiúscula e tem menos de 80 chars sem ponto final)
                    const ehTitulo = paragrafo.length < 80 && !paragrafo.endsWith('.') && paragrafo === paragrafo.toUpperCase();
                    
                    // Detectar listas (linhas que começam com •, -, ou número)
                    const linhas = paragrafo.split('\n');
                    const ehLista = linhas.some(l => l.trim().match(/^[•\-\d]/));
                    
                    if (ehTitulo) {
                      return (
                        <div key={idx} className="flex items-center gap-3 pt-4 pb-2">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Target className="h-4 w-4 text-blue-300" />
                          </div>
                          <h4 className="text-white font-bold text-base">{paragrafo}</h4>
                        </div>
                      );
                    }
                    
                    if (ehLista) {
                      return (
                        <div key={idx} className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10">
                          <div className="space-y-2">
                            {linhas.map((linha, i) => {
                              const textoLimpo = linha.trim().replace(/^[•\-\d\.]+\s*/, '');
                              if (!textoLimpo) return null;
                              
                              return (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                  <p className="text-white/85 text-sm leading-relaxed flex-1">{textoLimpo}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    
                    // Parágrafo normal
                    return (
                      <div key={idx} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/10">
                        <p className="text-white/90 text-sm leading-relaxed">{paragrafo}</p>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="h-6 w-6 text-blue-300 animate-spin" />
                  <p className="text-white/70 text-sm">Gerando análise inteligente...</p>
                </div>
              </div>
            )}

            {/* Áreas Prioritárias - Visualização Gráfica */}
            {prgData?.aiAnalysis.sintese && (
              <div className="mt-6">
                <AreasPrioritarias texto={prgData.aiAnalysis.sintese} />
              </div>
            )}

            {/* Metodologia e Frameworks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-xl p-4 border border-purple-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-purple-300" />
                  <h4 className="text-purple-200 font-bold text-sm">Modelo Karasek-Theorell</h4>
                </div>
                <p className="text-purple-100/80 text-xs">Demanda-Controle-Suporte Social (1990)</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-xl p-4 border border-blue-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-300" />
                  <h4 className="text-blue-200 font-bold text-sm">NR-01 (MTP nº 6.730/2020)</h4>
                </div>
                <p className="text-blue-100/80 text-xs">Gestão de Riscos Psicossociais</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-xl p-4 border border-green-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-300" />
                  <h4 className="text-green-200 font-bold text-sm">ISO 45003:2021</h4>
                </div>
                <p className="text-green-100/80 text-xs">Saúde e Segurança Psicológica</p>
              </div>
            </div>

            {/* Footer com timestamp */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Calendar className="h-4 w-4" />
                <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Sparkles className="h-4 w-4" />
                <span>Análise em tempo real</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS - RELATÓRIOS DETALHADOS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-xl border-0 p-1 grid grid-cols-3 md:grid-cols-7 gap-2">
            <TabsTrigger value="geral" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-geral">
              Geral
            </TabsTrigger>
            <TabsTrigger value="clima" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-clima">
              Clima
            </TabsTrigger>
            <TabsTrigger value="estresse" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-estresse">
              Estresse
            </TabsTrigger>
            <TabsTrigger value="burnout" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-burnout">
              Burnout
            </TabsTrigger>
            <TabsTrigger value="qvt" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-qvt">
              QVT
            </TabsTrigger>
            <TabsTrigger value="assedio" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white" data-testid="tab-assedio">
              Assédio
            </TabsTrigger>
          </TabsList>

          {/* GERAL - Gráfico de Radar */}
          <TabsContent value="geral" className="space-y-6">
            {/* 📊 GRÁFICO PARLIAMENT - Distribuição de Colaboradores */}
            {prgData && <GraficoParliament dados={prgData.dadosParliament} />}

            {/* 📊 GRÁFICO SANKEY - Fluxo entre Estados */}
            {prgData && <GraficoSankey dados={prgData.dadosSankey} />}

            {/* Gráfico Radar - Dimensões Psicossociais */}
            {prgData && <GraficoRadarDimensoes dados={prgData.dimensoesPsicossociais} />}

            {/* Matriz de Risco Qualitativa */}
            {prgData && <MatrizRisco riscos={prgData.matrizRiscos} />}
          </TabsContent>

          {/* CLIMA ORGANIZACIONAL */}
          <TabsContent value="clima" className="space-y-6">
            {/* Gráfico de Distribuição de Riscos */}
            {prgData && <GraficoDistribuicaoRiscos dados={prgData.distribuicaoRiscos} />}

            {/* Card com métricas de clima */}
            <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Indicadores de Clima Organizacional</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-300 text-sm font-semibold mb-1">Clima Positivo</p>
                  <p className="text-white text-3xl font-bold">{prgData?.kpis.climaPositivo}%</p>
                </div>
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <p className="text-green-300 text-sm font-semibold mb-1">Satisfação com Liderança</p>
                  <p className="text-white text-3xl font-bold">{prgData?.kpis.satisfacaoChefia}%</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ESTRESSE OCUPACIONAL */}
          <TabsContent value="estresse" className="space-y-6">
            {/* Gráfico Radar para Estresse */}
            {prgData && <GraficoRadarDimensoes dados={prgData.dimensoesPsicossociais} />}

            {/* Card com métricas de estresse */}
            <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Níveis de Estresse Ocupacional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Índice de Estresse</span>
                    <span className="text-white font-bold text-xl">{prgData?.kpis.indiceEstresse}%</span>
                  </div>
                  <Progress value={prgData?.kpis.indiceEstresse} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className={`p-4 rounded-xl ${(prgData?.kpis.riscoBurnout || 0) > 60 ? 'bg-red-500/20 border-red-500/30' : 'bg-yellow-500/20 border-yellow-500/30'} border`}>
                    <p className={`text-sm font-semibold mb-1 ${(prgData?.kpis.riscoBurnout || 0) > 60 ? 'text-red-300' : 'text-yellow-300'}`}>Risco de Burnout</p>
                    <p className="text-white text-3xl font-bold">{prgData?.kpis.riscoBurnout}%</p>
                  </div>
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <p className="text-green-300 text-sm font-semibold mb-1">Segurança Psicológica</p>
                    <p className="text-white text-3xl font-bold">{prgData?.kpis.segurancaPsicologica}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BURNOUT */}
          <TabsContent value="burnout">
            <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Burnout e Resiliência</CardTitle>
                <CardDescription className="text-white/60">
                  Indicadores de esgotamento e capacidade de recuperação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* KPI Principal */}
                <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">Risco de Burnout</h3>
                    <Badge className={`${
                      (prgData?.kpis.riscoBurnout || 0) > 60 ? 'bg-red-500' : 
                      (prgData?.kpis.riscoBurnout || 0) > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    } text-white`}>
                      {(prgData?.kpis.riscoBurnout || 0) > 60 ? 'Crítico' : 
                       (prgData?.kpis.riscoBurnout || 0) > 40 ? 'Atenção' : 'Controlado'}
                    </Badge>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-white text-5xl font-bold">{prgData?.kpis.riscoBurnout}%</span>
                    <span className="text-white/60 mb-2">da força de trabalho</span>
                  </div>
                </div>

                {/* Dimensões Relacionadas */}
                <div className="grid grid-cols-2 gap-4">
                  {prgData?.dimensoesPsicossociais
                    .filter(d => d.dimensao && ['Burnout', 'Exaustão', 'Esgotamento'].some(termo => d.dimensao.includes(termo)))
                    .slice(0, 4)
                    .map((dimensao, idx) => {
                      const nivel = dimensao.valor > 70 ? 'Bom' : dimensao.valor > 50 ? 'Atenção' : 'Crítico';
                      return (
                        <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/70 text-sm mb-2">{dimensao.dimensao}</p>
                          <div className="flex items-end gap-2">
                            <span className={`text-2xl font-bold ${
                              dimensao.valor > 70 ? 'text-green-400' :
                              dimensao.valor > 50 ? 'text-yellow-400' : 'text-red-400'
                            }`}>{Math.round(dimensao.valor)}%</span>
                            <Badge className={`mb-1 text-xs ${
                              nivel === 'Crítico' ? 'bg-red-500/80' :
                              nivel === 'Atenção' ? 'bg-yellow-500/80' : 'bg-green-500/80'
                            }`}>{nivel}</Badge>
                          </div>
                          <Progress value={dimensao.valor} className="h-2 mt-2" />
                        </div>
                      );
                    })
                  }
                </div>

                {/* Se não houver dimensões específicas de burnout */}
                {prgData?.dimensoesPsicossociais.filter(d => 
                  d.dimensao && ['Burnout', 'Exaustão', 'Esgotamento'].some(termo => d.dimensao.includes(termo))
                ).length === 0 && (
                  <div className="text-center py-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Logo size="sm" showText={false} className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-white/70">Aguardando testes específicos de burnout</p>
                    <p className="text-white/50 text-sm mt-1">O risco atual é calculado com base nos indicadores gerais de estresse</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* QVT */}
          <TabsContent value="qvt">
            <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Qualidade de Vida no Trabalho</CardTitle>
                <CardDescription className="text-white/60">
                  Indicadores de satisfação e bem-estar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dimensões de QVT */}
                <div className="grid grid-cols-2 gap-4">
                  {prgData?.dimensoesPsicossociais
                    .filter(d => d.dimensao && ['Satisfação', 'Saúde', 'Crescimento', 'Compensação', 'Condições'].some(termo => d.dimensao.includes(termo)))
                    .slice(0, 6)
                    .map((dimensao, idx) => {
                      const nivel = dimensao.valor > 70 ? 'Bom' : dimensao.valor > 50 ? 'Atenção' : 'Crítico';
                      return (
                        <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/70 text-sm mb-2">{dimensao.dimensao}</p>
                          <div className="flex items-end gap-2">
                            <span className={`text-2xl font-bold ${
                              dimensao.valor > 70 ? 'text-green-400' :
                              dimensao.valor > 50 ? 'text-yellow-400' : 'text-red-400'
                            }`}>{Math.round(dimensao.valor)}%</span>
                            <Badge className={`mb-1 text-xs ${
                              nivel === 'Crítico' ? 'bg-red-500/80' :
                              nivel === 'Atenção' ? 'bg-yellow-500/80' : 'bg-green-500/80'
                            }`}>{nivel}</Badge>
                          </div>
                          <Progress value={dimensao.valor} className="h-2 mt-2" />
                        </div>
                      );
                    })
                  }
                </div>

                {/* Indicador Geral de QVT */}
                {prgData?.dimensoesPsicossociais.filter(d => 
                  d.dimensao && ['Satisfação', 'Saúde', 'Crescimento', 'Compensação', 'Condições'].some(termo => d.dimensao.includes(termo))
                ).length > 0 && (
                  <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
                    <h3 className="text-white font-bold text-lg mb-4">Índice Geral de QVT</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-white text-5xl font-bold">
                        {Math.round(
                          prgData.dimensoesPsicossociais
                            .filter(d => d.dimensao && ['Satisfação', 'Saúde', 'Crescimento', 'Compensação', 'Condições'].some(termo => d.dimensao.includes(termo)))
                            .reduce((acc, d) => acc + d.valor, 0) / 
                          prgData.dimensoesPsicossociais.filter(d => d.dimensao && ['Satisfação', 'Saúde', 'Crescimento', 'Compensação', 'Condições'].some(termo => d.dimensao.includes(termo))).length
                        )}%
                      </span>
                      <span className="text-white/60 mb-2">média geral</span>
                    </div>
                  </div>
                )}

                {/* Se não houver dimensões específicas de QVT */}
                {prgData?.dimensoesPsicossociais.filter(d => 
                  d.dimensao && ['Satisfação', 'Saúde', 'Crescimento', 'Compensação', 'Condições'].some(termo => d.dimensao.includes(termo))
                ).length === 0 && (
                  <div className="text-center py-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Logo size="sm" showText={false} className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-white/70">Aguardando testes de Qualidade de Vida no Trabalho</p>
                    <p className="text-white/50 text-sm mt-1">Realize avaliações de QVT para ver indicadores detalhados aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ASSÉDIO */}
          <TabsContent value="assedio">
            <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Assédio Moral e Sexual</CardTitle>
                <CardDescription className="text-white/60">
                  Índice de percepção de segurança e proteção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* KPI Principal - Segurança Psicológica */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">Segurança Psicológica</h3>
                    <Badge className={`${
                      (prgData?.kpis.segurancaPsicologica || 0) > 70 ? 'bg-green-500' : 
                      (prgData?.kpis.segurancaPsicologica || 0) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    } text-white`}>
                      {(prgData?.kpis.segurancaPsicologica || 0) > 70 ? 'Saudável' : 
                       (prgData?.kpis.segurancaPsicologica || 0) > 50 ? 'Atenção' : 'Crítico'}
                    </Badge>
                  </div>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-white text-5xl font-bold">{prgData?.kpis.segurancaPsicologica}%</span>
                    <span className="text-white/60 mb-2">dos colaboradores se sentem seguros</span>
                  </div>
                  <Progress value={prgData?.kpis.segurancaPsicologica} className="h-3" />
                </div>

                {/* Dimensões Relacionadas */}
                <div className="grid grid-cols-2 gap-4">
                  {prgData?.dimensoesPsicossociais
                    .filter(d => d.dimensao && ['Assédio', 'Violência', 'Segurança Psicológica', 'Justiça'].some(termo => d.dimensao.includes(termo)))
                    .slice(0, 4)
                    .map((dimensao, idx) => {
                      const nivel = dimensao.valor > 70 ? 'Bom' : dimensao.valor > 50 ? 'Atenção' : 'Crítico';
                      return (
                        <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/70 text-sm mb-2">{dimensao.dimensao}</p>
                          <div className="flex items-end gap-2">
                            <span className={`text-2xl font-bold ${
                              dimensao.valor > 70 ? 'text-green-400' :
                              dimensao.valor > 50 ? 'text-yellow-400' : 'text-red-400'
                            }`}>{Math.round(dimensao.valor)}%</span>
                            <Badge className={`mb-1 text-xs ${
                              nivel === 'Crítico' ? 'bg-red-500/80' :
                              nivel === 'Atenção' ? 'bg-yellow-500/80' : 'bg-green-500/80'
                            }`}>{nivel}</Badge>
                          </div>
                          <Progress value={dimensao.valor} className="h-2 mt-2" />
                        </div>
                      );
                    })
                  }
                </div>

                {/* Alerta de Compliance */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Conformidade Legal</p>
                      <p className="text-white/70 text-sm">
                        A empresa mantém canais de denúncia confidenciais e políticas claras de prevenção ao assédio, 
                        em conformidade com a Lei nº 14.457/2022 e NR-01.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Se não houver dimensões específicas */}
                {prgData?.dimensoesPsicossociais.filter(d => 
                  d.dimensao && ['Assédio', 'Violência', 'Segurança Psicológica'].some(termo => d.dimensao.includes(termo))
                ).length === 0 && (
                  <div className="text-center py-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Logo size="sm" showText={false} className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-white/70">Aguardando testes específicos de assédio e segurança</p>
                    <p className="text-white/50 text-sm mt-1">O indicador atual é baseado em segurança psicológica geral</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AÇÕES RECOMENDADAS - VERSÃO APRIMORADA */}
        <Card className="border-0 bg-gradient-to-br from-orange-900/80 to-red-900/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/30 rounded-lg">
                <Target className="h-6 w-6 text-orange-200" />
              </div>
              <div>
                <CardTitle className="text-white text-2xl font-bold">Ações Recomendadas pela IA</CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Plano de ação personalizado baseado nos resultados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {prgData?.recomendacoes.map((rec, index) => {
              const IconComponent = getIconForRecomendacao(rec.categoria);
              const expandida = recomendacoesExpandidas.has(index);
              
              return (
                <div 
                  key={index} 
                  className="bg-white/10 rounded-xl border border-white/10 overflow-hidden transition-all hover:shadow-lg"
                  data-testid={`recomendacao-${index}`}
                >
                  {/* Header da recomendação */}
                  <div 
                    className="flex items-start gap-4 p-5 cursor-pointer hover:bg-white/15 transition-all"
                    onClick={() => toggleRecomendacao(index)}
                  >
                    <div className="p-3 bg-orange-500/30 rounded-xl">
                      <IconComponent className="h-6 w-6 text-orange-100" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="text-white font-bold text-lg">{rec.titulo}</h4>
                        <Badge variant="outline" className={
                          rec.prioridade === "alta" || rec.prioridade === "Alta"
                            ? "bg-red-600/90 text-white border-red-400 font-bold" 
                            : "bg-yellow-600/90 text-white border-yellow-400 font-bold"
                        }>
                          {rec.prioridade === "alta" || rec.prioridade === "Alta" ? "Alta" : "Média"}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-600/90 text-white border-blue-400">
                          {rec.categoria}
                        </Badge>
                      </div>
                      <p className="text-white/95 text-sm leading-relaxed">{rec.descricao}</p>
                      
                      {/* Indicadores rápidos */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-white/70">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{rec.prazo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{rec.responsavel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {expandida ? (
                        <ChevronUp className="h-5 w-5 text-white/60" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-white/60" />
                      )}
                    </div>
                  </div>

                  {/* Conteúdo expandido */}
                  {expandida && (
                    <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
                      {/* Ações Práticas */}
                      {rec.acoesPraticas && rec.acoesPraticas.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <h5 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Passos para Implementação
                          </h5>
                          <div className="space-y-2">
                            {rec.acoesPraticas.map((acao, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                <p className="text-white/90 text-xs leading-relaxed flex-1">{acao}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grid de informações */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Impacto Esperado */}
                        {rec.impactoEsperado && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-green-400" />
                              <span className="text-green-300 font-semibold text-xs">Impacto Esperado</span>
                            </div>
                            <p className="text-white/90 text-xs">{rec.impactoEsperado}</p>
                          </div>
                        )}

                        {/* Recursos Necessários */}
                        {rec.recursos && rec.recursos.length > 0 && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Briefcase className="h-4 w-4 text-blue-400" />
                              <span className="text-blue-300 font-semibold text-xs">Recursos Necessários</span>
                            </div>
                            <div className="space-y-1">
                              {rec.recursos.map((recurso, i) => (
                                <p key={i} className="text-white/90 text-xs">• {recurso}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4">
              <Button 
                onClick={handleExportarPlanoAcao}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 w-full text-white font-bold text-lg py-6 shadow-lg" 
                data-testid="button-exportar-plano"
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar Plano de Ação
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RELATÓRIOS EXPORTÁVEIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all cursor-pointer" data-testid="card-export-pdf">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-red-500/20 rounded-2xl">
                  <Download className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Relatório PDF Completo</h3>
                <p className="text-white/60 text-sm">Com capa, gráficos e análise descritiva da IA</p>
              </div>
              <Button 
                onClick={handleExportarPDF}
                variant="outline" 
                className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                data-testid="button-baixar-pdf"
              >
                Baixar PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all cursor-pointer" data-testid="card-export-qr">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-purple-500/20 rounded-2xl">
                  <QrCode className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">QR Code Exclusivo</h3>
                <p className="text-white/60 text-sm">Visualização online interativa</p>
              </div>
              <Button 
                onClick={handleGerarQRCode}
                variant="outline" 
                className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                data-testid="button-gerar-qrcode"
              >
                Gerar QR Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RODAPÉ HUMANIQ AI */}
        <Card className="border-0 bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 backdrop-blur-lg shadow-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Logo size="sm" showText={false} className="h-6 w-6 text-purple-300" />
                <h3 className="text-xl font-bold text-white">HumaniQ AI</h3>
              </div>
              <p className="text-white text-sm max-w-4xl mx-auto leading-relaxed">
                A <strong>HumaniQ AI</strong> é uma plataforma inteligente especializada na análise e gestão de riscos psicossociais e ocupacionais, 
                desenvolvida com base na NR-01 e demais normativas vigentes de Saúde e Segurança do Trabalho (SST). 
                Utilizando inteligência artificial e metodologia científica, a HumaniQ AI realiza diagnósticos automatizados, 
                cruzamento de dados de testes psicossociais e comportamentais, e gera relatórios técnicos que subsidiam a construção do PRG 
                – Programa de Gerenciamento de Riscos, de forma precisa, ética e em conformidade com os princípios da prevenção e melhoria contínua.
              </p>
              <p className="text-white/90 text-xs">
                Todos os relatórios da HumaniQ AI são produzidos de forma autônoma e imparcial, com base nos resultados dos colaboradores vinculados à empresa analisada, 
                garantindo sigilo, integridade dos dados e rastreabilidade completa do processo avaliativo.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  NR-01
                </Badge>
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  ISO 45003
                </Badge>
                <Badge variant="outline" className="bg-white/10 border-white/30 text-white">
                  <Logo size="sm" showText={false} className="h-3 w-3 mr-1" />
                  IA Ética
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
