'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  distancia?: number;
}

interface FiltrosBusca {
  termo: string;
  categoria: string;
  ordenacao: string;
  frete_gratis: boolean;
  tempo_max: number;
  valor_min: number;
}

// Mock de dados de restaurantes
const restaurantesMock: Restaurante[] = [
  {
    id: '1',
    nome: 'Burger Palace',
    categoria: 'Hamburger',
    imagem_capa: '/api/placeholder/400/200',
    avaliacao: 4.8,
    tempo_entrega_min: 20,
    tempo_entrega_max: 35,
    taxa_entrega: 3.99,
    valor_minimo_pedido: 25.00,
    aberto: true,
    promocional: {
      tipo: 'frete_gratis',
      valor: 0,
      condicao: 'Pedidos acima de R$ 30'
    },
    endereco: { latitude: -23.563200, longitude: -46.656500 }
  },
  {
    id: '2',
    nome: 'Pizza Express',
    categoria: 'Pizza',
    imagem_capa: '/api/placeholder/400/200',
    avaliacao: 4.6,
    tempo_entrega_min: 30,
    tempo_entrega_max: 45,
    taxa_entrega: 4.99,
    valor_minimo_pedido: 35.00,
    aberto: true,
    promocional: {
      tipo: 'desconto',
      valor: 15,
      condicao: '15% off na primeira compra'
    },
    endereco: { latitude: -23.565200, longitude: -46.658500 }
  },
  {
    id: '3',
    nome: 'Sushi House',
    categoria: 'Japonesa',
    imagem_capa: '/api/placeholder/400/200',
    avaliacao: 4.9,
    tempo_entrega_min: 35,
    tempo_entrega_max: 50,
    taxa_entrega: 5.99,
    valor_minimo_pedido: 45.00,
    aberto: true,
    endereco: { latitude: -23.567200, longitude: -46.660500 }
  },
  {
    id: '4',
    nome: 'Açaí Tropical',
    categoria: 'Açaí',
    imagem_capa: '/api/placeholder/400/200',
    avaliacao: 4.7,
    tempo_entrega_min: 15,
    tempo_entrega_max: 25,
    taxa_entrega: 2.99,
    valor_minimo_pedido: 15.00,
    aberto: false,
    endereco: { latitude: -23.569200, longitude: -46.662500 }
  },
  {
    id: '5',
    nome: 'Churrasco do Gaúcho',
    categoria: 'Churrasco',
    imagem_capa: '/api/placeholder/400/200',
    avaliacao: 4.5,
    tempo_entrega_min: 45,
    tempo_entrega_max: 60,
    taxa_entrega: 6.99,
    valor_minimo_pedido: 50.00,
    aberto: true,
    endereco: { latitude: -23.571200, longitude: -46.664500 }
  }
];

const categoriasMock = [
  { id: 'todas', nome: 'Todas', icone: 'Grid3X3' },
  { id: 'hamburger', nome: 'Burger', icone: 'Beef' },
  { id: 'pizza', nome: 'Pizza', icone: 'Pizza' },
  { id: 'japonesa', nome: 'Japonesa', icone: 'Fish' },
  { id: 'acai', nome: 'Açaí', icone: 'IceCream' },
  { id: 'churrasco', nome: 'Churrasco', icone: 'Beef' },
  { id: 'italiana', nome: 'Italiana', icone: 'ChefHat' },
  { id: 'brasileira', nome: 'Brasileira', icone: 'Home' }
];

interface Props {
  localizacaoUsuario: {
    latitude: number;
    longitude: number;
    precisao: number;
    carregando: boolean;
    usando_padrao?: boolean;
  };
  onSelecionarRestaurante: (restaurante: Restaurante) => void;
  online: boolean;
}

// Funções utilitárias
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

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarTempo = (min: number, max: number): string => {
  return `${min}-${max} min`;
};

export default function BuscaRestaurantes({ 
  localizacaoUsuario, 
  onSelecionarRestaurante, 
  online 
}: Props) {
  // Estados de filtros e busca
  const [filtros, setFiltros] = useState<FiltrosBusca>({
    termo: '',
    categoria: 'todas',
    ordenacao: 'distancia',
    frete_gratis: false,
    tempo_max: 60,
    valor_min: 0
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [expandirFiltros, setExpandirFiltros] = useState(false);

  // Carregar restaurantes sem aguardar localização
  const carregarRestaurantes = useCallback(async () => {
    if (!online) {
      setErro('Sem conexão de internet');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calcular distâncias com localização atual (padrão ou real)
      const restaurantesComDistancia = restaurantesMock.map(restaurante => ({
        ...restaurante,
        distancia: calcularDistancia(
          localizacaoUsuario.latitude,
          localizacaoUsuario.longitude,
          restaurante.endereco.latitude,
          restaurante.endereco.longitude
        )
      }));

      setRestaurantes(restaurantesComDistancia);
    } catch (error) {
      setErro('Falha ao carregar restaurantes');
      toast.error('Não foi possível carregar os restaurantes');
    } finally {
      setCarregando(false);
    }
  }, [localizacaoUsuario, online]);

  // Carregar dados independente do estado de carregamento da localização
  useEffect(() => {
    carregarRestaurantes();
  }, [carregarRestaurantes]);

  // Filtrar e ordenar restaurantes
  const restaurantesFiltrados = useMemo(() => {
    let resultado = restaurantes.filter(restaurante => {
      // Filtro por termo de busca
      if (filtros.termo) {
        const termo = filtros.termo.toLowerCase();
        const matchNome = restaurante.nome.toLowerCase().includes(termo);
        const matchCategoria = restaurante.categoria.toLowerCase().includes(termo);
        if (!matchNome && !matchCategoria) return false;
      }

      // Filtro por categoria
      if (filtros.categoria !== 'todas') {
        if (restaurante.categoria.toLowerCase() !== filtros.categoria.toLowerCase()) {
          return false;
        }
      }

      // Filtro por frete grátis
      if (filtros.frete_gratis) {
        if (!restaurante.promocional || restaurante.promocional.tipo !== 'frete_gratis') {
          return false;
        }
      }

      // Filtro por tempo máximo
      if (restaurante.tempo_entrega_max > filtros.tempo_max) {
        return false;
      }

      // Filtro por valor mínimo
      if (restaurante.valor_minimo_pedido < filtros.valor_min) {
        return false;
      }

      return true;
    });

    // Ordenação
    switch (filtros.ordenacao) {
      case 'distancia':
        resultado.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
        break;
      case 'tempo':
        resultado.sort((a, b) => a.tempo_entrega_min - b.tempo_entrega_min);
        break;
      case 'avaliacao':
        resultado.sort((a, b) => b.avaliacao - a.avaliacao);
        break;
      case 'taxa_entrega':
        resultado.sort((a, b) => a.taxa_entrega - b.taxa_entrega);
        break;
    }

    return resultado;
  }, [restaurantes, filtros]);

  // Handlers dos filtros
  const handleFiltroChange = useCallback((campo: keyof FiltrosBusca, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({
      termo: '',
      categoria: 'todas',
      ordenacao: 'distancia',
      frete_gratis: false,
      tempo_max: 60,
      valor_min: 0
    });
  }, []);

  // Estados UI para loading
  if (carregando) {
    return (
      <div className="p-4 space-y-4">
        {/* Skeleton para categorias */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
        
        {/* Skeleton para restaurantes */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Estado de erro
  if (erro) {
    return (
      <div className="p-8 text-center">
        <LucideIcons.AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar</h3>
        <p className="text-gray-500 mb-6">{erro}</p>
        <Button onClick={carregarRestaurantes}>
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar restaurantes, pratos..."
            value={filtros.termo}
            onChange={(e) => handleFiltroChange('termo', e.target.value)}
            className="pl-9 pr-16"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1"
            onClick={() => setExpandirFiltros(!expandirFiltros)}
          >
            <LucideIcons.SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtros expandidos */}
        {expandirFiltros && (
          <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Ordenar por
                </label>
                <Select 
                  value={filtros.ordenacao} 
                  onValueChange={(valor) => handleFiltroChange('ordenacao', valor)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distancia">Distância</SelectItem>
                    <SelectItem value="tempo">Tempo de entrega</SelectItem>
                    <SelectItem value="avaliacao">Avaliação</SelectItem>
                    <SelectItem value="taxa_entrega">Taxa de entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tempo máximo
                </label>
                <Select 
                  value={filtros.tempo_max.toString()} 
                  onValueChange={(valor) => handleFiltroChange('tempo_max', parseInt(valor))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="frete-gratis"
                checked={filtros.frete_gratis}
                onChange={(e) => handleFiltroChange('frete_gratis', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="frete-gratis" className="text-sm text-gray-700">
                Apenas frete grátis
              </label>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={limparFiltros}
              className="w-full"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Categorias horizontais */}
      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categoriasMock.map((categoria) => {
            const IconeComponente = LucideIcons[categoria.icone as keyof typeof LucideIcons] as any;
            const ativo = filtros.categoria === categoria.id;
            
            return (
              <button
                key={categoria.id}
                onClick={() => handleFiltroChange('categoria', categoria.id)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg min-w-[70px] transition-colors ${
                  ativo 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <IconeComponente className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{categoria.nome}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de restaurantes */}
      <div className="px-4 space-y-3">
        {restaurantesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <LucideIcons.Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum restaurante encontrado</h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar os filtros ou buscar por outro termo
            </p>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          restaurantesFiltrados.map((restaurante) => (
            <Card 
              key={restaurante.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !restaurante.aberto ? 'opacity-60' : ''
              }`}
              onClick={() => {
                if (restaurante.aberto) {
                  onSelecionarRestaurante(restaurante);
                } else {
                  toast.error('Restaurante fechado no momento');
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Imagem do restaurante */}
                  <div className="relative">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={restaurante.imagem_capa}
                        alt={restaurante.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {!restaurante.aberto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Fechado</span>
                      </div>
                    )}
                  </div>

                  {/* Informações do restaurante */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{restaurante.nome}</h3>
                      <div className="flex items-center ml-2">
                        <LucideIcons.Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">{restaurante.avaliacao}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">{restaurante.categoria}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center">
                          <LucideIcons.Clock className="h-3 w-3 mr-1" />
                          {formatarTempo(restaurante.tempo_entrega_min, restaurante.tempo_entrega_max)}
                        </span>
                        
                        {restaurante.distancia && (
                          <span className="flex items-center">
                            <LucideIcons.MapPin className="h-3 w-3 mr-1" />
                            {formatarDistancia(restaurante.distancia)}
                          </span>
                        )}
                      </div>
                      
                      <span className="font-medium">
                        {restaurante.taxa_entrega === 0 ? 'Grátis' : formatarMoeda(restaurante.taxa_entrega)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promoções */}
                {restaurante.promocional && (
                  <div className="mt-3 pt-3 border-t">
                    <Badge 
                      variant={restaurante.promocional.tipo === 'frete_gratis' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {restaurante.promocional.tipo === 'frete_gratis' 
                        ? '🚚 Frete grátis' 
                        : `💰 ${restaurante.promocional.valor}% off`
                      }
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">
                      {restaurante.promocional.condicao}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}