'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import * as LucideIcons from 'lucide-react'
import { caseStudies } from '@/data/case-studies'

export default function ShowcasePage() {
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');

  const casesFiltrados = caseStudies.filter(caseStudy => {
    const matchCategoria = filtroCategoria === 'todos' || caseStudy.categoria === filtroCategoria;
    const matchStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'implementado' && caseStudy.implementado) ||
      (filtroStatus === 'desenvolvimento' && !caseStudy.implementado);
    const matchBusca = termoBusca === '' || 
      caseStudy.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      caseStudy.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    
    return matchCategoria && matchStatus && matchBusca;
  });

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
              <Link href="/processo" className="text-gray-600 hover:text-gray-900 transition-colors">
                Processo
              </Link>
              <Link href="/showcase" className="text-blue-600 font-medium">
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
              <span className="text-blue-600">Showcase</span> Interativo
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistemas funcionais completos criados com Product Design AI-Enhanced. 
              Do requisito simples ao código executável.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{caseStudies.length}</div>
                <div className="text-gray-600">Cases Desenvolvidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{caseStudies.filter(c => c.implementado).length}</div>
                <div className="text-gray-600">Sistemas Funcionais</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">100%</div>
                <div className="text-gray-600">Metodologia Aplicada</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cases..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas as Categorias</option>
                <option value="simples">Simples</option>
                <option value="complexo">Complexo</option>
                <option value="avancado">Avançado</option>
              </select>
              
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="implementado">Implementado</option>
                <option value="desenvolvimento">Em Desenvolvimento</option>
              </select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroCategoria('todos');
                  setFiltroStatus('todos');
                  setTermoBusca('');
                }}
                disabled={filtroCategoria === 'todos' && filtroStatus === 'todos' && termoBusca === ''}
              >
                <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cases */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {casesFiltrados.length === 0 ? (
              <div className="text-center py-16">
                <LucideIcons.Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-500 mb-8">
                  Nenhum case corresponde aos filtros aplicados. Tente ajustar os critérios.
                </p>
                <Button
                  onClick={() => {
                    setFiltroCategoria('todos');
                    setFiltroStatus('todos');
                    setTermoBusca('');
                  }}
                  variant="outline"
                >
                  <LucideIcons.RefreshCw className="mr-2 h-4 w-4" />
                  Ver Todos os Cases
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {casesFiltrados.map((caseStudy) => (
                  <Card key={caseStudy.id} className="h-full hover:shadow-xl transition-all group">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant={
                          caseStudy.categoria === 'simples' ? 'secondary' :
                          caseStudy.categoria === 'complexo' ? 'default' : 'destructive'
                        }>
                          {caseStudy.categoria}
                        </Badge>
                        

                      </div>
                      
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {caseStudy.titulo}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {caseStudy.descricao}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {caseStudy.tecnologias.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-6">
                          {caseStudy.preview}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Button 
                          asChild 
                          className="w-full" 
                          disabled={!caseStudy.implementado}
                        >
                          <Link href={caseStudy.url}>
                            {caseStudy.implementado ? (
                              <>
                                <LucideIcons.ExternalLink className="mr-2 h-4 w-4" />
                                Acessar Sistema
                              </>
                            ) : (
                              <>
                                <LucideIcons.Clock className="mr-2 h-4 w-4" />
                                Em Desenvolvimento
                              </>
                            )}
                          </Link>
                        </Button>
                        
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Destaque - Sistema Principal */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Sistema em Destaque</h2>
              <p className="text-xl text-gray-600">
                Exemplo completo da metodologia aplicada do requisito ao código funcional
              </p>
            </div>
            
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge>Complexo</Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">Sistema de Gestão de Usuários</h3>
                  <p className="text-gray-600 mb-6">
                    CRUD completo com múltiplos perfis, auditoria e bulk actions. 
                    Demonstra arquitetura modular e todos os 28 estados UI mapeados.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <LucideIcons.Target className="h-5 w-5 text-blue-600" />
                      <span>Input: &quot;Admins devem gerenciar usuários com CRUD básico&quot;</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <LucideIcons.BarChart3 className="h-5 w-5 text-purple-600" />
                      <span>Complexidade: 52 pontos → Sistema modular</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <LucideIcons.Layers className="h-5 w-5 text-green-600" />
                      <span>28 estados UI mapeados e implementados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <LucideIcons.Code className="h-5 w-5 text-orange-600" />
                      <span>4 módulos especializados + orquestrador</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button asChild size="lg" className="w-full">
                      <Link href="/showcase/gestao-usuarios">
                        <LucideIcons.Play className="mr-2 h-5 w-5" />
                        Acessar Sistema Completo
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LucideIcons.Users className="h-12 w-12 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">Sistema Funcional</h4>
                    <p className="text-gray-600 mb-4">
                      Navegação completa, estados UI, validações, bulk actions
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div>✓ 4 módulos especializados</div>
                      <div>✓ 28 estados UI diferentes</div>
                      <div>✓ Acessibilidade WCAG AA</div>
                      <div>✓ Responsividade completa</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Quer Entender Como Isso Foi Criado?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Veja o processo completo da metodologia, desde a análise até a implementação
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/processo">
                <LucideIcons.Cog className="mr-2 h-5 w-5" />
                Ver Processo Completo
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="border-white text-purple-600 hover:bg-white hover:text-purple-600" asChild>
              <Link href="/metodologia">
                <LucideIcons.BookOpen className="mr-2 h-5 w-5" />
                Entender Metodologia
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
              <h3 className="font-semibold mb-4">Cases Disponíveis</h3>
              <ul className="space-y-2 text-gray-400">
                {caseStudies.filter(c => c.implementado).map(caseStudy => (
                  <li key={caseStudy.id}>
                    <Link href={caseStudy.url} className="hover:text-white transition-colors">
                      {caseStudy.titulo}
                    </Link>
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