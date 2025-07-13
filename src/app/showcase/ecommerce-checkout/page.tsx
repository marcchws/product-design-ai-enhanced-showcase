'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'

// Componentes UI com importação individual
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

// Funções utilitárias defensivas obrigatórias
const formatarMoeda = (valor: number | undefined): string => {
  if (!valor) return 'R$ 0,00';
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return 'R$ 0,00';
  }
};

const formatarCEP = (cep: string): string => {
  const apenasNumeros = cep.replace(/\D/g, '');
  if (apenasNumeros.length <= 5) {
    return apenasNumeros;
  }
  return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
};

const validarCEP = (cep: string): boolean => {
  const apenasNumeros = cep.replace(/\D/g, '');
  return apenasNumeros.length === 8;
};

const formatarCartao = (numero: string): string => {
  const apenasNumeros = numero.replace(/\D/g, '');
  return apenasNumeros.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const validarCartao = (numero: string): boolean => {
  const apenasNumeros = numero.replace(/\D/g, '');
  return apenasNumeros.length >= 13 && apenasNumeros.length <= 19;
};

// Interfaces TypeScript
interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem: string;
  disponivel: boolean;
}

interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface DadosPagamento {
  metodo: 'cartao' | 'pix' | 'boleto';
  nomeCartao: string;
  numeroCartao: string;
  validadeCartao: string;
  cvvCartao: string;
  parcelamento: number;
}

interface Pedido {
  itens: Produto[];
  endereco: Endereco;
  pagamento: DadosPagamento;
  frete: number;
  total: number;
  codigo?: string;
}

// Mock de dados
const produtosMock: Produto[] = [
  {
    id: '1',
    nome: 'iPhone 15 Pro Max 256GB',
    preco: 8999.99,
    quantidade: 1,
    imagem: '/api/placeholder/80/80',
    disponivel: true
  },
  {
    id: '2', 
    nome: 'AirPods Pro (2ª geração)',
    preco: 2199.99,
    quantidade: 1,
    imagem: '/api/placeholder/80/80',
    disponivel: true
  }
];

// APIs simuladas
const api = {
  verificarEstoque: async (produtos: Produto[]): Promise<Produto[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return produtos.map(p => ({ ...p, disponivel: Math.random() > 0.1 }));
  },
  
  buscarCEP: async (cep: string): Promise<Partial<Endereco>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (!validarCEP(cep)) throw new Error('CEP inválido');
    
    return {
      logradouro: 'Rua das Flores',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    };
  },
  
  calcularFrete: async (cep: string, produtos: Produto[]): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const valorProdutos = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
    return valorProdutos > 299 ? 0 : 29.90;
  },
  
  processarPagamento: async (dados: DadosPagamento, valor: number): Promise<{ sucesso: boolean; codigo?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const sucesso = Math.random() > 0.15; // 85% sucesso
    
    return sucesso 
      ? { sucesso: true, codigo: `PED${Date.now()}` }
      : { sucesso: false };
  }
};

export default function CheckoutOtimizado() {
  // Estados obrigatórios para prevenção de memory leaks
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);
  
  // Estados principais do checkout
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [produtos, setProdutos] = useState<Produto[]>(produtosMock);
  const [endereco, setEndereco] = useState<Endereco>({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  
  const [dadosPagamento, setDadosPagamento] = useState<DadosPagamento>({
    metodo: 'cartao',
    nomeCartao: '',
    numeroCartao: '',
    validadeCartao: '',
    cvvCartao: '',
    parcelamento: 1
  });
  
  // Estados de UX críticos
  const [carregandoEstoque, setCarregandoEstoque] = useState(false);
  const [carregandoCEP, setCarregandoCEP] = useState(false);
  const [carregandoFrete, setCarregandoFrete] = useState(false);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [frete, setFrete] = useState(0);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [pedidoConcluido, setPedidoConcluido] = useState<Pedido | null>(null);
  
  // Validação de etapas
  const [etapasValidadas, setEtapasValidadas] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false
  });
  
  // Configuração das etapas
  const etapas = [
    { numero: 1, titulo: 'Revisar Itens', icone: 'ShoppingCart' },
    { numero: 2, titulo: 'Endereço e Frete', icone: 'MapPin' },
    { numero: 3, titulo: 'Pagamento', icone: 'CreditCard' },
    { numero: 4, titulo: 'Confirmação', icone: 'CheckCircle' }
  ];
  
  // Cálculos derivados
  const subtotal = useMemo(() => {
    return produtos.reduce((acc, produto) => acc + (produto.preco * produto.quantidade), 0);
  }, [produtos]);
  
  const total = subtotal + frete;
  const freteGratis = subtotal >= 299;
  
  // Verificação inicial de estoque
  useEffect(() => {
    verificarEstoqueInicial();
  }, []);
  
  const verificarEstoqueInicial = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setCarregandoEstoque(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoEstoque(false);
        toast.error('Tempo de verificação de estoque excedido');
      }
    }, 5000);
    
    try {
      const produtosAtualizados = await api.verificarEstoque(produtos);
      if (montadoRef.current) {
        setProdutos(produtosAtualizados);
        const produtosDisponiveis = produtosAtualizados.filter(p => p.disponivel);
        if (produtosDisponiveis.length !== produtos.length) {
          toast.warning('Alguns itens não estão mais disponíveis');
        }
        setEtapasValidadas(prev => ({ ...prev, 1: produtosDisponiveis.length > 0 }));
      }
    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
      if (montadoRef.current) {
        toast.error('Falha ao verificar disponibilidade dos produtos');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoEstoque(false);
      }
    }
  }, [produtos]);
  
  // Buscar endereço por CEP
  const buscarEnderecoPorCEP = useCallback(async (cep: string) => {
    if (!validarCEP(cep) || !montadoRef.current) return;
    
    setCarregandoCEP(true);
    setErros(prev => ({ ...prev, cep: '' }));
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoCEP(false);
        setErros(prev => ({ ...prev, cep: 'Tempo de busca excedido' }));
      }
    }, 5000);
    
    try {
      const dadosEndereco = await api.buscarCEP(cep);
      if (montadoRef.current) {
        setEndereco(prev => ({
          ...prev,
          ...dadosEndereco
        }));
        toast.success('Endereço encontrado');
        // Calcular frete automaticamente
        calcularFreteAutomatico(cep);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      if (montadoRef.current) {
        setErros(prev => ({ ...prev, cep: 'CEP não encontrado' }));
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoCEP(false);
      }
    }
  }, []);
  
  // Calcular frete
  const calcularFreteAutomatico = useCallback(async (cep: string) => {
    if (!validarCEP(cep) || !montadoRef.current) return;
    
    setCarregandoFrete(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoFrete(false);
        toast.error('Tempo de cálculo de frete excedido');
      }
    }, 8000);
    
    try {
      const valorFrete = await api.calcularFrete(cep, produtos);
      if (montadoRef.current) {
        setFrete(valorFrete);
        toast.success(valorFrete === 0 ? 'Frete grátis!' : `Frete calculado: ${formatarMoeda(valorFrete)}`);
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      if (montadoRef.current) {
        toast.error('Falha ao calcular frete');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoFrete(false);
      }
    }
  }, [produtos]);
  
  // Validação de endereço
  const validarEndereco = useCallback(() => {
    const novosErros: Record<string, string> = {};
    
    if (!validarCEP(endereco.cep)) {
      novosErros.cep = 'CEP inválido';
    }
    if (!endereco.logradouro) {
      novosErros.logradouro = 'Logradouro é obrigatório';
    }
    if (!endereco.numero) {
      novosErros.numero = 'Número é obrigatório';
    }
    if (!endereco.bairro) {
      novosErros.bairro = 'Bairro é obrigatório';
    }
    if (!endereco.cidade) {
      novosErros.cidade = 'Cidade é obrigatória';
    }
    if (!endereco.estado) {
      novosErros.estado = 'Estado é obrigatório';
    }
    
    setErros(novosErros);
    const valido = Object.keys(novosErros).length === 0;
    setEtapasValidadas(prev => ({ ...prev, 2: valido }));
    
    return valido;
  }, [endereco]);
  
  // Validação de pagamento
  const validarPagamento = useCallback(() => {
    const novosErros: Record<string, string> = {};
    
    if (dadosPagamento.metodo === 'cartao') {
      if (!dadosPagamento.nomeCartao || dadosPagamento.nomeCartao.length < 3) {
        novosErros.nomeCartao = 'Nome do titular é obrigatório';
      }
      if (!validarCartao(dadosPagamento.numeroCartao)) {
        novosErros.numeroCartao = 'Número do cartão inválido';
      }
      if (!dadosPagamento.validadeCartao || !/^\d{2}\/\d{2}$/.test(dadosPagamento.validadeCartao)) {
        novosErros.validadeCartao = 'Validade inválida (MM/AA)';
      }
      if (!dadosPagamento.cvvCartao || dadosPagamento.cvvCartao.length < 3) {
        novosErros.cvvCartao = 'CVV inválido';
      }
    }
    
    setErros(novosErros);
    const valido = Object.keys(novosErros).length === 0;
    setEtapasValidadas(prev => ({ ...prev, 3: valido }));
    
    return valido;
  }, [dadosPagamento]);
  
  // Processamento final do pedido
  const processarPedidoFinal = useCallback(async () => {
    if (!montadoRef.current) return;
    
    setProcessandoPagamento(true);
    
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setProcessandoPagamento(false);
        toast.error('Tempo de processamento excedido. Tente novamente.');
      }
    }, 15000);
    
    try {
      const resultado = await api.processarPagamento(dadosPagamento, total);
      
      if (montadoRef.current) {
        if (resultado.sucesso) {
          const pedido: Pedido = {
            itens: produtos,
            endereco,
            pagamento: dadosPagamento,
            frete,
            total,
            codigo: resultado.codigo
          };
          
          setPedidoConcluido(pedido);
          setEtapaAtual(4);
          toast.success('Pedido realizado com sucesso!');
        } else {
          toast.error('Pagamento recusado. Verifique os dados do cartão.');
        }
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      if (montadoRef.current) {
        toast.error('Falha no processamento. Tente novamente.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setProcessandoPagamento(false);
      }
    }
  }, [dadosPagamento, total, produtos, endereco, frete]);
  
  // Navegação entre etapas
  const irParaProximaEtapa = useCallback(() => {
    switch (etapaAtual) {
      case 1:
        if (produtos.some(p => p.disponivel)) {
          setEtapaAtual(2);
        } else {
          toast.error('Não há produtos disponíveis para continuar');
        }
        break;
      case 2:
        if (validarEndereco()) {
          setEtapaAtual(3);
        } else {
          toast.error('Preencha todos os campos do endereço');
        }
        break;
      case 3:
        if (validarPagamento()) {
          processarPedidoFinal();
        } else {
          toast.error('Verifique os dados de pagamento');
        }
        break;
    }
  }, [etapaAtual, produtos, validarEndereco, validarPagamento, processarPedidoFinal]);
  
  const voltarEtapaAnterior = useCallback(() => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  }, [etapaAtual]);
  
  // Handlers para campos
  const handleCEPChange = useCallback((valor: string) => {
    const cepFormatado = formatarCEP(valor);
    setEndereco(prev => ({ ...prev, cep: cepFormatado }));
    
    if (validarCEP(cepFormatado)) {
      buscarEnderecoPorCEP(cepFormatado);
    }
  }, [buscarEnderecoPorCEP]);
  
  const handleCartaoChange = useCallback((campo: keyof DadosPagamento, valor: string) => {
    let valorFormatado = valor;
    
    if (campo === 'numeroCartao') {
      valorFormatado = formatarCartao(valor);
    } else if (campo === 'validadeCartao') {
      valorFormatado = valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (campo === 'cvvCartao') {
      valorFormatado = valor.replace(/\D/g, '').slice(0, 4);
    }
    
    setDadosPagamento(prev => ({ ...prev, [campo]: valorFormatado }));
  }, []);
  
  // Estado de loading geral
  const carregandoGeral = carregandoEstoque || carregandoCEP || carregandoFrete || processandoPagamento;
  
  // Renderização condicional por estado
  if (carregandoEstoque) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <h3 className="text-lg font-medium">Verificando Disponibilidade</h3>
              <p className="text-gray-500">Confirmando estoque dos produtos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Header do Checkout */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
              <p className="text-gray-600">Complete seu pedido de forma rápida e segura</p>
            </div>
            
            {/* Indicador de Progresso */}
            <div className="flex items-center space-x-2">
              {etapas.filter(e => e.numero <= 3).map((etapa, index) => {
                const IconeComponente = LucideIcons[etapa.icone as keyof typeof LucideIcons] as any;
                const ativo = etapa.numero === etapaAtual;
                const concluido = etapa.numero < etapaAtual || etapasValidadas[etapa.numero];
                
                return (
                  <div key={etapa.numero} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${ativo ? 'bg-blue-600 border-blue-600 text-white' : 
                        concluido ? 'bg-green-600 border-green-600 text-white' : 
                        'bg-gray-100 border-gray-300 text-gray-400'}
                    `}>
                      {concluido && etapa.numero < etapaAtual ? (
                        <LucideIcons.Check className="h-5 w-5" />
                      ) : (
                        <IconeComponente className="h-5 w-5" />
                      )}
                    </div>
                    
                    {index < 2 && (
                      <div className={`
                        w-8 h-0.5 mx-2 transition-all
                        ${etapa.numero < etapaAtual ? 'bg-green-600' : 'bg-gray-300'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ETAPA 1: Revisar Itens */}
            {etapaAtual === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.ShoppingCart className="h-5 w-5" />
                    Revisar Itens do Pedido
                  </CardTitle>
                  <CardDescription>
                    Confirme os produtos e quantidades antes de prosseguir
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {produtos.map(produto => (
                    <div key={produto.id} className={`
                      flex items-center space-x-4 p-4 border rounded-lg transition-all
                      ${produto.disponivel ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'}
                    `}>
                      <img 
                        src={produto.imagem} 
                        alt={produto.nome}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{produto.nome}</h3>
                        <p className="text-sm text-gray-600">Quantidade: {produto.quantidade}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatarMoeda(produto.preco)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        {produto.disponivel ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <LucideIcons.Check className="h-3 w-3 mr-1" />
                            Disponível
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <LucideIcons.AlertTriangle className="h-3 w-3 mr-1" />
                            Indisponível
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {produtos.every(p => !p.disponivel) && (
                    <div className="text-center py-8">
                      <LucideIcons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-red-900 mb-2">
                        Produtos Indisponíveis
                      </h3>
                      <p className="text-red-700 mb-4">
                        Infelizmente, os produtos selecionados não estão mais disponíveis.
                      </p>
                      <Button variant="outline" onClick={verificarEstoqueInicial}>
                        <LucideIcons.RefreshCw className="h-4 w-4 mr-2" />
                        Verificar Novamente
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* ETAPA 2: Endereço e Frete */}
            {etapaAtual === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                  <CardDescription>
                    Informe onde você deseja receber seu pedido
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* CEP */}
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        value={endereco.cep}
                        onChange={(e) => handleCEPChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        className={erros.cep ? 'border-red-500' : ''}
                      />
                      {carregandoCEP && (
                        <div className="absolute right-3 top-3">
                          <LucideIcons.Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    {erros.cep && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                        {erros.cep}
                      </p>
                    )}
                  </div>
                  
                  {/* Grid de campos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="logradouro">Logradouro</Label>
                      <Input
                        id="logradouro"
                        value={endereco.logradouro}
                        onChange={(e) => setEndereco(prev => ({ ...prev, logradouro: e.target.value }))}
                        className={erros.logradouro ? 'border-red-500' : ''}
                      />
                      {erros.logradouro && (
                        <p className="text-red-600 text-sm mt-1">{erros.logradouro}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={endereco.numero}
                        onChange={(e) => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                        className={erros.numero ? 'border-red-500' : ''}
                      />
                      {erros.numero && (
                        <p className="text-red-600 text-sm mt-1">{erros.numero}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={endereco.complemento}
                        onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                        placeholder="Apto, bloco, etc."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={endereco.bairro}
                        onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                        className={erros.bairro ? 'border-red-500' : ''}
                      />
                      {erros.bairro && (
                        <p className="text-red-600 text-sm mt-1">{erros.bairro}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={endereco.cidade}
                        onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                        className={erros.cidade ? 'border-red-500' : ''}
                      />
                      {erros.cidade && (
                        <p className="text-red-600 text-sm mt-1">{erros.cidade}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Informações de Frete */}
                  {frete >= 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LucideIcons.Truck className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Frete</span>
                        </div>
                        <div className="text-right">
                          {carregandoFrete ? (
                            <div className="flex items-center gap-2">
                              <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-gray-600">Calculando...</span>
                            </div>
                          ) : (
                            <>
                              <span className={`text-lg font-semibold ${frete === 0 ? 'text-green-600' : 'text-blue-900'}`}>
                                {frete === 0 ? 'GRÁTIS' : formatarMoeda(frete)}
                              </span>
                              <p className="text-sm text-gray-600">Entrega em até 7 dias úteis</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {!freteGratis && subtotal < 299 && (
                        <p className="text-sm text-blue-700 mt-2">
                          Faltam {formatarMoeda(299 - subtotal)} para frete grátis!
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* ETAPA 3: Pagamento */}
            {etapaAtual === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.CreditCard className="h-5 w-5" />
                    Forma de Pagamento
                  </CardTitle>
                  <CardDescription>
                    Escolha como deseja pagar seu pedido
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seleção de método */}
                  <RadioGroup
                    value={dadosPagamento.metodo}
                    onValueChange={(valor) => setDadosPagamento(prev => ({ ...prev, metodo: valor as any }))}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="cartao" id="cartao" />
                      <Label htmlFor="cartao" className="flex items-center gap-2 flex-1">
                        <LucideIcons.CreditCard className="h-4 w-4" />
                        Cartão de Crédito
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center gap-2 flex-1">
                        <LucideIcons.Zap className="h-4 w-4" />
                        PIX (5% de desconto)
                      </Label>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        -5%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="boleto" id="boleto" />
                      <Label htmlFor="boleto" className="flex items-center gap-2 flex-1">
                        <LucideIcons.FileText className="h-4 w-4" />
                        Boleto Bancário
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Campos específicos do cartão */}
                  {dadosPagamento.metodo === 'cartao' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="nomeCartao">Nome do Titular</Label>
                        <Input
                          id="nomeCartao"
                          value={dadosPagamento.nomeCartao}
                          onChange={(e) => handleCartaoChange('nomeCartao', e.target.value)}
                          placeholder="Como impresso no cartão"
                          className={erros.nomeCartao ? 'border-red-500' : ''}
                        />
                        {erros.nomeCartao && (
                          <p className="text-red-600 text-sm mt-1">{erros.nomeCartao}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="numeroCartao">Número do Cartão</Label>
                        <Input
                          id="numeroCartao"
                          value={dadosPagamento.numeroCartao}
                          onChange={(e) => handleCartaoChange('numeroCartao', e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className={erros.numeroCartao ? 'border-red-500' : ''}
                        />
                        {erros.numeroCartao && (
                          <p className="text-red-600 text-sm mt-1">{erros.numeroCartao}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="validadeCartao">Validade</Label>
                          <Input
                            id="validadeCartao"
                            value={dadosPagamento.validadeCartao}
                            onChange={(e) => handleCartaoChange('validadeCartao', e.target.value)}
                            placeholder="MM/AA"
                            maxLength={5}
                            className={erros.validadeCartao ? 'border-red-500' : ''}
                          />
                          {erros.validadeCartao && (
                            <p className="text-red-600 text-sm mt-1">{erros.validadeCartao}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="cvvCartao">CVV</Label>
                          <Input
                            id="cvvCartao"
                            value={dadosPagamento.cvvCartao}
                            onChange={(e) => handleCartaoChange('cvvCartao', e.target.value)}
                            placeholder="123"
                            maxLength={4}
                            className={erros.cvvCartao ? 'border-red-500' : ''}
                          />
                          {erros.cvvCartao && (
                            <p className="text-red-600 text-sm mt-1">{erros.cvvCartao}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Parcelamento */}
                      <div>
                        <Label htmlFor="parcelamento">Parcelamento</Label>
                        <Select
                          value={dadosPagamento.parcelamento.toString()}
                          onValueChange={(valor) => setDadosPagamento(prev => ({ 
                            ...prev, 
                            parcelamento: Number(valor) 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1x de {formatarMoeda(total)} sem juros</SelectItem>
                            <SelectItem value="2">2x de {formatarMoeda(total / 2)} sem juros</SelectItem>
                            <SelectItem value="3">3x de {formatarMoeda(total / 3)} sem juros</SelectItem>
                            <SelectItem value="6">6x de {formatarMoeda(total / 6)} sem juros</SelectItem>
                            <SelectItem value="12">12x de {formatarMoeda(total / 12)} sem juros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {/* Informações PIX */}
                  {dadosPagamento.metodo === 'pix' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <LucideIcons.Zap className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">Pagamento via PIX</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Após confirmar o pedido, você receberá o código PIX para pagamento.
                        O pagamento deve ser realizado em até 30 minutos.
                      </p>
                    </div>
                  )}
                  
                  {/* Informações Boleto */}
                  {dadosPagamento.metodo === 'boleto' && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <LucideIcons.FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Boleto Bancário</span>
                      </div>
                      <p className="text-blue-700 text-sm">
                        O boleto será enviado para seu email e poderá ser pago em qualquer banco.
                        Prazo de vencimento: 3 dias úteis.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* ETAPA 4: Confirmação */}
            {etapaAtual === 4 && pedidoConcluido && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                      <LucideIcons.CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Pedido Realizado com Sucesso!
                      </h2>
                      <p className="text-gray-600">
                        Seu pedido foi confirmado e será processado em breve.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Número do Pedido</div>
                      <div className="text-xl font-mono font-bold text-gray-900">
                        {pedidoConcluido.codigo}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button className="w-full">
                        <LucideIcons.Eye className="h-4 w-4 mr-2" />
                        Acompanhar Pedido
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <LucideIcons.Download className="h-4 w-4 mr-2" />
                        Baixar Comprovante
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Um email de confirmação foi enviado para você com todos os detalhes do pedido.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Botões de Navegação */}
            {etapaAtual < 4 && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={voltarEtapaAnterior}
                  disabled={etapaAtual === 1 || carregandoGeral}
                >
                  <LucideIcons.ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                
                <Button
                  onClick={irParaProximaEtapa}
                  disabled={carregandoGeral || (etapaAtual === 1 && !produtos.some(p => p.disponivel))}
                  className="min-w-[150px]"
                >
                  {processandoPagamento ? (
                    <>
                      <LucideIcons.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {etapaAtual === 3 ? 'Finalizar Pedido' : 'Continuar'}
                      <LucideIcons.ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Resumo do Pedido (Sidebar) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Produtos */}
                <div className="space-y-3">
                  {produtos.filter(p => p.disponivel).map(produto => (
                    <div key={produto.id} className="flex justify-between text-sm">
                      <span className="flex-1">{produto.nome}</span>
                      <span className="font-medium">{formatarMoeda(produto.preco * produto.quantidade)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Cálculos */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatarMoeda(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span className={frete === 0 ? 'text-green-600 font-medium' : ''}>
                      {frete === 0 ? 'GRÁTIS' : formatarMoeda(frete)}
                    </span>
                  </div>
                  
                  {dadosPagamento.metodo === 'pix' && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto PIX (5%)</span>
                      <span>-{formatarMoeda(total * 0.05)}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatarMoeda(
                      dadosPagamento.metodo === 'pix' ? total * 0.95 : total
                    )}
                  </span>
                </div>
                
                {/* Informações Adicionais */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <LucideIcons.Shield className="h-3 w-3" />
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LucideIcons.Truck className="h-3 w-3" />
                    <span>Entrega em até 7 dias úteis</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LucideIcons.RotateCcw className="h-3 w-3" />
                    <span>Troca grátis em 30 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}