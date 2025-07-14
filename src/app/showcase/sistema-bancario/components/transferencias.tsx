'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface TransferenciasProps {
  usuario: any
}

export default function TransferenciasModule({ usuario }: TransferenciasProps) {
  const [abaSelecionada, setAbaSelecionada] = useState('pix')
  const [processando, setProcessando] = useState(false)
  const [dadosPix, setDadosPix] = useState({
    chave: '',
    valor: '',
    descricao: ''
  })
  const [dadosTed, setDadosTed] = useState({
    banco: '',
    agencia: '',
    conta: '',
    cpf: '',
    nome: '',
    valor: '',
    descricao: ''
  })
  
  const montadoRef = useRef(true)
  
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  const formatarMoeda = useCallback((valor: string): string => {
    if (!valor) return ''
    
    const numero = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'))
    if (isNaN(numero)) return ''
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numero)
  }, [])
  
  const processarTransferencia = useCallback(async (tipo: 'pix' | 'ted') => {
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
        toast.success(`${tipo.toUpperCase()} enviado com sucesso!`)
        
        if (tipo === 'pix') {
          setDadosPix({ chave: '', valor: '', descricao: '' })
        } else {
          setDadosTed({ banco: '', agencia: '', conta: '', cpf: '', nome: '', valor: '', descricao: '' })
        }
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha ao processar transferência')
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
          <h2 className="text-2xl font-bold">Transferências</h2>
          <p className="text-gray-600">PIX, TED e transferências entre contas</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <LucideIcons.Clock className="h-3 w-3 mr-1" />
            Horário BACEN: 06:00 às 22:00
          </Badge>
        </div>
      </div>
      
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pix" className="flex items-center gap-2">
            <LucideIcons.Zap className="h-4 w-4" />
            PIX
          </TabsTrigger>
          <TabsTrigger value="ted" className="flex items-center gap-2">
            <LucideIcons.Building className="h-4 w-4" />
            TED
          </TabsTrigger>
          <TabsTrigger value="interna" className="flex items-center gap-2">
            <LucideIcons.RefreshCw className="h-4 w-4" />
            Entre Contas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.Zap className="h-5 w-5 text-blue-600" />
                Transferência PIX
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chave-pix">Chave PIX</Label>
                <Input
                  id="chave-pix"
                  placeholder="Digite a chave PIX (email, telefone, CPF ou chave aleatória)"
                  value={dadosPix.chave}
                  onChange={(e) => setDadosPix(prev => ({ ...prev, chave: e.target.value }))}
                  disabled={processando}
                />
              </div>
              
              <div>
                <Label htmlFor="valor-pix">Valor</Label>
                <Input
                  id="valor-pix"
                  type="number"
                  placeholder="0,00"
                  value={dadosPix.valor}
                  onChange={(e) => setDadosPix(prev => ({ ...prev, valor: e.target.value }))}
                  disabled={processando}
                />
              </div>
              
              <div>
                <Label htmlFor="descricao-pix">Descrição (opcional)</Label>
                <Input
                  id="descricao-pix"
                  placeholder="Motivo da transferência"
                  value={dadosPix.descricao}
                  onChange={(e) => setDadosPix(prev => ({ ...prev, descricao: e.target.value }))}
                  disabled={processando}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => processarTransferencia('pix')}
                  disabled={processando || !dadosPix.chave || !dadosPix.valor}
                  className="w-full"
                >
                  {processando ? (
                    <>
                      <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando PIX...
                    </>
                  ) : (
                    <>
                      <LucideIcons.Send className="mr-2 h-4 w-4" />
                      Enviar PIX
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ted" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.Building className="h-5 w-5 text-green-600" />
                Transferência TED
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banco-ted">Banco</Label>
                  <Select value={dadosTed.banco} onValueChange={(valor) => setDadosTed(prev => ({ ...prev, banco: valor }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="001">Banco do Brasil</SelectItem>
                      <SelectItem value="104">Caixa Econômica</SelectItem>
                      <SelectItem value="341">Itaú</SelectItem>
                      <SelectItem value="033">Santander</SelectItem>
                      <SelectItem value="237">Bradesco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="agencia-ted">Agência</Label>
                  <Input
                    id="agencia-ted"
                    placeholder="0000"
                    value={dadosTed.agencia}
                    onChange={(e) => setDadosTed(prev => ({ ...prev, agencia: e.target.value }))}
                    disabled={processando}
                  />
                </div>
                
                <div>
                  <Label htmlFor="conta-ted">Conta</Label>
                  <Input
                    id="conta-ted"
                    placeholder="00000-0"
                    value={dadosTed.conta}
                    onChange={(e) => setDadosTed(prev => ({ ...prev, conta: e.target.value }))}
                    disabled={processando}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cpf-ted">CPF do Favorecido</Label>
                  <Input
                    id="cpf-ted"
                    placeholder="000.000.000-00"
                    value={dadosTed.cpf}
                    onChange={(e) => setDadosTed(prev => ({ ...prev, cpf: e.target.value }))}
                    disabled={processando}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="nome-ted">Nome do Favorecido</Label>
                <Input
                  id="nome-ted"
                  placeholder="Nome completo"
                  value={dadosTed.nome}
                  onChange={(e) => setDadosTed(prev => ({ ...prev, nome: e.target.value }))}
                  disabled={processando}
                />
              </div>
              
              <div>
                <Label htmlFor="valor-ted">Valor</Label>
                <Input
                  id="valor-ted"
                  type="number"
                  placeholder="0,00"
                  value={dadosTed.valor}
                  onChange={(e) => setDadosTed(prev => ({ ...prev, valor: e.target.value }))}
                  disabled={processando}
                />
              </div>
              
              <div>
                <Label htmlFor="descricao-ted">Descrição (opcional)</Label>
                <Input
                  id="descricao-ted"
                  placeholder="Motivo da transferência"
                  value={dadosTed.descricao}
                  onChange={(e) => setDadosTed(prev => ({ ...prev, descricao: e.target.value }))}
                  disabled={processando}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={() => processarTransferencia('ted')}
                  disabled={processando || !dadosTed.banco || !dadosTed.agencia || !dadosTed.conta || !dadosTed.valor}
                  className="w-full"
                >
                  {processando ? (
                    <>
                      <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando TED...
                    </>
                  ) : (
                    <>
                      <LucideIcons.Send className="mr-2 h-4 w-4" />
                      Enviar TED
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interna" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.RefreshCw className="h-5 w-5 text-purple-600" />
                Transferência Entre Contas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LucideIcons.Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Transferência Entre Suas Contas</h3>
                <p className="text-gray-500 mb-6">
                  Transfira dinheiro entre suas contas corrente e poupança
                </p>
                <Button>
                  <LucideIcons.Plus className="mr-2 h-4 w-4" />
                  Nova Transferência
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}