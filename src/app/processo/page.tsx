'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as LucideIcons from 'lucide-react'

export default function ProcessoPage() {
  const [etapaAtiva, setEtapaAtiva] = useState(1);

  const etapas = [
    {
      numero: 1,
      titulo: 'Análise Multicamada',
      descricao: 'Decomposição sistemática do requisito em 6 camadas',
      tempo: '2 min',
      icone: 'Search',
      detalhes: [
        'Contexto de Produto: tipo, modelo negócio, usuários',
        'Parsing Inteligente: extração semântica de requisitos',
        'Arquitetura Interface: estados UI e componentes',
        'Jornadas Usuário: fluxos completos mapeados',
        'Regras Negócio: validações e comportamentos',
        'Validação Técnica: viabilidade e padrões'
      ]
    },
    {
      numero: 2,
      titulo: 'Decisão Arquitetural',
      descricao: 'Métricas objetivas determinam arquitetura ideal',
      tempo: '1 min',
      icone: 'Building2',
      detalhes: [
        'Cálculo automático de complexidade',
        'Entidades principais identificadas',
        'Estados UI quantificados',
        'Perfis de usuário mapeados',
        'Integrações necessárias avaliadas',
        'Recomendação: componente único ou modular'
      ]
    },
    {
      numero: 3,
      titulo: 'Especificação Completa',
      descricao: 'Documentação técnica para implementação',
      tempo: '1 min',
      icone: 'FileText',
      detalhes: [
        'Arquitetura de informação estruturada',
        'Todos os estados UI especificados',
        'Componentes necessários listados',
        'Fluxos de usuário documentados',
        'Pontos de validação identificados',
        'Score de qualidade calculado'
      ]
    },
    {
      numero: 4,
      titulo: 'Implementação Técnica',
      descricao: 'Código React funcional com padrões defensivos',
      tempo: '10 min',
      icone: 'Code',
      detalhes: [
        'Estrutura modular ou componente único',
        'Todos os estados UI implementados',
        'Padrões defensivos aplicados',
        'Acessibilidade WCAG AA integrada',
        'Validações e tratamento de erros',
        'Design system consistente'
      ]
    },
    {
      numero: 5,
      titulo: 'Validação de Qualidade',
      descricao: 'Verificação automatizada de completude',
      tempo: '1 min',
      icone: 'CheckCircle',
      detalhes: [
        'Checklist de 24 itens verificado',
        'Score de qualidade ≥ 90 obrigatório',
        'Heurísticas de Nielsen aplicadas',
        'Padrões técnicos confirmados',
        'Funcionalidade executável testada',
        'Relatório de qualidade gerado'
      ]
    }
  ];

  const exemploComplexidade = {
    entidades: 4,
    telas: 8,
    fluxos: 5,
    estadosUI: 28,
    perfis: 3,
    integracoes: 3,
    total: 52,
    recomendacao: 'sistema-modular'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PD</span>
              </div>
              <span className="font-bold text-xl">Product Design AI-Enhanced</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/metodologia" className="text-gray-600 hover:text-gray-900 transition-colors">
                Metodologia
              </Link>
              <Link href="/processo" className="text-blue-600 font-medium">
                Processo
              </Link>
              <Link href="/showcase" className="text-gray-600 hover:text-gray-900 transition-colors">
                Showcase
              </Link>
              <Link href="/sobre" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sobre
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Como Funciona <span className="text-blue-600">na Prática</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Processo completo da metodologia Product Design AI-Enhanced: 
              do requisito ambíguo ao sistema funcionando em 5 etapas sistemáticas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10-15</div>
                <div className="text-gray-600">minutos total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">5</div>
                <div className="text-gray-600">etapas sistemáticas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">90+</div>
                <div className="text-gray-600">score qualidade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Interativa */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Fluxo Completo do Processo</h2>
            
            {/* Timeline Navigation */}
            <div className="flex justify-center mb-12">
              <div className="flex items-center space-x-4 bg-gray-100 p-2 rounded-lg">
                {etapas.map((etapa) => {
                  const IconeComponente = LucideIcons[etapa.icone as keyof typeof LucideIcons] as any;
                  
                  return (
                    <button
                      key={etapa.numero}
                      onClick={() => setEtapaAtiva(etapa.numero)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                        etapaAtiva === etapa.numero
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <IconeComponente className="h-4 w-4" />
                      <span className="hidden md:inline">{etapa.numero}. {etapa.titulo}</span>
                      <span className="md:hidden">{etapa.numero}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Etapa Ativa */}
            {etapas.map((etapa) => {
              const IconeComponente = LucideIcons[etapa.icone as keyof typeof LucideIcons] as any;
              
              if (etapaAtiva !== etapa.numero) return null;
              
              return (
                <Card key={etapa.numero} className="mb-8">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconeComponente className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-center gap-4 mb-2">
                      <Badge variant="default">Etapa {etapa.numero}</Badge>
                      <Badge variant="outline">{etapa.tempo}</Badge>
                    </div>
                    <CardTitle className="text-2xl">{etapa.titulo}</CardTitle>
                    <CardDescription className="text-lg">{etapa.descricao}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-lg mb-4">Atividades Principais:</h4>
                        <ul className="space-y-3">
                          {etapa.detalhes.map((detalhe, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <LucideIcons.CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{detalhe}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        {etapa.numero === 1 && (
                          <div>
                            <h4 className="font-semibold mb-3">Exemplo de Input:</h4>
                            <div className="bg-white p-4 rounded border-l-4 border-blue-500 mb-4">
                              <p className="text-gray-700 italic">
                                "Administradores devem poder gerenciar usuários com CRUD básico"
                              </p>
                            </div>
                            <h4 className="font-semibold mb-3">Análise Automática Identifica:</h4>
                            <ul className="text-sm space-y-1 text-gray-600">
                              <li>• 4 entidades (usuários, perfis, permissões, auditoria)</li>
                              <li>• 8 telas necessárias</li>
                              <li>• 28 estados UI diferentes</li>
                              <li>• 5 fluxos de usuário</li>
                              <li>• 3 perfis de acesso</li>
                            </ul>
                          </div>
                        )}
                        
                        {etapa.numero === 2 && (
                          <div>
                            <h4 className="font-semibold mb-3">Calculadora de Complexidade:</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span>Entidades:</span>
                                <span className="font-mono">{exemploComplexidade.entidades} × 8 = {exemploComplexidade.entidades * 8}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Telas:</span>
                                <span className="font-mono">{exemploComplexidade.telas} × 3 = {exemploComplexidade.telas * 3}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Estados UI:</span>
                                <span className="font-mono">{exemploComplexidade.estadosUI} × 1 = {exemploComplexidade.estadosUI}</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between font-bold">
                                <span>Total:</span>
                                <span className="text-blue-600">{exemploComplexidade.total} pontos</span>
                              </div>
                              <div className="bg-blue-100 p-3 rounded text-center">
                                <span className="font-semibold text-blue-800">
                                  Recomendação: Sistema Modular
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {etapa.numero === 3 && (
                          <div>
                            <h4 className="font-semibold mb-3">Output Gerado:</h4>
                            <div className="bg-white p-4 rounded border">
                              <div className="text-sm space-y-2">
                                <div><strong>Arquitetura:</strong> 4 módulos + orquestrador</div>
                                <div><strong>Estados UI:</strong> 28 mapeados</div>
                                <div><strong>Componentes:</strong> 12 identificados</div>
                                <div><strong>Validações:</strong> 15 regras</div>
                                <div><strong>Score Previsto:</strong> 94/100</div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Button size="sm" variant="outline" asChild>
                                <Link href="/showcase/gestao-usuarios">
                                  <LucideIcons.ExternalLink className="mr-2 h-4 w-4" />
                                  Ver Especificação Completa
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {etapa.numero === 4 && (
                          <div>
                            <h4 className="font-semibold mb-3">Estrutura Gerada:</h4>
                            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs">
                              <div>page.tsx (orquestrador)</div>
                              <div>├── usuarios-gestao.tsx</div>
                              <div>├── usuarios-perfis.tsx</div>
                              <div>├── usuarios-auditoria.tsx</div>
                              <div>└── usuarios-config.tsx</div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                              <div>✓ 100% funcional</div>
                              <div>✓ Todos os estados implementados</div>
                              <div>✓ Padrões defensivos aplicados</div>
                              <div>✓ WCAG AA compliance</div>
                            </div>
                          </div>
                        )}
                        
                        {etapa.numero === 5 && (
                          <div>
                            <h4 className="font-semibold mb-3">Validação Automática:</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Análise Completa: 100%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Estados UI: 28/28</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                                <span>UX Heurísticas: 9/10</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Padrões Técnicos: 15/15</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <LucideIcons.CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Funcionalidade: 100%</span>
                              </div>
                            </div>
                            <div className="mt-4 bg-green-100 p-3 rounded text-center">
                              <span className="font-bold text-green-800">Score Final: 94/100 ✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Navegação entre etapas */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setEtapaAtiva(Math.max(1, etapaAtiva - 1))}
                disabled={etapaAtiva === 1}
              >
                <LucideIcons.ChevronLeft className="mr-2 h-4 w-4" />
                Etapa Anterior
              </Button>
              
              <Button
                onClick={() => setEtapaAtiva(Math.min(5, etapaAtiva + 1))}
                disabled={etapaAtiva === 5}
              >
                Próxima Etapa
                <LucideIcons.ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Exemplo Prático */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Veja o Resultado Final</h2>
            
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Do Requisito ao Sistema Funcionando</h3>
                  <p className="text-xl opacity-90 mb-6">
                    "Administradores devem poder gerenciar usuários com CRUD básico"
                  </p>
                  <LucideIcons.ArrowDown className="h-8 w-8 mx-auto animate-bounce" />
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h4 className="text-xl font-bold mb-4">Sistema Completo Gerado:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <LucideIcons.Users className="h-5 w-5 text-blue-600" />
                        <span>Gestão completa de usuários</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <LucideIcons.Shield className="h-5 w-5 text-purple-600" />
                        <span>Sistema de perfis e permissões</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <LucideIcons.FileText className="h-5 w-5 text-green-600" />
                        <span>Auditoria de todas as ações</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <LucideIcons.Settings className="h-5 w-5 text-orange-600" />
                        <span>Configurações avançadas</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <LucideIcons.Smartphone className="h-5 w-5 text-pink-600" />
                        <span>Totalmente responsivo</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <LucideIcons.Accessibility className="h-5 w-5 text-indigo-600" />
                        <span>WCAG AA compliant</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-gray-100 rounded-lg p-6 mb-6">
                      <LucideIcons.Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>✓ 4 módulos funcionais</div>
                        <div>✓ 28 estados UI implementados</div>
                        <div>✓ Validações completas</div>
                        <div>✓ Tratamento de erros</div>
                        <div>✓ Loading states</div>
                        <div>✓ Bulk actions</div>
                      </div>
                    </div>
                    
                    <Button asChild size="lg">
                      <Link href="/showcase/gestao-usuarios">
                        <LucideIcons.Play className="mr-2 h-5 w-5" />
                        Acessar Sistema Funcionando
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios do Processo */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Por Que Este Processo Funciona</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LucideIcons.Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Sistemático</h3>
                  <p className="text-gray-600">
                    Cada etapa tem critérios objetivos. Não depende de intuição ou experiência pessoal.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LucideIcons.Repeat className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Reproduzível</h3>
                  <p className="text-gray-600">
                    Mesmos inputs geram outputs consistentes. Qualidade não depende do designer.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LucideIcons.Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Eficiente</h3>
                  <p className="text-gray-600">
                    Elimina retrabalho por requisitos mal interpretados. Handoff preciso e completo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para Ver a Metodologia Aplicada?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Explore sistemas funcionais criados com este processo exato
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/showcase/gestao-usuarios">
                <LucideIcons.Monitor className="mr-2 h-5 w-5" />
                Sistema Completo
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="border-white text-purple-600 hover:bg-white hover:text-purple-600" asChild>
              <Link href="/showcase">
                <LucideIcons.Grid3X3 className="mr-2 h-5 w-5" />
                Todos os Cases
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PD</span>
                </div>
                <span className="font-bold">Product Design AI-Enhanced</span>
              </Link>
              <p className="text-gray-400">
                Metodologia sistemática para design de produtos digitais com IA.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Processo</h3>
              <ul className="space-y-2 text-gray-400">
                {etapas.map((etapa) => (
                  <li key={etapa.numero}>
                    <button 
                      onClick={() => setEtapaAtiva(etapa.numero)}
                      className="hover:text-white transition-colors text-left"
                    >
                      {etapa.numero}. {etapa.titulo}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Navegação</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/metodologia" className="hover:text-white transition-colors">Metodologia</Link></li>
                <li><Link href="/processo" className="hover:text-white transition-colors">Processo</Link></li>
                <li><Link href="/showcase" className="hover:text-white transition-colors">Showcase</Link></li>
                <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Marcos Bricches. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}