// src/app/showcase/onboarding-saas/etapa-informacoes-pessoais.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Função utilitária defensiva
const gerarIniciaisNome = (nome: string | undefined): string => {
  if (!nome) return '??';
  
  try {
    const nomeLimpo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const partesNome = nomeLimpo.trim().split(' ').filter(parte => parte.length > 0);
    
    if (partesNome.length === 0) return '??';
    if (partesNome.length === 1) {
      return partesNome[0].substring(0, 2).toUpperCase();
    }
    
    const primeiraLetra = partesNome[0][0] || '?';
    const ultimaLetra = partesNome[partesNome.length - 1][0] || '?';
    
    return (primeiraLetra + ultimaLetra).toUpperCase();
  } catch (error) {
    console.error('Erro ao gerar iniciais:', error);
    return '??';
  }
};

const validarUploadComPreview = (arquivo: File): { valido: boolean; erro?: string; preview?: string } => {
  try {
    // Validar tamanho (máx 2MB)
    if (arquivo.size > 2 * 1024 * 1024) {
      return {
        valido: false,
        erro: 'Arquivo muito grande. Máximo: 2MB'
      };
    }
    
    // Validar tipo
    if (!arquivo.type.startsWith('image/')) {
      return {
        valido: false,
        erro: 'Apenas imagens são permitidas'
      };
    }
    
    const preview = URL.createObjectURL(arquivo);
    return { valido: true, preview };
    
  } catch (error) {
    console.error('Erro na validação de upload:', error);
    return {
      valido: false,
      erro: 'Erro ao processar arquivo'
    };
  }
};

interface EtapaInformacoesPessoaisProps {
  dados: any;
  onAtualizarDados: (dados: any) => void;
  onProxima: () => void;
  onAnterior: () => void;
  salvando: boolean;
  etapaAtual: number;
  totalEtapas: number;
}

export default function EtapaInformacoesPessoais({
  dados,
  onAtualizarDados,
  onProxima,
  onAnterior,
  salvando,
  etapaAtual,
  totalEtapas
}: EtapaInformacoesPessoaisProps) {
  const [erros, setErros] = useState<Record<string, string>>({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    
    // Limpar preview anterior se existir
    if (dados.avatar && typeof dados.avatar === 'object') {
      const preview = URL.createObjectURL(dados.avatar);
      setPreviewAvatar(preview);
    }
    
    return () => {
      montadoRef.current = false;
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, []);

  // Validação em tempo real após primeira tentativa
  useEffect(() => {
    if (tentouEnviar) {
      const timeoutId = setTimeout(() => {
        validarFormulario();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [dados, tentouEnviar]);

  const validarFormulario = useCallback(() => {
    const novosErros: Record<string, string> = {};

    // Nome obrigatório
    if (!dados.nome || dados.nome.trim().length === 0) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (dados.nome.trim().length < 2) {
      novosErros.nome = 'Nome deve ter ao menos 2 caracteres';
    } else if (dados.nome.trim().length > 100) {
      novosErros.nome = 'Nome não pode ter mais de 100 caracteres';
    }

    // Email obrigatório e válido
    if (!dados.email || dados.email.trim().length === 0) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      novosErros.email = 'Email inválido';
    }

    // Cargo obrigatório
    if (!dados.cargo || dados.cargo.trim().length === 0) {
      novosErros.cargo = 'Cargo é obrigatório';
    }

    // Telefone opcional mas se preenchido deve ser válido
    if (dados.telefone && dados.telefone.trim().length > 0) {
      const apenasNumeros = dados.telefone.replace(/\D/g, '');
      if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
        novosErros.telefone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }, [dados]);

  const handleChange = useCallback((campo: string, valor: any) => {
    onAtualizarDados({ [campo]: valor });
    
    // Limpar erro quando campo é editado
    if (erros[campo]) {
      setErros(prev => {
        const novos = { ...prev };
        delete novos[campo];
        return novos;
      });
    }
  }, [onAtualizarDados, erros]);

  const handleUploadAvatar = useCallback((arquivos: FileList | null) => {
    if (!arquivos || arquivos.length === 0) return;

    const arquivo = arquivos[0];
    const validacao = validarUploadComPreview(arquivo);

    if (!validacao.valido) {
      toast.error(validacao.erro);
      return;
    }

    // Limpar preview anterior
    if (previewAvatar) {
      URL.revokeObjectURL(previewAvatar);
    }

    setPreviewAvatar(validacao.preview || null);
    handleChange('avatar', arquivo);
    toast.success('Avatar adicionado com sucesso!');
  }, [previewAvatar, handleChange]);

  const handleProxima = useCallback(() => {
    setTentouEnviar(true);
    
    if (validarFormulario()) {
      toast.success('Informações pessoais salvas!');
      onProxima();
    } else {
      toast.error('Corrija os erros antes de continuar');
    }
  }, [validarFormulario, onProxima]);

  const getFieldClass = useCallback((campo: string) => {
    if (erros[campo]) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    if (tentouEnviar && !erros[campo] && dados[campo]) return 'border-green-500';
    return '';
  }, [erros, tentouEnviar, dados]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Conte-nos sobre você para personalizarmos sua experiência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload de Avatar */}
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24 border-4 border-gray-200">
              <AvatarImage src={previewAvatar || undefined} />
              <AvatarFallback className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {gerarIniciaisNome(dados.nome)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>
                    <LucideIcons.Upload className="mr-2 h-4 w-4" />
                    Adicionar Foto
                  </span>
                </Button>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadAvatar(e.target.files)}
                  className="sr-only"
                />
              </Label>
              <p className="text-xs text-gray-500">JPG, PNG até 2MB</p>
            </div>
          </div>

          {/* Campos do formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={dados.nome || ''}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={getFieldClass('nome')}
                placeholder="Digite seu nome completo"
              />
              {erros.nome && (
                <p className="text-red-500 text-sm flex items-center">
                  <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                  {erros.nome}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={dados.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={getFieldClass('email')}
                placeholder="seu@email.com"
              />
              {erros.email && (
                <p className="text-red-500 text-sm flex items-center">
                  <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                  {erros.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Select
                value={dados.cargo || ''}
                onValueChange={(valor) => handleChange('cargo', valor)}
              >
                <SelectTrigger className={getFieldClass('cargo')}>
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceo">CEO / Fundador</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="diretor">Diretor</SelectItem>
                  <SelectItem value="coordenador">Coordenador</SelectItem>
                  <SelectItem value="analista">Analista</SelectItem>
                  <SelectItem value="especialista">Especialista</SelectItem>
                  <SelectItem value="consultor">Consultor</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {erros.cargo && (
                <p className="text-red-500 text-sm flex items-center">
                  <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                  {erros.cargo}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone (opcional)</Label>
              <Input
                id="telefone"
                value={dados.telefone || ''}
                onChange={(e) => handleChange('telefone', e.target.value)}
                className={getFieldClass('telefone')}
                placeholder="(11) 99999-9999"
              />
              {erros.telefone && (
                <p className="text-red-500 text-sm flex items-center">
                  <LucideIcons.AlertCircle className="h-4 w-4 mr-1" />
                  {erros.telefone}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <LucideIcons.Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Dicas importantes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use seu nome real para facilitar a identificação pela equipe</li>
                <li>• O email será usado para login e notificações importantes</li>
                <li>• Sua foto ajuda a personalizar a experiência</li>
                <li>• Todos os dados podem ser alterados posteriormente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onAnterior}
          disabled={salvando}
        >
          <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="text-sm text-gray-500">
          Etapa {etapaAtual + 1} de {totalEtapas}
        </div>
        
        <Button 
          onClick={handleProxima}
          disabled={salvando}
        >
          {salvando ? (
            <>
              <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Continuar
              <LucideIcons.ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}