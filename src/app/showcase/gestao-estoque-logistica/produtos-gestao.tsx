'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { gerarIniciaisNome, formatarStatusVisual, formatarDataContextual, formatarMoeda } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'

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

interface GestaoProdutosProps {
  dadosGlobais: DadosGlobais;
  onAtualizarEstatisticas: () => void;
}

export default function GestaoProdutos({ dadosGlobais, onAtualizarEstatisticas }: GestaoProdutosProps) {
  // Estados primários obrigatórios
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Estados de interação
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState<Produto | null>(null);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    termo: '',
    categoria: 'todos',
    status: 'todos',
    fornecedor: 'todos'
  });
  
  // Estados de formulário
  const [dadosFormulario, setDadosFormulario] = useState({
    codigo: '',
    nome: '',
    categoria: '',
    descricao: '',
    preco_unitario: '',
    quantidade_estoque: '',
    quantidade_minima: '',
    fornecedor: '',
    localizacao: '',
    status: 'ativo' as Produto['status']
  });
  const [errosFormulario, setErrosFormulario] = useState<Record<string, string>>({});
  const [salvandoFormulario, setSalvandoFormulario] = useState(false);
  
  // Prevenção memory leak obrigatória
  const montadoRef = useMounted();
  
  // Mock de dados
  const produtosMock: Produto[] = [
    {
      id: '1',
      codigo: 'PROD001',
      nome: 'Notebook Dell Inspiron 15',
      categoria: 'Eletrônicos',
      descricao: 'Notebook Dell Inspiron 15 polegadas, Intel i5, 8GB RAM, 256GB SSD',
      preco_unitario: 3499.99,
      quantidade_estoque: 15,
      quantidade_minima: 5,
      fornecedor: 'Dell Brasil',
      localizacao: 'Prateleira A-01',
      status: 'ativo',
      data_cadastro: '2024-01-10T10:30:00Z',
      ultima_atualizacao: '2024-01-15T14:20:00Z'
    },
    {
      id: '2',
      codigo: 'PROD002',
      nome: 'Mouse Wireless Logitech',
      categoria: 'Periféricos',
      descricao: 'Mouse sem fio Logitech com sensor óptico de alta precisão',
      preco_unitario: 89.90,
      quantidade_estoque: 2,
      quantidade_minima: 10,
      fornecedor: 'Logitech',
      localizacao: 'Prateleira B-03',
      status: 'estoque_baixo',
      data_cadastro: '2024-01-08T09:15:00Z',
      ultima_atualizacao: '2024-01-14T16:45:00Z'
    },
    {
      id: '3',
      codigo: 'PROD003',
      nome: 'Teclado Mecânico RGB',
      categoria: 'Periféricos',
      descricao: 'Teclado mecânico com switches Cherry MX e iluminação RGB',
      preco_unitario: 299.99,
      quantidade_estoque: 0,
      quantidade_minima: 3,
      fornecedor: 'Corsair',
      localizacao: 'Prateleira B-05',
      status: 'sem_estoque',
      data_cadastro: '2024-01-05T11:00:00Z',
      ultima_atualizacao: '2024-01-13T10:30:00Z'
    },
    {
      id: '4',
      codigo: 'PROD004',
      nome: 'Monitor LG 24" Full HD',
      categoria: 'Monitores',
      descricao: 'Monitor LG 24 polegadas, resolução Full HD, painel IPS',
      preco_unitario: 799.99,
      quantidade_estoque: 8,
      quantidade_minima: 4,
      fornecedor: 'LG Electronics',
      localizacao: 'Prateleira C-02',
      status: 'ativo',
      data_cadastro: '2024-01-12T15:30:00Z',
      ultima_atualizacao: '2024-01-15T10:15:00Z'
    },
    {
      id: '5',
      codigo: 'PROD005',
      nome: 'Webcam HD 1080p',
      categoria: 'Periféricos',
      descricao: 'Webcam com resolução Full HD, microfone integrado e autofoco',
      preco_unitario: 159.90,
      quantidade_estoque: 12,
      quantidade_minima: 8,
      fornecedor: 'Logitech',
      localizacao: 'Prateleira B-07',
      status: 'ativo',
      data_cadastro: '2024-01-09T08:45:00Z',
      ultima_atualizacao: '2024-01-15T09:20:00Z'
    }
  ];
  
  // Carregamento de dados
  const carregarProdutos = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregando(true);
    setErro(null);
    
    // Timeout de segurança obrigatório
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregando(false);
        setErro('Tempo de carregamento excedido');
      }
    }, 5000);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (montadoRef.current) {
        // Aplicar filtros
        let produtosFiltrados = produtosMock;
        
        if (filtros.termo) {
          produtosFiltrados = produtosFiltrados.filter(produto =>
            produto.nome.toLowerCase().includes(filtros.termo.toLowerCase()) ||
            produto.codigo.toLowerCase().includes(filtros.termo.toLowerCase()) ||
            produto.descricao.toLowerCase().includes(filtros.termo.toLowerCase())
          );
        }
        
        if (filtros.categoria !== 'todos') {
          produtosFiltrados = produtosFiltrados.filter(produto => produto.categoria === filtros.categoria);
        }
        
        if (filtros.status !== 'todos') {
          produtosFiltrados = produtosFiltrados.filter(produto => produto.status === filtros.status);
        }
        
        if (filtros.fornecedor !== 'todos') {
          produtosFiltrados = produtosFiltrados.filter(produto => produto.fornecedor === filtros.fornecedor);
        }
        
        setProdutos(produtosFiltrados);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      if (montadoRef.current) {
        setErro('Falha ao carregar produtos. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [filtros, montadoRef]);
  
  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);
  
  // Handlers de filtros
  const handleFiltroChange = useCallback((campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);
  
  const limparFiltros = useCallback(() => {
    setFiltros({ termo: '', categoria: 'todos', status: 'todos', fornecedor: 'todos' });
  }, []);
  
  // Handlers de formulário
  const resetarFormulario = useCallback(() => {
    setDadosFormulario({
      codigo: '',
      nome: '',
      categoria: '',
      descricao: '',
      preco_unitario: '',
      quantidade_estoque: '',
      quantidade_minima: '',
      fornecedor: '',
      localizacao: '',
      status: 'ativo'
    });
    setErrosFormulario({});
  }, []);
  
  const validarFormulario = useCallback(() => {
    const erros: Record<string, string> = {};
    
    if (!dadosFormulario.codigo.trim()) {
      erros.codigo = 'Código é obrigatório';
    }
    
    if (!dadosFormulario.nome.trim()) {
      erros.nome = 'Nome é obrigatório';
    }
    
    if (!dadosFormulario.categoria.trim()) {
      erros.categoria = 'Categoria é obrigatória';
    }
    
    if (!dadosFormulario.preco_unitario || parseFloat(dadosFormulario.preco_unitario) <= 0) {
      erros.preco_unitario = 'Preço deve ser maior que zero';
    }
    
    if (!dadosFormulario.quantidade_estoque || parseInt(dadosFormulario.quantidade_estoque) < 0) {
      erros.quantidade_estoque = 'Quantidade deve ser zero ou maior';
    }
    
    if (!dadosFormulario.quantidade_minima || parseInt(dadosFormulario.quantidade_minima) < 0) {
      erros.quantidade_minima = 'Quantidade mínima deve ser zero ou maior';
    }
    
    if (!dadosFormulario.fornecedor.trim()) {
      erros.fornecedor = 'Fornecedor é obrigatório';
    }
    
    if (!dadosFormulario.localizacao.trim()) {
      erros.localizacao = 'Localização é obrigatória';
    }
    
    setErrosFormulario(erros);
    return Object.keys(erros).length === 0;
  }, [dadosFormulario]);
  
  const salvarProduto = useCallback(async () => {
    if (!validarFormulario()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }
    
    setSalvandoFormulario(true);
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const novoProduto: Produto = {
        id: produtoEditando?.id || Date.now().toString(),
        codigo: dadosFormulario.codigo,
        nome: dadosFormulario.nome,
        categoria: dadosFormulario.categoria,
        descricao: dadosFormulario.descricao,
        preco_unitario: parseFloat(dadosFormulario.preco_unitario),
        quantidade_estoque: parseInt(dadosFormulario.quantidade_estoque),
        quantidade_minima: parseInt(dadosFormulario.quantidade_minima),
        fornecedor: dadosFormulario.fornecedor,
        localizacao: dadosFormulario.localizacao,
        status: dadosFormulario.status,
        data_cadastro: produtoEditando?.data_cadastro || new Date().toISOString(),
        ultima_atualizacao: new Date().toISOString()
      };
      
      if (produtoEditando) {
        // Edição
        setProdutos(prev => prev.map(p => p.id === produtoEditando.id ? novoProduto : p));
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criação
        setProdutos(prev => [...prev, novoProduto]);
        toast.success('Produto criado com sucesso!');
      }
      
      setModalFormulario(false);
      resetarFormulario();
      setProdutoEditando(null);
      onAtualizarEstatisticas();
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto. Tente novamente.');
    } finally {
      setSalvandoFormulario(false);
    }
  }, [dadosFormulario, produtoEditando, validarFormulario, resetarFormulario, onAtualizarEstatisticas]);
  
  const editarProduto = useCallback((produto: Produto) => {
    setProdutoEditando(produto);
    setDadosFormulario({
      codigo: produto.codigo,
      nome: produto.nome,
      categoria: produto.categoria,
      descricao: produto.descricao,
      preco_unitario: produto.preco_unitario.toString(),
      quantidade_estoque: produto.quantidade_estoque.toString(),
      quantidade_minima: produto.quantidade_minima.toString(),
      fornecedor: produto.fornecedor,
      localizacao: produto.localizacao,
      status: produto.status
    });
    setModalFormulario(true);
  }, []);
  
  const excluirProduto = useCallback(async (produto: Produto) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      return;
    }
    
    try {
      // Simular exclusão
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProdutos(prev => prev.filter(p => p.id !== produto.id));
      toast.success('Produto excluído com sucesso!');
      onAtualizarEstatisticas();
      
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto. Tente novamente.');
    }
  }, [onAtualizarEstatisticas]);
  
  // Categorias disponíveis
  const categorias = ['Eletrônicos', 'Periféricos', 'Monitores', 'Software', 'Acessórios'];
  const fornecedores = ['Dell Brasil', 'Logitech', 'Corsair', 'LG Electronics', 'Samsung'];
  
  // Estados de interface
  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Erro ao Carregar Produtos</h3>
        <p className="text-red-700 mb-4">{erro}</p>
        <Button onClick={carregarProdutos}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestão de Produtos</h2>
          <p className="text-gray-600">Gerencie o catálogo de produtos e controle de estoque</p>
        </div>
        
        <Button onClick={() => setModalFormulario(true)}>
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="termo">Buscar</Label>
              <Input
                id="termo"
                placeholder="Nome, código ou descrição..."
                value={filtros.termo}
                onChange={(e) => handleFiltroChange('termo', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={filtros.categoria} onValueChange={(value) => handleFiltroChange('categoria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as categorias</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filtros.status} onValueChange={(value) => handleFiltroChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="estoque_baixo">Estoque Baixo</SelectItem>
                  <SelectItem value="sem_estoque">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={limparFiltros} className="w-full">
                <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => {
          const statusInfo = formatarStatusVisual(produto.status);
          const StatusIcon = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as React.ComponentType<any>;
          
          return (
            <Card key={produto.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {produto.codigo}
                      </Badge>
                      <Badge variant={statusInfo.badge as any}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.texto}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg mb-2">{produto.nome}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {produto.descricao}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setModalDetalhes(produto)}
                    >
                      <LucideIcons.Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editarProduto(produto)}
                    >
                      <LucideIcons.Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => excluirProduto(produto)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <LucideIcons.Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço:</span>
                    <span className="font-medium">{formatarMoeda(produto.preco_unitario)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estoque:</span>
                    <span className={`font-medium ${
                      produto.quantidade_estoque <= produto.quantidade_minima ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {produto.quantidade_estoque} / {produto.quantidade_minima} min
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fornecedor:</span>
                    <span className="font-medium">{produto.fornecedor}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Localização:</span>
                    <span className="font-medium">{produto.localizacao}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Atualizado: {formatarDataContextual(produto.ultima_atualizacao, 'relativa')}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Estado vazio */}
      {produtos.length === 0 && (
        <div className="text-center py-12">
          <LucideIcons.Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500 mb-6">
            {filtros.termo || filtros.categoria !== 'todos' || filtros.status !== 'todos' || filtros.fornecedor !== 'todos'
              ? 'Nenhum produto corresponde aos filtros aplicados.'
              : 'Comece adicionando seu primeiro produto.'
            }
          </p>
          {!filtros.termo && filtros.categoria === 'todos' && filtros.status === 'todos' && filtros.fornecedor === 'todos' && (
            <Button onClick={() => setModalFormulario(true)}>
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Produto
            </Button>
          )}
        </div>
      )}
      
      {/* Modal de formulário */}
      <Dialog open={modalFormulario} onOpenChange={setModalFormulario}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {produtoEditando 
                ? 'Atualize as informações do produto selecionado.'
                : 'Preencha as informações para criar um novo produto.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={dadosFormulario.codigo}
                onChange={(e) => setDadosFormulario(prev => ({ ...prev, codigo: e.target.value }))}
                className={errosFormulario.codigo ? 'border-red-500' : ''}
              />
              {errosFormulario.codigo && (
                <p className="text-sm text-red-500 mt-1">{errosFormulario.codigo}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={dadosFormulario.nome}
                onChange={(e) => setDadosFormulario(prev => ({ ...prev, nome: e.target.value }))}
                className={errosFormulario.nome ? 'border-red-500' : ''}
              />
              {errosFormulario.nome && (
                <p className="text-sm text-red-500 mt-1">{errosFormulario.nome}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={dadosFormulario.categoria} 
                onValueChange={(value) => setDadosFormulario(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger className={errosFormulario.categoria ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errosFormulario.categoria && (
                <p className="text-sm text-red-500 mt-1">{errosFormulario.categoria}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={dadosFormulario.status} 
                onValueChange={(value) => setDadosFormulario(prev => ({ ...prev, status: value as Produto['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="estoque_baixo">Estoque Baixo</SelectItem>
                  <SelectItem value="sem_estoque">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="preco_unitario">Preço Unitário *</Label>
              <Input
                id="preco_unitario"
                type="number"
                step="0.01"
                min="0"
                value={dadosFormulario.preco_unitario}
                onChange={(e) => setDadosFormulario(prev => ({ ...prev, preco_unitario: e.target.value }))}
                className={errosFormulario.preco_unitario ? 'border-red-500' : ''}
              />
              {errosFormulario.preco_unitario && (
                <p className="text-sm text-red-500 mt-1">{errosFormulario.preco_unitario}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="quantidade_estoque">Quantidade em Estoque *</Label>
              <Input
                id="quantidade_estoque"
                type="number"
                min="0"
                value={dadosFormulario.quantidade_estoque}
                onChange={(e) => setDadosFormulario(prev => ({ ...prev, quantidade_estoque: e.target.value }))}
                className={errosFormulario.quantidade_estoque ? 'border-red-500' : ''}
              />
              {errosFormulario.quantidade_estoque && (
                <p className="text-sm text-red-500 mt-1">{errosFormulario.quantidade_estoque}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="quantidade_minima">Quantidade Mínima *</Label>
              <Input
                id="quantidade_minima"
                type="number"
                min="0"
                value={dadosFormulario.quantidade_minima}
                onChange={(e) => setDadosFormulario(prev => ({ ...prev, quantidade_minima: e.target.value }))}
                className={errosFormulario.quantidade_minima ? 'border-red-500' : ''}
              />
              {errosFormulario.quantidade_minima && (
                <p className="text-sm text-red-500 mt-1">{errosFormulario.quantidade_minima}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Select 
                value={dadosFormulario.fornecedor} 
                onValueChange={(value) => setDadosFormulario(prev => ({ ...prev, fornecedor: value }))}
              >
                <SelectTrigger className={errosFormulario.fornecedor ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem key={fornecedor} value={fornecedor}>{fornecedor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errosFormulario.fornecedor && (
                <p className="text-sm text-red-500 mt-1">{errosFormulario.fornecedor}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="localizacao">Localização *</Label>
              <Input
                id="localizacao"
                value={dadosFormulario.localizacao}
                onChange={(e) => setDadosFormulario(prev => ({ ...prev, localizacao: e.target.value }))}
                className={errosFormulario.localizacao ? 'border-red-500' : ''}
              />
              {errosFormulario.localizacao && (
                <p className="text-sm text-red-500 mt-1">{errosFormulario.localizacao}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={dadosFormulario.descricao}
                onChange={(e) => setDadosFormulario(prev => ({ ...prev, descricao: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setModalFormulario(false);
              resetarFormulario();
              setProdutoEditando(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={salvarProduto} disabled={salvandoFormulario}>
              {salvandoFormulario ? (
                <>
                  <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <LucideIcons.Save className="mr-2 h-4 w-4" />
                  {produtoEditando ? 'Atualizar' : 'Criar'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de detalhes */}
      <Dialog open={!!modalDetalhes} onOpenChange={() => setModalDetalhes(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          
          {modalDetalhes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Código</Label>
                  <p className="text-sm">{modalDetalhes.codigo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nome</Label>
                  <p className="text-sm font-medium">{modalDetalhes.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Categoria</Label>
                  <p className="text-sm">{modalDetalhes.categoria}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={formatarStatusVisual(modalDetalhes.status).badge as any}>
                      {formatarStatusVisual(modalDetalhes.status).texto}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Preço Unitário</Label>
                  <p className="text-sm font-medium">{formatarMoeda(modalDetalhes.preco_unitario)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estoque Atual</Label>
                  <p className="text-sm font-medium">{modalDetalhes.quantidade_estoque}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estoque Mínimo</Label>
                  <p className="text-sm">{modalDetalhes.quantidade_minima}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fornecedor</Label>
                  <p className="text-sm">{modalDetalhes.fornecedor}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Localização</Label>
                  <p className="text-sm">{modalDetalhes.localizacao}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data de Cadastro</Label>
                  <p className="text-sm">{formatarDataContextual(modalDetalhes.data_cadastro, 'longa')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Última Atualização</Label>
                  <p className="text-sm">{formatarDataContextual(modalDetalhes.ultima_atualizacao, 'longa')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                <p className="text-sm mt-1">{modalDetalhes.descricao}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalhes(null)}>
              Fechar
            </Button>
            {modalDetalhes && (
              <Button onClick={() => {
                setModalDetalhes(null);
                editarProduto(modalDetalhes);
              }}>
                <LucideIcons.Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 