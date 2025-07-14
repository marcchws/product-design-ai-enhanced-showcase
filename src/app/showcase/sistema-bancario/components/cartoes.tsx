'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface CartoesProps {
  usuario: any
}

const cartoesMock = [
  {
    id: '1',
    numero: '**** **** **** 1234',
    tipo: 'Crédito',
    bandeira: 'Visa',
    limite: 5000,
    limite_usado: 1250,
    fatura_atual: 1250,
    vencimento: '2025-01-15',
    status: 'ativo',
    bloqueado: false
  },
  {
    id: '2',
    numero: '**** **** **** 5678',
    tipo: 'Débito',
    bandeira: 'Mastercard',
    limite: 0,
    limite_usado: 0,
    fatura_atual: 0,
    vencimento: null,
    status: 'ativo',
    bloqueado: false
  }
]

export default function CartoesModule({ usuario }: CartoesProps) {
  const [cartoes, setCartoes] = useState(cartoesMock)
  const [processando, setProcessando] = useState<string | null>(null)
  
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
  
  const alterarStatusCartao = useCallback(async (cartaoId: string, acao: 'bloquear' | 'desbloquear') => {
    if (!montadoRef.current) return
    
    setProcessando(cartaoId)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (montadoRef.current) {
        setCartoes(prev => prev.map(cartao => 
          cartao.id === cartaoId 
            ? { ...cartao, bloqueado: acao === 'bloquear' }
            : cartao
        ))
        toast.success(`Cartão ${acao === 'bloquear' ? 'bloqueado' : 'desbloqueado'} com sucesso`)
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha ao alterar status do cartão')
      }
    } finally {
      if (montadoRef.current) {
        setProcessando(null)
      }
    }
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cartões</h2>
          <p className="text-gray-600">Gerencie seus cartões de débito e crédito</p>
        </div>
        <Button>
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Solicitar Cartão
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cartoes.map((cartao) => (
          <Card key={cartao.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <LucideIcons.CreditCard className="h-5 w-5 text-blue-600" />
                  Cartão {cartao.tipo}
                </CardTitle>
                <Badge variant={cartao.bloqueado ? 'destructive' : 'default'}>
                  {cartao.bloqueado ? 'Bloqueado' : 'Ativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-mono text-lg">{cartao.numero}</p>
                <p className="text-sm text-gray-600">{cartao.bandeira}</p>
              </div>
              
              {cartao.tipo === 'Crédito' && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Limite usado</span>
                    <span>{formatarMoeda(cartao.limite_usado)} / {formatarMoeda(cartao.limite)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(cartao.limite_usado / cartao.limite) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!cartao.bloqueado}
                    onCheckedChange={(checked) => 
                      alterarStatusCartao(cartao.id, checked ? 'desbloquear' : 'bloquear')
                    }
                    disabled={processando === cartao.id}
                  />
                  <span className="text-sm">
                    {cartao.bloqueado ? 'Desbloqueado' : 'Bloqueado'}
                  </span>
                </div>
                
<Button 
                  variant="outline" 
                  size="sm"
                  disabled={processando === cartao.id}
                >
                  {processando === cartao.id ? (
                    <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LucideIcons.Settings className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Fatura atual */}
      <Card>
        <CardHeader>
          <CardTitle>Fatura Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartoes.filter(c => c.tipo === 'Crédito').map((cartao) => (
              <div key={cartao.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Cartão {cartao.numero}</p>
                  <p className="text-sm text-gray-600">
                    Vencimento: {cartao.vencimento ? new Date(cartao.vencimento).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{formatarMoeda(cartao.fatura_atual)}</p>
                  <Button variant="outline" size="sm">
                    <LucideIcons.Eye className="mr-2 h-4 w-4" />
                    Ver Fatura
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}