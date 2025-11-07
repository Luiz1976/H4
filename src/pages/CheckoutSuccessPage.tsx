import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Função util para obter base da API de forma segura
function getApiBase() {
  const raw = import.meta.env.VITE_API_URL || '';
  const trimmed = raw.replace(/\/+$/, '');
  const base = trimmed.replace(/\/api$/, '');
  return base;
}

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [showConviteDialog, setShowConviteDialog] = useState(false);
  const [conviteUrl, setConviteUrl] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [conviteData, setConviteData] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      const apiBase = getApiBase();
      if (!apiBase) {
        console.error('VITE_API_URL ausente para buscar convite do Stripe');
        setLoading(false);
        return;
      }
      fetch(`${apiBase}/api/stripe/convite-session/${sessionId}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setConviteUrl(data.url);
            setConviteData(data.convite);
            setShowConviteDialog(true);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Erro ao buscar convite:', error);
          setLoading(false);
        });
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const copiarLink = () => {
    navigator.clipboard.writeText(conviteUrl);
    setCopiado(true);
    toast({
      title: 'Link copiado!',
      description: 'O link do convite foi copiado para a área de transferência',
    });
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <Card className="max-w-md w-full" data-testid="card-success">
        <CardHeader className="text-center">
          {loading ? (
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
          )}
          <CardTitle className="text-2xl">
            {loading ? 'Processando Pagamento...' : 'Pagamento Confirmado!'}
          </CardTitle>
          <CardDescription>
            {loading
              ? 'Aguarde enquanto confirmamos sua assinatura'
              : 'Sua assinatura foi ativada com sucesso'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-300 text-center">
                  Enviamos um e-mail de confirmação com todos os detalhes da sua assinatura.
                  {conviteUrl && ' Você receberá também o link de convite para configurar sua empresa.'}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">Próximos Passos:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Use o link de convite para configurar sua empresa</li>
                  <li>Configure sua conta e convide colaboradores</li>
                  <li>Comece a aplicar testes psicológicos</li>
                </ol>
              </div>

              <div className="pt-4 space-y-2">
                {conviteUrl && (
                  <Button
                    data-testid="button-ver-convite"
                    onClick={() => setShowConviteDialog(true)}
                    className="w-full"
                  >
                    Ver Link de Convite
                  </Button>
                )}
                <Button
                  data-testid="button-ir-dashboard"
                  variant={conviteUrl ? "outline" : "default"}
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Ir para o Login
                </Button>
                <Button
                  data-testid="button-voltar-home"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Voltar para Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConviteDialog} onOpenChange={setShowConviteDialog}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-convite">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 Seu Link de Convite</DialogTitle>
            <DialogDescription>
              Use este link para configurar sua empresa e começar a usar a plataforma. 
              {conviteData && ` Você pode convidar até ${conviteData.numeroColaboradores} colaboradores.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  data-testid="input-convite-url"
                  id="link"
                  value={conviteUrl}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <Button
                data-testid="button-copiar-link"
                type="button"
                size="icon"
                onClick={copiarLink}
                className="shrink-0"
              >
                {copiado ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Importante:</strong> Guarde este link em um local seguro. Você precisará dele para configurar sua empresa.
                {conviteData && ` Este convite expira em ${new Date(conviteData.validade).toLocaleDateString('pt-BR')}.`}
              </p>
            </div>

            {conviteData && (
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Plano:</strong> {conviteData.metadados?.planType || 'Não especificado'}</p>
                <p><strong>Limite de Colaboradores:</strong> {conviteData.numeroColaboradores}</p>
                <p><strong>Dias de Acesso:</strong> {conviteData.diasAcesso} dias</p>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConviteDialog(false)}
              data-testid="button-fechar-dialog"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={() => window.open(conviteUrl, '_blank')}
              data-testid="button-usar-convite"
            >
              Usar Convite Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}