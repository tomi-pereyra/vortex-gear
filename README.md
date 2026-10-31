# ⚡ Vortex Gear — E-Commerce de Periféricos Gamer de Alta Performance

Bem-vindo ao repositório oficial da **Vortex Gear**, uma plataforma de e-commerce moderna e performática focada em periféricos gamer competitivos (mouses ultraleves de alto polling rate, teclados magnéticos com switches Hall Effect, monitores e-sports e acessórios de precisão).

---

## 🏗️ Arquitetura do Projeto (Monorepo)

O projeto utiliza uma arquitetura **Monorepo** organizada em duas aplicações principais desacopladas:

```text
vortex-gear/
├── backend/       # API RESTful em Node.js + Fastify + TypeScript + Prisma
├── frontend/      # Aplicação Web em Next.js + Tailwind CSS + Shadcn/ui + Zustand
├── .gitignore     # Regras globais de exclusão do Git
└── README.md      # Documentação principal do ecossistema
```

---

## 🚀 Tecnologias & Stack

### Backend (`/backend`)
- **[Node.js](https://nodejs.org/)** — Runtime JavaScript de alta performance
- **[Fastify](https://fastify.dev/)** — Framework web focado em baixíssima sobrecarga e máxima velocidade
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática rigorosa (`strict: true`)
- **[Prisma ORM](https://www.prisma.io/)** — Modelagem e acesso seguro ao banco de dados
- **[Zod](https://zod.dev/)** — Validação de esquemas e contratos de dados em tempo de execução

### Frontend (`/frontend`)
- **[Next.js](https://nextjs.org/)** — Framework React com App Router, SSR e otimizações de performance
- **[Tailwind CSS](https://tailwindcss.com/)** — Estilização utilitária moderna e responsiva
- **[Shadcn/ui](https://ui.shadcn.com/)** — Componentes de interface acessíveis e customizáveis
- **[Zustand](https://zustand-demo.pmnd.rs/)** — Gerenciamento de estado global leve e reativo (carrinho, filtros, sessão)

---

## 🛠️ Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v20 LTS ou superior recomendado)
- **npm** (v10+)

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/vortex-gear.git
cd vortex-gear
```

### 2. Iniciar o Backend (API)
```bash
cd backend
npm install
npm run dev
```
O servidor Fastify estará disponível em `http://localhost:3333`.

#### Rotas iniciais de verificação:
- `GET http://localhost:3333/status` — Verifica o status operacional da API.
- `GET http://localhost:3333/produtos-teste` — Retorna o catálogo inicial de periféricos em memória.

### 3. Iniciar o Frontend (Web)
```bash
cd frontend
npm install
npm run dev
```
A aplicação web estará disponível em `http://localhost:3000`.

---

## 📄 Licença
Este projeto foi desenvolvido para fins de arquitetura e desenvolvimento Full-Stack da **Vortex Gear**.

