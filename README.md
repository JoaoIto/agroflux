# AgroFlux - [DOCUMENTAÇÃO](https://github.com/kaiomaced0/hackathon-agroflux)

**AgroFlux** é uma plataforma inovadora voltada para a **automação inteligente de irrigação** e a **gestão eficiente da água** no setor agropecuário. Utilizando sensores, mineração de dados e inteligência artificial (IA), o AgroFlux ajuda agricultores a otimizar o uso da água, garantindo a eficiência hídrica e reduzindo desperdícios, tudo de forma automatizada e acessível, desde pequenas hortas até grandes propriedades.

O AgroFlux não é apenas uma ferramenta de **irrigação inteligente**; é uma solução completa para **gestão sustentável da água** na agricultura.

---

## 🚀 **Proposta de Valor**

**AgroFlux** oferece uma maneira inovadora de **gerenciar recursos hídricos** de forma eficiente, com o objetivo de:

* **Reduzir o consumo de água**, sem depender da intervenção do usuário.
* **Tornar a automação agrícola acessível**, com um sistema modular que atende desde hortas domiciliares até grandes propriedades.
* **Fornecer dados mensuráveis** sobre a eficiência hídrica.
* **Garantir sustentabilidade e eficiência no uso da água**, alinhando-se ao tema "Gestão e Uso Eficiente da Água".

---

## 🛠 **Tecnologias Utilizadas**

* **Frontend**:

    * **React**: Para a criação de interfaces dinâmicas.
    * **Next.js**: Framework React para renderização do lado do servidor (SSR) e geração de sites estáticos (SSG).
    * **Tailwind CSS**: Framework CSS para um design limpo e responsivo.
    * **Axios**: Para realizar requisições HTTP no frontend.

* **Backend**:

    * **Node.js**: Ambiente de execução JavaScript para o servidor.
    * **MongoDB**: Banco de dados NoSQL para armazenar dados sobre usuários, sensores e medidores de água.
    * **JWT**: Para autenticação segura de usuários.
    * **Bcrypt.js**: Para hashing de senhas de forma segura.
    * **CORS**: Middleware para configuração de requisições cross-origin.

* **Inteligência Artificial**:

    * **Mineração de Dados**: Para análise preditiva de condições climáticas e otimização de irrigação.
    * **Modelos de Previsão**: Para gerar previsões de chuva e ajustar automaticamente os ciclos de irrigação.

* **Infraestrutura**:

    * **Docker**: Para containerização da aplicação.
    * **MongoDB Atlas**: Banco de dados na nuvem.
    * **Vercel**: Para deploy contínuo do frontend.

---

## **Módulos do Produto**

### **1. Módulo de Inteligência Artificial (IA)**

A IA é o **cérebro do sistema**, tomando decisões inteligentes baseadas em dados reais de sensores e previsões meteorológicas.

| **Função**                          | **Como funciona no AgroFlux**                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Análise de Dados Meteorológicos** | A IA analisa as condições climáticas (chuva, temperatura, umidade) e decide a melhor hora para irrigar.               |
| **Previsões Inteligentes**          | A IA prevê chuvas e ajusta a irrigação automaticamente para evitar desperdício.                                       |
| **Recomendações de Irrigação**      | A IA recomenda a quantidade exata de água necessária com base na análise dos sensores e das previsões meteorológicas. |

---

### **2. Módulo de Gestão de Recursos Hídricos**

Esse módulo se concentra na **gestão eficiente da água**, otimizando o uso do recurso e enviando alertas quando necessário.

| **Função**                         | **Como funciona no AgroFlux**                                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Monitoramento do Nível de Água** | O sensor monitora o volume disponível nos reservatórios e ajusta a irrigação conforme necessário.                                |
| **Cálculo de Autonomia Hídrica**   | Calcula a quantidade de água disponível e estima a autonomia do sistema de irrigação, ajudando o produtor a planejar a captação. |
| **Alertas Inteligentes**           | Envia alertas quando o nível da água estiver baixo ou se houver risco de escassez, evitando desperdícios.                        |

---

### **3. Módulo de Análise de Solo**

Este módulo foca em **analisar o solo** e fornecer dados precisos sobre a umidade e condições do solo, ajudando na irrigação eficiente.

| **Função**                             | **Como funciona no AgroFlux**                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Sensores de Umidade do Solo**        | Medem a umidade do solo em tempo real, ajustando a irrigação de forma precisa para garantir que as plantas recebam a água necessária.     |
| **Monitoramento de Condições do Solo** | O AgroFlux ajusta automaticamente a irrigação conforme as condições ideais para cada tipo de cultivo, garantindo o uso eficiente da água. |

---

## **Proposta de Benefícios para o Produtor**

### **Redução do Consumo de Água**

* O sistema **ajusta automaticamente a irrigação** conforme as necessidades reais das plantas, evitando desperdícios e garantindo que o uso de água seja **eficiente e sustentável**.

### **Acessibilidade e Inovação**

* Oferece **tecnologia de ponta** com um preço acessível, permitindo que pequenos produtores também se beneficiem de um sistema de irrigação avançado.
* **Modularidade**: O AgroFlux se adapta a diferentes tamanhos de propriedades, desde hortas domésticas até grandes propriedades agrícolas.

### **Automação Completa e Sustentável**

* O sistema oferece **irrigação automatizada**, eliminando a necessidade de ajustes manuais frequentes.
* **Sustentabilidade**: O AgroFlux ajuda a minimizar o impacto ambiental ao utilizar apenas a quantidade necessária de água, sem desperdícios.

---

## **Público-Alvo**

O AgroFlux é ideal para:

* **Pequenos Produtores**: Que buscam uma solução simples e acessível para irrigação inteligente.
* **Médios Produtores**: Que necessitam de um sistema mais robusto e inteligente para gerenciar a irrigação com base em dados meteorológicos e de solo.
* **Grandes Produtores**: Que exigem um sistema de monitoramento avançado, com gestão precisa de recursos hídricos e previsões de consumo.

---

## **Como Rodar o Projeto Localmente**

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/JoaoIto/agroflux.git
   cd agroflux
   ```

2. **Instale as dependências**:
   Se o **Node.js** não estiver instalado, baixe-o [aqui](https://nodejs.org/). Em seguida, instale as dependências:

   ```bash
   npm install
   ```

3. **Configure o arquivo `.env`**:
   Crie um arquivo `.env` na raiz do projeto e adicione as variáveis de ambiente:

   ```env
   MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/agroflux?retryWrites=true&w=majority
   JWT_SECRET=seu_segredo_aqui
   ```

4. **Inicie o servidor**:
   Execute o comando para rodar o frontend e o backend:

   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**:
   A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

---

## **Licença**

Este projeto é licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Com o **AgroFlux**, estamos redefinindo a maneira como a água é gerenciada na agricultura. Nossa solução **inteligente, modular e acessível** proporciona **eficiência** e **sustentabilidade**, entregando o melhor da tecnologia para todos os produtores, independentemente do tamanho de sua propriedade.

---
