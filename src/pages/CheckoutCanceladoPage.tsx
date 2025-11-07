import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutCanceladoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <Card className="max-w-md w-full" data-testid="card-cancelado">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
          <CardDescription>
            Você cancelou o processo de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300 text-center">
              Não se preocupe! Você pode retornar e escolher um plano a qualquer momento.
              Estamos aqui para ajudar quando você estiver pronto.
            </p>
          </div>

          <div className="pt-4 space-y-2">
            <Button
              data-testid="button-tentar-novamente"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Ver Planos Novamente
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

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Precisa de ajuda?{' '}
              <a
                href="mailto:contato@humaniqai.com.br"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                data-testid="link-contato"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
