'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ConfiguracoesPerfilProps {
  usuario: any;
  dados: any;
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
  onAtualizarUsuario: (usuario: any) => void;
}

const gerarIniciaisNome = (nome: string | undefined): string => {
  if (!nome) return '??';
  const partesNome = nome.trim().split(' ');
  if (partesNome.length === 0) return '??';
  if (partesNome.length === 1) return partesNome[0].substring(0, 2).toUpperCase();
  
  const primeiraLetra = partesNome[0][0] || '?';
  const ultimaLetra = partesNome[partesNome.length - 1][0] || '?';
  return (primeiraLetra + ultimaLetra).toUpperCase();
};

export default function ConfiguracoesPerfil({ 
  usuario, 
  dados, 
  carregando, 
  erro, 
  onRecarregar,
  onAtualizarUsuario
}: ConfiguracoesPerfilProps) {
  const [abaSelecionada, setAbaSelecionada] = useState('perfil');
  const [dadosFormulario, setDadosFormulario] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    bio: '',
    timezone: 'America/Sao_Paulo',
    idioma: 'pt-BR',
    nivel_conhecimento: usuario?.nivel || 'intermediario'
  });

  const [configuracoes, setConfiguracoes] = useState({
    notificacoes_email: true,
    notificacoes_push: false,
    emails_marketing: false,
    modo_escuro: false,
    autoplay_videos: true,
    legendas_automaticas: true,
    velocidade_padrao: '1',
    qualidade_video: 'auto'
  });

  const [salvando, setSalvando] = useState(false);
  const [alterado, setAlterado] = useState(false);
  const [modalCancelamento, setModalCancelamento] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => { 
      montadoRef.current = false;
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  // Detectar alterações
  useEffect(() => {
    const dadosOriginais = {
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      bio: '',
      timezone: 'America/Sao_Paulo',
      idioma: 'pt-BR',
      nivel_conhecimento: usuario?.nivel || 'intermediario'
    };
    
    const foiAlterado = JSON.stringify(dadosFormulario) !== JSON.stringify(dadosOriginais);
    setAlterado(foiAlterado);
  }, [dadosFormulario, usuario]);

  const handleInputChange = useCallback((campo: string, valor: any) => {
    setDadosFormulario(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleConfigChange = useCallback((campo: string, valor: boolean) => {
    setConfiguracoes(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleUploadAvatar = useCallback((arquivos: FileList | null) => {
    if (!arquivos || arquivos.length === 0) return;

    const arquivo = arquivos[0];
    
    // Validação do arquivo
    if (!arquivo.type.startsWith('image/')) {
      toast.error('Selecione apenas arquivos de imagem');
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) { // 2MB
      toast.error('Imagem muito grande. Máximo 2MB');
      return;
    }

    // Limpar preview anterior
    if (previewAvatar) {
      URL.revokeObjectURL(previewAvatar);
    }

    const preview = URL.createObjectURL(arquivo);
    setPreviewAvatar(preview);
    toast.success('Imagem carregada! Salve as alterações para confirmar.');
  }, [previewAvatar]);

  const salvarPerfil = useCallback(async () => {
    if (!montadoRef.current) return;

    setSalvando(true);

    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setSalvando(false);
        toast.error('Tempo de salvamento excedido. Tente novamente.');
      }
    }, 8000);

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (montadoRef.current) {
        // Atualizar usuário
        const usuarioAtualizado = {
          ...usuario,
          nome: dadosFormulario.nome,
          email: dadosFormulario.email,
          nivel: dadosFormulario.nivel_conhecimento,
          avatar: previewAvatar || usuario?.avatar
        };

        onAtualizarUsuario(usuarioAtualizado);
        
        toast.success('Perfil atualizado com sucesso!');
        setAlterado(false);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      if (montadoRef.current) {
        toast.error('Falha ao salvar perfil. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setSalvando(false);
      }
    }
  }, [dadosFormulario, previewAvatar, usuario, onAtualizarUsuario]);

  const salvarConfiguracoes = useCallback(async () => {
    setSalvando(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configurações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  }, [configuracoes]);

  const cancelarAssinatura = useCallback(() => {
    setModalCancelamento(true);
  }, []);

  const confirmarCancelamento = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Assinatura cancelada. Você terá acesso até o fim do período.');
      setModalCancelamento(false);
    } catch (error) {
      toast.error('Erro ao cancelar assinatura');
    }
  }, []);

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
          <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Gerencie suas informações básicas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload de avatar */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewAvatar || usuario?.avatar} />
                  <AvatarFallback className="text-lg">
                    {gerarIniciaisNome(dadosFormulario.nome || usuario?.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <LucideIcons.Camera className="mr-2 h-4 w-4" />
                        Alterar Foto
                      </span>
                    </Button>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadAvatar(e.target.files)}
                      className="sr-only"
                    />
                  </Label>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG ou GIF até 2MB
                  </p>
                </div>
              </div>

              {/* Campos do formulário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={dadosFormulario.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={dadosFormulario.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel">Nível de Conhecimento</Label>
                  <Select
                    value={dadosFormulario.nivel_conhecimento}
                    onValueChange={(valor) => handleInputChange('nivel_conhecimento', valor)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={dadosFormulario.timezone}
                    onValueChange={(valor) => handleInputChange('timezone', valor)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={dadosFormulario.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você e seus objetivos de aprendizado..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={salvarPerfil} 
                  disabled={salvando || !alterado}
                >
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferencias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como você quer ser notificado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-mail sobre novos cursos</Label>
                  <p className="text-sm text-gray-500">
                    Receba notificações sobre lançamentos de cursos
                  </p>
                </div>
                <Switch
                  checked={configuracoes.notificacoes_email}
                  onCheckedChange={(checked) => handleConfigChange('notificacoes_email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações push</Label>
                  <p className="text-sm text-gray-500">
                    Notificações no navegador sobre suas atividades
                  </p>
                </div>
                <Switch
                  checked={configuracoes.notificacoes_push}
                  onCheckedChange={(checked) => handleConfigChange('notificacoes_push', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-mails de marketing</Label>
                  <p className="text-sm text-gray-500">
                    Dicas de estudo, ofertas especiais e novidades
                  </p>
                </div>
                <Switch
                  checked={configuracoes.emails_marketing}
                  onCheckedChange={(checked) => handleConfigChange('emails_marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reprodução de Vídeo</CardTitle>
              <CardDescription>Personalize sua experiência de aprendizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reprodução automática</Label>
                  <p className="text-sm text-gray-500">
                    Próximas aulas iniciam automaticamente
                  </p>
                </div>
                <Switch
                  checked={configuracoes.autoplay_videos}
                  onCheckedChange={(checked) => handleConfigChange('autoplay_videos', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Legendas automáticas</Label>
                  <p className="text-sm text-gray-500">
                    Ativar legendas por padrão nos vídeos
                  </p>
                </div>
                <Switch
                  checked={configuracoes.legendas_automaticas}
                  onCheckedChange={(checked) => handleConfigChange('legendas_automaticas', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Velocidade padrão</Label>
                  <Select
                    value={configuracoes.velocidade_padrao}
                    onValueChange={(valor) => setConfiguracoes(prev => ({ ...prev, velocidade_padrao: valor }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="1">1x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Qualidade de vídeo</Label>
                  <Select
                    value={configuracoes.qualidade_video}
                    onValueChange={(valor) => setConfiguracoes(prev => ({ ...prev, qualidade_video: valor }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automática</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={salvarConfiguracoes} disabled={salvando}>
                  {salvando ? (
                    <>
                      <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <LucideIcons.Save className="mr-2 h-4 w-4" />
                      Salvar Preferências
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assinatura" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription>Gerencie sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div>
                    <h3 className="font-semibold text-blue-900">Plano Premium</h3>
                    <p className="text-sm text-blue-700">
                      Acesso total a todos os cursos e recursos
                    </p>
                  </div>
                  <Badge className="bg-blue-600">Ativo</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Benefícios Inclusos</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <LucideIcons.Check className="h-4 w-4 text-green-500" />
                        Acesso a todos os cursos
                      </li>
                      <li className="flex items-center gap-2">
                        <LucideIcons.Check className="h-4 w-4 text-green-500" />
                        Downloads para offline
                      </li>
                      <li className="flex items-center gap-2">
                        <LucideIcons.Check className="h-4 w-4 text-green-500" />
                        Certificados de conclusão
                      </li>
                      <li className="flex items-center gap-2">
                        <LucideIcons.Check className="h-4 w-4 text-green-500" />
                        Suporte prioritário
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Detalhes da Cobrança</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Valor mensal:</span>
                        <span className="font-medium">R$ 49,90</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Próxima cobrança:</span>
                        <span>15/08/2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Método de pagamento:</span>
                        <span>•••• 1234</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline">
                    <LucideIcons.CreditCard className="mr-2 h-4 w-4" />
                    Atualizar Pagamento
                  </Button>
                  <Button variant="outline">
                    <LucideIcons.Receipt className="mr-2 h-4 w-4" />
                    Ver Histórico
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={cancelarAssinatura}
                  >
                    <LucideIcons.X className="mr-2 h-4 w-4" />
                    Cancelar Assinatura
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacidade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacidade e Dados</CardTitle>
              <CardDescription>Controle suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Visibilidade do Perfil</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Perfil público</Label>
                        <p className="text-sm text-gray-500">
                          Outros usuários podem ver seu perfil
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mostrar no ranking</Label>
                        <p className="text-sm text-gray-500">
                          Aparecer nos rankings da plataforma
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Seus Dados</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <LucideIcons.Download className="mr-2 h-4 w-4" />
                      Baixar Dados Pessoais
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <LucideIcons.FileText className="mr-2 h-4 w-4" />
                      Ver Política de Privacidade
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <LucideIcons.Trash2 className="mr-2 h-4 w-4" />
                      Excluir Conta Permanentemente
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Indicador de alterações pendentes */}
      {alterado && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center text-yellow-800">
            <LucideIcons.AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">Você tem alterações não salvas</span>
          </div>
        </div>
      )}

      {/* Modal de cancelamento */}
      <Dialog open={modalCancelamento} onOpenChange={setModalCancelamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura Premium? 
              Você perderá acesso aos benefícios exclusivos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">O que você perderá:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Acesso a cursos premium</li>
                <li>• Downloads para offline</li>
                <li>• Certificados de conclusão</li>
                <li>• Suporte prioritário</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-600">
              Seu acesso continuará até <strong>15/08/2024</strong>, 
              final do período já pago.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCancelamento(false)}>
              Manter Assinatura
            </Button>
            <Button variant="destructive" onClick={confirmarCancelamento}>
              Sim, Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}