# Letra.AI 🎤 - Sua Plataforma Inteligente de Repertório Musical

[![Letra.AI Logo](public/brand/letra-ai-icon.png)](https://github.com/IsacFSC/letra-ai)

## ✨ Visão Geral do Projeto

**Letra.AI** é uma aplicação web progressiva (PWA) desenvolvida para cantores e músicos organizarem e ensaiarem seu repertório de forma eficiente. A plataforma permite criar, editar e gerenciar letras de músicas, integrando-se com o YouTube para facilitar o ensaio e oferecendo funcionalidades offline para acesso contínuo.

Este projeto demonstra minhas habilidades em desenvolvimento **Frontend (React, Next.js, UI/UX)**, **Backend (Next.js API Routes, Prisma, PostgreSQL)** e a aplicação de conceitos de **Inteligência Artificial/Produtividade** para criar uma experiência de usuário fluida e robusta.

## 🚀 Funcionalidades Principais

-   **Gestão de Músicas**: Crie, edite e organize seu repertório musical com títulos, artistas e letras.
-   **Importação Inteligente**: Importe automaticamente título e artista de vídeos do YouTube.
-   **Busca de Letras**: Busque e importe letras de músicas diretamente para o editor.
-   **Editor de Letras Avançado**:
    -   Estruture letras em seções (Verso, Refrão, Ponte, etc.) com cores e labels dinâmicos.
    -   Reordene e exclua seções facilmente.
-   **Modo Palco (Stage Mode)**:
    -   Visualização otimizada para ensaio com autoscroll configurável.
    -   Player de YouTube embedado e minimizado para acompanhar a música e a letra simultaneamente.
    -   Modo foco para remover distrações.
-   **Gestão de Escalas**: Crie e gerencie listas de músicas (escalas) para apresentações ou ensaios específicos.
-   **PWA (Progressive Web App)**:
    -   Instalável em dispositivos móveis e desktops.
    -   Suporte offline para acesso a letras e funcionalidades básicas sem conexão com a internet.
-   **Autenticação Segura**: Login e registro de usuários com NextAuth.js.
-   **UI/UX Moderna**: Interface intuitiva e responsiva, com design "glassmorphism" e componentes Shadcn UI.

## 🛠️ Tecnologias Utilizadas

### Frontend

-   **React**: Biblioteca JavaScript para construção de interfaces de usuário.
-   **Next.js (App Router)**: Framework React para renderização do lado do servidor (SSR), geração de sites estáticos (SSG) e rotas de API.
-   **TypeScript**: Linguagem de programação que adiciona tipagem estática ao JavaScript.
-   **Tailwind CSS**: Framework CSS utilitário para estilização rápida e responsiva.
-   **Shadcn UI**: Coleção de componentes de UI reutilizáveis e acessíveis, estilizados com Tailwind CSS.
-   **Lucide React**: Biblioteca de ícones.
-   **Framer Motion**: Biblioteca para animações fluidas e elegantes.
-   **React Hot Toast**: Notificações toast personalizáveis.
-   **PWA (Progressive Web App)**: Service Workers para caching e funcionalidade offline, manifest.json para instalabilidade.

### Backend

-   **Next.js API Routes**: Criação de endpoints de API RESTful para comunicação com o banco de dados.
-   **Prisma ORM**: ORM (Object-Relational Mapper) para interação com o banco de dados de forma segura e tipada.
-   **NextAuth.js**: Solução completa de autenticação para aplicações Next.js.
-   **Zod**: Biblioteca de validação de esquemas para garantir a integridade dos dados.

### Banco de Dados

-   **PostgreSQL**: Banco de dados relacional robusto e escalável.

### Ferramentas e Outros

-   **Vercel**: Plataforma de deploy contínuo para aplicações Next.js.
-   **Git/GitHub**: Controle de versão e hospedagem de código.

## 🧠 Inteligência Artificial & Produtividade

Embora não utilize modelos de IA complexos diretamente, o projeto incorpora princípios de IA para produtividade e automação:

-   **Automação de Dados (YouTube)**: A capacidade de extrair automaticamente o título e o artista de um link do YouTube economiza tempo e reduz erros manuais, agilizando o processo de criação de novas músicas.
-   **Busca de Letras**: A integração com serviços de letras (simulada ou real) automatiza a inserção de conteúdo, um passo repetitivo para músicos.
-   **Experiência de Ensaio Otimizada**: O "Modo Palco" com autoscroll e player embedado é um exemplo de como a tecnologia pode ser usada para criar um ambiente de prática mais focado e produtivo, minimizando distrações e maximizando a eficiência do músico.

## ⚙️ Como Rodar o Projeto Localmente

Siga estas instruções para configurar e executar o projeto em sua máquina local:

### Pré-requisitos

-   Node.js (versão 18 ou superior)
-   npm ou Yarn
-   PostgreSQL (local ou serviço em nuvem)
-   Conta no GitHub (para NextAuth.js, se configurado com provedor GitHub)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone <https://github.com/IsacFSC/letra-ai.git>
    cd letra-ai
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    NEXTAUTH_SECRET="UM_TEXTO_LONGO_E_ALEATORIO_PARA_SEGURANCA"
    NEXTAUTH_URL="http://localhost:3000"
    # Opcional: Se usar provedores OAuth (ex: GitHub)
    # GITHUB_ID="seu_github_client_id"
    # GITHUB_SECRET="seu_github_client_secret"
    ```
    _Você pode gerar um `NEXTAUTH_SECRET` com `openssl rand -base64 32` no terminal._

4.  **Configure o banco de dados com Prisma:**
    ```bash
    npx prisma migrate dev --name init
    npx prisma db push
    ```

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```

6.  **Acesse a aplicação:**
    Abra seu navegador e acesse `http://localhost:3000`.

## 🤝 Contato

Estou ativamente buscando minha primeira oportunidade como desenvolvedor frontend React. Sinta-se à vontade para entrar em contato!

-   **LinkedIn**: [Isac Freitas](https://www.linkedin.com/in/isac-freitas-502a42289)
-   **GitHub**: [IsacFSC](https://github.com/IsacFSC)

---

**Obrigado por visitar o Letra.AI!**

```
