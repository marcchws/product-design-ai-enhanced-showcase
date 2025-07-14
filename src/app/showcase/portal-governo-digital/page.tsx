'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'
import * as LucideIcons from 'lucide-react'

// Componentes UI obrigatórios
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

// Funções utilitárias defensivas obrigatórias
const validarCPF = (cpf: string | undefined): boolean => {
  if (!cpf) return false;
  
  try {
    const apenasNumeros = cpf.replace(/\D/g, '');
    
    if (apenasNumeros.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(apenasNumeros)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(apenasNumeros[i]) * (10 - i);
    }
    let digito1 = (soma * 10) % 11;
    if (digito1 === 10) digito1 = 0;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(apenasNumeros[i]) * (11 - i);
    }
    let digito2 = (soma * 10) % 11;
    if (digito2 === 10) digito2 = 0;
    
    return digito1 === parseInt(apenasNumeros[9]) && digito2 === parseInt(apenasNumeros[10]);
  } catch (error) {
    console.error('Erro ao validar CPF:', error);
    return false;
  }
};

const formatarCPF = (cpf: string | undefined): string => {
  if (!cpf) return '';
  
  const apenasNumeros = cpf.replace(/\D/g, '');
  
  if (apenasNumeros.length <= 11) {
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
};

const gerarProtocolo = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `GOV${timestamp.slice(-6)}${random}`;
};

const formatarStatusProcesso = (status: string | undefined) => {
  if (!status) {
    return { 
      texto: 'Indefinido', 
      cor: 'text-gray-500', 
      icone: 'HelpCircle', 
      badge: 'secondary' as const
    };
  }
  
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'em_andamento':
    case 'processando':
      return { 
        texto: 'Em Andamento', 
        cor: 'text-blue-600', 
        icone: 'Clock', 
        badge: 'default' as const
      };
    
    case 'concluido':
    case 'aprovado':
      return { 
        texto: 'Concluído', 
        cor: 'text-green-600', 
        icone: 'CheckCircle', 
        badge: 'default' as const
      };
    
    case 'pendente':
    case 'aguardando_documentos':
      return { 
        texto: 'Pendente', 
        cor: 'text-yellow-600', 
        icone: 'AlertTriangle', 
        badge: 'secondary' as const
      };
    
    case 'rejeitado':
    case 'cancelado':
      return { 
        texto: 'Rejeitado', 
        cor: 'text-red-600', 
        icone: 'XCircle', 
        badge: 'destructive' as const
      };
    
    default:
      return { 
        texto: status, 
        cor: 'text-gray-600', 
        icone: 'Circle', 
        badge: 'secondary' as const
      };
  }
};

// Dados mock para demonstração
const servicosPopulares = [
  {
    id: 'carteira-identidade',
    titulo: 'Carteira de Identidade',
    descricao: 'Solicite ou renove seu RG',
    orgao: 'Polícia Civil',
    prazo: '15 dias úteis',
    custo: 'Gratuito',
    categoria: 'Documentos',
    icone: 'CreditCard',
    digital: true,
    acessos: 45230
  },
  {
    id: 'certidao-nascimento',
    titulo: 'Certidão de Nascimento',
    descricao: '2ª via de certidão de nascimento',
    orgao: 'Cartório Civil',
    prazo: 'Imediato',
    custo: 'R$ 30,00',
    categoria: 'Documentos',
    icone: 'FileText',
    digital: true,
    acessos: 38940
  },
  {
    id: 'cnh-renovacao',
    titulo: 'Renovação de CNH',
    descricao: 'Renovar carteira de motorista',
    orgao: 'DETRAN',
    prazo: '30 dias úteis',
    custo: 'R$ 145,00',
    categoria: 'Habilitação',
    icone: 'Car',
    digital: false,
    acessos: 67820
  },
  {
    id: 'imposto-renda',
    titulo: 'Consulta Imposto de Renda',
    descricao: 'Consulte situação do IR',
    orgao: 'Receita Federal',
    prazo: 'Imediato',
    custo: 'Gratuito',
    categoria: 'Impostos',
    icone: 'Calculator',
    digital: true,
    acessos: 124567
  },
  {
    id: 'titulo-eleitor',
    titulo: 'Título de Eleitor',
    descricao: 'Emitir ou transferir título',
    orgao: 'TRE',
    prazo: '10 dias úteis',
    custo: 'Gratuito',
    categoria: 'Eleitoral',
    icone: 'Vote',
    digital: true,
    acessos: 23456
  },
  {
    id: 'auxilio-emergencial',
    titulo: 'Auxílio Social',
    descricao: 'Consultar benefícios sociais',
    orgao: 'Ministério Social',
    prazo: 'Imediato',
    custo: 'Gratuito',
    categoria: 'Benefícios',
    icone: 'Heart',
    digital: true,
    acessos: 89234
  }
];

const processosExemplo = [
  {
    id: 'PROC001',
    protocolo: 'GOV123456ABCD',
    servico: 'Carteira de Identidade',
    data_solicitacao: '2024-01-15',
    status: 'em_andamento',
    etapa_atual: 'Análise de documentos',
    prazo_estimado: '2024-01-30',
    orgao_responsavel: 'Polícia Civil'
  },
  {
    id: 'PROC002',
    protocolo: 'GOV789012EFGH',
    servico: 'Renovação de CNH',
    data_solicitacao: '2024-01-10',
    status: 'pendente',
    etapa_atual: 'Aguardando exame médico',
    prazo_estimado: '2024-02-10',
    orgao_responsavel: 'DETRAN'
  },
  {
    id: 'PROC003',
    protocolo: 'GOV345678IJKL',
    servico: 'Certidão de Nascimento',
    data_solicitacao: '2024-01-12',
    status: 'concluido',
    etapa_atual: 'Documento disponível',
    prazo_estimado: '2024-01-12',
    orgao_responsavel: 'Cartório Civil'
  }
];

export default function PortalGovernoDigital() {
  // Estados globais compartilhados
  const [abaSelecionada, setAbaSelecionada] = useState<string>('servicos');
  const [dadosPorAba, setDadosPorAba] = useState<Record<string, any>>({});
  const [carregandoPorAba, setCarregandoPorAba] = useState<Record<string, boolean>>({});
  const [erroPorAba, setErroPorAba] = useState<Record<string, string | null>>({});
  const [abasCarregadas, setAbasCarregadas] = useState<Set<string>>(new Set(['servicos']));
  
  // Estados de acessibilidade
  const [modoAcessibilidade, setModoAcessibilidade] = useState({
    altoContraste: false,
    tamanhoFonte: 'normal' as 'normal' | 'grande' | 'extra-grande',
    interfaceSimplificada: false,
    navegacaoTeclado: false
  });
  
  // Estados de usuário
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  
  // Prevenção memory leak obrigatória
  const montadoRef = useRef(true);
  
  useEffect(() => {
    montadoRef.current = true;
    
    // Carregar primeira aba automaticamente
    carregarDadosAba('servicos');
    
    // Detectar preferências de acessibilidade do sistema
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setModoAcessibilidade(prev => ({ ...prev, interfaceSimplificada: true }));
    }
    
    return () => {
      montadoRef.current = false;
    };
  }, []);
  
  // Configuração de abas disponíveis
  const configuracaoAbas = useMemo(() => [
    { 
      id: 'servicos', 
      label: 'Serviços', 
      icone: 'Grid3X3',
      badge: servicosPopulares.length,
      lazy: false
    },
    { 
      id: 'documentos', 
      label: 'Meus Documentos', 
      icone: 'FileText',
      badge: usuarioAutenticado ? 3 : null,
      lazy: true
    },
    { 
      id: 'acompanhamento', 
      label: 'Acompanhar', 
      icone: 'Search',
      badge: usuarioAutenticado ? processosExemplo.length : null,
      lazy: true
    },
    { 
      id: 'transparencia', 
      label: 'Transparência', 
      icone: 'BarChart3',
      badge: null,
      lazy: true
    },
    { 
      id: 'ajuda', 
      label: 'Ajuda', 
      icone: 'HelpCircle',
      badge: null,
      lazy: true
    }
  ], [usuarioAutenticado]);
  
  // Carregamento por aba com timeout estendido para gov
  const carregarDadosAba = useCallback(async (abaId: string) => {
    if (!montadoRef.current) return;
    
    if (abasCarregadas.has(abaId) && dadosPorAba[abaId]) {
      return;
    }
    
    setCarregandoPorAba(prev => ({ ...prev, [abaId]: true }));
    setErroPorAba(prev => ({ ...prev, [abaId]: null }));
    
    // Timeout estendido para sistemas governamentais
    const timeoutId = setTimeout(() => {
      if (montadoRef.current) {
        setCarregandoPorAba(prev => ({ ...prev, [abaId]: false }));
        setErroPorAba(prev => ({ 
          ...prev, 
          [abaId]: 'Tempo de resposta excedido. Sistemas governamentais podem estar lentos. Tente novamente.' 
        }));
      }
    }, 15000); // 15 segundos para sistemas gov
    
    try {
      // Simular carregamento de dados governamentais
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let dados: string[] | { id: string; titulo: string; descricao: string; orgao: string; prazo: string; custo: string; categoria: string; icone: string; digital: boolean; acessos: number }[] | { id: string; protocolo: string; servico: string; data_solicitacao: string; status: string; etapa_atual: string; prazo_estimado: string; orgao_responsavel: string }[] | { categoria: string; valor: number; percentual: number }[];
      switch (abaId) {
        case 'servicos':
          dados = servicosPopulares;
          break;
        case 'documentos':
          dados = usuarioAutenticado ? ['RG Digital', 'CPF', 'Título Eleitor'] : [];
          break;
        case 'acompanhamento':
          dados = usuarioAutenticado ? processosExemplo : [];
          break;
        case 'transparencia':
          dados = [
            { categoria: 'Educação', valor: 2500000000, percentual: 25 },
            { categoria: 'Saúde', valor: 2000000000, percentual: 20 },
            { categoria: 'Segurança', valor: 1500000000, percentual: 15 },
            { categoria: 'Infraestrutura', valor: 1200000000, percentual: 12 }
          ];
          break;
        default:
          dados = [];
      }
      
      if (montadoRef.current) {
        setDadosPorAba(prev => ({ ...prev, [abaId]: dados }));
        setAbasCarregadas(prev => {
          const newSet = new Set(prev);
          newSet.add(abaId);
          return newSet;
        });
      }
    } catch (error) {
      console.error(`Erro ao carregar aba ${abaId}:`, error);
      if (montadoRef.current) {
        setErroPorAba(prev => ({ 
          ...prev, 
          [abaId]: 'Falha na comunicação com sistemas governamentais. Tente novamente em alguns instantes.' 
        }));
      }
    } finally {
      clearTimeout(timeoutId);
      if (montadoRef.current) {
        setCarregandoPorAba(prev => ({ ...prev, [abaId]: false }));
      }
    }
  }, [abasCarregadas, dadosPorAba, usuarioAutenticado]);
  
  // Handler para mudança de aba
  const handleMudarAba = useCallback((novaAba: string) => {
    if (novaAba === abaSelecionada) return;
    
    setAbaSelecionada(novaAba);
    
    // Verificar se precisa autenticação
    if (['documentos', 'acompanhamento'].includes(novaAba) && !usuarioAutenticado) {
      toast.info('Esta funcionalidade requer autenticação via Gov.br');
      return;
    }
    
    const configAba = configuracaoAbas.find(aba => aba.id === novaAba);
    if (configAba?.lazy && !abasCarregadas.has(novaAba)) {
      setTimeout(() => {
        if (montadoRef.current) {
          carregarDadosAba(novaAba);
        }
      }, 150);
    }
  }, [abaSelecionada, configuracaoAbas, abasCarregadas, carregarDadosAba, usuarioAutenticado]);
  
  // Toggle de acessibilidade
  const toggleAcessibilidade = useCallback((tipo: keyof typeof modoAcessibilidade, valor?: any) => {
    setModoAcessibilidade(prev => ({
      ...prev,
      [tipo]: valor !== undefined ? valor : !prev[tipo]
    }));
    
    // Anunciar mudança para screen readers
    const mudancas = {
      altoContraste: 'Modo de alto contraste',
      tamanhoFonte: 'Tamanho da fonte',
      interfaceSimplificada: 'Interface simplificada',
      navegacaoTeclado: 'Navegação por teclado'
    };
    
    toast.success(`${mudancas[tipo]} ${valor !== undefined ? valor : (!modoAcessibilidade[tipo] ? 'ativado' : 'desativado')}`);
  }, [modoAcessibilidade]);
  
  // Autenticação simulada Gov.br
  const handleAutenticacaoGovBr = useCallback(async () => {
    toast.loading('Redirecionando para Gov.br...');
    
    // Simular autenticação
    setTimeout(() => {
      if (montadoRef.current) {
        setUsuarioAutenticado(true);
        setDadosUsuario({
          nome: 'Maria Silva Santos',
          cpf: '123.456.789-00',
          email: 'maria.silva@email.com'
        });
        toast.success('Autenticado com sucesso via Gov.br');
      }
    }, 2000);
  }, []);
  
  // Classes de acessibilidade
  const classesAcessibilidade = useMemo(() => {
    let classes = '';
    
    if (modoAcessibilidade.altoContraste) {
      classes += ' contrast-125 saturate-150';
    }
    
    if (modoAcessibilidade.tamanhoFonte === 'grande') {
      classes += ' text-lg';
    } else if (modoAcessibilidade.tamanhoFonte === 'extra-grande') {
      classes += ' text-xl';
    }
    
    return classes;
  }, [modoAcessibilidade]);
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-green-50 ${classesAcessibilidade}`}>
      <Toaster position="bottom-right" richColors />
      
      {/* Skip links para acessibilidade */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
        <a 
          href="#main-content" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Pular para conteúdo principal
        </a>
      </div>
      
      {/* Header governamental */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-green-800 font-bold text-lg">BR</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Gov.br</h1>
                  <p className="text-green-100 text-xs">Portal de Serviços Públicos</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Controles de acessibilidade */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAcessibilidade('altoContraste')}
                  className={`text-white border-white hover:bg-green-600 ${modoAcessibilidade.altoContraste ? 'bg-green-600' : ''}`}
                  aria-label="Alternar alto contraste"
                >
                  <LucideIcons.Eye className="h-4 w-4" />
                </Button>
                
                <Select
                  value={modoAcessibilidade.tamanhoFonte}
                  onValueChange={(valor) => toggleAcessibilidade('tamanhoFonte', valor)}
                >
                  <SelectTrigger className="w-20 h-8 text-white border-white">
                    <LucideIcons.Type className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                    <SelectItem value="extra-grande">Extra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Autenticação */}
              {usuarioAutenticado ? (
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-green-600 text-white">
                      {dadosUsuario?.nome?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{dadosUsuario?.nome}</p>
                    <p className="text-green-100 text-xs">{dadosUsuario?.cpf}</p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleAutenticacaoGovBr}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <LucideIcons.LogIn className="mr-2 h-4 w-4" />
                  Entrar com Gov.br
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Navegação principal */}
      <nav className="bg-white shadow-sm border-b" role="navigation" aria-label="Navegação principal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={abaSelecionada} onValueChange={handleMudarAba} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1">
              {configuracaoAbas.map(aba => {
                const IconeComponente = LucideIcons[aba.icone as keyof typeof LucideIcons] as any;
                const isCarregando = carregandoPorAba[aba.id];
                
                return (
                  <TabsTrigger 
                    key={aba.id}
                    value={aba.id} 
                    className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                    disabled={isCarregando}
                    aria-label={`${aba.label}${aba.badge ? ` (${aba.badge} itens)` : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {isCarregando ? (
                        <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <IconeComponente className="h-5 w-5" />
                      )}
                      {aba.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {aba.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-medium">{aba.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {/* Conteúdo principal */}
            <main id="main-content" className="py-8">
              {configuracaoAbas.map(aba => (
                <TabsContent key={aba.id} value={aba.id} className="mt-0">
                  <ConteudoAba 
                    abaId={aba.id}
                    dados={dadosPorAba[aba.id]}
                    carregando={carregandoPorAba[aba.id]}
                    erro={erroPorAba[aba.id]}
                    onRecarregar={() => carregarDadosAba(aba.id)}
                    usuarioAutenticado={usuarioAutenticado}
                    modoAcessibilidade={modoAcessibilidade}
                  />
                </TabsContent>
              ))}
            </main>
          </Tabs>
        </div>
      </nav>
    </div>
  );
}

// Componente para conteúdo de cada aba
function ConteudoAba({ 
  abaId, 
  dados, 
  carregando, 
  erro, 
  onRecarregar, 
  usuarioAutenticado,
  modoAcessibilidade 
}: {
  abaId: string;
  dados: any;
  carregando: boolean;
  erro: string | null;
  onRecarregar: () => void;
  usuarioAutenticado: boolean;
  modoAcessibilidade: any;
}) {
  // Estados de loading
  if (carregando) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando informações</h3>
          <p className="text-gray-500">Aguarde enquanto buscamos os dados nos sistemas governamentais...</p>
        </div>
      </div>
    );
  }
  
  // Estados de erro
  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center max-w-2xl mx-auto">
        <LucideIcons.AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-red-900 mb-4">Problema na comunicação</h3>
        <p className="text-red-700 mb-6">{erro}</p>
        <div className="text-left mb-6">
          <p className="text-sm font-medium text-red-800 mb-2">O que você pode fazer:</p>
          <ul className="text-sm text-red-700 space-y-1">
            <li className="flex items-start">
              <LucideIcons.CheckCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              Verificar sua conexão com a internet
            </li>
            <li className="flex items-start">
              <LucideIcons.CheckCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              Aguardar alguns instantes e tentar novamente
            </li>
            <li className="flex items-start">
              <LucideIcons.CheckCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              Entre em contato com o suporte se o problema persistir
            </li>
          </ul>
        </div>
        <Button onClick={onRecarregar} className="bg-red-600 hover:bg-red-700">
          <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }
  
  // Renderizar conteúdo específico por aba
  switch (abaId) {
    case 'servicos':
      return <ServicosPopulares dados={dados} modoAcessibilidade={modoAcessibilidade} />;
    
    case 'documentos':
      if (!usuarioAutenticado) {
        return <RequereAutenticacao />;
      }
      return <MeusDocumentos dados={dados} />;
    
    case 'acompanhamento':
      if (!usuarioAutenticado) {
        return <RequereAutenticacao />;
      }
      return <AcompanharProcessos dados={dados} />;
    
    case 'transparencia':
      return <TransparenciaGov dados={dados} />;
    
    case 'ajuda':
      return <CentralAjuda modoAcessibilidade={modoAcessibilidade} />;
    
    default:
      return <div>Conteúdo não encontrado</div>;
  }
}

// Componente de Serviços Populares
function ServicosPopulares({ dados, modoAcessibilidade }: any) {
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [termoBusca, setTermoBusca] = useState('');
  
  const categorias = ['todas', 'Documentos', 'Habilitação', 'Impostos', 'Eleitoral', 'Benefícios'];
  
  const servicosFiltrados = useMemo(() => {
    if (!dados) return [];
    
    return dados.filter((servico: any) => {
      const matchCategoria = filtroCategoria === 'todas' || servico.categoria === filtroCategoria;
      const matchBusca = termoBusca === '' || 
        servico.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        servico.descricao.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchCategoria && matchBusca;
    });
  }, [dados, filtroCategoria, termoBusca]);
  
  return (
    <div className="space-y-8">
      {/* Busca e filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Serviços Públicos Digitais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Label htmlFor="busca-servicos" className="sr-only">Buscar serviços</Label>
            <LucideIcons.Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="busca-servicos"
              placeholder="Buscar serviços públicos..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10 text-lg py-3"
              aria-describedby="busca-help"
            />
            <p id="busca-help" className="text-sm text-gray-500 mt-1">
              Digite o nome do documento ou serviço que você precisa
            </p>
          </div>
          
          <div>
            <Label htmlFor="filtro-categoria">Filtrar por categoria</Label>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger id="filtro-categoria" className="text-lg py-3">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria === 'todas' ? 'Todas as categorias' : categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {termoBusca && (
          <p className="text-gray-600 mb-4">
            {servicosFiltrados.length} serviço(s) encontrado(s) para "{termoBusca}"
          </p>
        )}
      </div>
      
      {/* Grid de serviços */}
      {servicosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <LucideIcons.Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-2">Nenhum serviço encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Não encontramos serviços que correspondam aos seus critérios de busca.
            Tente usar termos diferentes ou limpar os filtros.
          </p>
          <Button 
            onClick={() => {
              setTermoBusca('');
              setFiltroCategoria('todas');
            }}
            variant="outline"
          >
            <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicosFiltrados.map((servico: any) => (
            <ServicoCard key={servico.id} servico={servico} modoAcessibilidade={modoAcessibilidade} />
          ))}
        </div>
      )}
    </div>
  );
}

// Card individual de serviço
function ServicoCard({ servico, modoAcessibilidade }: any) {
  const IconeComponente = LucideIcons[servico.icone as keyof typeof LucideIcons] as any;
  
  const handleSolicitarServico = useCallback(() => {
    toast.success(`Redirecionando para ${servico.titulo}...`);
    // Simular redirecionamento
  }, [servico.titulo]);
  
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <IconeComponente className="h-8 w-8 text-blue-600" />
          {servico.digital && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <LucideIcons.Smartphone className="mr-1 h-3 w-3" />
              Digital
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-semibold">{servico.titulo}</CardTitle>
        <CardDescription className="text-gray-600">
          {servico.descricao}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Órgão:</p>
            <p className="text-gray-600">{servico.orgao}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Prazo:</p>
            <p className="text-gray-600">{servico.prazo}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 text-sm">Custo:</p>
            <p className={`font-semibold ${servico.custo === 'Gratuito' ? 'text-green-600' : 'text-blue-600'}`}>
              {servico.custo}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Acessos hoje:</p>
            <p className="text-sm font-medium text-gray-700">
              {servico.acessos.toLocaleString()}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSolicitarServico}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size={modoAcessibilidade.tamanhoFonte !== 'normal' ? 'lg' : 'default'}
        >
          <LucideIcons.ArrowRight className="mr-2 h-4 w-4" />
          Acessar Serviço
        </Button>
      </CardContent>
    </Card>
  );
}

// Componente de autenticação necessária
function RequereAutenticacao() {
  return (
    <div className="text-center py-16">
      <LucideIcons.Lock className="h-20 w-20 text-gray-300 mx-auto mb-6" />
      <h3 className="text-2xl font-semibold mb-4">Acesso Restrito</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Para acessar esta funcionalidade, você precisa estar autenticado com sua conta Gov.br.
        Isso garante a segurança dos seus dados pessoais.
      </p>
      <div className="space-y-4">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <LucideIcons.LogIn className="mr-2 h-5 w-5" />
          Entrar com Gov.br
        </Button>
        <p className="text-sm text-gray-500">
          Sua conta Gov.br permite acesso seguro a todos os serviços digitais do governo
        </p>
      </div>
    </div>
  );
}

// Componente de Meus Documentos
function MeusDocumentos({ dados }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Meus Documentos Digitais</h2>
        <p className="text-gray-600 mb-6">
          Acesse e baixe seus documentos digitais emitidos pelos órgãos governamentais.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['RG Digital', 'CPF', 'Título de Eleitor'].map((doc, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <LucideIcons.FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{doc}</h3>
                <p className="text-sm text-gray-600 mb-4">Válido e atualizado</p>
                <Button variant="outline" className="w-full">
                  <LucideIcons.Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente de Acompanhamento de Processos
function AcompanharProcessos({ dados }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acompanhar Processos</h2>
        <p className="text-gray-600 mb-6">
          Veja o status atual de todas as suas solicitações de serviços públicos.
        </p>
      </div>
      
      <div className="space-y-4">
        {processosExemplo.map((processo) => {
          const statusInfo = formatarStatusProcesso(processo.status);
          const IconeStatus = LucideIcons[statusInfo.icone as keyof typeof LucideIcons] as any;
          
          return (
            <Card key={processo.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{processo.servico}</h3>
                    <p className="text-gray-600">Protocolo: {processo.protocolo}</p>
                  </div>
                  <Badge variant={statusInfo.badge} className="flex items-center gap-1">
                    <IconeStatus className="h-3 w-3" />
                    {statusInfo.texto}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Data Solicitação:</p>
                    <p className="text-gray-600">{new Date(processo.data_solicitacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Etapa Atual:</p>
                    <p className="text-gray-600">{processo.etapa_atual}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Prazo Estimado:</p>
                    <p className="text-gray-600">{new Date(processo.prazo_estimado).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Órgão: {processo.orgao_responsavel}
                  </p>
                  <Button variant="outline" size="sm">
                    <LucideIcons.ExternalLink className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Componente de Transparência
function TransparenciaGov({ dados }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Transparência Pública</h2>
        <p className="text-gray-600 mb-6">
          Acompanhe como os recursos públicos estão sendo utilizados em nossa cidade.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dados?.map((item: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">{item.categoria}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {item.percentual}%
                </p>
                <p className="text-sm text-gray-600">
                  R$ {(item.valor / 1000000).toFixed(1)}M
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button className="bg-green-600 hover:bg-green-700">
            <LucideIcons.BarChart3 className="mr-2 h-4 w-4" />
            Ver Relatório Completo
          </Button>
        </div>
      </div>
    </div>
  );
}

// Componente de Central de Ajuda
function CentralAjuda({ modoAcessibilidade }: any) {
  const [categoriaAjuda, setCategoriaAjuda] = useState('geral');
  
  const categoriasAjuda = [
    { id: 'geral', label: 'Perguntas Gerais', icone: 'HelpCircle' },
    { id: 'documentos', label: 'Documentos', icone: 'FileText' },
    { id: 'acessibilidade', label: 'Acessibilidade', icone: 'Eye' },
    { id: 'tecnico', label: 'Suporte Técnico', icone: 'Settings' }
  ];
  
  const perguntasFrequentes = {
    geral: [
      {
        pergunta: 'Como posso me autenticar no portal?',
        resposta: 'Use sua conta Gov.br para acessar todos os serviços de forma segura.'
      },
      {
        pergunta: 'Os serviços são gratuitos?',
        resposta: 'A maioria dos serviços são gratuitos. Quando há custo, ele é informado claramente.'
      }
    ],
    documentos: [
      {
        pergunta: 'Como baixar meus documentos digitais?',
        resposta: 'Após autenticação, acesse "Meus Documentos" e clique em "Baixar PDF".'
      }
    ],
    acessibilidade: [
      {
        pergunta: 'Como ativar o modo de alto contraste?',
        resposta: 'Clique no ícone do olho no canto superior direito da página.'
      },
      {
        pergunta: 'Posso aumentar o tamanho da fonte?',
        resposta: 'Sim, use o controle "A" no cabeçalho para ajustar o tamanho.'
      }
    ],
    tecnico: [
      {
        pergunta: 'O site não está funcionando corretamente',
        resposta: 'Tente limpar o cache do navegador ou use um navegador diferente.'
      }
    ]
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Central de Ajuda</h2>
        <p className="text-gray-600 mb-6">
          Encontre respostas para suas dúvidas ou entre em contato com nossa equipe de suporte.
        </p>
        
        {/* Categorias de ajuda */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {categoriasAjuda.map(categoria => {
            const IconeComponente = LucideIcons[categoria.icone as keyof typeof LucideIcons] as any;
            
            return (
              <Button
                key={categoria.id}
                variant={categoriaAjuda === categoria.id ? "default" : "outline"}
                onClick={() => setCategoriaAjuda(categoria.id)}
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                <IconeComponente className="h-6 w-6" />
                <span className="text-sm">{categoria.label}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Perguntas frequentes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Perguntas Frequentes</h3>
          {perguntasFrequentes[categoriaAjuda as keyof typeof perguntasFrequentes]?.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h4 className="font-medium mb-2">{faq.pergunta}</h4>
                <p className="text-gray-600">{faq.resposta}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Contato */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Precisa de mais ajuda?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline">
              <LucideIcons.Phone className="mr-2 h-4 w-4" />
              Ligar: 155
            </Button>
            <Button variant="outline">
              <LucideIcons.Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button variant="outline">
              <LucideIcons.MessageCircle className="mr-2 h-4 w-4" />
              Chat Online
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}