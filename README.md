# 🌱 AgroFlux

**AgroFlux** é uma plataforma completa de **automação inteligente de irrigação** que combina sensores IoT, inteligência artificial e análise de dados para otimizar o uso da água na agricultura. O sistema ajuda produtores rurais a reduzirem desperdícios, aumentarem a eficiência hídrica e tomarem decisões baseadas em dados precisos - tudo de forma automatizada e acessível.

---

## 📦 **Componentes do Sistema**

O AgroFlux é composto por três partes principais que trabalham em conjunto:

### 1. 🌐 **Aplicação Web**
Plataforma web desenvolvida em Next.js que permite ao produtor:
- Gerenciar hortas e zonas de cultivo
- Visualizar dados de sensores em tempo real
- Acompanhar previsões de irrigação calculadas por IA
- Receber recomendações personalizadas baseadas em dados climáticos e de solo
- Calcular ETC (Evapotranspiração da Cultura) e ETO automaticamente
- Monitorar consumo de água e eficiência hídrica

### 2. 🔌 **ESP32 - Microcontrolador IoT**
Sistema embarcado baseado em ESP32/ESP8266 com WiFi que:
- Conecta sensores de umidade do solo, temperatura e outros
- Disponibiliza dados dos sensores via API REST
- Permite controle remoto de dispositivos de irrigação
- Comunica-se com a aplicação web em tempo real

### 3. 🤖 **Agente de IA com N8N**
Sistema de suporte inteligente via WhatsApp que:
- Responde dúvidas sobre irrigação e manejo de culturas
- Fornece recomendações personalizadas baseadas nos dados do usuário
- Integra dados da aplicação web para contexto preciso
- Disponibiliza suporte 24/7 ao produtor

---

## 🚀 **Como Rodar o Projeto**

### **1. Aplicação Web (Next.js)**

#### Requisitos:
- **Node.js**: versão 18.x ou superior
- **MongoDB**: versão 5.0 ou superior (local ou MongoDB Atlas)
- **npm** ou **yarn**

#### Passo a passo:

1. **Clone o repositório**:
   ```powershell
   git clone https://github.com/JoaoIto/agroflux.git
   cd agroflux
   ```

2. **Instale as dependências**:
   ```powershell
   npm install
   ```

3. **Configure o arquivo `.env`**:
   Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/agroflux?retryWrites=true&w=majority
   # ou para MongoDB local:
   # MONGODB_URI=mongodb://localhost:27017/agroflux

   # Autenticação
   JWT_SECRET=seu_segredo_jwt_aqui_minimo_32_caracteres

   # OpenAI (para recomendações de IA)
   OPENAI_API_KEY=sua_chave_openai_aqui

   # API de Clima (Open-Meteo é gratuita, não precisa de chave)
   ```

4. **Inicialize o banco de dados** (primeira vez apenas):
   ```powershell
   node init-database.js
   ```

5. **Inicie o servidor de desenvolvimento**:
   ```powershell
   npm run dev
   ```

6. **Acesse a aplicação**:
   Abra seu navegador em [http://localhost:3000](http://localhost:3000)

#### Scripts disponíveis:
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa verificação de código

---

### **2. ESP32/ESP8266 (Microcontrolador)**

#### Requisitos:
- **Arduino IDE** 1.8.x ou superior (ou Arduino IDE 2.x)
- **Placa ESP32** ou **ESP8266**
- **Sensores**: DHT22 (temperatura/umidade), sensor de umidade do solo
- **Cabo USB** para programação

#### Passo a passo:

1. **Instale o Arduino IDE**:
   - Download: [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software)

2. **Instale o suporte para ESP8266**:
   - Abra Arduino IDE
   - Vá em `File > Preferences`
   - Em "Additional Board Manager URLs", adicione:
     ```
     http://arduino.esp8266.com/stable/package_esp8266com_index.json
     ```
   - Vá em `Tools > Board > Boards Manager`
   - Busque por "esp8266" e instale o pacote **ESP8266 Community**

3. **Instale as bibliotecas necessárias**:
   - Vá em `Sketch > Include Library > Manage Libraries`
   - Instale as seguintes bibliotecas:
     - **ESP8266WiFi** (já incluída com o pacote ESP8266)
     - **DHT sensor library** by Adafruit
     - **Adafruit Unified Sensor**
     - **ArduinoJson** (para comunicação REST)

4. **Configure o código**:
   - Abra o arquivo do Arduino (ver `arduinocodigo.md`)
   - Configure suas credenciais WiFi:
     ```cpp
     const char* ssid = "SUA_REDE_WIFI";
     const char* password = "SUA_SENHA_WIFI";
     ```
   - Configure o endpoint da API:
     ```cpp
     const char* serverUrl = "http://SEU_SERVIDOR/api/sensors";
     ```

5. **Faça o upload para o ESP**:
   - Conecte o ESP via USB
   - Selecione a placa em `Tools > Board > ESP8266 Boards > NodeMCU 1.0`
   - Selecione a porta em `Tools > Port`
   - Clique em `Upload` (seta para direita)

6. **Monitore o funcionamento**:
   - Abra o Serial Monitor (`Tools > Serial Monitor`)
   - Configure para 115200 baud
   - Verifique se o ESP conectou ao WiFi e está enviando dados

---

### **3. Agente de IA com N8N (WhatsApp Bot)**

#### Requisitos:
- **N8N** (Self-hosted ou N8N Cloud)
- **Redis** para gerenciamento de sessões
- **Conta WhatsApp Business API** (Meta/Facebook)
- **OpenAI API Key** (para processamento de IA)

#### Passo a passo:

1. **Instale o Redis** (se for local):
   ```powershell
   # Com Docker
   docker run -d --name redis -p 6379:6379 redis:latest
   ```

2. **Instale e configure o N8N**:
   ```powershell
   # Com Docker
   docker run -d `
     --name n8n `
     -p 5678:5678 `
     -e N8N_BASIC_AUTH_ACTIVE=true `
     -e N8N_BASIC_AUTH_USER=admin `
     -e N8N_BASIC_AUTH_PASSWORD=suasenha `
     -v C:\n8n-data:/home/node/.n8n `
     n8nio/n8n
   ```

   Ou instale globalmente:
   ```powershell
   npm install -g n8n
   n8n start
   ```

3. **Configure a API do WhatsApp Business**:
   - Acesse [Meta for Developers](https://developers.facebook.com/)
   - Crie um App e ative o WhatsApp Business API
   - Obtenha o **Token de Acesso** e **Phone Number ID**
   - Configure o webhook apontando para seu N8N

4. **Crie o workflow no N8N**:
   - Acesse N8N em [http://localhost:5678](http://localhost:5678)
   - Crie um novo workflow com os seguintes nós:

   **a) Webhook Node** (Receber mensagens):
   - Type: POST
   - Path: `/webhook/whatsapp`
   - Response Mode: `Respond Immediately`

   **b) Function Node** (Processar mensagem):
   - Extrair dados do usuário (número, mensagem)
   - Buscar contexto do banco de dados (histórico, dados do produtor)

   **c) HTTP Request Node** (Buscar dados da aplicação):
   - Method: GET
   - URL: `http://seu-servidor/api/gardens?user_id={{$json.user_id}}`
   - Authentication: Bearer Token

   **d) OpenAI Node** (Processar com IA):
   - Operation: Create a chat completion
   - Model: gpt-4 ou gpt-3.5-turbo
   - Messages: Incluir contexto do usuário + mensagem

   **e) HTTP Request Node** (Responder via WhatsApp):
   - Method: POST
   - URL: `https://graph.facebook.com/v18.0/{{phoneNumberId}}/messages`
   - Body JSON:
     ```json
     {
       "messaging_product": "whatsapp",
       "to": "{{$json.from}}",
       "text": {
         "body": "{{$json.ai_response}}"
       }
     }
     ```

   **f) Redis Node** (Salvar histórico):
   - Operation: Set
   - Key: `chat:{{$json.user_id}}`
   - Value: Histórico da conversa

5. **Configure as credenciais no N8N**:
   - OpenAI API Key
   - WhatsApp Business Token
   - Credenciais da aplicação web
   - Redis connection string

6. **Teste o workflow**:
   - Salve e ative o workflow
   - Envie uma mensagem via WhatsApp
   - Verifique os logs no N8N

#### Exemplo de mensagem que o bot entende:
```
"Quanto de água devo usar hoje na minha horta de tomates?"
"Qual a previsão de irrigação para os próximos 7 dias?"
"Como está a umidade do solo na zona A?"
```

---

## 🛠 **Tecnologias Utilizadas**

### Aplicação Web:
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **MongoDB** - Banco de dados
- **OpenAI API** - Recomendações inteligentes
- **Axios** - Requisições HTTP

### ESP32/ESP8266:
- **C++/Arduino** - Linguagem de programação
- **ESP8266WiFi** - Conectividade
- **DHT Library** - Sensores
- **ArduinoJson** - Comunicação REST

### Agente de IA:
- **N8N** - Automação e workflows
- **Redis** - Cache e sessões
- **WhatsApp Business API** - Mensageria
- **OpenAI GPT-4** - Processamento de linguagem natural

---

## 📱 **Funcionalidades Principais**

- ✅ Cálculo automático de ETC e ETO
- ✅ Recomendações personalizadas por IA
- ✅ Monitoramento de sensores em tempo real
- ✅ Previsões de irrigação para 7, 30 dias e 6 meses
- ✅ Gestão de múltiplas zonas de cultivo
- ✅ Dashboard responsivo e intuitivo
- ✅ Suporte via WhatsApp com IA
- ✅ Integração com dados climáticos
- ✅ Alertas e notificações inteligentes

---

---

## 👥 **Equipe**

Desenvolvido durante o Hackathon de Inovação Agrícola 2025.

---

## 📄 **Licença**

Este projeto é licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 **Suporte**

Para dúvidas ou suporte, entre em contato via:
- WhatsApp: +55 63 98414-2982
- Agente de IA (WhatsApp): https://wa.me/5563984142982
---

**AgroFlux** - Transformando a gestão da água na agricultura através da tecnologia e inteligência artificial. 🌱💧
