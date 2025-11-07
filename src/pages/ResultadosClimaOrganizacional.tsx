import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Share2, RefreshCw, TrendingUp, Award, Building2, AlertTriangle, Heart, Users, Loader2, CheckCircle, Eye } from "lucide-react";
import Logo from "@/components/Logo";
import { resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";

interface ClimaOrganizacionalResult {
  id: string;
  pontuacao_total: number;
  status: string;
  created_at: string;
  metadados: {
    analise_completa: {
      dimensoes: Array<{
        name: string;
        score: number;
        description: string;
      }>;
      pontuacaoGeral: number;
      classificacaoGeral: string;
    };
    recomendacoes: string[];
    interpretacao: string;
  };
}

export default function ResultadosClimaOrganizacional() {
  const navigate = useNavigate();
  const [resultados, setResultados] = useState<ClimaOrganizacionalResult[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarResultados();
  }, []);

  const carregarResultados = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      console.log('🔍 [CLIMA-RESULTADOS] Carregando resultados de clima organizacional...');
      
      // Buscar resultados por sessão
      const sessionId = sessionService