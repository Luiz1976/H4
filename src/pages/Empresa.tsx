import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const Empresa = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Empresa</h1>
          <p className="text-gray-600">Gerencie sua organização e colaboradores</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Disponíveis</CardTitle>
            <CardDescription>
              Acesse as funcionalidades disponíveis para sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <h3 className="font-medium text-gray-900">Gestão de Convites</h3>
              <p className="text-sm text-gray-600">Envie e gerencie convites para novos colaboradores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao HumaniQ Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed">
            Esta é sua central de controle para gerenciar todos os aspectos relacionados aos testes 
            psicossociais da sua organização. Utilize a sidebar para navegar entre as diferentes 
            funcionalidades disponíveis e mantenha sua equipe engajada com ferramentas de bem-estar 
            e qualidade de vida no trabalho.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Empresa;