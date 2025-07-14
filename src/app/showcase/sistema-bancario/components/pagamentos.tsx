'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PagamentosProps {
  usuario: any
}

export default function PagamentosModule({ usuario }: PagamentosProps) {
  const [abaSelecionada, setAbaSelecionada] = useState('boleto')
  const [processando, setProcessando] = useState(false)
  const [codigoBarras, setCodigoBarras] = useState('')
  
  const montadoRef = useRef(true)
  
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  const processarPagamento = useCallback(async () => {
    if (!montadoRef.current) return
    
    setProcessando(true)
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setProcessando(false)
        toast.error('Tempo de processamento excedido')
      }
    }, 15000)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      if (montadoRef.current) {
        toast.success('Pagamento processado com sucesso!')
        setCodigoBarras('')
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha ao processar pagamento')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setProcessando(false)
      }
    }
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pagamentos</h2>
          <p className="text-gray-600">Boletos, impostos e financiamentos</p>
        </div>
      </div>
      
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="boleto">Boletos</TabsTrigger>
          <TabsTrigger value="impostos">Impostos</TabsTrigger>
          <TabsTrigger value="financiamentos">Financiamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="boleto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.Receipt className="h-5 w-5 text-orange-600" />
                Pagamento de Boleto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="codigo-barras">Código de Barras</Label>
                <Input
                  id="codigo-barras"
                  placeholder="Digite ou cole o código de barras"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  disabled={processando}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={processarPagamento}
                  disabled={processando || !codigoBarras}
                  className="w-full"
                >
                  {processando ? (
                    <>
                      <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <LucideIcons.CreditCard className="mr-2 h-4 w-4" />
                      Pagar Boleto
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="impostos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pagamento de Impostos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LucideIcons.FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Pagamento de Impostos</h3>
                <p className="text-gray-500 mb-6">
                  Pague seus impostos federais, estaduais e municipais
                </p>
                <Button>
                  <LucideIcons.Plus className="mr-2 h-4 w-4" />
                  Novo Pagamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financiamentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financiamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LucideIcons.Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Financiamentos</h3>
                <p className="text-gray-500 mb-6">
                  Acompanhe e pague suas parcelas de financiamento
                </p>
                <Button>
                  <LucideIcons.Plus className="mr-2 h-4 w-4" />
                  Consultar Financiamentos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}