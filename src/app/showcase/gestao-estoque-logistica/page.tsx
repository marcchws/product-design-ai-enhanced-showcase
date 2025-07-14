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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { gerarIniciaisNome, formatarStatusVisual, formatarDataContextual, formatarMoeda } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'

// Interfaces do sistema
interface Produto {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  descricao: string;
  preco_unitario: number;
  quantidade_estoque: number;
  quantidade_minima: number;
  fornecedor: string;
  localizacao: string;
  status: 'ativo' | 'inativo' | 'sem_estoque' | 'estoque_baixo';
  data_cadastro: string;
  ultima_atualizacao: string;
  imagem?: string;
}

interface Movimentacao {
  id: string;
  produto_id: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  motivo: string;
  responsavel: string;
  data_movimentacao: string;
  observacoes?: string;
  documento_referencia?: string;
}

interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  status: 'ativo' | 'inativo';
  produtos_fornecidos: number;
  ultima_compra?: string;
}

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

// Componentes especializados
import GestaoProdutos from './produtos-gestao'
import MovimentacoesEstoque from './movimentacoes-estoque'
import GestaoFornecedores from './fornecedores-gestao'
import RelatoriosEstoque from './relatorios-estoque'
import AlertasEstoque from './alertas-estoque'

export default function SistemaGestaoEstoqueLogisticaPage() {
  // Estados globais compartilhados
  const [abaSelecionada, setAbaSelecionada] = useState('produtos');
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
              nome: 'João Silva',
              perfil: 'gerente',
              permissoes: ['produtos:view', 'produtos:edit', 'movimentacoes:create', 'fornecedores:view']
            },
            estatisticas: {
              totalProdutos: 1247,
              produtosEstoqueBaixo: 23,
              produtosSemEstoque: 8,
              valorTotalEstoque: 1250000.50,
              movimentacoesHoje: 45,
              fornecedoresAtivos: 18,
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
      id: 'produtos',
      label: 'Produtos',
      icone: 'Package',
      badge: dadosGlobais?.estatisticas.totalProdutos || null,
      componente: GestaoProdutos
    },
    {
      id: 'movimentacoes',
      label: 'Movimentações',
      icone: 'ArrowUpDown',
      badge: dadosGlobais?.estatisticas.movimentacoesHoje || null,
      componente: MovimentacoesEstoque
    },
    {
      id: 'fornecedores',
      label: 'Fornecedores',
      icone: 'Truck',
      badge: dadosGlobais?.estatisticas.fornecedoresAtivos || null,
      componente: GestaoFornecedores
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icone: 'BarChart3',
      badge: null,
      componente: RelatoriosEstoque
    },
    {
      id: 'alertas',
      label: 'Alertas',
      icone: 'AlertTriangle',
      badge: (dadosGlobais?.estatisticas.produtosEstoqueBaixo || 0) + (dadosGlobais?.estatisticas.produtosSemEstoque || 0),
      componente: AlertasEstoque
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
              <span className="font-bold text-xl">Gestão de Estoque e Logística</span>
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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de Estoque</h1>
                <p className="text-gray-600">
                  Última atualização: {formatarDataContextual(dadosGlobais.estatisticas.ultimaAtualizacao, 'relativa')}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Usuário</p>
                  <p className="font-medium">{dadosGlobais.usuarioLogado.nome}</p>
                </div>
                <Avatar>
                  <AvatarFallback>{gerarIniciaisNome(dadosGlobais.usuarioLogado.nome)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Produtos</p>
                      <p className="text-2xl font-bold text-blue-600">{dadosGlobais.estatisticas.totalProdutos}</p>
                    </div>
                    <LucideIcons.Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatarMoeda(dadosGlobais.estatisticas.valorTotalEstoque)}
                      </p>
                    </div>
                    <LucideIcons.DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Estoque Baixo</p>
                      <p className="text-2xl font-bold text-yellow-600">{dadosGlobais.estatisticas.produtosEstoqueBaixo}</p>
                    </div>
                    <LucideIcons.AlertTriangle className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Movimentações Hoje</p>
                      <p className="text-2xl font-bold text-purple-600">{dadosGlobais.estatisticas.movimentacoesHoje}</p>
                    </div>
                    <LucideIcons.ArrowUpDown className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sistema de abas */}
          <Card>
            <CardHeader>
              <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  {configuracaoAbas.map((aba) => {
                    const IconComponent = LucideIcons[aba.icone as keyof typeof LucideIcons] as React.ComponentType<any>;
                    return (
                      <TabsTrigger key={aba.id} value={aba.id} className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {aba.label}
                        {aba.badge && (
                          <Badge variant="secondary" className="ml-1">
                            {aba.badge}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                
                {configuracaoAbas.map((aba) => {
                  const Componente = aba.componente;
                  return (
                    <TabsContent key={aba.id} value={aba.id} className="mt-6">
                      <Componente 
                        dadosGlobais={dadosGlobais}
                        onAtualizarEstatisticas={atualizarEstatisticas}
                      />
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Modal de informações do sistema */}
      <Dialog open={mostrarInfo} onOpenChange={setMostrarInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LucideIcons.Info className="h-5 w-5 text-blue-500" />
              Sistema de Gestão de Estoque e Logística
            </DialogTitle>
            <DialogDescription>
              Demonstração completa dos padrões PDAIE aplicados em sistema empresarial real.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Características do Sistema:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <strong>Arquitetura Modular:</strong> 5 módulos especializados integrados</li>
                <li>• <strong>Estados UI Completos:</strong> 28 estados mapeados e tratados</li>
                <li>• <strong>Padrões Defensivos:</strong> Timeouts, validações e tratamento de erros</li>
                <li>• <strong>Multi-perfil:</strong> Admin, Gerente e Operador com permissões granulares</li>
                <li>• <strong>Workflows Complexos:</strong> Movimentações, alertas e relatórios</li>
                <li>• <strong>Responsividade:</strong> Mobile-first com adaptação desktop</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Módulos Implementados:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <strong>Gestão de Produtos:</strong> CRUD completo com controle de estoque</li>
                <li>• <strong>Movimentações:</strong> Entrada, saída, ajustes e transferências</li>
                <li>• <strong>Fornecedores:</strong> Cadastro e relacionamento com produtos</li>
                <li>• <strong>Relatórios:</strong> Analytics e métricas de performance</li>
                <li>• <strong>Alertas:</strong> Notificações automáticas de estoque baixo</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tecnologias Utilizadas:</h4>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Shadcn/UI', 'Sonner'].map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarInfo(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 