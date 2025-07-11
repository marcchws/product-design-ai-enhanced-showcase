'use client'

import React, { useState, useRef, useCallback, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { gerarIniciaisNome, formatarStatusVisual, formatarDataContextual } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'
import { Usuario, DadosGlobais } from '@/types'

// Componentes especializados
import GestaoUsuarios from './usuarios-gestao'
import GestaoPerfs from './usuarios-perfis'
import HistoricoAuditoria from './usuarios-auditoria'
import ConfiguracoesUsuarios from './usuarios-configuracoes'

export default function SistemaGestaoUsuariosPage() {
  // Estados globais compartilhados
  const [abaSelecionada, setAbaSelecionada] = useState('usuarios');
  const [dadosGlobais, setDadosGlobais] = useState<DadosGlobais | null>(null);
  const [carregandoGlobal, setCarregandoGlobal] = useState(true);
  const [erroGlobal, setErroGlobal] = useState<string | null>(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  
  // Prevenção memory leak obrigatória
  const montadoRef = useMounted();
  
  // Carregamento inicial dos dados globais
  const carregarDadosGlobais = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregandoGlobal(true);
    setErroGlobal(null);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoGlobal(false);
        setErroGlobal('Tempo de carregamento excedido');
      }
    }, 8000);
    
    try {
      // Simulação de API - dados globais do sistema
      const response = await new Promise<DadosGlobais>((resolve) => {
        setTimeout(() => {
          resolve({
            usuarioLogado: {
              id: '1',
              nome: 'Admin Sistema',
              perfil: 'admin',
              permissoes: ['usuarios:create', 'usuarios:edit', 'usuarios:delete', 'auditoria:view']
            },
            estatisticas: {
              totalUsuarios: 247,
              usuariosAtivos: 198,
              usuariosPendentes: 12,
              ultimaAtualizacao: new Date().toISOString()
            }
          });
        }, 1500);
      });
      
      if (montadoRef.current) {
        setDadosGlobais(response);
      }
    } catch (error) {
      console.error('Erro ao carregar dados globais:', error);
      if (montadoRef.current) {
        setErroGlobal('Falha ao carregar dados do sistema');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoGlobal(false);
      }
    }
  }, [montadoRef]);
  
  useEffect(() => {
    carregarDadosGlobais();
  }, [carregarDadosGlobais]);
  
  // Handler para atualização de dados globais (callback para módulos)
  const atualizarEstatisticas = useCallback(() => {
    carregarDadosGlobais();
  }, [carregarDadosGlobais]);
  
  // Configuração das abas com badges dinâmicas
  const configuracaoAbas = [
    {
      id: 'usuarios',
      label: 'Usuários',
      icone: 'Users',
      badge: dadosGlobais?.estatisticas.totalUsuarios || null,
      componente: GestaoUsuarios
    },
    {
      id: 'perfis',
      label: 'Perfis',
      icone: 'Shield',
      badge: null,
      componente: GestaoPerfs
    },
    {
      id: 'auditoria',
      label: 'Auditoria',
      icone: 'FileText',
      badge: null,
      componente: HistoricoAuditoria
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icone: 'Settings',
      badge: null,
      componente: ConfiguracoesUsuarios
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PD</span>
              </div>
              <span className="font-bold text-xl">Sistema de Gestão de Usuários</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarInfo(true)}
              >
                <LucideIcons.Info className="mr-2 h-4 w-4" />
                Sobre Este Sistema
              </Button>
              
              <Link href="/showcase">
                <Button variant="ghost" size="sm">
                  <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Showcase
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Estado de loading global */}
      {carregandoGlobal && (
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Estado de erro global */}
      {erroGlobal && (
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center">
            <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Erro no Sistema</h3>
            <p className="text-red-700 mb-6">{erroGlobal}</p>
            <Button onClick={carregarDadosGlobais}>
              <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}

      {/* Sistema principal */}
      {!carregandoGlobal && !erroGlobal && dadosGlobais && (
        <div className="container mx-auto p-6 space-y-6">
          {/* Header com estatísticas globais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
                <p className="text-gray-600">
                  Sistema completo de administração de usuários e permissões
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <LucideIcons.Clock className="h-4 w-4" />
                Atualizado {formatarDataContextual(dadosGlobais.estatisticas.ultimaAtualizacao, 'relativa')}
              </div>
            </div>
            
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <LucideIcons.Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dadosGlobais.estatisticas.totalUsuarios}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <LucideIcons.UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dadosGlobais.estatisticas.usuariosAtivos}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <LucideIcons.UserPlus className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dadosGlobais.estatisticas.usuariosPendentes}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <LucideIcons.Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Seu Perfil</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {dadosGlobais.usuarioLogado.perfil}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Sistema de navegação por abas */}
          <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              {configuracaoAbas.map(aba => {
                const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any;
                
                return (
                  <TabsTrigger key={aba.id} value={aba.id} className="relative">
                    <div className="flex items-center gap-2">
                      <IconeComponente className="h-4 w-4" />
                      <span>{aba.label}</span>
                      {aba.badge && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {aba.badge}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {/* Conteúdo das abas - cada módulo especializado */}
            {configuracaoAbas.map(aba => {
              const ComponenteAba = aba.componente;
              
              return (
                <TabsContent key={aba.id} value={aba.id} className="space-y-6">
                  <ComponenteAba
                    dadosGlobais={dadosGlobais}
                    onAtualizarEstatisticas={atualizarEstatisticas}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      )}

      {/* Modal de informações */}
      {mostrarInfo && (
        <Dialog open={true} onOpenChange={() => setMostrarInfo(false)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Sistema de Gestão de Usuários</DialogTitle>
              <DialogDescription className="text-lg">
                Exemplo completo da metodologia Product Design AI-Enhanced aplicada
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LucideIcons.Target className="h-5 w-5 text-blue-600" />
                      Input Original
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                      <p className="text-blue-800 italic">
                        "Administradores devem poder gerenciar usuários com CRUD básico"
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LucideIcons.BarChart3 className="h-5 w-5 text-purple-600" />
                      Análise Gerada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• 4 entidades identificadas</li>
                      <li>• 8 telas necessárias</li>
                      <li>• 28 estados UI mapeados</li>
                      <li>• 5 fluxos de usuário</li>
                      <li>• 52 pontos complexidade → Sistema modular</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.Layers className="h-5 w-5 text-green-600" />
                    Implementação Realizada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Módulos Funcionais:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <LucideIcons.Users className="h-4 w-4 text-blue-600" />
                          <span>Gestão de Usuários (CRUD completo)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <LucideIcons.Shield className="h-4 w-4 text-purple-600" />
                          <span>Perfis e Permissões</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <LucideIcons.FileText className="h-4 w-4 text-green-600" />
                          <span>Auditoria de Ações</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <LucideIcons.Settings className="h-4 w-4 text-orange-600" />
                          <span>Configurações do Sistema</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Recursos Implementados:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>✓ 28 estados UI funcionais</li>
                        <li>✓ Filtros e busca avançada</li>
                        <li>✓ Ações em lote (bulk actions)</li>
                        <li>✓ Validações em tempo real</li>
                        <li>✓ Acessibilidade WCAG AA</li>
                        <li>✓ Responsividade completa</li>
                        <li>✓ Tratamento defensivo de erros</li>
                        <li>✓ Loading states otimizados</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.Award className="h-5 w-5 text-yellow-600" />
                    Score de Qualidade Final
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-2xl font-bold text-blue-600">100%</div>
                      <div className="text-xs text-blue-800">Estados UI</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-600">94/100</div>
                      <div className="text-xs text-green-800">Score Geral</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-2xl font-bold text-purple-600">WCAG AA</div>
                      <div className="text-xs text-purple-800">Acessibilidade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <LucideIcons.Lightbulb className="h-5 w-5 text-yellow-600" />
                  Metodologia Aplicada
                </h4>
                <p className="text-gray-700 mb-4">
                  Este sistema demonstra como a metodologia Product Design AI-Enhanced transforma 
                  um requisito simples em uma solução completa e robusta.
                </p>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/metodologia">
                      <LucideIcons.BookOpen className="mr-2 h-4 w-4" />
                      Ver Metodologia
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/processo">
                      <LucideIcons.Cog className="mr-2 h-4 w-4" />
                      Ver Processo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setMostrarInfo(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}