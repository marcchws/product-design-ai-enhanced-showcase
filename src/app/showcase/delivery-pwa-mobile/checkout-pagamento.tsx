'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface ItemPedido {
  produto: { id: string; nome: string; preco: number };
  quantidade: number;
  customizacoes_selecionadas: { [key: string]: string[] };
  observacoes?: string;
  preco_total: number;
}

interface Endereco {
  id: string;
  tipo: 'casa' | 'trabalho' | 'outro';
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  cep: string;
  coordenadas: { latitude: number; longitude: number };
  ativo: boolean;
}

interface MetodoPagamento {
  id: string;
  tipo: 'cartao_credito' | 'cartao_debito' | 'pix' | 'dinheiro';
  principal: boolean;
  dados?: {
    numero_mascarado?: string;
    bandeira?: string;
    chave_pix?: string;
  };
}

interface Pedido {
  id: string;
  usuario_id: string;
  restaurante: any;
  itens: ItemPedido[];
  endereco_entrega: Endereco;
  metodo_pagamento: MetodoPagamento;
  subtotal: number;
  taxa_entrega: number;
  desconto: number;
  total: number;
  status: 'confirmado';
  tempo_estimado: number;
  created_at: string;
  tracking: any[];
}

interface Props {
  carrinho: ItemPedido[];
  valorTotal: number;
  localizacaoUsuario: { latitude: number; longitude: number };
  onVoltarCarrinho: () => void;
  onPedidoConfirmado: (pedido: Pedido) => void;
}

// Mock de dados do usuário
const enderecosMock: Endereco[] = [
  {
    id: '1',
    tipo: 'casa',
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: 'Apto 45',
    bairro: 'Vila Madalena',
    cidade: 'São Paulo',
    cep: '05423-020',
    coordenadas: { latitude: -23.563200, longitude: -46.656500 },
    ativo: true
  },
  {
    id: '2',
    tipo: 'trabalho',
    logradouro: 'Av. Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    cep: '01310-100',
    coordenadas: { latitude: -23.561200, longitude: -46.655500 },
    ativo: true
  }
];

const metodosPagamentoMock: MetodoPagamento[] = [
  {
    id: '1',
    tipo: 'cartao_credito',
    principal: true,
    dados: {
      numero_mascarado: '**** **** **** 1234',
      bandeira: 'Visa'
    }
  },
  {
    id: '2',
    tipo: 'pix',
    principal: false,
    dados: {
      chave_pix: 'usuario@email.com'
    }
  },
  {
    id: '3',
    tipo: 'dinheiro',
    principal: false
  }
];

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarCEP = (cep: string): string => {
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const validarCEP = (cep: string): boolean => {
  return /^\d{5}-?\d{3}$/.test(cep);
};

export default function CheckoutPagamento({
  carrinho,
  valorTotal,
  localizacaoUsuario,
  onVoltarCarrinho,
  onPedidoConfirmado
}: Props) {
  // Estados principais
  const [etapaAtiva, setEtapaAtiva] = useState<'endereco' | 'pagamento' | 'confirmacao'>('endereco');
  const [enderecos, setEnderecos] = useState<Endereco[]>(enderecosMock);
  const [metodosPagamento, setMetodosPagamento] = useState<MetodoPagamento[]>(metodosPagamentoMock);
  
  // Estados de seleção
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string>(enderecosMock[0]?.id || '');
  const [metodoPagamentoSelecionado, setMetodoPagamentoSelecionado] = useState<string>(metodosPagamentoMock[0]?.id || '');
  const [observacoesPedido, setObservacoesPedido] = useState('');
  const [trocoParaValor, setTrocoParaValor] = useState('');
  
  // Estados de novo endereço
  const [modalNovoEndereco, setModalNovoEndereco] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState<{
    tipo: 'casa' | 'trabalho' | 'outro';
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    cep: string;
  }>({
    tipo: 'casa',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'São Paulo',
    cep: ''
  });
  
  // Estados UI
  const [carregando, setCarregando] = useState(false);
  const [validandoCEP, setValidandoCEP] = useState(false);
  const [errosEndereco, setErrosEndereco] = useState<{ [key: string]: string }>({});
  
  const montadoRef = React.useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  // Cálculos do pedido
  const subtotal = useMemo(() => {
    return carrinho.reduce((total, item) => total + item.preco_total, 0);
  }, [carrinho]);

  const taxaEntrega = 4.99;
  const desconto = 0;
  const total = subtotal + taxaEntrega - desconto;

  // Buscar endereço por CEP
  const buscarEnderecoPorCEP = useCallback(async (cep: string) => {
    if (!validarCEP(cep)) return;

    setValidandoCEP(true);

    try {
      // Simular API ViaCEP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de retorno
      const enderecoEncontrado = {
        logradouro: 'Rua Exemplo',
        bairro: 'Bairro Exemplo',
        cidade: 'São Paulo'
      };

      if (montadoRef.current) {
        setNovoEndereco(prev => ({
          ...prev,
          ...enderecoEncontrado
        }));
        toast.success('Endereço encontrado!');
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('CEP não encontrado');
      }
    } finally {
      if (montadoRef.current) {
        setValidandoCEP(false);
      }
    }
  }, []);

  // Validar novo endereço
  const validarNovoEndereco = useCallback(() => {
    const erros: { [key: string]: string } = {};

    if (!novoEndereco.cep) {
      erros.cep = 'CEP é obrigatório';
    } else if (!validarCEP(novoEndereco.cep)) {
      erros.cep = 'CEP inválido';
    }

    if (!novoEndereco.logradouro) erros.logradouro = 'Logradouro é obrigatório';
    if (!novoEndereco.numero) erros.numero = 'Número é obrigatório';
    if (!novoEndereco.bairro) erros.bairro = 'Bairro é obrigatório';
    if (!novoEndereco.cidade) erros.cidade = 'Cidade é obrigatória';

    setErrosEndereco(erros);
    return Object.keys(erros).length === 0;
  }, [novoEndereco]);

  // Adicionar novo endereço
  const adicionarEndereco = useCallback(async () => {
    if (!validarNovoEndereco()) return;

    setCarregando(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const enderecoCompleto: Endereco = {
        id: Date.now().toString(),
        ...novoEndereco,
        coordenadas: localizacaoUsuario,
        ativo: true
      };

      if (montadoRef.current) {
        setEnderecos(prev => [...prev, enderecoCompleto]);
        setEnderecoSelecionado(enderecoCompleto.id);
        setModalNovoEndereco(false);
        setNovoEndereco({
          tipo: 'casa',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: 'São Paulo',
          cep: ''
        });
        toast.success('Endereço adicionado com sucesso!');
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Erro ao adicionar endereço');
      }
    } finally {
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [validarNovoEndereco, novoEndereco, localizacaoUsuario]);

  // Finalizar pedido
  const finalizarPedido = useCallback(async () => {
    const enderecoEscolhido = enderecos.find(e => e.id === enderecoSelecionado);
    const pagamentoEscolhido = metodosPagamento.find(p => p.id === metodoPagamentoSelecionado);

    if (!enderecoEscolhido || !pagamentoEscolhido) {
      toast.error('Selecione endereço e forma de pagamento');
      return;
    }

    setCarregando(true);

    try {
      // Simular processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pedido: Pedido = {
        id: `PED${Date.now()}`,
        usuario_id: 'user123',
        restaurante: { nome: 'Burger Palace' },
        itens: carrinho,
        endereco_entrega: enderecoEscolhido,
        metodo_pagamento: pagamentoEscolhido,
        subtotal,
        taxa_entrega: taxaEntrega,
        desconto,
        total,
        status: 'confirmado',
        tempo_estimado: 30,
        created_at: new Date().toISOString(),
        tracking: [
          {
            timestamp: new Date().toISOString(),
            status: 'confirmado',
            observacao: 'Pedido confirmado e enviado para o restaurante'
          }
        ]
      };

      if (montadoRef.current) {
        onPedidoConfirmado(pedido);
        toast.success('Pedido confirmado com sucesso!');
      }
    } catch (error) {
      if (montadoRef.current) {
        toast.error('Erro ao processar pedido. Tente novamente.');
      }
    } finally {
      if (montadoRef.current) {
        setCarregando(false);
      }
    }
  }, [enderecos, metodosPagamento, enderecoSelecionado, metodoPagamentoSelecionado, carrinho, subtotal, taxaEntrega, desconto, total, onPedidoConfirmado]);

  // Navegar entre etapas
  const proximaEtapa = useCallback(() => {
    if (etapaAtiva === 'endereco') {
      if (!enderecoSelecionado) {
        toast.error('Selecione um endereço de entrega');
        return;
      }
      setEtapaAtiva('pagamento');
    } else if (etapaAtiva === 'pagamento') {
      if (!metodoPagamentoSelecionado) {
        toast.error('Selecione uma forma de pagamento');
        return;
      }
      setEtapaAtiva('confirmacao');
    }
  }, [etapaAtiva, enderecoSelecionado, metodoPagamentoSelecionado]);

  const etapaAnterior = useCallback(() => {
    if (etapaAtiva === 'pagamento') {
      setEtapaAtiva('endereco');
    } else if (etapaAtiva === 'confirmacao') {
      setEtapaAtiva('pagamento');
    }
  }, [etapaAtiva]);

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex items-center justify-between">
          {['endereco', 'pagamento', 'confirmacao'].map((etapa, index) => {
            const ativo = etapaAtiva === etapa;
            const concluido = ['endereco', 'pagamento', 'confirmacao'].indexOf(etapaAtiva) > index;
            
            return (
              <div key={etapa} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  ativo ? 'bg-orange-500 text-white' :
                  concluido ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {concluido ? <LucideIcons.Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    concluido ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-2 text-center">
          <h2 className="text-lg font-medium">
            {etapaAtiva === 'endereco' && 'Endereço de entrega'}
            {etapaAtiva === 'pagamento' && 'Forma de pagamento'}
            {etapaAtiva === 'confirmacao' && 'Confirmar pedido'}
          </h2>
        </div>
      </div>

      {/* Etapa: Endereço */}
      {etapaAtiva === 'endereco' && (
        <div className="px-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Endereços salvos</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalNovoEndereco(true)}
                >
                  <LucideIcons.Plus className="mr-1 h-4 w-4" />
                  Novo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={enderecoSelecionado} onValueChange={setEnderecoSelecionado}>
                <div className="space-y-3">
                  {enderecos.map((endereco) => (
                    <div key={endereco.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={endereco.id} id={endereco.id} />
                        <Label htmlFor={endereco.id} className="flex-1 cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{endereco.tipo}</span>
                                <Badge variant="outline" className="text-xs">
                                  {endereco.tipo === 'casa' ? '🏠' : endereco.tipo === 'trabalho' ? '🏢' : '📍'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {endereco.logradouro}, {endereco.numero}
                                {endereco.complemento && `, ${endereco.complemento}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {endereco.bairro}, {endereco.cidade} - {formatarCEP(endereco.cep)}
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onVoltarCarrinho} className="flex-1">
              <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao carrinho
            </Button>
            <Button onClick={proximaEtapa} className="flex-1">
              Continuar
              <LucideIcons.ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Etapa: Pagamento */}
      {etapaAtiva === 'pagamento' && (
        <div className="px-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forma de pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={metodoPagamentoSelecionado} onValueChange={setMetodoPagamentoSelecionado}>
                <div className="space-y-3">
                  {metodosPagamento.map((metodo) => (
                    <div key={metodo.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={metodo.id} id={metodo.id} />
                        <Label htmlFor={metodo.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {metodo.tipo === 'cartao_credito' && <LucideIcons.CreditCard className="h-5 w-5 text-blue-600" />}
                              {metodo.tipo === 'cartao_debito' && <LucideIcons.CreditCard className="h-5 w-5 text-green-600" />}
                              {metodo.tipo === 'pix' && <span className="text-lg">💰</span>}
                              {metodo.tipo === 'dinheiro' && <LucideIcons.Banknote className="h-5 w-5 text-green-600" />}
                              
                              <div>
                                <p className="font-medium">
                                  {metodo.tipo === 'cartao_credito' && 'Cartão de Crédito'}
                                  {metodo.tipo === 'cartao_debito' && 'Cartão de Débito'}
                                  {metodo.tipo === 'pix' && 'PIX'}
                                  {metodo.tipo === 'dinheiro' && 'Dinheiro'}
                                </p>
                                {metodo.dados?.numero_mascarado && (
                                  <p className="text-sm text-gray-500">
                                    {metodo.dados.bandeira} {metodo.dados.numero_mascarado}
                                  </p>
                                )}
                                {metodo.dados?.chave_pix && (
                                  <p className="text-sm text-gray-500">
                                    {metodo.dados.chave_pix}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {metodo.principal && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">Principal</Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                      
                      {metodoPagamentoSelecionado === metodo.id && metodo.tipo === 'dinheiro' && (
                        <div className="ml-7 mt-2">
                          <Label htmlFor="troco">Troco para (opcional)</Label>
                          <Input
                            id="troco"
                            type="number"
                            step="0.01"
                            placeholder="R$ 0,00"
                            value={trocoParaValor}
                            onChange={(e) => setTrocoParaValor(e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={etapaAnterior} className="flex-1">
              <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={proximaEtapa} className="flex-1">
              Continuar
              <LucideIcons.ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Etapa: Confirmação */}
      {etapaAtiva === 'confirmacao' && (
        <div className="px-4 space-y-4">
          {/* Resumo do pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrinho.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.produto.nome}</p>
                    <p className="text-sm text-gray-500">Qtd: {item.quantidade}</p>
                  </div>
                  <span className="font-medium">{formatarMoeda(item.preco_total)}</span>
                </div>
              ))}
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatarMoeda(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span>{formatarMoeda(taxaEntrega)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium border-t pt-2">
                  <span>Total</span>
                  <span>{formatarMoeda(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço selecionado */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço de entrega</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const endereco = enderecos.find(e => e.id === enderecoSelecionado);
                return endereco ? (
                  <div>
                    <p className="font-medium">{endereco.tipo}</p>
                    <p className="text-sm text-gray-600">
                      {endereco.logradouro}, {endereco.numero}
                      {endereco.complemento && `, ${endereco.complemento}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {endereco.bairro}, {endereco.cidade} - {formatarCEP(endereco.cep)}
                    </p>
                  </div>
                ) : null;
              })()}
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações do pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Alguma observação especial? (opcional)"
                value={observacoesPedido}
                onChange={(e) => setObservacoesPedido(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1">
                {observacoesPedido.length}/200 caracteres
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={etapaAnterior} className="flex-1">
              <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              onClick={finalizarPedido} 
              disabled={carregando}
              className="flex-1 h-12"
            >
              {carregando ? (
                <>
                  <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <LucideIcons.CheckCircle className="mr-2 h-4 w-4" />
                  Finalizar pedido
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Modal novo endereço */}
      {modalNovoEndereco && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Novo endereço</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setModalNovoEndereco(false)}
                >
                  <LucideIcons.X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="tipo">Tipo de endereço</Label>
                <Select 
                  value={novoEndereco.tipo} 
                  onValueChange={(valor: 'casa' | 'trabalho' | 'outro') => 
                    setNovoEndereco(prev => ({ ...prev, tipo: valor }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="trabalho">Trabalho</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={novoEndereco.cep}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      setNovoEndereco(prev => ({ ...prev, cep: valor }));
                      if (valor.length === 8) {
                        buscarEnderecoPorCEP(valor);
                      }
                    }}
                    placeholder="00000-000"
                    maxLength={8}
                    className={errosEndereco.cep ? 'border-red-500' : ''}
                  />
                  {validandoCEP && (
                    <div className="absolute right-3 top-3">
                      <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
                {errosEndereco.cep && (
                  <p className="text-red-500 text-sm mt-1">{errosEndereco.cep}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={novoEndereco.logradouro}
                    onChange={(e) => setNovoEndereco(prev => ({ ...prev, logradouro: e.target.value }))}
                    className={errosEndereco.logradouro ? 'border-red-500' : ''}
                  />
                  {errosEndereco.logradouro && (
                    <p className="text-red-500 text-sm mt-1">{errosEndereco.logradouro}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={novoEndereco.numero}
                    onChange={(e) => setNovoEndereco(prev => ({ ...prev, numero: e.target.value }))}
                    className={errosEndereco.numero ? 'border-red-500' : ''}
                  />
                  {errosEndereco.numero && (
                    <p className="text-red-500 text-sm mt-1">{errosEndereco.numero}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="complemento">Complemento (opcional)</Label>
                <Input
                  id="complemento"
                  value={novoEndereco.complemento}
                  onChange={(e) => setNovoEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                  placeholder="Apto, bloco, etc."
                />
              </div>

              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={novoEndereco.bairro}
                  onChange={(e) => setNovoEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                  className={errosEndereco.bairro ? 'border-red-500' : ''}
                />
                {errosEndereco.bairro && (
                  <p className="text-red-500 text-sm mt-1">{errosEndereco.bairro}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={novoEndereco.cidade}
                  onChange={(e) => setNovoEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                  className={errosEndereco.cidade ? 'border-red-500' : ''}
                />
                {errosEndereco.cidade && (
                  <p className="text-red-500 text-sm mt-1">{errosEndereco.cidade}</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={() => setModalNovoEndereco(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={adicionarEndereco}
                disabled={carregando}
                className="flex-1"
              >
                {carregando ? (
                  <>
                    <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar endereço'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}