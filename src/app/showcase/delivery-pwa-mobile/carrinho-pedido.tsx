'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  preco_promocional?: number;
  imagem: string;
  categoria: string;
}

interface ItemPedido {
  produto: Produto;
  quantidade: number;
  customizacoes_selecionadas: { [key: string]: string[] };
  observacoes?: string;
  preco_total: number;
}

interface Props {
  itens: ItemPedido[];
  onRemoverItem: (index: number) => void;
  onLimparCarrinho: () => void;
  onContinuarCompra: () => void;
  onVoltarParaBusca: () => void;
  valorTotal: number;
}

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export default function CarrinhoPedido({
  itens,
  onRemoverItem,
  onLimparCarrinho,
  onContinuarCompra,
  onVoltarParaBusca,
  valorTotal
}: Props) {
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    tipo: 'remover' | 'limpar';
    index?: number;
  } | null>(null);

  // Cálculos do carrinho
  const quantidadeTotal = useMemo(() => {
    return itens.reduce((total, item) => total + item.quantidade, 0);
  }, [itens]);

  const subtotal = useMemo(() => {
    return itens.reduce((total, item) => total + item.preco_total, 0);
  }, [itens]);

  // Taxa de entrega simulada
  const taxaEntrega = 4.99;
  const valorMinimoPedido = 25.00;
  const faltaParaMinimo = Math.max(0, valorMinimoPedido - subtotal);

  // Handlers
  const handleRemoverItem = useCallback((index: number) => {
    setModalConfirmacao({ tipo: 'remover', index });
  }, []);

  const handleLimparCarrinho = useCallback(() => {
    setModalConfirmacao({ tipo: 'limpar' });
  }, []);

  const confirmarAcao = useCallback(() => {
    if (!modalConfirmacao) return;

    if (modalConfirmacao.tipo === 'remover' && modalConfirmacao.index !== undefined) {
      onRemoverItem(modalConfirmacao.index);
      toast.success('Item removido do carrinho');
    } else if (modalConfirmacao.tipo === 'limpar') {
      onLimparCarrinho();
      toast.success('Carrinho limpo');
    }

    setModalConfirmacao(null);
  }, [modalConfirmacao, onRemoverItem, onLimparCarrinho]);

const renderizarCustomizacoes = useCallback((item: ItemPedido) => {
    const customizacoes = Object.entries(item.customizacoes_selecionadas)
      .filter(([_, opcoes]) => opcoes.length > 0)
      .map(([nome, opcoes]) => `${nome}: ${opcoes.join(', ')}`)
      .join(' • ');

    return customizacoes || null;
  }, []);

  // Estado vazio
  if (itens.length === 0) {
    return (
      <div className="p-8 text-center">
        <LucideIcons.ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Seu carrinho está vazio</h3>
        <p className="text-gray-500 mb-6">
          Adicione itens do cardápio para começar seu pedido
        </p>
        <Button onClick={onVoltarParaBusca} className="w-full max-w-xs">
          <LucideIcons.Search className="mr-2 h-4 w-4" />
          Buscar Restaurantes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header do carrinho */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Seu carrinho ({quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimparCarrinho}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LucideIcons.Trash2 className="mr-1 h-4 w-4" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Lista de itens */}
      <div className="px-4 space-y-3">
        {itens.map((item, index) => (
          <Card key={`${item.produto.id}-${index}`}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Imagem do produto */}
                <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.produto.imagem}
                    alt={item.produto.nome}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Informações do item */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{item.produto.nome}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                    >
                      <LucideIcons.X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Customizações */}
                  {renderizarCustomizacoes(item) && (
                    <p className="text-sm text-gray-600 mb-1">
                      {renderizarCustomizacoes(item)}
                    </p>
                  )}

                  {/* Observações */}
                  {item.observacoes && (
                    <p className="text-sm text-gray-500 italic mb-2">
                      Obs: {item.observacoes}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Qtd: {item.quantidade}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatarMoeda(item.preco_total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Valor mínimo do pedido */}
      {faltaParaMinimo > 0 && (
        <div className="mx-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800">
            <LucideIcons.AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">
              Adicione mais {formatarMoeda(faltaParaMinimo)} para atingir o valor mínimo do pedido
            </span>
          </div>
        </div>
      )}

      {/* Resumo do pedido */}
      <Card className="mx-4">
        <CardHeader>
          <CardTitle className="text-lg">Resumo do pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatarMoeda(subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Taxa de entrega</span>
            <span>{formatarMoeda(taxaEntrega)}</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>{formatarMoeda(subtotal + taxaEntrega)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="p-4 space-y-3">
        <Button
          onClick={onContinuarCompra}
          disabled={faltaParaMinimo > 0}
          className="w-full h-12 text-lg"
        >
          {faltaParaMinimo > 0 ? (
            <>
              <LucideIcons.ShoppingCart className="mr-2 h-5 w-5" />
              Valor mínimo não atingido
            </>
          ) : (
            <>
              <LucideIcons.CreditCard className="mr-2 h-5 w-5" />
              Finalizar pedido • {formatarMoeda(subtotal + taxaEntrega)}
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onVoltarParaBusca}
          className="w-full"
        >
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Adicionar mais itens
        </Button>
      </div>

      {/* Modal de confirmação */}
      <Dialog open={!!modalConfirmacao} onOpenChange={() => setModalConfirmacao(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalConfirmacao?.tipo === 'remover' ? 'Remover item' : 'Limpar carrinho'}
            </DialogTitle>
            <DialogDescription>
              {modalConfirmacao?.tipo === 'remover' 
                ? 'Tem certeza que deseja remover este item do carrinho?'
                : 'Tem certeza que deseja remover todos os itens do carrinho?'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalConfirmacao(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarAcao}
            >
              {modalConfirmacao?.tipo === 'remover' ? 'Remover' : 'Limpar carrinho'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}