import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmpresaLayout from '@/components/layout/EmpresaLayout';
import EmpresaOverview from '@/pages/empresa/EmpresaOverview';
import EmpresaColaboradores from '@/pages/empresa/EmpresaColaboradores';
import EmpresaColaboradorResultados from '@/pages/empresa/EmpresaColaboradorResultados';
import EmpresaConvites from '@/pages/empresa/EmpresaConvites';
import EmpresaGestaoConvites from '@/pages/empresa/EmpresaGestaoConvites';
import EmpresaGerarConvite from '@/pages/empresa/EmpresaGerarConvite';
import EmpresaResultados from '@/pages/empresa/EmpresaResultados';
import EmpresaEstadoPsicossocial from '@/pages/empresa/EmpresaEstadoPsicossocial';
import EmpresaPRG from '@/pages/empresa/EmpresaPRG';

const EmpresaDashboard: React.FC = () => {
  return (
    <EmpresaLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/empresa/overview" replace />} />
        <Route path="/overview" element={<EmpresaOverview />} />
        <Route path="/gestao-colaboradores" element={<EmpresaColaboradores />} />
        <Route path="/colaborador/:colaboradorId/resultados" element={<EmpresaColaboradorResultados />} />
        <Route path="/convites" element={<EmpresaConvites />} />
        <Route path="/gestao-convites" element={<EmpresaGestaoConvites />} />
        <Route path="/gerar-convite" element={<EmpresaGerarConvite />} />
        <Route path="/resultados" element={<EmpresaResultados />} />
        <Route path="/estado-psicossocial" element={<EmpresaEstadoPsicossocial />} />
        <Route path="/prg" element={<EmpresaPRG />} />
      </Routes>
    </EmpresaLayout>
  );
};

export default EmpresaDashboard;