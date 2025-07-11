export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icone?: string;
  descricao?: string;
  badge?: string;
  children?: MenuItem[];
}

export const menuPrincipal: MenuItem[] = [
  {
    id: 'home',
    label: 'Início',
    href: '/',
    icone: 'Home',
    descricao: 'Página inicial do showcase'
  },
  {
    id: 'metodologia',
    label: 'Metodologia',
    href: '/metodologia',
    icone: 'BookOpen',
    descricao: 'Entenda os 8 pilares fundamentais'
  },
  {
    id: 'processo',
    label: 'Processo',
    href: '/processo',
    icone: 'Cog',
    descricao: 'Como funciona na prática'
  },
  {
    id: 'showcase',
    label: 'Showcase',
    href: '/showcase',
    icone: 'Grid3X3',
    descricao: 'Sistemas funcionais implementados',
    children: [
      {
        id: 'gestao-usuarios',
        label: 'Gestão de Usuários',
        href: '/showcase/gestao-usuarios',
        icone: 'Users',
        descricao: 'Sistema completo com 28 estados UI',
        badge: 'Completo'
      },
      {
        id: 'ecommerce-dashboard',
        label: 'E-commerce Dashboard',
        href: '/showcase/ecommerce-dashboard',
        icone: 'ShoppingCart',
        descricao: 'Painel administrativo completo',
        badge: 'Em breve'
      },
      {
        id: 'crm-simples',
        label: 'CRM Simplificado',
        href: '/showcase/crm-simples',
        icone: 'Contact',
        descricao: 'Exemplo de componente único',
        badge: 'Em breve'
      }
    ]
  },
  {
    id: 'sobre',
    label: 'Sobre',
    href: '/sobre',
    icone: 'User',
    descricao: 'Sobre Marcos Bricches'
  }
];

export const menuFooter: MenuItem[] = [
  {
    id: 'metodologia-footer',
    label: 'Metodologia',
    href: '/metodologia'
  },
  {
    id: 'processo-footer',
    label: 'Processo',
    href: '/processo'
  },
  {
    id: 'showcase-footer',
    label: 'Showcase',
    href: '/showcase'
  },
  {
    id: 'sobre-footer',
    label: 'Sobre',
    href: '/sobre'
  }
];