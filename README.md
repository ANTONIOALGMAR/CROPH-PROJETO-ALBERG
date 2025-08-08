# croph-projeto-alberg

## Descrição do Projeto
Um sistema de gerenciamento para albergues, focado em otimizar a administração de conviventes, leitos, controle de presença, registro de ocorrências e participação em refeições. O objetivo é fornecer uma ferramenta eficiente para assistentes sociais, orientadores e administradores gerenciarem as operações diárias de um albergue.

## Funcionalidades
-   **Autenticação de Usuários**: Sistema de login e registro com diferentes níveis de acesso (Assistente, Orientador, Admin).
-   **Gerenciamento de Conviventes**: Funcionalidades CRUD (Criar, Ler, Atualizar, Deletar) para informações detalhadas dos conviventes, incluindo foto.
-   **Controle de Presença**: Registro diário da presença dos conviventes nos leitos.
-   **Mapa de Leitos**: Visualização do status e ocupação dos leitos.
-   **Feed de Ocorrências**: Registro e acompanhamento de ocorrências, com diferenciação visual por autor.
-   **Gerenciamento de Participação em Refeições**: Controle da participação dos conviventes em diferentes refeições (café, almoço, jantar).
-   **Perfis de Usuário**: Diferenciação de funcionalidades e acesso baseada no papel do usuário.

## Tecnologias Utilizadas

### Backend
-   **Node.js**: Ambiente de execução JavaScript.
-   **Express.js**: Framework web para construção de APIs RESTful.
-   **Prisma**: ORM (Object-Relational Mapper) moderno para interagir com o banco de dados.
-   **MongoDB**: Banco de dados NoSQL para armazenamento de dados.
-   **JWT (JSON Web Tokens)**: Para autenticação segura de usuários.
-   **bcrypt**: Para hash e comparação de senhas.
-   **Multer**: Middleware para tratamento de `multipart/form-data`, usado para upload de arquivos (fotos).
-   **dotenv**: Para gerenciamento de variáveis de ambiente.

### Frontend
-   **React**: Biblioteca JavaScript para construção de interfaces de usuário.
-   **TypeScript**: Superset de JavaScript que adiciona tipagem estática.
-   **Tailwind CSS**: Framework CSS utilitário para estilização rápida e responsiva.
-   **Formik**: Biblioteca para gerenciamento de estados de formulários no React.
-   **Yup**: Biblioteca para validação de esquemas de formulários.
-   **date-fns**: Biblioteca para manipulação e formatação de datas.
-   **React Router DOM**: Para roteamento declarativo na aplicação.

## Pré-requisitos
Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
-   **Node.js**: Versão 18 ou superior.
-   **npm** (Node Package Manager) ou **Yarn**: Gerenciadores de pacotes.
-   **MongoDB**: Servidor de banco de dados rodando localmente ou acesso a um cluster remoto (ex: MongoDB Atlas).

## Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/croph-projeto-alberg.git
    cd croph-projeto-alberg
    ```

2.  **Configuração do Backend:**
    Navegue até o diretório `backend`:
    ```bash
    cd backend
    ```
    Instale as dependências:
    ```bash
    npm install
    # ou yarn install
    ```
    Crie um arquivo `.env` na raiz do diretório `backend` com as seguintes variáveis de ambiente:
    ```
    PORT=3001
    MONGO_URI="mongodb://localhost:27017/albergue_db" # Ou sua URI do MongoDB Atlas
    JWT_SECRET="sua_chave_secreta_jwt_muito_segura" # Gere uma string aleatória e forte
    ```
    Execute as migrações do Prisma para configurar o banco de dados e gerar o cliente Prisma:
    ```bash
    npx prisma migrate dev --name init
    # Se você já tem o banco de dados e só precisa gerar o cliente:
    # npx prisma generate
    ```

3.  **Configuração do Frontend:**
    Navegue de volta para a raiz do projeto e depois para o diretório `frontend`:
    ```bash
    cd ../frontend
    ```
    Instale as dependências:
    ```bash
    npm install
    # ou yarn install
    ```
    Crie um arquivo `.env.local` na raiz do diretório `frontend` com a seguinte variável de ambiente:
    ```
    REACT_APP_API_URL="http://localhost:3001" # URL do seu backend
    ```

## Como Rodar a Aplicação

1.  **Iniciar o Backend:**
    No diretório `backend`, execute:
    ```bash
    npm start
    # ou yarn start
    ```
    O servidor backend estará rodando em `http://localhost:3001`.

2.  **Iniciar o Frontend:**
    No diretório `frontend`, execute:
    ```bash
    npm start
    # ou yarn start
    ```
    O aplicativo frontend estará acessível em `http://localhost:3000` (ou outra porta disponível).

## Estrutura do Projeto

```
croph-projeto-alberg/
├── backend/                  # Código do servidor Node.js/Express
│   ├── controllers/          # Lógica de negócio das rotas
│   ├── middlewares/          # Middlewares de autenticação, etc.
│   ├── models/               # (Se usar Mongoose ou similar, mas aqui é Prisma)
│   ├── node_modules/
│   ├── prisma/               # Esquema do banco de dados e migrações
│   ├── routes/               # Definição das rotas da API
│   ├── services/             # Lógica de serviço (opcional)
│   ├── uploads/              # Diretório para uploads de arquivos (fotos)
│   ├── .env                  # Variáveis de ambiente do backend
│   ├── package.json
│   └── server.js             # Ponto de entrada do servidor
└── frontend/                 # Código do aplicativo React/TypeScript
    ├── public/               # Arquivos estáticos
    ├── src/
    │   ├── assets/           # Imagens, ícones, etc.
    │   ├── components/       # Componentes React reutilizáveis
    │   ├── context/          # Contextos React (ex: AuthContext)
    │   ├── hooks/            # Hooks personalizados (ex: useProtectedFetch)
    │   ├── pages/            # Páginas da aplicação
    │   ├── types/            # Definições de tipos TypeScript
    │   ├── App.tsx           # Componente principal da aplicação
    │   ├── index.tsx         # Ponto de entrada do React
    │   └── index.css         # Estilos globais (incluindo Tailwind)
    ├── .env.local            # Variáveis de ambiente do frontend
    ├── package.json
    ├── postcss.config.js     # Configuração do PostCSS para Tailwind
    ├── tailwind.config.js    # Configuração do Tailwind CSS
    └── tsconfig.json
```

## Modelos do Banco de Dados (Prisma Schema)

### `User`
-   `id`: ID único do usuário.
-   `email`: Email do usuário (único).
-   `password`: Senha hash.
-   `role`: Papel do usuário (ADMIN, ASSISTENTE, ORIENTADOR).
-   `nome`: Nome do usuário.
-   `tipo`: Tipo de usuário.

### `Convivente`
-   `id`: ID único do convivente.
-   `nome`: Nome completo do convivente.
-   `leito`: Número do leito (único).
-   `cpf`: CPF do convivente (opcional, único).
-   `rg`: RG do convivente (opcional).
-   `dataNascimento`: Data de nascimento.
-   `quarto`: Quarto do convivente (opcional).
-   `assistenteSocial`: Assistente social responsável (opcional).
-   `email`: Email do convivente (opcional).
-   `photoUrl`: URL da foto do convivente (opcional).

### `Ocorrencia`
-   `id`: ID único da ocorrência.
-   `titulo`: Título da ocorrência.
-   `descricao`: Descrição detalhada.
-   `data`: Data da ocorrência.
-   `autorId`: ID do autor da ocorrência.

### `ParticipacaoRefeicao`
-   `id`: ID único da participação.
-   `leito`: Número do leito.
-   `data`: Data da refeição.
-   `tipo`: Tipo de refeição (CAFE, ALMOCO, JANTAR).
-   `participou`: Booleano indicando participação.
-   `conviventeId`: ID do convivente.

### `Presenca`
-   `id`: ID único da presença.
-   `leito`: Número do leito.
-   `data`: Data da presença.
-   `presente`: Booleano indicando presença.
-   `conviventeId`: ID do convivente.

### `Leito`
-   `id`: ID único do leito.
-   `numero`: Número do leito (único).
-   `status`: Status do leito (DISPONIVEL, MANUTENCAO, INTERDITADO, LIMPEZA).
-   `motivo`: Motivo do status (opcional).

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## Licença
Este projeto está licenciado sob a Licença MIT.
