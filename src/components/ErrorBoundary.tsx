import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ERROR-BOUNDARY] Erro capturado:', error);
    console.error('🚨 [ERROR-BOUNDARY] Stack trace:', error.stack);
    console.error('🚨 [ERROR-BOUNDARY] Component stack:', errorInfo.componentStack);
    console.error('🚨 [ERROR-BOUNDARY] Error name:', error.name);
    console.error('🚨 [ERROR-BOUNDARY] Error message:', error.message);
    
    // Log adicional para debugging
    console.log('🔍 [ERROR-BOUNDARY] Window location:', window.location.href);
    console.log('🔍 [ERROR-BOUNDARY] User agent:', navigator.userAgent);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Ops! Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                A aplicação encontrou um erro inesperado. Isso pode ser um problema temporário.
              </p>
              
              <div className="flex justify-center gap-2">
                <Button onClick={this.handleReload} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Recarregar Página
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm">
                      <div className="font-medium text-red-800 mb-2">
                        {this.state.error.name}: {this.state.error.message}
                      </div>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto">
                        {this.state.error.stack}
                      </pre>
                      {this.state.errorInfo && (
                        <div className="mt-4">
                          <div className="font-medium text-red-800 mb-2">Component Stack:</div>
                          <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}