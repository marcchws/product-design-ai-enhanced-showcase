// src/app/showcase/ecommerce-dashboard/produtos-inventario.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

// Funções utilitárias defensivas
const formatarMoeda = (valor: number | undefined): string => {
  if (valor === undefined || valor === null || isNaN(valor)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarNumero = (numero: number | undefined): string => {
  if (numero === undefined || numero === null || isNaN(numero)) return '0';
  return new Intl.NumberFormat('pt-BR').format(numero);
};

const calcularStatusEstoque = (estoque: number, estoqueMinimo: number = 10) => {
  if (estoque === 0) return { status: 'esgotado', cor: 'text-red-600 bg-red-100', label: 'Esgotado' };
  if (estoque <= estoqueMinimo) return { status: 'baixo', cor: 'text-yellow-600 bg-yellow-100', label: 'Estoque Baixo' };
  return { status: 'normal', cor: 'text-green-600 bg-green-100', label: 'Em Estoque' };
};

interface ProdutosInventarioProps {
  dados: any;
  periodo: string;
  carregando?: boolean;
  onRecarregar: () => void;
}

export default function ProdutosInventario({ dados, periodo, carregando, onRecarregar }: ProdutosInventarioProps) {
  // Estados para gestão de produtos
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: 'todas',
    status: 'todos',
    estoque: 'todos'
  });
  
  const [ordenacao, setOrdenacao] = useState<{campo: string, direcao: 'asc' | 'desc'}>({
    campo: 'nome',
    direcao: 'asc'
  });
  
  const [modalProduto, setModalProduto] = useState<{ tipo: 'criar' | 'editar', produto?: any } | null>(null);
  const [produtoEditando, setProdutoEditando] = useState<any>(null);
  const [salvandoProduto, setSalvandoProduto] = useState(false);

  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Produtos filtrados e ordenados
  const produtosFiltrados = useMemo(() => {
    if (!dados?.produtos) return [];

    let produtos = [...dados.produtos];

    // Aplicar filtros
    produtos = produtos.filter(produto => {
      const matchBusca = !filtros.busca || 
        produto.nome.toLowerCase().includes(filtros.busca.toLowerCase());
      
      const matchCategoria = filtros.categoria === 'todas' || produto.categoria === filtros.categoria;
      const matchStatus = filtros.status === 'todos' || produto.status === filtros.status;
      
      let matchEstoque = true;
      if (filtros.estoque === 'esgotado') matchEstoque = produto.estoque === 0;
      else if (filtros.estoque === 'baixo') matchEstoque = produto.estoque > 0 && produto.estoque <= 10;
      else if (filtros.estoque === 'normal') matchEstoque = produto.estoque > 10;
      
      return matchBusca && matchCategoria && matchStatus && matchEstoque;
    });

    // Aplicar ordenação
    produtos.sort((a, b) => {
      let valorA = a[ordenacao.campo];
      let valorB = b[ordenacao.campo];
      
      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }
      
      if (ordenacao.direcao === 'asc') {
        return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      } else {
        return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
      }
    });

    return produtos;
  }, [dados?.produtos, filtros, ordenacao]);

  // Estatísticas do inventário
  const estatisticasInventario = useMemo(() => {
    if (!dados?.produtos) return null;

    const produtos = dados.produtos;
    const total = produtos.length;
    const ativos = produtos.filter((p: any) => p.status === 'ativo').length;
    const esgotados = produtos.filter((p: any) => p.estoque === 0).length;
    const estoqueBaixo = produtos.filter((p: any) => p.estoque > 0 && p.estoque <= 10).length;
    const valorTotalEstoque = produtos.reduce((acc: number, p: any) => acc + (p.preco * p.estoque), 0);

    const categorias = produtos.reduce((acc: any, produto: any) => {
      acc[produto.categoria] = (acc[produto.categoria] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      ativos,
      esgotados,
      estoqueBaixo,
      valorTotalEstoque,
      categorias
    };
  }, [dados?.produtos]);

  // Handlers
  const handleOrdenacao = useCallback((campo: string) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleSalvarProduto = useCallback(async (dadosProduto: any) => {
    if (!montadoRef.current) return;

    setSalvandoProduto(true);

    try {
      // Simulação de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const acao = modalProduto?.tipo === 'criar' ? 'criado' : 'atualizado';
      toast.success(`Produto ${acao} com sucesso`);
      
      setModalProduto(null);
      setProdutoEditando(null);
      onRecarregar();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    } finally {
      if (montadoRef.current) {
        setSalvandoProduto(false);
      }
    }
  }, [modalProduto, onRecarregar]);

  // Renderizar produto individual
  const renderizarProduto = useCallback((produto: any) => {
    const statusEstoque = calcularStatusEstoque(produto.estoque);
    
    return (
      <Card key={produto.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{produto.nome}</h3>
              <p className="text-sm text-gray-500">{produto.categoria}</p>
            </div>
            <Badge variant={produto.status === 'ativo' ? 'default' : 'secondary'}>
              {produto.status}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Preço:</span>
              <span className="font-medium">{formatarMoeda(produto.preco)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estoque:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatarNumero(produto.estoque)}</span>
                <div className={`px-2 py-1 rounded-full text-xs ${statusEstoque.cor}`}>
                  {statusEstoque.label}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor em estoque:</span>
              <span className="font-medium">{formatarMoeda(produto.preco * produto.estoque)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                setProdutoEditando(produto);
                setModalProduto({ tipo: 'editar', produto });
              }}
            >
              <LucideIcons.Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.info('Visualizando produto...')}
            >
              <LucideIcons.Eye className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }, []);

  // Estado de loading
  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas do Inventário */}
      {estatisticasInventario && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestão de Inventário</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                    <p className="text-2xl font-bold text-gray-900">{estatisticasInventario.total}</p>
                    <p className="text-xs text-green-600">{estatisticasInventario.ativos} ativos</p>
                  </div>
                  <LucideIcons.Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor em Estoque</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarMoeda(estatisticasInventario.valorTotalEstoque)}</p>
                  </div>
                  <LucideIcons.DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                    <p className="text-2xl font-bold text-yellow-600">{estatisticasInventario.estoqueBaixo}</p>
                    <p className="text-xs text-gray-500">Precisam reposição</p>
                  </div>
                  <LucideIcons.AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Esgotados</p>
                    <p className="text-2xl font-bold text-red-600">{estatisticasInventario.esgotados}</p>
                    <p className="text-xs text-gray-500">Sem estoque</p>
                  </div>
                  <LucideIcons.XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Controles e Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-9"
                />
              </div>
              
              <Select
                value={filtros.categoria}
                onValueChange={(valor) => setFiltros(prev => ({ ...prev, categoria: valor }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Categorias</SelectItem>
                  <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                  <SelectItem value="Roupas">Roupas</SelectItem>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Esportes">Esportes</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filtros.estoque}
                onValueChange={(valor) => setFiltros(prev => ({ ...prev, estoque: valor }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todo Estoque</SelectItem>
                  <SelectItem value="normal">Em Estoque</SelectItem>
                  <SelectItem value="baixo">Estoque Baixo</SelectItem>
                  <SelectItem value="esgotado">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => setModalProduto({ tipo: 'criar' })}
              className="shrink-0"
            >
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos ({produtosFiltrados.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Ordenar por:</Label>
              <Select
                value={ordenacao.campo}
                onValueChange={(valor) => handleOrdenacao(valor)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome</SelectItem>
                  <SelectItem value="preco">Preço</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                  <SelectItem value="categoria">Categoria</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOrdenacao(ordenacao.campo)}
              >
                {ordenacao.direcao === 'asc' ? (
                  <LucideIcons.ArrowUp className="h-4 w-4" />
                ) : (
                  <LucideIcons.ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <LucideIcons.Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 mb-6">
                {Object.values(filtros).some(f => f !== 'todas' && f !== 'todos' && f !== '')
                  ? 'Nenhum produto corresponde aos filtros aplicados.'
                  : 'Você ainda não tem produtos cadastrados.'
                }
              </p>
              <Button onClick={() => setModalProduto({ tipo: 'criar' })}>
                <LucideIcons.Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {produtosFiltrados.map(renderizarProduto)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise por Categoria */}
      {estatisticasInventario && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(estatisticasInventario.categorias).map(([categoria, quantidade]) => {
                const porcentagem = (quantidade as number / estatisticasInventario.total) * 100;
                
                return (
                  <div key={categoria}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{categoria}</span>
                      <span className="text-sm text-gray-600">
                        {quantidade as number} produtos ({porcentagem.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={porcentagem} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Produto */}
      {modalProduto && (
        <Dialog open={true} onOpenChange={() => !salvandoProduto && setModalProduto(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {modalProduto.tipo === 'criar' ? 'Adicionar Produto' : 'Editar Produto'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input
                  id="nome"
                  defaultValue={produtoEditando?.nome || ''}
                  placeholder="Digite o nome do produto"
                />
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select defaultValue={produtoEditando?.categoria || 'Eletrônicos'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                    <SelectItem value="Roupas">Roupas</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Esportes">Esportes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preco">Preço</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    defaultValue={produtoEditando?.preco || ''}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estoque">Estoque</Label>
                  <Input
                    id="estoque"
                    type="number"
                    defaultValue={produtoEditando?.estoque || ''}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setModalProduto(null)}
                disabled={salvandoProduto}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => handleSalvarProduto({})}
                disabled={salvandoProduto}
              >
                {salvandoProduto ? (
                  <>
                    <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  modalProduto.tipo === 'criar' ? 'Criar Produto' : 'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}