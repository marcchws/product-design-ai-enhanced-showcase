'use client'

import React, { useState, useCallback } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatarDataContextual, formatarStatusVisual } from '@/lib/utils'

interface DadosGlobais {
  usuarioLogado: {
    id: string;
    nome: string;
    perfil: 'admin' | 'gerente' | 'operador';
    permissoes: string[];
  };
  estatisticas: {
    totalProdutos: number;
    produtosEstoqueBaixo: number;
    produtosSemEstoque: number;
    valorTotalEstoque: number;
    movimentacoesHoje: number;
    fornecedoresAtivos: number;
    ultimaAtualizacao: string;
  };
}

interface MovimentacoesEstoqueProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function MovimentacoesEstoque({ dadosGlobais, onAtualizarEstatisticas }: MovimentacoesEstoqueProps) {
  const [movimentacoes] = useState([
    {
      id: '1',
      produto: 'Notebook Dell Inspiron 15',
      tipo: 'entrada',
      quantidade: 10,
      responsavel: 'João Silva',
      data: '2024-01-15T14:20:00Z',
      motivo: 'Compra de fornecedor'
    },
    {
      id: '2',
      produto: 'Mouse Wireless Logitech',
      tipo: 'saida',
      quantidade: 5,
      responsavel: 'Maria Santos',
      data: '2024-01-15T10:15:00Z',
      motivo: 'Venda para cliente'
    },
    {
      id: '3',
      produto: 'Teclado Mecânico RGB',
      tipo: 'ajuste',
      quantidade: -2,
      responsavel: 'Pedro Costa',
      data: '2024-01-15T09:30:00Z',
      motivo: 'Ajuste de inventário'
    }
  ]);

  const getTipoInfo = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return { texto: 'Entrada', cor: 'text-green-600', icone: 'ArrowDown', badge: 'default' };
      case 'saida':
        return { texto: 'Saída', cor: 'text-red-600', icone: 'ArrowUp', badge: 'destructive' };
      case 'ajuste':
        return { texto: 'Ajuste', cor: 'text-yellow-600', icone: 'Settings', badge: 'secondary' };
      default:
        return { texto: tipo, cor: 'text-gray-600', icone: 'Circle', badge: 'secondary' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Movimentações de Estoque</h2>
          <p className="text-gray-600">Histórico de entradas, saídas e ajustes de estoque</p>
        </div>
        
        <Button>
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>
      
      <div className="space-y-4">
        {movimentacoes.map((mov) => {
          const tipoInfo = getTipoInfo(mov.tipo);
          const TipoIcon = LucideIcons[tipoInfo.icone as keyof typeof LucideIcons] as React.ComponentType<any>;
          
          return (
            <Card key={mov.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${tipoInfo.cor.replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <TipoIcon className={`h-5 w-5 ${tipoInfo.cor}`} />
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{mov.produto}</h3>
                      <p className="text-sm text-gray-600">{mov.motivo}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={tipoInfo.badge as any}>
                        {tipoInfo.texto}
                      </Badge>
                      <span className={`font-medium ${tipoInfo.cor}`}>
                        {mov.tipo === 'entrada' ? '+' : ''}{mov.quantidade}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{mov.responsavel}</p>
                    <p className="text-xs text-gray-500">
                      {formatarDataContextual(mov.data, 'relativa')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {movimentacoes.length === 0 && (
        <div className="text-center py-12">
          <LucideIcons.ArrowUpDown className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
          <p className="text-gray-500">Comece registrando a primeira movimentação de estoque.</p>
        </div>
      )}
    </div>
  )
} 