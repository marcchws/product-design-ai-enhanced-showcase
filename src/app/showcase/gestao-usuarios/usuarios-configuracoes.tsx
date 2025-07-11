'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useMounted } from '@/hooks/use-mounted'
import { DadosGlobais } from '@/types'

interface ConfiguracaoSistema {
  id: string;
  categoria: string;
  nome: string;
  descricao: string;
  valor: string | boolean | number;
  tipo: 'texto' | 'numero' | 'boolean' | 'select';
  opcoes?: string[];
  editavel: boolean;
  requer_reinicio: boolean;
}

interface ConfiguracoesUsuariosProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function ConfiguracoesUsuarios({ dadosGlobais }: ConfiguracoesUsuariosProps) {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [alteracoesPendentes, setAlteracoesPendentes] = useState<Record<string, any>>({});
  const [categoriaAtiva, setCategoriaAtiva] = useState('geral');
  
  const montadoRef = useMounted();
  
  // Carregar configurações
  const carregarConfiguracoes = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    try {
      // Simulação de configurações do sistema
      const configMock: ConfiguracaoSistema[] = [
        // Configurações Gerais
        {
          id: 'sistema_nome',
          categoria: 'geral',
          nome: 'Nome do Sistema',
          descricao: 'Nome que aparece no cabeçalho e emails',
          valor: 'Sistema de Gestão de Usuários',
          tipo: 'texto',
          editavel: true,
          requer_reinicio: false
        },
        {
          id: 'sistema_url',
          categoria: 'geral',
          nome: 'URL Base',
          descricao: 'URL base do sistema para links em emails',
          valor: 'https://sistema.empresa.com',
          tipo: 'texto',
          editavel: true,
          requer_reinicio: false
        },
        {
          id: 'manutencao_modo',
          categoria: 'geral',
          nome: 'Modo Manutenção',
          descricao: 'Ativar modo de manutenção para todos os usuários',
          valor: false,
          tipo: 'boolean',
          editavel: true,
          requer_reinicio: false
        },
        
        // Configurações de Usuários
        {
          id: 'usuario_max_tentativas_login',
          categoria: 'usuarios',
          nome: 'Máximo de Tentativas de Login',
          descricao: 'Número máximo de tentativas antes de bloquear conta',
          valor: 5,
          tipo: 'numero',
          editavel: true,
          requer_reinicio: false
        },
        {
          id: 'usuario_sessao_duracao',
          categoria: 'usuarios',
          nome: 'Duração da Sessão (horas)',
          descricao: 'Tempo de inatividade antes do logout automático',
          valor: 8,
          tipo: 'numero',
          editavel: true,
          requer_reinicio: false
        },
        {
          id: 'usuario_senha_complexidade',
          categoria: 'usuarios',
          nome: 'Exigir Senha Complexa',
          descricao: 'Obrigar senhas com maiúsculas, números e símbolos',
          valor: true,
          tipo: 'boolean',
          editavel: true,
          requer_reinicio: false
        },
        {
          id: 'usuario_aprovacao_automatica',
          categoria: 'usuarios',
          nome: 'Aprovação Automática',
          descricao: 'Novos usuários são aprovados automaticamente',
          valor: false,
          tipo: 'boolean',
          editavel: true,
          requer_reinicio: false
        },
        
        // Configurações de Email
        {
          id: 'email_servidor_smtp',
          categoria: 'email',
          nome: 'Servidor SMTP',
          descricao: 'Endereço do servidor de email',
          valor: 'smtp.empresa.com',
          tipo: 'texto',
          editavel: true,
          requer_reinicio: true
        },
        {
          id: 'email_porta',
          categoria: 'email',
          nome: 'Porta SMTP',
          descricao: 'Porta do servidor SMTP',
          valor: 587,
          tipo: 'numero',
          editavel: true,
          requer_reinicio: true
        },
        {
          id: 'email_remetente',
          categoria: 'email',
          nome: 'Email Remetente',
          descricao: 'Email usado como remetente das notificações',
          valor: 'noreply@empresa.com',
          tipo: 'texto',
          editavel: true,
          requer_reinicio: false
        },
        {
          id: 'email_notificacoes_ativas',
          categoria: 'email',
          nome: 'Notificações por Email',
          descricao: 'Enviar notificações automáticas por email',
          valor: true,
          tipo: 'boolean',
          editavel: true,
          requer_reinicio: false
        },
        
        // Configurações de Segurança
        {
          id: 'seguranca_2fa_obrigatorio',
          categoria: 'seguranca',
          nome: '2FA Obrigatório',
          descricao: 'Exigir autenticação de dois fatores para todos',
          valor: false,
          tipo: 'boolean',
          editavel: true,
          requer_reinicio: false
        },
        {
          id: 'seguranca_audit_logs',
          categoria: 'seguranca',
          nome: 'Logs Detalhados',
          descricao: 'Registrar todas as ações no sistema',
          valor: true,
          tipo: 'boolean',
          editavel: true,
          requer_reinicio: false
        },
        {
          id: 'seguranca_ip_whitelist',
          categoria: 'seguranca',
          nome: 'Lista de IPs Permitidos',
          descricao: 'IPs que podem acessar o painel admin (separados por vírgula)',
          valor: '192.168.1.0/24, 10.0.0.0/8',
          tipo: 'texto',
          editavel: true,
          requer_reinicio: false
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (montadoRef.current) {
        setConfiguracoes(configMock);
      }
    } catch (error) {
      if (montadoRef.current) {
        setErro('Falha ao carregar configurações');
      }
    } finally {
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [montadoRef]);
  
  useEffect(() => {
    carregarConfiguracoes();
  }, [carregarConfiguracoes]);
  
  // Agrupar configurações por categoria
  const configsPorCategoria = configuracoes.reduce((acc, config) => {
    if (!acc[config.categoria]) {
      acc[config.categoria] = [];
    }
    acc[config.categoria].push(config);
    return acc;
  }, {} as Record<string, ConfiguracaoSistema[]>);
  
  const categorias = [
    { id: 'geral', nome: 'Geral', icone: 'Settings' },
    { id: 'usuarios', nome: 'Usuários', icone: 'Users' },
    { id: 'email', nome: 'Email', icone: 'Mail' },
    { id: 'seguranca', nome: 'Segurança', icone: 'Shield' }
  ];
  
  // Handlers
  const handleValorChange = useCallback((configId: string, novoValor: any) => {
    setAlteracoesPendentes(prev => ({
      ...prev,
      [configId]: novoValor
    }));
  }, []);
  
  const handleSalvarConfiguracoes = useCallback(async () => {
    if (Object.keys(alteracoesPendentes).length === 0) {
      toast.info('Nenhuma alteração para salvar');
      return;
    }
    
    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (montadoRef.current) {
        // Atualizar configurações localmente
        setConfiguracoes(prev => 
          prev.map(config => ({
            ...config,
            valor: alteracoesPendentes[config.id] !== undefined 
              ? alteracoesPendentes[config.id] 
              : config.valor
          }))
        );
        
        // Verificar se alguma configuração requer reinício
        const requerReinicio = configuracoes.some(config => 
          alteracoesPendentes[config.id] !== undefined && config.requer_reinicio
        );
        
        setAlteracoesPendentes({});
        
        if (requerReinicio) {
          toast.success('Configurações salvas! Reinicie o sistema para aplicar todas as alterações.', {
            duration: 8000
          });
        } else {
          toast.success('Configurações salvas com sucesso!');
        }
      }
    } catch (error) {
      toast.error('Falha ao salvar configurações');
    } finally {
      if (montadoRef.current) {
        setSalvando(false);
      }
    }
  }, [alteracoesPendentes, configuracoes, montadoRef]);
  
  const handleDescartarAlteracoes = useCallback(() => {
    setAlteracoesPendentes({});
    toast.info('Alterações descartadas');
  }, []);
  
  const renderCampoConfiguracao = useCallback((config: ConfiguracaoSistema) => {
    const valorAtual = alteracoesPendentes[config.id] !== undefined 
      ? alteracoesPendentes[config.id] 
      : config.valor;
    
    const temAlteracao = alteracoesPendentes[config.id] !== undefined;
    
    switch (config.tipo) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label className="font-medium">{config.nome}</Label>
                {temAlteracao && <Badge variant="outline" className="text-xs">Alterado</Badge>}
                {config.requer_reinicio && <Badge variant="destructive" className="text-xs">Reinício</Badge>}
              </div>
              <p className="text-sm text-gray-600 mt-1">{config.descricao}</p>
            </div>
            <Checkbox
              checked={valorAtual}
              onCheckedChange={(checked) => handleValorChange(config.id, checked)}
              disabled={!config.editavel}
            />
          </div>
        );
      
      case 'numero':
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="font-medium">{config.nome}</Label>
              {temAlteracao && <Badge variant="outline" className="text-xs">Alterado</Badge>}
              {config.requer_reinicio && <Badge variant="destructive" className="text-xs">Reinício</Badge>}
            </div>
            <p className="text-sm text-gray-600 mb-3">{config.descricao}</p>
            <Input
              type="number"
              value={valorAtual}
              onChange={(e) => handleValorChange(config.id, parseInt(e.target.value))}
              disabled={!config.editavel}
              className={temAlteracao ? 'border-blue-500' : ''}
            />
          </div>
        );
      
      case 'select':
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="font-medium">{config.nome}</Label>
              {temAlteracao && <Badge variant="outline" className="text-xs">Alterado</Badge>}
              {config.requer_reinicio && <Badge variant="destructive" className="text-xs">Reinício</Badge>}
            </div>
            <p className="text-sm text-gray-600 mb-3">{config.descricao}</p>
            <select
              value={valorAtual}
              onChange={(e) => handleValorChange(config.id, e.target.value)}
              disabled={!config.editavel}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                temAlteracao ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              {config.opcoes?.map(opcao => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </div>
        );
      
      default: // texto
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="font-medium">{config.nome}</Label>
              {temAlteracao && <Badge variant="outline" className="text-xs">Alterado</Badge>}
              {config.requer_reinicio && <Badge variant="destructive" className="text-xs">Reinício</Badge>}
            </div>
            <p className="text-sm text-gray-600 mb-3">{config.descricao}</p>
            {config.nome.includes('Lista') || config.descricao.includes('vírgula') ? (
              <Textarea
                value={valorAtual}
                onChange={(e) => handleValorChange(config.id, e.target.value)}
                disabled={!config.editavel}
                className={temAlteracao ? 'border-blue-500' : ''}
                rows={3}
              />
            ) : (
              <Input
                value={valorAtual}
                onChange={(e) => handleValorChange(config.id, e.target.value)}
                disabled={!config.editavel}
                className={temAlteracao ? 'border-blue-500' : ''}
              />
            )}
          </div>
        );
    }
  }, [alteracoesPendentes, handleValorChange]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
        <p className="text-gray-700 mb-6">{erro}</p>
        <Button onClick={carregarConfiguracoes}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const temAlteracoesPendentes = Object.keys(alteracoesPendentes).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">
            Gerencie configurações globais e parâmetros do sistema
          </p>
        </div>
        
        {temAlteracoesPendentes && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDescartarAlteracoes}
              disabled={salvando}
            >
              <LucideIcons.X className="mr-2 h-4 w-4" />
              Descartar
            </Button>
            <Button
              onClick={handleSalvarConfiguracoes}
              disabled={salvando}
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
        )}
      </div>

      {/* Alertas */}
      {temAlteracoesPendentes && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <LucideIcons.AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Alterações Pendentes</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Você tem {Object.keys(alteracoesPendentes).length} configurações alteradas que ainda não foram salvas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegação de categorias */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {categorias.map(categoria => {
            const IconeCategoria = LucideIcons[categoria.icone as keyof typeof LucideIcons] as any;
            const isAtiva = categoriaAtiva === categoria.id;
            const temAlteracaoCategoria = configuracoes
              .filter(config => config.categoria === categoria.id)
              .some(config => alteracoesPendentes[config.id] !== undefined);
            
            return (
              <button
                key={categoria.id}
                onClick={() => setCategoriaAtiva(categoria.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isAtiva
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconeCategoria className="h-4 w-4" />
                {categoria.nome}
                {temAlteracaoCategoria && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Configurações da categoria ativa */}
      <div className="space-y-6">
        {configsPorCategoria[categoriaAtiva]?.map(config => (
          <Card key={config.id}>
            <CardContent className="pt-6">
              {renderCampoConfiguracao(config)}
              {!config.editavel && (
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                  <LucideIcons.Lock className="h-3 w-3" />
                  <span>Esta configuração é somente leitura</span>
                </div>
              )}
            </CardContent>
          </Card>
        )) || (
          <div className="text-center py-8">
            <LucideIcons.Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma configuração encontrada nesta categoria</p>
          </div>
        )}
      </div>

      {/* Informações do sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.Info className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
          <CardDescription>
            Detalhes técnicos e estatísticas do sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-500">Versão do Sistema</Label>
                <p className="text-gray-900">v2.1.4</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Última Atualização</Label>
                <p className="text-gray-900">15 de Janeiro, 2024</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Ambiente</Label>
                <Badge variant="default">Produção</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-500">Banco de Dados</Label>
                <p className="text-gray-900">PostgreSQL 15.2</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Uptime</Label>
                <p className="text-gray-900">15 dias, 7 horas</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Status dos Serviços</Label>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-green-600">
                    <LucideIcons.CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações de sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <LucideIcons.AlertTriangle className="h-5 w-5" />
            Ações de Sistema
          </CardTitle>
          <CardDescription>
            Ações críticas que afetam todo o sistema. Use com cuidado.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <LucideIcons.Download className="h-4 w-4" />
                  <span className="font-medium">Backup Sistema</span>
                </div>
                <p className="text-xs text-gray-600">Fazer backup completo</p>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <LucideIcons.RotateCcw className="h-4 w-4" />
                  <span className="font-medium">Reiniciar Sistema</span>
                </div>
                <p className="text-xs text-gray-600">Aplicar configurações</p>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4 border-red-200 text-red-600 hover:bg-red-50">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <LucideIcons.Trash2 className="h-4 w-4" />
                  <span className="font-medium">Limpar Logs</span>
                </div>
                <p className="text-xs text-red-500">Remover logs antigos</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}