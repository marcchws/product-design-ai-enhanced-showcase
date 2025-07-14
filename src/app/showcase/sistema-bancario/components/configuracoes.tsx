'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ConfiguracoesProps {
  usuario: any
}

export default function ConfiguracoesModule({ usuario }: ConfiguracoesProps) {
  const [abaSelecionada, setAbaSelecionada] = useState('seguranca')
  const [salvando, setSalvando] = useState(false)
  const [configuracoes, setConfiguracoes] = useState({
    notificacoes_email: true,
    notificacoes_push: true,
    notificacoes_sms: false,
    biometria_ativa: true,
    autenticacao_2fa: true,
    limite_pix: 1000,
    limite_ted: 5000,
    tema: 'auto'
  })
  
  const montadoRef = useRef(true)
  
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])
  
  const salvarConfiguracoes = useCallback(async () => {
    if (!montadoRef.current) return
    
    setSalvando(true)
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setSalvando(false)
        toast.error('Tempo de salvamento excedido')
      }
    }, 10000)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (montadoRef.current) {
        toast.success('Configurações salvas com sucesso')
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Falha ao salvar configurações')
      }
    } finally {
      clearTimeout(timeoutId)
      if (montadoRef.current) {
        setSalvando(false)
      }
    }
  }, [])
  
  const handleConfigChange = useCallback((campo: string, valor: any) => {
    setConfiguracoes(prev => ({ ...prev, [campo]: valor }))
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-gray-600">Personalize sua experiência bancária</p>
        </div>
        <Button onClick={salvarConfiguracoes} disabled={salvando}>
          {salvando ? (
            <>
              <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <LucideIcons.Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
      
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="limites">Limites</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
        </TabsList>
        
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.Shield className="h-5 w-5 text-green-600" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Autenticação 2FA</Label>
                  <p className="text-sm text-gray-600">Verificação em duas etapas para maior segurança</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={configuracoes.autenticacao_2fa}
                    onCheckedChange={(checked) => handleConfigChange('autenticacao_2fa', checked)}
                  />
                  <Badge variant={configuracoes.autenticacao_2fa ? 'default' : 'destructive'}>
                    {configuracoes.autenticacao_2fa ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Biometria</Label>
                  <p className="text-sm text-gray-600">Login com impressão digital ou face</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={configuracoes.biometria_ativa}
                    onCheckedChange={(checked) => handleConfigChange('biometria_ativa', checked)}
                  />
                  <Badge variant={configuracoes.biometria_ativa ? 'default' : 'destructive'}>
                    {configuracoes.biometria_ativa ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Alterar Senha</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="senha-atual">Senha Atual</Label>
                    <Input id="senha-atual" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="nova-senha">Nova Senha</Label>
                    <Input id="nova-senha" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                    <Input id="confirmar-senha" type="password" />
                  </div>
                  <Button variant="outline">
                    <LucideIcons.Key className="mr-2 h-4 w-4" />
                    Alterar Senha
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.Bell className="h-5 w-5 text-blue-600" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email</Label>
                  <p className="text-sm text-gray-600">Receber notificações por email</p>
                </div>
                <Switch
                  checked={configuracoes.notificacoes_email}
                  onCheckedChange={(checked) => handleConfigChange('notificacoes_email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Push</Label>
                  <p className="text-sm text-gray-600">Notificações no navegador</p>
                </div>
                <Switch
                  checked={configuracoes.notificacoes_push}
                  onCheckedChange={(checked) => handleConfigChange('notificacoes_push', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">SMS</Label>
                  <p className="text-sm text-gray-600">Alertas via mensagem de texto</p>
                </div>
                <Switch
                  checked={configuracoes.notificacoes_sms}
                  onCheckedChange={(checked) => handleConfigChange('notificacoes_sms', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="limites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.Shield className="h-5 w-5 text-yellow-600" />
                Limites de Transação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="limite-pix">Limite PIX (por transação)</Label>
                <Input
                  id="limite-pix"
                  type="number"
                  value={configuracoes.limite_pix}
                  onChange={(e) => handleConfigChange('limite_pix', Number(e.target.value))}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Valor atual: R$ {configuracoes.limite_pix.toLocaleString('pt-BR')}
                </p>
              </div>
              
              <div>
                <Label htmlFor="limite-ted">Limite TED (por transação)</Label>
                <Input
                  id="limite-ted"
                  type="number"
                  value={configuracoes.limite_ted}
                  onChange={(e) => handleConfigChange('limite_ted', Number(e.target.value))}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Valor atual: R$ {configuracoes.limite_ted.toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferencias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideIcons.Palette className="h-5 w-5 text-purple-600" />
                Preferências de Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tema da Interface</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <Button
                    variant={configuracoes.tema === 'claro' ? 'default' : 'outline'}
                    onClick={() => handleConfigChange('tema', 'claro')}
                    className="flex items-center gap-2"
                  >
                    <LucideIcons.Sun className="h-4 w-4" />
                    Claro
                  </Button>
                  <Button
                    variant={configuracoes.tema === 'escuro' ? 'default' : 'outline'}
                    onClick={() => handleConfigChange('tema', 'escuro')}
                    className="flex items-center gap-2"
                  >
                    <LucideIcons.Moon className="h-4 w-4" />
                    Escuro
                  </Button>
                  <Button
                    variant={configuracoes.tema === 'auto' ? 'default' : 'outline'}
                    onClick={() => handleConfigChange('tema', 'auto')}
                    className="flex items-center gap-2"
                  >
                    <LucideIcons.Monitor className="h-4 w-4" />
                    Auto
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Dados Pessoais</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" value={usuario.nome} disabled />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={usuario.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={usuario.telefone} disabled />
                  </div>
                  <p className="text-sm text-gray-600">
                    Para alterar dados pessoais, entre em contato com nossa central de atendimento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}