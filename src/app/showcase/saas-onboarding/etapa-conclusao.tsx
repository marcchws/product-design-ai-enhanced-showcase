// src/app/showcase/onboarding-saas/etapa-conclusao.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

interface EtapaConclusaoProps {
  dados: any;
  onAtualizarDados: (dados: any) => void;
  onProxima: () => void;
  onAnterior: () => void;
  onConcluir: () => void;
  salvando: boolean;
  etapaAtual: number;
  totalEtapas: number;
}

export default function EtapaConclusao({
  dados,
  onAtualizarDados,
  onProxima,
  onAnterior,
  onConcluir,
  salvando,
  etapaAtual,
  totalEtapas
}: EtapaConclusaoProps) {
  const [celebrando, setCelebrando] = useState(false);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    
    const timer = setTimeout(() => {
      if (montadoRef.current) {
        setCelebrando(true);
      }
    }, 500);

    return () => {
      montadoRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  const handleConcluirSetup = useCallback(() => {
    return toast.promise(
          Promise.resolve(onConcluir()),
          {
              loading: 'Finalizando configuração...',
              success: 'Setup concluído com sucesso!',
              error: 'Erro ao finalizar setup'
          }
      )
  }, [onConcluir]);

  const proximosPassos = [
    {
      icone: 'LayoutDashboard',
      titulo: 'Explore seu Dashboard',
      descricao: 'Veja métricas personalizadas baseadas nos seus objetivos',
      tempo: '2 min'
    },
    {
      icone: 'Plus',
      titulo: 'Crie seu Primeiro Projeto',
      descricao: 'Comece organizando seu trabalho em projetos',
      tempo: '5 min'
    },
    {
      icone: 'Users',
      titulo: 'Convide sua Equipe',
      descricao: 'Adicione colaboradores e defina permissões',
      tempo: '3 min'
    },
    {
      icone: 'Smartphone',
      titulo: 'Baixe o App Mobile',
      descricao: 'Tenha acesso à plataforma em qualquer lugar',
      tempo: '1 min'
    }
  ];

  const recursos = [
    {
      icone: 'Book',
      titulo: 'Base de Conhecimento',
      descricao: 'Artigos e guias detalhados',
      link: 'Acessar'
    },
    {
      icone: 'MessageCircle',
      titulo: 'Chat de Suporte',
      descricao: 'Ajuda em tempo real',
      link: 'Abrir Chat'
    },
    {
      icone: 'Video',
      titulo: 'Vídeo Tutoriais',
      descricao: 'Aprenda assistindo',
      link: 'Ver Vídeos'
    },
    {
      icone: 'Users',
      titulo: 'Comunidade',
      descricao: 'Conecte-se com outros usuários',
      link: 'Participar'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header de Celebração */}
      <Card className="border-0 bg-gradient-to-r from-green-500 to-blue-600 text-white relative overflow-hidden">
        <CardContent className="p-12 relative z-10 text-center">
          <div className={`transition-all duration-1000 ${celebrando ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <LucideIcons.PartyPopper className="h-16 w-16 text-white mx-auto mb-6" />
            
            <h1 className="text-4xl font-bold mb-4">
              🎉 Parabéns, {dados.nome?.split(' ')[0] || 'Usuário'}!
            </h1>
            
            <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
              Sua conta está 100% configurada e pronta para uso. 
              Vamos começar a transformar sua produtividade!
            </p>
            
            <div className="flex items-center justify-center gap-8 text-green-100">
              <div className="flex items-center gap-2">
                <LucideIcons.CheckCircle className="h-6 w-6" />
                <span className="font-medium">Setup Completo</span>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcons.Zap className="h-6 w-6" />
                <span className="font-medium">Pronto para Usar</span>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcons.Heart className="h-6 w-6" />
                <span className="font-medium">Bem-vindo!</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.User className="h-5 w-5" />
            Resumo das suas Configurações
          </CardTitle>
          <CardDescription>
            Aqui está um resumo de tudo que configuramos para você
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações Pessoais */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={dados.avatar ? URL.createObjectURL(dados.avatar) : undefined} />
              <AvatarFallback className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {gerarIniciaisNome(dados.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{dados.nome || 'Nome não informado'}</h3>
              <p className="text-gray-600">{dados.cargo || 'Cargo não informado'}</p>
              <p className="text-sm text-gray-500">{dados.email || 'Email não informado'}</p>
            </div>
          </div>

          {/* Empresa e Preferências */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Empresa</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{dados.nomeEmpresa || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Setor:</span>
                  <span className="font-medium">{dados.setor || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tamanho:</span>
                  <span className="font-medium">{dados.tamanhoEmpresa || 'Não informado'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Preferências</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Objetivo:</span>
                  <span className="font-medium">{dados.objetivo || 'Não definido'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experiência:</span>
                  <span className="font-medium">{dados.experiencia || 'Não definida'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tutorial:</span>
                  <Badge variant={dados.tutorialCompleto ? "default" : "secondary"}>
                    {dados.tutorialCompleto ? "Concluído" : "Pulado"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Integrações */}
          {dados.integracoes && dados.integracoes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Integrações Conectadas</h4>
              <div className="flex flex-wrap gap-2">
                {dados.integracoes.map((integracao: string) => (
                  <Badge key={integracao} variant="outline">
                    {integracao}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.ArrowRight className="h-5 w-5" />
            Próximos Passos Recomendados
          </CardTitle>
          <CardDescription>
            Sugestões para você começar a usar a plataforma da melhor forma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proximosPassos.map((passo, index) => {
              const IconeComponente = LucideIcons[passo.icone as keyof typeof LucideIcons] as any;
              
              return (
                <Card key={index} className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconeComponente className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900">{passo.titulo}</h3>
                          <Badge variant="outline" className="text-xs">
                            {passo.tempo}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{passo.descricao}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recursos de Ajuda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideIcons.HelpCircle className="h-5 w-5" />
            Recursos de Ajuda
          </CardTitle>
          <CardDescription>
            Sempre que precisar de ajuda, estes recursos estão à sua disposição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recursos.map((recurso, index) => {
              const IconeComponente = LucideIcons[recurso.icone as keyof typeof LucideIcons] as any;
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconeComponente className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{recurso.titulo}</h3>
                      <p className="text-sm text-gray-600">{recurso.descricao}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {recurso.link}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações Finais */}
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
          Etapa {etapaAtual + 1} de {totalEtapas} • Setup Completo
        </div>
        
        <Button 
          onClick={handleConcluirSetup}
          disabled={salvando}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          {salvando ? (
            <>
              <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              <LucideIcons.Rocket className="mr-2 h-4 w-4" />
              Começar a Usar!
            </>
          )}
        </Button>
      </div>
    </div>
  );
}