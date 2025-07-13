// src/lib/utils-defensivas.ts

/**
 * Product Design AI-Enhanced - Funções Utilitárias Defensivas
 * 
 * TODAS as funções devem ser implementadas COMPLETAMENTE para design systems
 * com tratamento defensivo de edge cases e validações robustas.
 */

// Geração de iniciais com suporte a nomes complexos - DESIGN SYSTEM READY
export const gerarIniciaisNome = (nome: string | undefined): string => {
  if (!nome || typeof nome !== 'string') return '??';
  
  try {
    // Remove acentos e caracteres especiais para melhor display
    const nomeLimpo = nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    
    if (nomeLimpo.length === 0) return '??';
    
    const partesNome = nomeLimpo
      .split(' ')
      .filter(parte => parte.length > 0)
      .filter(parte => !['da', 'de', 'do', 'das', 'dos', 'e'].includes(parte.toLowerCase()));
    
    if (partesNome.length === 0) return '??';
    
    if (partesNome.length === 1) {
      // Se só tem um nome, pega as duas primeiras letras
      return partesNome[0].substring(0, 2).toUpperCase();
    }
    
    // Pegar primeira letra do primeiro e último nome (melhor para design)
    const primeiraLetra = partesNome[0][0] || '?';
    const ultimaLetra = partesNome[partesNome.length - 1][0] || '?';
    
    return (primeiraLetra + ultimaLetra).toUpperCase();
  } catch (error) {
    console.error('Erro ao gerar iniciais:', error);
    return '??';
  }
};

// Formatação de data com contexto de design - MÚLTIPLOS FORMATOS
export const formatarDataContextual = (
  dataString: string | undefined, 
  formato: 'curta' | 'media' | 'longa' | 'relativa' = 'media'
): string => {
  if (!dataString || typeof dataString !== 'string') return 'N/A';
  
  try {
    const data = new Date(dataString);
    
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    const agora = new Date();
    const diferenca = agora.getTime() - data.getTime();
    const segundos = Math.floor(diferenca / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const semanas = Math.floor(dias / 7);
    const meses = Math.floor(dias / 30);
    const anos = Math.floor(dias / 365);
    
    switch (formato) {
      case 'relativa':
        if (Math.abs(segundos) < 60) return 'Agora há pouco';
        if (Math.abs(minutos) < 60) return `${Math.abs(minutos)} min atrás`;
        if (Math.abs(horas) < 24) return `${Math.abs(horas)} h atrás`;
        
        if (dias === 0) return 'Hoje';
        if (dias === 1) return 'Ontem';
        if (dias === -1) return 'Amanhã';
        if (Math.abs(dias) < 7) {
          return dias > 0 ? `${dias} dias atrás` : `em ${Math.abs(dias)} dias`;
        }
        if (Math.abs(semanas) < 4) {
          return semanas > 0 ? `${semanas} semana(s) atrás` : `em ${Math.abs(semanas)} semana(s)`;
        }
        if (Math.abs(meses) < 12) {
          return meses > 0 ? `${meses} mês(es) atrás` : `em ${Math.abs(meses)} mês(es)`;
        }
        return anos > 0 ? `${anos} ano(s) atrás` : `em ${Math.abs(anos)} ano(s)`;
      
      case 'curta':
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      
      case 'longa':
        return data.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
      default: // 'media'
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro de formato';
  }
};

// Status visual para design systems - CORES E ÍCONES
export const formatarStatusVisual = (
  status: string | undefined
): { 
  texto: string; 
  cor: string; 
  icone: string; 
  badge: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
} => {
  if (!status || typeof status !== 'string') {
    return { 
      texto: 'Indefinido', 
      cor: 'text-gray-500', 
      icone: 'HelpCircle', 
      badge: 'outline' 
    };
  }
  
  const statusLower = status.toLowerCase().trim();
  
  switch (statusLower) {
    // Status positivos/ativos
    case 'ativo':
    case 'aprovado':
    case 'concluido':
    case 'concluída':
    case 'success':
    case 'completo':
    case 'finalizado':
      return { 
        texto: 'Ativo', 
        cor: 'text-green-600', 
        icone: 'CheckCircle', 
        badge: 'default' 
      };
    
    // Status negativos/inativos
    case 'inativo':
    case 'cancelado':
    case 'rejeitado':
    case 'error':
    case 'falhou':
    case 'erro':
      return { 
        texto: 'Inativo', 
        cor: 'text-red-600', 
        icone: 'XCircle', 
        badge: 'destructive' 
      };
    
    // Status de atenção/pendentes
    case 'pendente':
    case 'aguardando':
    case 'em_analise':
    case 'em análise':
    case 'warning':
    case 'atrasado':
    case 'em_risco':
    case 'em risco':
      return { 
        texto: 'Pendente', 
        cor: 'text-yellow-600', 
        icone: 'Clock', 
        badge: 'warning' 
      };
    
    // Status de progresso
    case 'rascunho':
    case 'em_progresso':
    case 'em progresso':
    case 'editando':
    case 'processando':
    case 'em_andamento':
    case 'em andamento':
      return { 
        texto: 'Em Progresso', 
        cor: 'text-blue-600', 
        icone: 'Play', 
        badge: 'secondary' 
      };
    
    // Status de revisão
    case 'revisao':
    case 'revisão':
    case 'em_revisao':
    case 'em revisão':
    case 'validando':
      return { 
        texto: 'Em Revisão', 
        cor: 'text-purple-600', 
        icone: 'Eye', 
        badge: 'outline' 
      };
    
    // Status planejamento
    case 'planejamento':
    case 'draft':
    case 'rascunho':
    case 'novo':
      return { 
        texto: 'Planejamento', 
        cor: 'text-gray-600', 
        icone: 'FileText', 
        badge: 'outline' 
      };
    
    // Prioridades
    case 'baixa':
      return { 
        texto: 'Baixa', 
        cor: 'text-gray-600', 
        icone: 'ArrowDown', 
        badge: 'outline' 
      };
    
    case 'media':
    case 'média':
      return { 
        texto: 'Média', 
        cor: 'text-yellow-600', 
        icone: 'Minus', 
        badge: 'warning' 
      };
    
    case 'alta':
      return { 
        texto: 'Alta', 
        cor: 'text-orange-600', 
        icone: 'ArrowUp', 
        badge: 'secondary' 
      };
    
    case 'critica':
    case 'crítica':
    case 'urgente':
      return { 
        texto: 'Crítica', 
        cor: 'text-red-600', 
        icone: 'AlertTriangle', 
        badge: 'destructive' 
      };
    
    // Status específicos de tarefas
    case 'a_fazer':
    case 'a fazer':
    case 'todo':
      return { 
        texto: 'A Fazer', 
        cor: 'text-gray-600', 
        icone: 'Circle', 
        badge: 'outline' 
      };
    
    default:
      // Capitalizar primeira letra para status personalizados
      const textoFormatado = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      return { 
        texto: textoFormatado, 
        cor: 'text-gray-600', 
        icone: 'Circle', 
        badge: 'outline' 
      };
  }
};

// Formatação de valores monetários - DESIGN SYSTEM
export const formatarMoeda = (
  valor: number | string | undefined, 
  moeda: 'BRL' | 'USD' | 'EUR' = 'BRL',
  opcoes: {
    mostrarSimbolo?: boolean;
    casasDecimais?: number;
    abreviar?: boolean;
  } = {}
): string => {
  if (valor === undefined || valor === null || valor === '') return 'R$ 0,00';
  
  const { mostrarSimbolo = true, casasDecimais = 2, abreviar = false } = opcoes;
  
  try {
    let numero = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) : valor;
    
    if (isNaN(numero)) return 'Valor inválido';
    
    // Abreviação para valores grandes
    if (abreviar && Math.abs(numero) >= 1000) {
      if (Math.abs(numero) >= 1000000000) {
        numero = numero / 1000000000;
        const formatado = new Intl.NumberFormat('pt-BR', {
          style: mostrarSimbolo ? 'currency' : 'decimal',
          currency: moeda,
          maximumFractionDigits: 1
        }).format(numero);
        return mostrarSimbolo ? formatado + 'B' : formatado + 'B';
      } else if (Math.abs(numero) >= 1000000) {
        numero = numero / 1000000;
        const formatado = new Intl.NumberFormat('pt-BR', {
          style: mostrarSimbolo ? 'currency' : 'decimal',
          currency: moeda,
          maximumFractionDigits: 1
        }).format(numero);
        return mostrarSimbolo ? formatado + 'M' : formatado + 'M';
      } else if (Math.abs(numero) >= 1000) {
        numero = numero / 1000;
        const formatado = new Intl.NumberFormat('pt-BR', {
          style: mostrarSimbolo ? 'currency' : 'decimal',
          currency: moeda,
          maximumFractionDigits: 1
        }).format(numero);
        return mostrarSimbolo ? formatado + 'K' : formatado + 'K';
      }
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: mostrarSimbolo ? 'currency' : 'decimal',
      currency: moeda,
      minimumFractionDigits: casasDecimais,
      maximumFractionDigits: casasDecimais
    }).format(numero);
  } catch (error) {
    console.error('Erro ao formatar moeda:', error);
    return 'Erro de formato';
  }
};

// Truncar texto com suporte a markdown - DESIGN CONTEXTUAL
export const truncarTextoInteligente = (
  texto: string | undefined, 
  limite: number = 50,
  contexto: 'titulo' | 'descricao' | 'lista' = 'descricao'
): string => {
  if (!texto || typeof texto !== 'string') return 'N/A';
  
  try {
    // Remove markdown básico para contagem
    const textoLimpo = texto
      .replace(/[*_~`#\[\]()]/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '[imagem]')
      .replace(/\[.*?\]\(.*?\)/g, '[link]')
      .trim();
    
    if (textoLimpo.length <= limite) return texto;
    
    // Truncagem inteligente por contexto
    switch (contexto) {
      case 'titulo':
        // Para títulos, corta em palavra completa
        const palavras = textoLimpo.split(' ');
        let resultado = '';
        for (const palavra of palavras) {
          const novoResultado = resultado + (resultado ? ' ' : '') + palavra;
          if (novoResultado.length <= limite) {
            resultado = novoResultado;
          } else {
            break;
          }
        }
        return resultado + (resultado.length < textoLimpo.length ? '...' : '');
      
      case 'lista':
        // Para listas, corte mais agressivo
        return textoLimpo.slice(0, Math.floor(limite * 0.8)) + '...';
      
      default: // 'descricao'
        // Para descrições, mantém frase completa se possível
        const pontoFinal = textoLimpo.slice(0, limite).lastIndexOf('.');
        const pontoExclamacao = textoLimpo.slice(0, limite).lastIndexOf('!');
        const pontoInterrogacao = textoLimpo.slice(0, limite).lastIndexOf('?');
        
        const ultimoPonto = Math.max(pontoFinal, pontoExclamacao, pontoInterrogacao);
        
        if (ultimoPonto > limite * 0.6) {
          return textoLimpo.slice(0, ultimoPonto + 1);
        }
        
        // Se não encontrou ponto, procura por vírgula
        const ultimaVirgula = textoLimpo.slice(0, limite).lastIndexOf(',');
        if (ultimaVirgula > limite * 0.7) {
          return textoLimpo.slice(0, ultimaVirgula) + '...';
        }
        
        // Última tentativa: corta em espaço
        const ultimoEspaco = textoLimpo.slice(0, limite).lastIndexOf(' ');
        if (ultimoEspaco > limite * 0.8) {
          return textoLimpo.slice(0, ultimoEspaco) + '...';
        }
        
        return textoLimpo.slice(0, limite) + '...';
    }
  } catch (error) {
    console.error('Erro ao truncar texto:', error);
    return texto || 'Erro';
  }
};

// Validação de upload com preview - DESIGN SYSTEM COMPLETO
export const validarUploadComPreview = (
  arquivo: File,
  tiposPermitidos: string[] = ['image/*', 'application/pdf'],
  tamanhoMaxMB: number = 10
): { 
  valido: boolean; 
  erro?: string; 
  preview?: string; 
  tipo: 'imagem' | 'documento' | 'outro';
  metadados?: {
    nome: string;
    tamanho: string;
    tipo: string;
    ultimaModificacao: string;
  };
} => {
  try {
    if (!arquivo || !(arquivo instanceof File)) {
      return {
        valido: false,
        erro: 'Arquivo inválido',
        tipo: 'outro'
      };
    }
    
    // Validar tamanho
    if (arquivo.size > tamanhoMaxMB * 1024 * 1024) {
      const tamanhoMB = (arquivo.size / (1024 * 1024)).toFixed(1);
      return {
        valido: false,
        erro: `Arquivo muito grande (${tamanhoMB}MB). Máximo permitido: ${tamanhoMaxMB}MB`,
        tipo: 'outro'
      };
    }
    
    if (arquivo.size === 0) {
      return {
        valido: false,
        erro: 'Arquivo está vazio',
        tipo: 'outro'
      };
    }
    
    // Validar tipo
    const tipoValido = tiposPermitidos.some(tipo => {
      if (tipo.endsWith('/*')) {
        const categoria = tipo.replace('/*', '/');
        return arquivo.type.startsWith(categoria);
      }
      return arquivo.type === tipo;
    });
    
    if (!tipoValido) {
      return {
        valido: false,
        erro: `Tipo de arquivo não permitido. Aceitos: ${tiposPermitidos.join(', ')}`,
        tipo: 'outro'
      };
    }
    
    // Determinar tipo para UI
    let tipoUI: 'imagem' | 'documento' | 'outro' = 'outro';
    if (arquivo.type.startsWith('image/')) {
      tipoUI = 'imagem';
    } else if (
      arquivo.type === 'application/pdf' || 
      arquivo.type.includes('document') ||
      arquivo.type.includes('text') ||
      arquivo.type.includes('spreadsheet') ||
      arquivo.type.includes('presentation')
    ) {
      tipoUI = 'documento';
    }
    
    // Gerar metadados
    const metadados = {
      nome: arquivo.name,
      tamanho: formatarTamanhoArquivo(arquivo.size),
      tipo: arquivo.type || 'Desconhecido',
      ultimaModificacao: formatarDataContextual(new Date(arquivo.lastModified).toISOString(), 'relativa')
    };
    
    // Gerar preview para imagens
    if (tipoUI === 'imagem') {
      try {
        const preview = URL.createObjectURL(arquivo);
        return { 
          valido: true, 
          preview, 
          tipo: tipoUI,
          metadados
        };
      } catch (error) {
        console.error('Erro ao gerar preview:', error);
        return { 
          valido: true, 
          tipo: tipoUI,
          metadados
        };
      }
    }
    
    return { 
      valido: true, 
      tipo: tipoUI,
      metadados
    };
    
  } catch (error) {
    console.error('Erro na validação de upload:', error);
    return {
      valido: false,
      erro: 'Erro ao processar arquivo',
      tipo: 'outro'
    };
  }
};

// Formatar tamanho de arquivo
export const formatarTamanhoArquivo = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const decimais = 2;
  const tamanhos = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimais)) + ' ' + tamanhos[i];
};

// Validar CPF (para casos específicos do Brasil)
export const validarCPF = (cpf: string | undefined): { valido: boolean; erro?: string } => {
  if (!cpf || typeof cpf !== 'string') {
    return { valido: false, erro: 'CPF é obrigatório' };
  }
  
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) {
    return { valido: false, erro: 'CPF deve ter 11 dígitos' };
  }
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return { valido: false, erro: 'CPF inválido' };
  }
  
  // Validação dos dígitos verificadores
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
    return { valido: false, erro: 'CPF inválido' };
  }
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
    return { valido: false, erro: 'CPF inválido' };
  }
  
  return { valido: true };
};

// Formatar CPF para exibição
export const formatarCPF = (cpf: string | undefined): string => {
  if (!cpf) return '';
  
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) return cpf;
  
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Validar telefone brasileiro
export const validarTelefoneBR = (telefone: string | undefined): { valido: boolean; erro?: string } => {
  if (!telefone || typeof telefone !== 'string') {
    return { valido: false, erro: 'Telefone é obrigatório' };
  }
  
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
    return { valido: false, erro: 'Telefone deve ter 10 ou 11 dígitos' };
  }
  
  // Para celular (11 dígitos), deve começar com 9
  if (telefoneLimpo.length === 11 && !['8', '9'].includes(telefoneLimpo[2])) {
    return { valido: false, erro: 'Celular deve começar com 8 ou 9' };
  }
  
  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1+$/.test(telefoneLimpo)) {
    return { valido: false, erro: 'Telefone inválido' };
  }
  
  return { valido: true };
};

// Formatar telefone para exibição
export const formatarTelefoneBR = (telefone: string | undefined): string => {
  if (!telefone) return '';
  
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
};

// Gerar cor aleatória consistente baseada em string
export const gerarCorConsistente = (texto: string | undefined): string => {
  if (!texto) return 'bg-gray-500';
  
  const cores = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-lime-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    const char = texto.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return cores[Math.abs(hash) % cores.length];
};

// Verificar se URL é válida
export const validarURL = (url: string | undefined): { valido: boolean; erro?: string } => {
  if (!url || typeof url !== 'string') {
    return { valido: false, erro: 'URL é obrigatória' };
  }
  
  try {
    new URL(url);
    return { valido: true };
  } catch {
    return { valido: false, erro: 'URL inválida' };
  }
};

// Escapar HTML para prevenir XSS
export const escaparHTML = (texto: string | undefined): string => {
  if (!texto || typeof texto !== 'string') return '';
  
  const mapa: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return texto.replace(/[&<>"']/g, (char) => mapa[char] || char);
};

// Debounce para otimização de performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle para limitação de chamadas
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Gerar ID único simples
export const gerarIdUnico = (prefixo: string = 'id'): string => {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Verificar se dispositivo é mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

// Verificar se dispositivo é tablet
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

// Verificar se dispositivo é desktop
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 1024;
};

// Copiar texto para clipboard
export const copiarParaClipboard = async (texto: string): Promise<{ sucesso: boolean; erro?: string }> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return { sucesso: true };
    } else {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const sucesso = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return sucesso ? { sucesso: true } : { sucesso: false, erro: 'Falha ao copiar' };
    }
  } catch (error) {
    return { sucesso: false, erro: 'Erro ao copiar para clipboard' };
  }
};

// Função para deep merge de objetos
export const deepMerge = <T>(target: T, source: Partial<T>): T => {
  const resultado = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      resultado[key] = deepMerge(resultado[key], source[key]!);
    } else {
      resultado[key] = source[key]!;
    }
  }
  
  return resultado;
};

// Função para comparar objetos profundamente
export const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};