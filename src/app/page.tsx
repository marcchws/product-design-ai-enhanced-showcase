'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import * as LucideIcons from 'lucide-react'
import { caseStudies } from '@/data/case-studies'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PD</span>
              </div>
              <span className="font-bold text-xl">Product Design AI-Enhanced</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/metodologia" className="text-gray-600 hover:text-gray-900 transition-colors">
                Metodologia
              </Link>
              <Link href="/processo" className="text-gray-600 hover:text-gray-900 transition-colors">
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

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 showcase-pattern"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="showcase-gradient-text">Product Design</span>
              <br />
              <span className="text-gray-900">AI-Enhanced</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Metodologia sistemática que transforma requisitos ambíguos em produtos 
              completos e funcionais através de análise inteligente assistida por IA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/showcase">
                  <LucideIcons.Rocket className="mr-2 h-5 w-5" />
                  Ver Showcase
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                <Link href="/metodologia">
                  <LucideIcons.BookOpen className="mr-2 h-5 w-5" />
                  Entender Metodologia
                </Link>
              </Button>
            </div>
            
            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">85%</div>
                <div className="text-gray-600">Redução retrabalho</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">60%</div>
                <div className="text-gray-600">Aceleração processo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">95%</div>
                <div className="text-gray-600">Consistência entregas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferencial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
              O Problema que Todo Designer Conhece
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
              Como garantir que nenhum detalhe passe despercebido entre requisitos ambíguos e a entrega final?
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <h3 className="font-bold text-red-900 mb-2">❌ Processo Tradicional</h3>
                  <ul className="space-y-2 text-red-800">
                    <li>• PRD ambíguo recebido</li>
                    <li>• Interpretação baseada em suposições</li>
                    <li>• Wireframes criados intuitivamente</li>
                    <li>• Edge cases descobertos em produção</li>
                    <li>• Retrabalho constante</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                  <h3 className="font-bold text-green-900 mb-2">✅ Product Design AI-Enhanced</h3>
                  <ul className="space-y-2 text-green-800">
                    <li>• Análise sistemática obrigatória</li>
                    <li>• Todos os cenários mapeados</li>
                    <li>• Estados UI completos desde o início</li>
                    <li>• Código funcional entregue</li>
                    <li>• Zero surpresas na implementação</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            Os 8 Pilares da Metodologia
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icone: 'Search',
                titulo: 'Análise Obrigatória',
                descricao: '6 camadas de análise antes de qualquer wireframe'
              },
              {
                icone: 'Brain',
                titulo: 'Inteligência de Requisitos',
                descricao: 'IA extrai informações explícitas e infere implícitas'
              },
              {
                icone: 'Building2',
                titulo: 'Arquitetura Inteligente',
                descricao: 'Decisões baseadas em métricas, não intuição'
              },
              {
                icone: 'Layers',
                titulo: 'Estados UI Completos',
                descricao: 'Todos os cenários mapeados e implementados'
              },
              {
                icone: 'Shield',
                titulo: 'Prevenção Edge Cases',
                descricao: 'Cenários extremos previstos no design'
              },
              {
                icone: 'CheckCircle',
                titulo: 'Validação Defensiva',
                descricao: 'Heurísticas e acessibilidade automatizadas'
              },
              {
                icone: 'Code',
                titulo: 'Implementação Robusta',
                descricao: 'Do design ao código funcional'
              },
              {
                icone: 'Award',
                titulo: 'Qualidade Automatizada',
                descricao: 'Score ≥90 obrigatório antes do handoff'
              }
            ].map((pilar, index) => {
              const IconeComponente = LucideIcons[pilar.icone as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
              
              return (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconeComponente className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{pilar.titulo}</h3>
                    <p className="text-sm text-gray-600">{pilar.descricao}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cases em Destaque */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Cases Implementados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Exemplos reais da metodologia aplicada, do requisito simples ao sistema complexo funcionando.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.slice(0, 3).map((caseStudy) => (
              <Card key={caseStudy.id} className="h-full hover:shadow-lg transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={
                      caseStudy.categoria === 'simples' ? 'secondary' :
                      caseStudy.categoria === 'complexo' ? 'default' : 'destructive'
                    }>
                      {caseStudy.categoria}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {caseStudy.complexidade} pontos
                    </span>
                  </div>
                  
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {caseStudy.titulo}
                  </CardTitle>
                  <CardDescription>
                    {caseStudy.descricao}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caseStudy.tecnologias.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {caseStudy.preview}
                  </p>
                  
                  <Button asChild className="w-full" disabled={!caseStudy.implementado}>
                    <Link href={caseStudy.url}>
                      {caseStudy.implementado ? (
                        <>
                          <LucideIcons.ExternalLink className="mr-2 h-4 w-4" />
                          Ver Sistema
                        </>
                      ) : (
                        <>
                          <LucideIcons.Clock className="mr-2 h-4 w-4" />
                          Em Desenvolvimento
                        </>
                      )}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/showcase">
                Ver Todos os Cases
                <LucideIcons.ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Pronto para Ver a Metodologia em Ação?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Explore sistemas funcionais completos criados com Product Design AI-Enhanced
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/showcase/gestao-usuarios">
                <LucideIcons.Play className="mr-2 h-5 w-5" />
                Ver Sistema Completo
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="border-white text-purple-600 hover:bg-white hover:text-purple-600" asChild>
              <Link href="/sobre">
                <LucideIcons.User className="mr-2 h-5 w-5" />
                Sobre Marcos Bricches
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
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PD</span>
                </div>
                <span className="font-bold">Product Design AI-Enhanced</span>
              </div>
              <p className="text-gray-400 mb-4">
                Metodologia sistemática para design de produtos digitais com IA.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/metodologia" className="hover:text-white transition-colors">Metodologia</Link></li>
                <li><Link href="/processo" className="hover:text-white transition-colors">Processo</Link></li>
                <li><Link href="/showcase" className="hover:text-white transition-colors">Showcase</Link></li>
                <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Desenvolvido por</h3>
              <p className="text-gray-400 mb-2">Marcos Bricches</p>
              <p className="text-gray-400 text-sm">
                Product Designer
              </p>
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