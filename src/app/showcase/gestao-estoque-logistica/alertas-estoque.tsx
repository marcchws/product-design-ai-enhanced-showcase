'use client'

import React from 'react'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DadosGlobais {
  usuarioLogado: { id: string; nome: string; perfil: string; permissoes: string[] };
  estatisticas: any;
}

interface AlertasEstoqueProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function AlertasEstoque({ dadosGlobais, onAtualizarEstatisticas }: AlertasEstoqueProps) {
  const alertas = [
    {
      id: '1',
      produto: 'Mouse Wireless Logitech',
      tipo: 'estoque_baixo',
      quantidade_atual: 2,
      quantidade_minima: 10,
      prioridade: 'alta'
    },
    {
      id: '2',
      produto: 'Teclado Mecânico RGB',
      tipo: 'sem_estoque',
      quantidade_atual: 0,
      quantidade_minima: 3,
      prioridade: 'critica'
    }
  ];

  const getPrioridadeInfo = (prioridade: string) => {
    switch (prioridade) {
      case 'critica':
        return { cor: 'text-red-600', badge: 'destructive', icone: 'AlertTriangle' };
      case 'alta':
        return { cor: 'text-yellow-600', badge: 'secondary', icone: 'AlertCircle' };
      default:
        return { cor: 'text-blue-600', badge: 'outline', icone: 'Info' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Alertas de Estoque</h2>
        <p className="text-gray-600">Notificações automáticas de produtos com estoque baixo</p>
      </div>
      
      <div className="space-y-4">
        {alertas.map((alerta) => {
          const prioridadeInfo = getPrioridadeInfo(alerta.prioridade);
          const PrioridadeIcon = LucideIcons[prioridadeInfo.icone as keyof typeof LucideIcons] as React.ComponentType<any>;
          
          return (
            <Card key={alerta.id} className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-red-100">
                      <PrioridadeIcon className="h-5 w-5 text-red-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{alerta.produto}</h3>
                      <p className="text-sm text-gray-600">
                        Estoque atual: {alerta.quantidade_atual} / Mínimo: {alerta.quantidade_minima}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={prioridadeInfo.badge as any}>
                      {alerta.tipo === 'sem_estoque' ? 'Sem Estoque' : 'Estoque Baixo'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <LucideIcons.ShoppingCart className="mr-2 h-4 w-4" />
                      Solicitar Compra
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {alertas.length === 0 && (
        <div className="text-center py-12">
          <LucideIcons.CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta ativo</h3>
          <p className="text-gray-500">Todos os produtos estão com estoque adequado.</p>
        </div>
      )}
    </div>
  )
} 