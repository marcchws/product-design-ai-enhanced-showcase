// src/app/showcase/onboarding-saas/etapa-boas-vindas.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EtapaBoasVindasProps {
  dados: any;
  onAtualizarDados: (dados: any) => void;
  onProxima: () => void;
  onAnterior: () => void;
  salvando: boolean;
  etapaAtual: number;
  totalEtapas: number;
}

export default function EtapaBoasVindas({
  dados,
  onAtualizarDados,
  onProxima,
  onAnterior,
  salvando,
  etapaAtual,
  totalEtapas
}: EtapaBoasVindasProps) {
  const [animacaoVisivel, setAnimacaoVisivel] = useState(false);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    
    const timer = setTimeout(() => {
      if (montadoRef.current) {
        setAnimacaoVisivel(true);
      }
    }, 300);

    return () => {
      montadoRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  const handleComecar = useCallback(() => {
    toast.success('Iniciando configuração da sua conta!');
    onProxima();
  }, [onProxima]);

  const beneficios = [
    {
      icone: 'Zap',
      titulo: 'Setup Rápido',
      descricao: 'Configure sua conta em menos de 5 minutos'
    },
    {
      icone: 'Shield',
      titulo: 'Segurança Total',
      descricao: 'Seus dados protegidos com criptografia de ponta'
    },
    {
      icone: 'Users',
      titulo: 'Colaboração',
      descricao: 'Convide sua equipe e trabalhem juntos'
    },
    {
      icone: 'BarChart3',
      titulo: 'Analytics Avançado',
      descricao: 'Insights detalhados para tomar melhores decisões'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <CardContent className="p-12 relative z-10">
          <div className={`text-center transition-all duration-1000 ${animacaoVisivel ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LucideIcons.Rocket className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              Bem-vindo ao ProductSaaS!
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Vamos configurar sua conta para que você possa aproveitar ao máximo 
              nossa plataforma. O processo é rápido e intuitivo.
            </p>
            
            <div className="flex items-center justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <LucideIcons.Clock className="h-5 w-5" />
                <span>~5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcons.CheckCircle className="h-5 w-5" />
                <span>Setup guiado</span>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcons.Smartphone className="h-5 w-5" />
                <span>Responsivo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">
          Por que você vai amar nossa plataforma
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beneficios.map((beneficio, index) => {
            const IconeComponente = LucideIcons[beneficio.icone as keyof typeof LucideIcons] as any;
            
            return (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-all duration-500 ${
                  animacaoVisivel ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconeComponente className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{beneficio.titulo}</h3>
                      <p className="text-gray-600">{beneficio.descricao}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Processo do Setup */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>O que faremos juntos</CardTitle>
          <CardDescription>
            Um processo simples e organizado para configurar tudo perfeitamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                numero: '01',
                titulo: 'Informações Básicas',
                descricao: 'Seus dados pessoais e da empresa'
              },
              {
                numero: '02',
                titulo: 'Preferências',
                descricao: 'Customize a experiência para você'
              },
              {
                numero: '03',
                titulo: 'Integrações',
                descricao: 'Conecte com suas ferramentas favoritas'
              }
            ].map((etapa, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {etapa.numero}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{etapa.titulo}</h3>
                <p className="text-gray-600 text-sm">{etapa.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between items-center pt-6">
        <div className="text-sm text-gray-500">
          Etapa {etapaAtual + 1} de {totalEtapas}
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => toast.info('Você pode pular o onboarding a qualquer momento')}
          >
            Pular Setup
          </Button>
          
          <Button 
            onClick={handleComecar}
            disabled={salvando}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {salvando ? (
              <>
                <LucideIcons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                Vamos Começar!
                <LucideIcons.ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}