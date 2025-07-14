'use client'

import React, { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatarDataContextual, formatarStatusVisual } from '@/lib/utils'

interface DadosGlobais {
  usuarioLogado: { id: string; nome: string; perfil: string; permissoes: string[] };
  estatisticas: any;
}

interface FornecedoresGestaoProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function GestaoFornecedores({ dadosGlobais, onAtualizarEstatisticas }: FornecedoresGestaoProps) {
  const [fornecedores] = useState([
    { id: '1', nome: 'Dell Brasil', status: 'ativo', produtos: 45, ultima_compra: '2024-01-15T10:00:00Z' },
    { id: '2', nome: 'Logitech', status: 'ativo', produtos: 23, ultima_compra: '2024-01-14T15:30:00Z' },
    { id: '3', nome: 'Corsair', status: 'ativo', produtos: 12, ultima_compra: '2024-01-13T09:15:00Z' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestão de Fornecedores</h2>
          <p className="text-gray-600">Cadastro e relacionamento com fornecedores</p>
        </div>
        <Button>
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fornecedores.map((fornecedor) => {
          const statusInfo = formatarStatusVisual(fornecedor.status);
          const StatusIcon = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as React.ComponentType<any>;
          
          return (
            <Card key={fornecedor.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{fornecedor.nome}</h3>
                  <Badge variant={statusInfo.badge as any}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.texto}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produtos:</span>
                    <span className="font-medium">{fornecedor.produtos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última compra:</span>
                    <span className="text-gray-500">{formatarDataContextual(fornecedor.ultima_compra, 'relativa')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  )
} 