import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Login from './pages/Login';
import PostLoginAnimation from './pages/PostLoginAnimation';
import { MainLayout } from "@/components/layout/MainLayout";
import { EmpresaLayout } from "@/components/layout/EmpresaLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Colaborador from "./pages/Colaborador";
import Empresa from "./pages/Empresa";
import EmpresaDashboard from "./pages/EmpresaDashboard";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmpresas from "./pages/admin/AdminEmpresas";
import AdminEmpresaDetalhes from "./pages/admin/AdminEmpresaDetalhes";
import AdminConvites from "./pages/admin/AdminConvites";
import AdminEstatisticas from "./pages/admin/AdminEstatisticas";
import EmpresaOverview from "./pages/empresa/EmpresaOverview";
import EmpresaColaboradores from "./pages/empresa/EmpresaColaboradores";
import EmpresaConvites from "./pages/empresa/EmpresaConvites";
import EmpresaGestaoConvites from "./pages/empresa/EmpresaGestaoConvites";
import EmpresaGerarConvite from "./pages/empresa/EmpresaGerarConvite";
import EmpresaResultados from "./pages/empresa/EmpresaResultados";
import EmpresaColaboradorResultados from "./pages/empresa/EmpresaColaboradorResultados";
import EmpresaEstadoPsicossocial from "./pages/empresa/EmpresaEstadoPsicossocial";
import EmpresaPRG from "./pages/empresa/EmpresaPRG";
import PRGPublico from "./pages/PRGPublico";
import GestaoAI from "./pages/GestaoAI";
import GestaoConvite from "./pages/GestaoConvite";
import AcessoConvite from "./pages/AcessoConvite";
import DashboardConvites from "./pages/DashboardConvites";
import ModuleSelection from "./pages/ModuleSelection";
import Testes from "./pages/Testes";
import Resultados from "./pages/Resultados";
import TodosResultados from "./pages/TodosResultados";
import TesteIntroducao from "./pages/TesteIntroducao";
import TesteKarasekSiegristIntroducao from "./pages/TesteKarasekSiegristIntroducao";
import TesteClimaOrganizacionalIntroducao from "./pages/TesteClimaOrganizacionalIntroducao";
import TesteEstresseOcupacionalIntroducao from "./pages/TesteEstresseOcupacionalIntroducao";
import TesteClimaBemEstarIntroducao from "./pages/TesteClimaBemEstarIntroducao";
import TesteClimaBemEstarPerguntas from "./pages/TesteClimaBemEstarPerguntas";
import TesteHumaniQInsightIntroducao from "./pages/TesteHumaniQInsightIntroducao";
import ResultadoHumaniQInsight from "./pages/ResultadoHumaniQInsight";
import ResultadoClimaBemEstar from "./pages/ResultadoClimaBemEstar";
import TesteMGRPIntroducao from "./pages/TesteMGRPIntroducao";
import TesteMGRPPerguntas from "./pages/TesteMGRPPerguntas";
import ResultadoMaturidadeRiscosPsicossociais from "./pages/ResultadoMaturidadeRiscosPsicossociais";
import TestePASIntroducao from "./pages/TestePASIntroducao";
import TestePASPerguntas from "./pages/TestePASPerguntas";
import ResultadoPAS from "./pages/ResultadoPAS";
import TesteQVTIntroducao from "./pages/TesteQVTIntroducao";
import TesteQVTPerguntas from "./pages/TesteQVTPerguntas";
import TesteRPOIntroducao from "./pages/TesteRPOIntroducao";
import TesteRPOPerguntas from "./pages/TesteRPOPerguntas";
import ResultadoRPO from "./pages/ResultadoRPO";
import TestePerguntas from "./pages/TestePerguntas";
import TesteRPO from "./pages/TesteRPO";
import TesteKarasekSiegristPerguntas from "./pages/TesteKarasekSiegristPerguntas";
import ResultadoKarasekSiegrist from "./pages/ResultadoKarasekSiegrist";
import TesteEstresseOcupacionalPerguntas from "./pages/TesteEstresseOcupacionalPerguntas";
import ResultadoEstresseOcupacional from "./pages/ResultadoEstresseOcupacional";
import Resultado from "./pages/Resultado";
import NotFound from "./pages/NotFound";
import TestSupabaseConnection from "./components/TestSupabaseConnection";
import { DebugResultado } from "@/components/DebugResultado";
import CadastroEmpresa from "./pages/CadastroEmpresa";
import CadastroColaborador from "./pages/CadastroColaborador";
import LandingPage from "./pages/LandingPage";
import QuickCheckEstresse from "./pages/QuickCheckEstresse";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCanceladoPage from "./pages/CheckoutCanceladoPage";
import RecuperarSenha from "./pages/RecuperarSenha";
import ColaboradorCursos from "./pages/colaborador/ColaboradorCursos";
import CursoDetalhes from "./pages/colaborador/CursoDetalhes";
import ColaboradorCertificado from "./pages/colaborador/ColaboradorCertificado";
import ValidarCertificado from "./pages/ValidarCertificado";
import EmpresaColaboradorCertificado from "./pages/empresa/EmpresaColaboradorCertificado";
import { Chatbot } from "./components/Chatbot";
import { OnlineStatus } from "./components/OnlineStatus";
import HomeRoute from "./components/layout/HomeRoute";

function App() {
  console.log('🔍 [APP] Componente App iniciado');
  console.log('🔍 [APP] Location atual:', window.location.href);
  console.log('🔍 [APP] LandingPage importado?', LandingPage ? 'SIM' : 'NÃO');
  
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <Chatbot />
            <OnlineStatus />
            <Routes>
              {/* Rotas públicas - SEM autenticação */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/quick-check" element={<QuickCheckEstresse />} />
              <Route path="/validar-certificado/:codigo?" element={<ValidarCertificado />} />
              <Route path="/checkout/:planType" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/checkout/cancelado" element={<CheckoutCanceladoPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route path="/aceitar-convite/:token" element={<AcessoConvite />} />
              <Route path="/prg/compartilhado/:token" element={<PRGPublico />} />
              <Route 
                path="/post-login-animation" 
                element={
                  <ProtectedRoute>
                    <PostLoginAnimation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={<HomeRoute />} 
              />
              <Route 
                path="/Colaborador" 
                element={
                  <ProtectedRoute allowedRoles={['colaborador']}>
                    <MainLayout>
                      <Colaborador />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/Empresa" 
                element={
                  <ProtectedRoute allowedRoles={['empresa']}>
                    <EmpresaLayout>
                      <Empresa />
                    </EmpresaLayout>
                  </ProtectedRoute>
                } 
              />
              {/* Rota Colaborador */}
              <Route 
                path="/colaborador" 
                element={
                  <ProtectedRoute allowedRoles={['colaborador']}>
                    <Colaborador />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/colaborador/cursos" 
                element={
                  <ProtectedRoute allowedRoles={['colaborador']}>
                    <MainLayout>
                      <ColaboradorCursos />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/colaborador/cursos/:slug" 
                element={
                  <ProtectedRoute allowedRoles={['colaborador']}>
                    <MainLayout>
                      <CursoDetalhes />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/colaborador/cursos/:slug/certificado" 
                element={
                  <ProtectedRoute allowedRoles={['colaborador']}>
                    <ColaboradorCertificado />
                  </ProtectedRoute>
                } 
              />
              {/* Rotas Admin com Sidebar */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<AdminDashboard />} />
                <Route path="empresas" element={<AdminEmpresas />} />
                <Route path="empresas/:id" element={<AdminEmpresaDetalhes />} />
                <Route path="convites" element={<AdminConvites />} />
                <Route path="estatisticas" element={<AdminEstatisticas />} />
              </Route>
              
              {/* Rotas Empresa com Sidebar */}
              <Route 
                path="/empresa" 
                element={
                  <ProtectedRoute allowedRoles={['empresa', 'admin']}>
                    <EmpresaDashboard />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<EmpresaOverview />} />
                <Route path="overview" element={<EmpresaOverview />} />
                <Route path="visao-geral" element={<EmpresaOverview />} />
                <Route path="gestao-colaboradores" element={<EmpresaColaboradores />} />
                <Route path="convites" element={<EmpresaConvites />} />
                <Route path="gestao-convites" element={<EmpresaGestaoConvites />} />
                <Route path="gerar-convite" element={<EmpresaGerarConvite />} />
                <Route path="estado-psicossocial" element={<EmpresaEstadoPsicossocial />} />
                <Route path="prg" element={<EmpresaPRG />} />
                <Route path="resultados" element={<EmpresaResultados />} />
                <Route path="colaborador/:colaboradorId/resultados" element={<EmpresaColaboradorResultados />} />
              </Route>
              {/* Rota para visualização de certificado pela empresa (sem sidebar) */}
              <Route 
                path="/empresa/colaborador/:colaboradorId/certificado/:cursoSlug" 
                element={
                  <ProtectedRoute allowedRoles={['empresa', 'admin']}>
                    <EmpresaColaboradorCertificado />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/GestaoAI" 
                element={
                  <ProtectedRoute>
                    <GestaoAI />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/GestaoAI/Convite" 
                element={
                  <ProtectedRoute>
                    <GestaoConvite />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/GestaoAI/Dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardConvites />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/convite/:codigo" 
                element={<AcessoConvite />} 
              />
              <Route 
                path="/convite/empresa/:token" 
                element={<AcessoConvite />} 
              />
              <Route 
                path="/convite/colaborador/:token" 
                element={<AcessoConvite />} 
              />
              <Route 
                path="/testes" 
                element={
                  <MainLayout>
                    <Testes />
                  </MainLayout>
                } 
              />
              <Route 
                path="/resultados" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Resultados />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/todos-resultados" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TodosResultados />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/:testeId/introducao" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/:testeId/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TestePerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/karasek-siegrist" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteKarasekSiegristIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/karasek-siegrist/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteKarasekSiegristPerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/karasek-siegrist/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ResultadoKarasekSiegrist />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/clima-organizacional" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteClimaOrganizacionalIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/humaniq-insight" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteHumaniQInsightIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/humaniq-insight/perguntas" 
                element={
                  <MainLayout>
                    <TestePerguntas />
                  </MainLayout>
                } 
              />
              <Route 
                path="/teste/estresse-ocupacional" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteEstresseOcupacionalIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/estresse-ocupacional/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteEstresseOcupacionalPerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/estresse-ocupacional/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ResultadoEstresseOcupacional />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/clima-bem-estar" 
                element={
                  <MainLayout>
                    <TesteClimaBemEstarIntroducao />
                  </MainLayout>
                } 
              />
              <Route 
                path="/teste/clima-bem-estar/perguntas" 
                element={
                  <MainLayout>
                    <TesteClimaBemEstarPerguntas />
                  </MainLayout>
                } 
              />
              <Route 
                path="/resultado/clima-bem-estar/:resultadoId" 
                element={
                  <MainLayout>
                    <ResultadoClimaBemEstar />
                  </MainLayout>
                } 
              />
              <Route 
                path="/teste/maturidade-gestao-riscos" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteMGRPIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              {/* Alias para maturidade de riscos psicossociais */}
              <Route 
                path="/teste/maturidade-riscos-psicossociais" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteMGRPIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/maturidade-gestao-riscos/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteMGRPPerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              {/* Alias para maturidade de riscos psicossociais - perguntas */}
              <Route 
                path="/teste/maturidade-riscos-psicossociais/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteMGRPPerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/maturidade-gestao-riscos/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ResultadoMaturidadeRiscosPsicossociais />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/maturidade-riscos-psicossociais/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ResultadoMaturidadeRiscosPsicossociais />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/percepcao-assedio" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TestePASIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/percepcao-assedio/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TestePASPerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/percepcao-assedio/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ResultadoPAS />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/qualidade-vida-trabalho" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteQVTIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/qualidade-vida-trabalho/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteQVTPerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/qualidade-vida-trabalho/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Resultado />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/rpo" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteRPOIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/rpo/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteRPOPerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/rpo/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ResultadoRPO />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/riscos-psicossociais-ocupacionais" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteRPOIntroducao />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teste/riscos-psicossociais-ocupacionais/perguntas" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TesteRPOPerguntas />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/riscos-psicossociais-ocupacionais/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ResultadoRPO />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/humaniq-insight/:resultadoId" 
                element={
                  <MainLayout>
                    <ResultadoHumaniQInsight />
                  </MainLayout>
                } 
              />
              <Route 
                path="/resultado/:tipoTeste/:resultadoId" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Resultado />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultado/:resultadoId" 
                element={
                  <MainLayout>
                    <Resultado />
                  </MainLayout>
                } 
              />
              <Route 
                path="/test-supabase" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TestSupabaseConnection />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/debug-resultado" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DebugResultado />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              {/* Rotas de cadastro via convite */}
              <Route 
                path="/cadastro/empresa/:token" 
                element={<CadastroEmpresa />} 
              />
              <Route 
                path="/cadastro/colaborador/:token" 
                element={<CadastroColaborador />} 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
