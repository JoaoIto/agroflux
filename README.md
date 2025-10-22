# AgroFlux

**AgroFlux** é uma plataforma inovadora voltada para o gerenciamento e análise de dados do setor agropecuário. Ela permite o monitoramento de variáveis-chave, otimização de processos e tomada de decisões mais precisas para melhorar a eficiência e sustentabilidade no campo. O sistema permite a coleta, processamento e visualização de dados em tempo real para agricultores e profissionais do setor agrícola.

---

## 🛠 Tecnologias Utilizadas

* **Frontend**:

    * **React** – Para criar interfaces de usuário interativas.
    * **Next.js** – Framework React para renderização do lado do servidor (SSR) e geração de sites estáticos (SSG).
    * **Tailwind CSS** – Framework de design CSS para uma interface visual limpa e responsiva.
    * **Axios** – Biblioteca para fazer requisições HTTP para o backend.

* **Backend**:

    * **Node.js** – Ambiente de execução JavaScript no servidor.
    * **Next.js API Routes** – Para a construção de rotas de API no lado do servidor.
    * **MongoDB** – Banco de dados NoSQL para armazenar dados de usuários, sensores, e outras informações importantes.
    * **JWT (JSON Web Tokens)** – Para autenticação segura de usuários.
    * **Bcrypt.js** – Biblioteca de hashing de senhas para segurança do sistema.
   
* **Deploy e Infraestrutura**:

    * **Vercel** – Para deploy contínuo do frontend (utilizando o Next.js).
    * **MongoDB Atlas** – Para hospedagem do banco de dados MongoDB na nuvem.
    * **Docker** – Para containerizar a aplicação e facilitar a execução em diferentes ambientes.

---

## ⚙️ Funcionalidades

* **Cadastro de Usuários**: O sistema permite o cadastro de novos usuários com um processo de autenticação seguro utilizando senhas criptografadas.
* **Login de Usuários**: Funcionalidade de login utilizando autenticação via **JWT (JSON Web Tokens)** para garantir a segurança nas sessões dos usuários.
* **Armazenamento de Dados**: Utiliza o banco de dados **MongoDB** para armazenar dados relacionados aos usuários, configurações de sensores e medições de variáveis.
* **Visualização de Dados**: O sistema pode apresentar dados em tempo real, através de gráficos e dashboards, ajudando na visualização de informações importantes.
* **Autenticação e Segurança**: Implementação de autenticação com JWT, protegendo endpoints com verificação de token.
* **API RESTful**: O sistema oferece endpoints RESTful que permitem interagir com o backend, como realizar login, registro de usuários e consulta de dados.

---

## 🚀 Como Rodar o Projeto Localmente

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/JoaoIto/agroflux.git
   cd agroflux
   ```

2. **Instale as dependências**:
   Se você não tiver o **Node.js** instalado, faça o download em [nodejs.org](https://nodejs.org/).
   Depois, instale as dependências com o comando:

   ```bash
   npm install
   ```

3. **Configure o arquivo `.env`**:
   Crie um arquivo `.env` na raiz do projeto e defina as variáveis de ambiente necessárias, como a URL de conexão do MongoDB, JWT secret, etc. Um exemplo de configuração:

   ```env
   MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/agroflux?retryWrites=true&w=majority
   JWT_SECRET=seu_segredo_aqui
   ```

4. **Inicie o servidor**:
   Para rodar o backend e o frontend localmente, execute:

   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**:
   A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

---

## 🔨 Módulos e Funcionalidades

### Módulos do Backend:

* **`/api/auth/register`**: Rota para registro de novos usuários.
* **`/api/auth/login`**: Rota para login de usuários autenticados.
* **`/api/sensors`**: Rota para gerenciar dados dos sensores e variáveis agrícolas.
* **`/api/analytics`**: Rota para calcular e retornar análises baseadas nos dados coletados.

### Módulos do Frontend:

* **Dashboard**: Exibição de dados em tempo real dos sensores agrícolas e outros insights.

---

## 📝 Licença

Este projeto é licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

### 🛠️ Ferramentas e Bibliotecas Utilizadas

* **React.js** – Para construção de interfaces dinâmicas e interativas.
* **Next.js** – Framework para aplicações React com renderização do lado do servidor (SSR) e geração de sites estáticos (SSG).
* **MongoDB Atlas** – Para gerenciamento e hospedagem do banco de dados MongoDB na nuvem.
* **Tailwind CSS** – Framework CSS para facilitar o design da interface com classes utilitárias.
* **JWT** – Para autenticação baseada em tokens.
* **Bcrypt.js** – Para encriptação de senhas no processo de autenticação.
* **Axios** – Para comunicação entre frontend e backend via requisições HTTP.
* **dotenv** – Para carregar variáveis de ambiente a partir de arquivos `.env`.

---
