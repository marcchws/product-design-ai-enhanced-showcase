'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Componentes modulares
import BuscaRestaurantes from './busca-restaurantes'
import RestauranteCardapio from './restaurante-cardapio'
import CarrinhoPedido from './carrinho-pedido'
import CheckoutPagamento from './checkout-pagamento'
import RastreamentoPedido from './rastreamento-pedido'

// Interfaces básicas
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
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    latitude: number;
    longitude: number;
  };
  cardapio: Produto[];
}

interface Pedido {
  id: string;
  restaurante: { nome: string };
  itens: ItemPedido[];
  endereco_entrega: any;
  metodo_pagamento: any;
  subtotal: number;
  taxa_entrega: number;
  total: number;
  status: 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue';
  tempo_estimado: number;
  created_at: string;
  tracking: any[];
  usuario_id: string;
}

// Localização fixa - Vila Madalena, SP
const LOCALIZACAO_FIXA = {
  latitude: -23.563200,
  longitude: -46.656500,
  precisao: 100,
  carregando: false,
  usando_padrao: true
};

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export default function DeliveryPWA() {
  // Estados principais
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  const [pedidoAtivo, setPedidoAtivo] = useState<Pedido | null>(null);
  const [restauranteSelecionado, setRestauranteSelecionado] = useState<Restaurante | null>(null);
  const [telaAtiva, setTelaAtiva] = useState<'busca' | 'cardapio' | 'carrinho' | 'checkout' | 'tracking'>('busca');

  // Navegação
  const navegarParaCardapio = useCallback((restaurante: any) => {
    // Ensure the restaurante object conforms to our interface
    const fullRestaurante = restaurante as Restaurante;
    setRestauranteSelecionado(fullRestaurante);
    setTelaAtiva('cardapio');
  }, []);

  const voltarParaBusca = useCallback(() => {
    setRestauranteSelecionado(null);
    setTelaAtiva('busca');
  }, []);

  const navegarParaCarrinho = useCallback(() => {
    setTelaAtiva('carrinho');
  }, []);

  const navegarParaCheckout = useCallback(() => {
    setTelaAtiva('checkout');
  }, []);

  const navegarParaTracking = useCallback(() => {
    setTelaAtiva('tracking');
  }, []);

  // Gestão do carrinho
  const adicionarAoCarrinho = useCallback((item: ItemPedido) => {
    setCarrinho(prev => [...prev, item]);
    toast.success('Item adicionado ao carrinho', {
      action: {
        label: 'Ver carrinho',
        onClick: navegarParaCarrinho
      }
    });
  }, [navegarParaCarrinho]);

  const removerDoCarrinho = useCallback((index: number) => {
    setCarrinho(prev => prev.filter((_, i) => i !== index));
    toast.info('Item removido do carrinho');
  }, []);

  const limparCarrinho = useCallback(() => {
    setCarrinho([]);
    toast.info('Carrinho limpo');
  }, []);

  // Cálculos do carrinho
  const valorCarrinho = useMemo(() => {
    return carrinho.reduce((total, item) => total + item.preco_total, 0);
  }, [carrinho]);

  const quantidadeItensCarrinho = useMemo(() => {
    return carrinho.reduce((total, item) => total + item.quantidade, 0);
  }, [carrinho]);

  const renderizarTela = () => {
    switch (telaAtiva) {
      case 'cardapio':
        return (
          <RestauranteCardapio
            restaurante={restauranteSelecionado!}
            onVoltarParaBusca={voltarParaBusca}
            onAdicionarAoCarrinho={adicionarAoCarrinho}
            localizacaoUsuario={LOCALIZACAO_FIXA}
            online={true}
          />
        );
      case 'carrinho':
        return (
          <CarrinhoPedido
            itens={carrinho}
            onRemoverItem={removerDoCarrinho}
            onLimparCarrinho={limparCarrinho}
            onContinuarCompra={navegarParaCheckout}
            onVoltarParaBusca={voltarParaBusca}
            valorTotal={valorCarrinho}
          />
        );
      case 'checkout':
        return (
          <CheckoutPagamento
            carrinho={carrinho}
            valorTotal={valorCarrinho}
            localizacaoUsuario={LOCALIZACAO_FIXA}
            onVoltarCarrinho={navegarParaCarrinho}
            onPedidoConfirmado={(pedido) => {
              setPedidoAtivo(pedido as unknown as Pedido);
              setCarrinho([]);
              navegarParaTracking();
            }}
          />
        );
      case 'tracking':
        return (
          <RastreamentoPedido
            pedido={pedidoAtivo!}
            onVoltarInicio={voltarParaBusca}
            localizacaoUsuario={LOCALIZACAO_FIXA}
          />
        );
      default:
        return (
          <BuscaRestaurantes
            localizacaoUsuario={LOCALIZACAO_FIXA}
            onSelecionarRestaurante={navegarParaCardapio}
            online={true}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      
      {/* Header Mobile */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Botão voltar */}
            {telaAtiva !== 'busca' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (telaAtiva === 'cardapio') voltarParaBusca();
                  else if (telaAtiva === 'carrinho') voltarParaBusca();
                  else if (telaAtiva === 'checkout') navegarParaCarrinho();
                  else if (telaAtiva === 'tracking') voltarParaBusca();
                }}
              >
                <LucideIcons.ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Logo/Localização */}
            <div className="flex-1 flex items-center justify-center">
              {telaAtiva === 'busca' ? (
                <div className="flex items-center text-center">
                  <LucideIcons.MapPin className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm font-medium">Vila Madalena, SP</span>
                </div>
              ) : (
                <h1 className="text-lg font-medium">
                  {telaAtiva === 'cardapio' && restauranteSelecionado?.nome}
                  {telaAtiva === 'carrinho' && 'Seu Carrinho'}
                  {telaAtiva === 'checkout' && 'Finalizar Pedido'}
                  {telaAtiva === 'tracking' && 'Acompanhar Pedido'}
                </h1>
              )}
            </div>

            {/* Badge carrinho */}
            {quantidadeItensCarrinho > 0 && telaAtiva !== 'carrinho' && telaAtiva !== 'checkout' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={navegarParaCarrinho}
                className="relative"
              >
                <LucideIcons.ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {quantidadeItensCarrinho}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="pb-20">
        {renderizarTela()}
      </main>

      {/* Bottom Navigation */}
      {telaAtiva === 'busca' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="grid grid-cols-3 h-16">
            <button className="flex flex-col items-center justify-center space-y-1 text-orange-500">
              <LucideIcons.Search className="h-5 w-5" />
              <span className="text-xs">Buscar</span>
            </button>
            
            <button
              onClick={() => {
                if (quantidadeItensCarrinho > 0) {
                  navegarParaCarrinho();
                } else {
                  toast.info('Seu carrinho está vazio');
                }
              }}
              className={`flex flex-col items-center justify-center space-y-1 relative ${
                quantidadeItensCarrinho > 0 ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <LucideIcons.ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Carrinho</span>
              {quantidadeItensCarrinho > 0 && (
                <Badge className="absolute -top-1 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {quantidadeItensCarrinho}
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => {
                if (pedidoAtivo) {
                  navegarParaTracking();
                } else {
                  toast.info('Você não tem pedidos ativos');
                }
              }}
              className={`flex flex-col items-center justify-center space-y-1 ${
                pedidoAtivo ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <LucideIcons.Clock className="h-5 w-5" />
              <span className="text-xs">Pedidos</span>
            </button>
          </div>
        </nav>
      )}

      {/* FAB carrinho flutuante */}
      {quantidadeItensCarrinho > 0 && telaAtiva !== 'carrinho' && telaAtiva !== 'checkout' && telaAtiva !== 'busca' && (
        <button
          onClick={navegarParaCarrinho}
          className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg z-40 flex items-center gap-2"
        >
          <LucideIcons.ShoppingCart className="h-5 w-5" />
          <span className="font-medium">{formatarMoeda(valorCarrinho)}</span>
          <Badge className="bg-white text-orange-500 ml-1">
            {quantidadeItensCarrinho}
          </Badge>
        </button>
      )}
    </div>
  );
}