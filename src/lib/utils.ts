import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funções utilitárias defensivas para o projeto
export const gerarIniciaisNome = (nome: string | undefined): string => {
  if (!nome) return '??';
  try {
    const nomeLimpo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const partesNome = nomeLimpo.trim().split(' ').filter(parte => parte.length > 0);
    if (partesNome.length === 0) return '??';
    if (partesNome.length === 1) return partesNome[0].substring(0, 2).toUpperCase();
    
    const primeiraLetra = partesNome[0][0] || '?';
    const ultimaLetra = partesNome[partesNome.length - 1][0] || '?';
    return (primeiraLetra + ultimaLetra).toUpperCase();
  } catch (error) {
    console.error('Erro ao gerar iniciais:', error);
    return '??';
  }
};

export const formatarStatusVisual = (status: string | undefined) => {
  if (!status) return { texto: 'Indefinido', cor: 'text-gray-500', icone: 'HelpCircle', badge: 'secondary' };
  
  switch (status.toLowerCase()) {
    case 'ativo':
      return { texto: 'Ativo', cor: 'text-green-600', icone: 'CheckCircle', badge: 'default' };
    case 'inativo':
      return { texto: 'Inativo', cor: 'text-red-600', icone: 'XCircle', badge: 'destructive' };
    case 'pendente':
      return { texto: 'Pendente', cor: 'text-yellow-600', icone: 'Clock', badge: 'secondary' };
    default:
      return { texto: status, cor: 'text-gray-600', icone: 'Circle', badge: 'secondary' };
  }
};

export const formatarDataContextual = (
  dataString: string | undefined, 
  formato: 'curta' | 'media' | 'longa' | 'relativa' = 'media'
): string => {
  if (!dataString) return 'N/A';
  
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'Data inválida';
    
    const agora = new Date();
    const diferenca = agora.getTime() - data.getTime();
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    switch (formato) {
      case 'relativa':
        if (dias === 0) return 'Hoje';
        if (dias === 1) return 'Ontem';
        if (dias < 7) return `${dias} dias atrás`;
        if (dias < 30) return `${Math.floor(dias / 7)} semana(s) atrás`;
        if (dias < 365) return `${Math.floor(dias / 30)} mês(es) atrás`;
        return `${Math.floor(dias / 365)} ano(s) atrás`;
      
      case 'curta':
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      
      case 'longa':
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
      default:
        return data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro de formato';
  }
};