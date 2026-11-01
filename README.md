 <div align="center">

<img src="./app/icon.svg" alt="Logo Thiago.dev" width="90"/>

# Thiago.dev

**Portfólio pessoal | Desenvolvimento Web**

Portfólio desenvolvido para apresentar meus projetos, habilidades e evolução na área de tecnologia.

[**Acessar portfólio**](https://thiagoferraz.vercel.app/) · [**Meu GitHub**](https://github.com/thiagolfa07)

</div>

---

## Sobre o projeto

O Thiago.dev é meu portfólio pessoal, desenvolvido durante minha formação em Ciência da Computação na Universidade Guarulhos (UNG).

A proposta é reunir meus projetos em um único lugar, com informações sobre o desenvolvimento, as tecnologias utilizadas e os desafios encontrados.

Além da apresentação dos trabalhos, desenvolvi um painel administrativo para gerenciar os conteúdos sem precisar alterar diretamente o código a cada atualização.

## Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| Next.js | Estrutura da aplicação e navegação |
| React | Componentes e interfaces |
| TypeScript | Desenvolvimento com tipagem |
| Tailwind CSS | Estilização responsiva |
| CSS | Identidade visual e animações |
| Supabase | Autenticação, banco de dados e armazenamento |
| Git e GitHub | Versionamento |
| Vercel | Hospedagem e deploy |

## Funcionalidades

- Interface responsiva para desktop e dispositivos móveis.
- Modo claro e escuro na página inicial.
- Animações, partículas e efeitos interativos.
- Listagem de projetos integrada ao Supabase.
- Páginas individuais com informações detalhadas.
- Galeria de imagens com carrossel e visualização ampliada.
- Painel administrativo com autenticação.
- Cadastro, edição e exclusão de projetos.
- Upload de imagens e gerenciamento da galeria.
- Integração com repositórios públicos do GitHub.
- Área de contato profissional.

## Estrutura do projeto

```text
app/
├── admin/              # Painel administrativo
├── projetos/[slug]/     # Páginas individuais
├── page.tsx             # Página inicial
├── globals.css          # Estilos globais
├── portfolio.css        # Identidade visual
├── experience.css       # Animações e interações
└── icon.svg             # Identidade da marca

lib/
└── supabase.ts          # Cliente Supabase

supabase/
└── schema.sql           # Estrutura do banco de dados
```

## Executando localmente

Clone o repositório:

```bash
git clone https://github.com/thiagolfa07/Thiago-Dev.git
cd Thiago-Dev
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env.local` na raiz do projeto, utilizando `.env.example` como referência, e configure as variáveis necessárias:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GITHUB_USERNAME=
```

Para utilizar os recursos integrados ao Supabase, também é necessário configurar o projeto, o banco de dados, o armazenamento e as permissões correspondentes.

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Autor

**Thiago Ferraz**

Estudante de Ciência da Computação na UNG, com interesse em desenvolvimento de software, aplicações web e novas tecnologias.

[Portfólio](https://thiagoferraz.vercel.app/) · [GitHub](https://github.com/thiagolfa07)

