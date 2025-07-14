'use client'

import React from 'react'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DadosGlobais {
  usuarioLogado: { id: string; nome: string; perfil: string; permissoes: string[] };
  estatisticas: any;
}

interface RelatoriosEstoqueProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function RelatoriosEstoque({ dadosGlobais, onAtualizarEstatisticas }: RelatoriosEstoqueProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Relatórios de Estoque</h2>
        <p className="text-gray-600">Analytics e métricas de performance do estoque</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideIcons.BarChart3 className="h-5 w-5 text-blue-500" />
              Produtos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Eletrônicos</span>
                <Badge variant="outline">45%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Periféricos</span>
                <Badge variant="outline">32%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Monitores</span>
                <Badge variant="outline">23%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideIcons.TrendingUp className="h-5 w-5 text-green-500" />
              Movimentações Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">+12.5%</div>
              <p className="text-sm text-gray-600">vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LucideIcons.AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">8</div>
              <p className="text-sm text-gray-600">produtos com estoque baixo</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 