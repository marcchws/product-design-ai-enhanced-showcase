'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface InvestimentosProps {
  usuario: any
}

const investimentosMock = [
  {
    id: '1',
    nome: 'CDB Liquidez Diária',
    tipo: 'Renda Fixa',
    valor_aplicado: 5000,
    valor_atual: 5150.25,
    rentabilidade: 3.01,
    data_aplicacao: '2024-11-15',
    vencimento: '2025-11-15'
  },
  {
    id: '2',
    nome: 'Tesouro IPCA+ 2029',
    tipo: 'Tesouro Direto',
    valor_aplicado: 3000,
    valor_atual: 3095.50,
    rentabilidade: 3.18,
    data_aplicacao: '2024-10-20',
    vencimento: '2029-08-15'
  }
]

export default function InvestimentosModule({ usuario }: InvestimentosProps) {
  const [investimentos, setInvestimentos] = useState(investimentosMock)
  const [carregando, setCarregando] = useState(false)
  
  const montadoRef = useRef(true)
  
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  const formatarMoeda = useCallback((valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }, [])
  
  const formatarPercentual = useCallback((valor: number): string => {
    return `${valor.toFixed(2)}%`
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investimentos</h2>
          <p className="text-gray-600">Sua carteira de investimentos</p>
        </div>
        <Button>
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Novo Investimento
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatarMoeda(investimentos.reduce((acc, inv) => acc + inv.valor_aplicado, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(investimentos.reduce((acc, inv) => acc + inv.valor_atual, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Rentabilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              +{formatarMoeda(investimentos.reduce((acc, inv) => acc + (inv.valor_atual - inv.valor_aplicado), 0))}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Seus Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investimentos.map((investimento) => (
              <div key={investimento.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <LucideIcons.TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{investimento.nome}</p>
                    <p className="text-sm text-gray-600">{investimento.tipo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatarMoeda(investimento.valor_atual)}</p>
                  <Badge variant="default">
                    +{formatarPercentual(investimento.rentabilidade)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}