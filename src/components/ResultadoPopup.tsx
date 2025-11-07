import React, { useState, useEffect } from 'react';
import { Eye, Download, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/apiService';
import { ResultadoVisualizacao } from '@/components/ResultadoVisualizacao';

interface ResultadoTeste {
  id: string;
  nomeTest: string;
  categoria: string;
  pontuacao: number;
  nivel?: string;
  dataRealizacao: string;
  tipoTabela?: string;
}

interface ResultadoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  resultado: ResultadoTeste | null;
}

export function ResultadoPopup({ isOpen, onClose, resultado }: ResultadoPopupProps) {
  const [dadosResultado, setDadosResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && resultado && resultado.id) {
      console.log('🔍 [ResultadoPopup] useEffect - resultado válido:', resultado);
      carregarDadosResultado();
    } else if (isOpen && !resultado) {
      console.warn('⚠️ [ResultadoPopup] useEffect - resultado é null/undefined');
      setErro('Resultado não encontrado');
    }
  }, [isOpen, resultado]);

  const carregarDadosResultado = async () => {
    if (!resultado || !resultado.id) {
      console.error('❌ [ResultadoPopup] Resultado inválido:', resultado);
      setErro('Dados do resultado não encontrados');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      console.log('🔍 [ResultadoPopup] Carregando dados para resultado:', resultado.id);
      console.log('🔍 [ResultadoPopup] Tipo de tabela:', resultado.tipoTabela);
      console.log('🔍 [ResultadoPopup] Nome do teste:', resultado.nomeTest || 'Nome não disponível');

      const { resultado: dadosCompletos } = await apiService.obterResultadoPorId(resultado.id);
      console.log('📊 [ResultadoPopup] Dados recebidos via API:', !!dadosCompletos);

      if (!dadosCompletos) {
        throw new Error('Resultado não encontrado');
      }

      // Verificar se é teste Karasek-Siegrist e tem análise completa
      const tipoTeste = dadosCompletos.metadados?.tipo_teste?.toLowerCase() || '';
      const isKarasek = tipoTeste === 'karasek-siegrist' || 
                        resultado.nomeTest?.toLowerCase().includes('karasek') ||
                        resultado.nomeTest?.toLowerCase().includes('siegrist');
                        
      if (isKarasek && dadosCompletos.metadados?.analise_completa) {
        console.log('✅ [ResultadoPopup] Teste Karasek-Siegrist com análise completa encontrada');
        setDadosResultado(dadosCompletos.metadados.analise_completa);
      } else {
        console.log('⚠️ [ResultadoPopup] Teste genérico ou sem análise completa');
        // Para resultados QVT, mapear os campos específicos
        if (resultado.tipoTabela === 'resultados_qvt' || dadosCompletos.indice_geral !== undefined) {
          const dadosQVT = {
            id: dadosCompletos.id,
            pontuacao: Math.round((dadosCompletos.indice_geral || 0) * 20),
            nivel: dadosCompletos.nivel_geral || 'Não definido',
            percentual: dadosCompletos.percentual_geral || 0,
            indice_geral: dadosCompletos.indice_geral,
            satisfacao_funcao: dadosCompletos.satisfacao_funcao,
            relacao_lideranca: dadosCompletos.relacao_lideranca,
            estrutura_condicoes: dadosCompletos.estrutura_condicoes,
            recompensas_remuneracao: dadosCompletos.recompensas_remuneracao,
            equilibrio_vida_trabalho: dadosCompletos.equilibrio_vida_trabalho,
            dimensoes_criticas: dadosCompletos.dimensoes_criticas,
            pontos_fortes: dadosCompletos.pontos_fortes,
            risco_turnover: dadosCompletos.risco_turnover
          };
          setDadosResultado(dadosQVT);
        } else {
          setDadosResultado(dadosCompletos);
        }
      }

    } catch (error) {
      console.error('❌ [ResultadoPopup] Erro ao carregar dados:', error);
      setErro('Não foi possível carregar os dados do resultado');
    } finally {
      setCarregando(false);
    }
  };

  // Obter nome do teste de várias fontes
  const obterNomeTeste = (): string => {
    if (resultado?.nomeTest) return resultado.nomeTest;
    if (dadosResultado?.metadados?.teste_nome) return dadosResultado.metadados.teste_nome;
    if (dadosResultado?.metadados?.tipo_teste) {
      const tipo = dadosResultado.metadados.tipo_teste;
      if (tipo === 'clima-organizacional') return 'Pesquisa de Clima Organizacional';
      if (tipo === 'rpo') return 'Riscos Psicossociais Ocupacionais';
      if (tipo === 'qvt') return 'Qualidade de Vida no Trabalho';
      if (tipo === 'karasek-siegrist') return 'Karasek-Siegrist';
    }
    return 'Resultado do Teste';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Eye className="h-5 w-5" />
            {obterNomeTeste()}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <ResultadoVisualizacao 
            resultado={resultado}
            dadosResultado={dadosResultado}
            carregando={carregando}
            erro={erro}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
