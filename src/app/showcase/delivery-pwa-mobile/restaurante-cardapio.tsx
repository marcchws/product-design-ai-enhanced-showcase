'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Interfaces (replicadas para clareza do módulo)
interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  preco_promocional?: number;
  imagem: string;
  categoria: string;
  ingredientes: string[];
  alergicos?: string[];
  disponivel: boolean;
  tempo_preparo: number;
  popularidade: number;
  customizacoes?: {
    nome: string;
    opcoes: { id: string; nome: string; preco_adicional: number }[];
    obrigatoria: boolean;
    multipla_escolha: boolean;
  }[];
}

interface ItemPedido {
  produto: Produto;
  quantidade: number;
  customizacoes_selecionadas: { [key: string]: string[] };
  observacoes?: string;
  preco_total: number;
}

interface Restaurante {
  id: string;
  nome: string;
  categoria: string;
  imagem_capa: string;
  avaliacao: number;
  tempo_entrega_min: number;
  tempo_entrega_max: number;
  taxa_entrega: number;
  valor_minimo_pedido: number;
  aberto: boolean;
  promocional?: {
    tipo: 'desconto' | 'frete_gratis';
    valor: number;
    condicao: string;
  };
  endereco: {
    latitude: number;
    longitude: number;
  };
  cardapio: Produto[];
}

// Mock do cardápio
const cardapioMock: Produto[] = [
  {
    id: '1',
    nome: 'Big Burger Clássico',
    descricao: 'Hambúrguer artesanal 180g, queijo, alface, tomate, cebola roxa e molho especial',
    preco: 28.90,
    preco_promocional: 24.90,
    imagem: '/api/placeholder/300/200',
    categoria: 'Hamburgers',
    ingredientes: ['carne bovina', 'queijo', 'alface', 'tomate', 'cebola', 'molho especial'],
    alergicos: ['leite', 'glúten'],
    disponivel: true,
    tempo_preparo: 15,
    popularidade: 95,
    customizacoes: [
      {
        nome: 'Ponto da carne',
        opcoes: [
          { id: 'mal-passada', nome: 'Mal passada', preco_adicional: 0 },
          { id: 'ao-ponto', nome: 'Ao ponto', preco_adicional: 0 },
          { id: 'bem-passada', nome: 'Bem passada', preco_adicional: 0 }
        ],
        obrigatoria: true,
        multipla_escolha: false
      },
      {
        nome: 'Adicionais',
        opcoes: [
          { id: 'bacon', nome: 'Bacon', preco_adicional: 4.00 },
          { id: 'queijo-extra', nome: 'Queijo extra', preco_adicional: 3.00 },
          { id: 'cebola-caramelizada', nome: 'Cebola caramelizada', preco_adicional: 2.50 }
        ],
        obrigatoria: false,
        multipla_escolha: true
      }
    ]
  },
  {
    id: '2',
    nome: 'Fritas Especiais',
    descricao: 'Batatas fritas sequinhas com tempero especial da casa',
    preco: 12.90,
    imagem: '/api/placeholder/300/200',
    categoria: 'Acompanhamentos',
    ingredientes: ['batata', 'tempero especial'],
    disponivel: true,
    tempo_preparo: 8,
    popularidade: 88,
    customizacoes: [
      {
        nome: 'Tamanho',
        opcoes: [
          { id: 'pequena', nome: 'Pequena', preco_adicional: 0 },
          { id: 'media', nome: 'Média', preco_adicional: 3.00 },
          { id: 'grande', nome: 'Grande', preco_adicional: 6.00 }
        ],
        obrigatoria: true,
        multipla_escolha: false
      }
    ]
  },
  {
    id: '3',
    nome: 'Coca-Cola Lata',
    descricao: 'Refrigerante Coca-Cola 350ml gelado',
    preco: 6.90,
    imagem: '/api/placeholder/300/200',
    categoria: 'Bebidas',
    ingredientes: ['coca-cola'],
    disponivel: true,
    tempo_preparo: 2,
    popularidade: 75
  },
  {
    id: '4',
    nome: 'Chicken Burger',
    descricao: 'Peito de frango grelhado, queijo, alface e maionese temperada',
    preco: 24.90,
    imagem: '/api/placeholder/300/200',
    categoria: 'Hamburgers',
    ingredientes: ['frango', 'queijo', 'alface', 'maionese'],
    alergicos: ['leite', 'glúten'],
    disponivel: false,
    tempo_preparo: 12,
    popularidade: 82
  }
];

interface Props {
  restaurante: Restaurante;
  onVoltarParaBusca: () => void;
  onAdicionarAoCarrinho: (item: ItemPedido) => void;
  localizacaoUsuario: {
    latitude: number;
    longitude: number;
  };
  online: boolean;
}

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const calcularDistancia = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const formatarDistancia = (metros: number): string => {
  if (metros < 1000) return `${Math.round(metros)}m`;
  return `${(metros / 1000).toFixed(1)}km`;
};

export default function RestauranteCardapio({
  restaurante,
  onVoltarParaBusca,
  onAdicionarAoCarrinho,
  localizacaoUsuario,
  online
}: Props) {
  const [cardapio, setCardapio] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');
  const [produtoModal, setProdutoModal] = useState<Produto | null>(null);
  
  // Estados do modal de customização
  const [quantidade, setQuantidade] = useState(1);
  const [customizacoesSelecionadas, setCustomizacoesSelecionadas] = useState<{ [key: string]: string[] }>({});
  const [observacoes, setObservacoes] = useState('');

  // Carregar cardápio
  const carregarCardapio = useCallback(async () => {
    if (!online) {
      setErro('Sem conexão de internet');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCardapio(cardapioMock);
    } catch (error) {
      setErro('Falha ao carregar cardápio');
      toast.error('Não foi possível carregar o cardápio');
    } finally {
      setCarregando(false);
    }
  }, [online]);

  useEffect(() => {
    carregarCardapio();
  }, [carregarCardapio]);

  // Categorias do cardápio
  const categorias = useMemo(() => {
    const categoriasUnicas = ['todas', ...Array.from(new Set(cardapio.map(item => item.categoria)))];
    return categoriasUnicas;
  }, [cardapio]);

  // Produtos filtrados por categoria
  const produtosFiltrados = useMemo(() => {
    if (categoriaAtiva === 'todas') return cardapio;
    return cardapio.filter(produto => produto.categoria === categoriaAtiva);
  }, [cardapio, categoriaAtiva]);

  // Distância do restaurante
  const distanciaRestaurante = useMemo(() => {
    return calcularDistancia(
      localizacaoUsuario.latitude,
      localizacaoUsuario.longitude,
      restaurante.endereco.latitude,
      restaurante.endereco.longitude
    );
  }, [localizacaoUsuario, restaurante.endereco]);

  // Abrir modal de produto
  const abrirModalProduto = useCallback((produto: Produto) => {
    if (!produto.disponivel) {
      toast.error('Produto indisponível no momento');
      return;
    }

    setProdutoModal(produto);
    setQuantidade(1);
    setObservacoes('');
    
    // Inicializar customizações
    const customizacoesIniciais: { [key: string]: string[] } = {};
    produto.customizacoes?.forEach(customizacao => {
      if (customizacao.obrigatoria && !customizacao.multipla_escolha) {
        customizacoesIniciais[customizacao.nome] = [customizacao.opcoes[0].id];
      } else {
        customizacoesIniciais[customizacao.nome] = [];
      }
    });
    setCustomizacoesSelecionadas(customizacoesIniciais);
  }, []);

  // Fechar modal
  const fecharModal = useCallback(() => {
    setProdutoModal(null);
    setQuantidade(1);
    setCustomizacoesSelecionadas({});
    setObservacoes('');
  }, []);

  // Handler para customizações
  const handleCustomizacao = useCallback((
    nomeCustomizacao: string, 
    opcaoId: string, 
    multiplaEscolha: boolean
  ) => {
    setCustomizacoesSelecionadas(prev => {
      const novas = { ...prev };
      
      if (multiplaEscolha) {
        if (novas[nomeCustomizacao].includes(opcaoId)) {
          novas[nomeCustomizacao] = novas[nomeCustomizacao].filter(id => id !== opcaoId);
        } else {
          novas[nomeCustomizacao] = [...novas[nomeCustomizacao], opcaoId];
        }
      } else {
        novas[nomeCustomizacao] = [opcaoId];
      }
      
      return novas;
    });
  }, []);

  // Calcular preço total do item
  const calcularPrecoTotal = useCallback(() => {
    if (!produtoModal) return 0;
    
    let precoBase = produtoModal.preco_promocional || produtoModal.preco;
    let precoCustomizacoes = 0;
    
    produtoModal.customizacoes?.forEach(customizacao => {
      const selecionadas = customizacoesSelecionadas[customizacao.nome] || [];
      selecionadas.forEach(opcaoId => {
        const opcao = customizacao.opcoes.find(o => o.id === opcaoId);
        if (opcao) {
          precoCustomizacoes += opcao.preco_adicional;
        }
      });
    });
    
    return (precoBase + precoCustomizacoes) * quantidade;
  }, [produtoModal, customizacoesSelecionadas, quantidade]);

  // Validar se pode adicionar ao carrinho
  const podeAdicionarAoCarrinho = useMemo(() => {
    if (!produtoModal) return false;
    
    // Verificar customizações obrigatórias
    const customizacoesObrigatorias = produtoModal.customizacoes?.filter(c => c.obrigatoria) || [];
    
    return customizacoesObrigatorias.every(customizacao => {
      const selecionadas = customizacoesSelecionadas[customizacao.nome] || [];
      return selecionadas.length > 0;
    });
  }, [produtoModal, customizacoesSelecionadas]);

  // Adicionar ao carrinho
  const adicionarAoCarrinho = useCallback(() => {
    if (!produtoModal || !podeAdicionarAoCarrinho) return;
    
    const item: ItemPedido = {
      produto: produtoModal,
      quantidade,
      customizacoes_selecionadas: customizacoesSelecionadas,
      observacoes: observacoes.trim() || undefined,
      preco_total: calcularPrecoTotal()
    };
    
    onAdicionarAoCarrinho(item);
    fecharModal();
  }, [produtoModal, quantidade, customizacoesSelecionadas, observacoes, podeAdicionarAoCarrinho, calcularPrecoTotal, onAdicionarAoCarrinho, fecharModal]);

  // Loading state
  if (carregando) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="animate-pulse bg-gray-200 h-48 w-full"></div>
        
        {/* Categories skeleton */}
        <div className="px-4 flex gap-2 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-8 w-20 rounded-full"></div>
          ))}
        </div>
        
        {/* Products skeleton */}
        <div className="px-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (erro) {
    return (
      <div className="p-8 text-center">
        <LucideIcons.AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar cardápio</h3>
        <p className="text-gray-500 mb-6">{erro}</p>
        <Button onClick={carregarCardapio}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header do restaurante */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
          <img 
            src={restaurante.imagem_capa}
            alt={restaurante.nome}
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h1 className="text-2xl font-bold text-white mb-1">{restaurante.nome}</h1>
          <div className="flex items-center text-white/90 text-sm space-x-4">
            <span className="flex items-center">
              <LucideIcons.Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              {restaurante.avaliacao}
            </span>
            <span className="flex items-center">
              <LucideIcons.Clock className="h-4 w-4 mr-1" />
              {restaurante.tempo_entrega_min}-{restaurante.tempo_entrega_max} min
            </span>
            <span className="flex items-center">
              <LucideIcons.MapPin className="h-4 w-4 mr-1" />
              {formatarDistancia(distanciaRestaurante)}
            </span>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-white p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Taxa: {formatarMoeda(restaurante.taxa_entrega)}</span>
          <span>Mín: {formatarMoeda(restaurante.valor_minimo_pedido)}</span>
        </div>
        
        {restaurante.promocional && (
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
            {restaurante.promocional.tipo === 'frete_gratis' 
              ? 'Frete grátis' 
              : `${restaurante.promocional.valor}% off`
            }
          </Badge>
        )}
      </div>

      {/* Categorias */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              onClick={() => setCategoriaAtiva(categoria)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoriaAtiva === categoria
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {categoria === 'todas' ? 'Todas' : categoria}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="px-4 space-y-3 mt-4">
        {produtosFiltrados.map((produto) => (
          <Card 
            key={produto.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              !produto.disponivel ? 'opacity-60' : ''
            }`}
            onClick={() => abrirModalProduto(produto)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Imagem do produto */}
                <div className="relative flex-shrink-0">
                  <div className="h-20 w-20 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={produto.imagem}
                      alt={produto.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/80/80';
                      }}
                    />
                  </div>
                  
                  {/* Badge de popularidade */}
                  {produto.popularidade > 90 && (
                    <Badge className="absolute -top-1 -right-1 text-xs bg-orange-500">
                      Top
                    </Badge>
                  )}
                  
                  {!produto.disponivel && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Indisponível</span>
                    </div>
                  )}
                </div>

                {/* Informações do produto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{produto.nome}</h3>
                    <div className="ml-2 text-right">
                      {produto.preco_promocional && (
                        <span className="text-xs text-gray-400 line-through block">
                          {formatarMoeda(produto.preco)}
                        </span>
                      )}
                      <span className="font-medium text-gray-900">
                        {formatarMoeda(produto.preco_promocional || produto.preco)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{produto.descricao}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center">
                      <LucideIcons.Clock className="h-3 w-3 mr-1" />
                      {produto.tempo_preparo} min
                    </span>
                    
                    {produto.alergicos && produto.alergicos.length > 0 && (
                      <span className="flex items-center text-orange-600">
                        <LucideIcons.AlertTriangle className="h-3 w-3 mr-1" />
                        Alérgenos
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de customização */}
      <Dialog open={!!produtoModal} onOpenChange={fecharModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {produtoModal && (
            <>
              <DialogHeader>
                <div className="relative mb-4">
                  <div className="h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={produtoModal.imagem}
                      alt={produtoModal.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/400/200';
                      }}
                    />
                  </div>
                </div>
                
                <DialogTitle className="text-xl">{produtoModal.nome}</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {produtoModal.descricao}
                </DialogDescription>
                
                {/* Preço e ingredientes */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">
                      {formatarMoeda(produtoModal.preco_promocional || produtoModal.preco)}
                    </span>
                    {produtoModal.preco_promocional && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatarMoeda(produtoModal.preco)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <strong>Ingredientes:</strong> {produtoModal.ingredientes.join(', ')}
                  </div>
                  
                  {produtoModal.alergicos && produtoModal.alergicos.length > 0 && (
                    <div className="text-xs text-orange-600 flex items-center">
                      <LucideIcons.AlertTriangle className="h-3 w-3 mr-1" />
                      <strong>Alérgenos:</strong> {produtoModal.alergicos.join(', ')}
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customizações */}
                {produtoModal.customizacoes?.map((customizacao) => (
                  <div key={customizacao.nome} className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      {customizacao.nome}
                      {customizacao.obrigatoria && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h4>
                    
                    <div className="space-y-2">
                      {customizacao.opcoes.map((opcao) => {
                        const selecionada = customizacoesSelecionadas[customizacao.nome]?.includes(opcao.id);
                        
                        return (
                          <label
                            key={opcao.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              selecionada ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => handleCustomizacao(customizacao.nome, opcao.id, customizacao.multipla_escolha)}
                          >
                            <div className="flex items-center">
                              <input
                                type={customizacao.multipla_escolha ? 'checkbox' : 'radio'}
                                checked={selecionada}
                                onChange={() => {}}
                                className="mr-3"
                              />
                              <span className="text-sm">{opcao.nome}</span>
                            </div>
                            
                            {opcao.preco_adicional > 0 && (
                              <span className="text-sm font-medium">
                                +{formatarMoeda(opcao.preco_adicional)}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Observações (opcional)
                  </label>
                  <Textarea
                    placeholder="Ex: sem cebola, ponto da carne, etc."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {observacoes.length}/200 caracteres
                  </div>
                </div>

                {/* Quantidade */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Quantidade</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                      disabled={quantidade <= 1}
                    >
                      <LucideIcons.Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="font-medium w-8 text-center">{quantidade}</span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantidade(quantidade + 1)}
                      disabled={quantidade >= 10}
                    >
                      <LucideIcons.Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <div className="flex items-center justify-between w-full">
                  <div className="text-lg font-medium">
                    Total: {formatarMoeda(calcularPrecoTotal())}
                  </div>
                  
                  <Button
                    onClick={adicionarAoCarrinho}
                    disabled={!podeAdicionarAoCarrinho}
                    className="min-w-[120px]"
                  >
                    <LucideIcons.ShoppingCart className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}