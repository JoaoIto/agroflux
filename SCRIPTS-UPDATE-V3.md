# 🔄 Scripts AgroFlux - Atualização v3.0

## 📋 Resumo das Atualizações

Todos os scripts foram atualizados para usar a nova configuração do MongoDB:

### ✅ Alterações Globais

**URI MongoDB:**
- **Antes:** `mongodb://localhost:32768/hackaton-scti-agua`
- **Depois:** `mongodb://localhost:27017/agroflux`

**Nome do Banco:**
- **Antes:** `hackaton-scti-agua`
- **Depois:** `agroflux`

---

## 📁 Arquivos Atualizados

### 1. **init-database.js** v3.0
**Principais mudanças:**
- ✅ URI atualizada para `mongodb://localhost:27017/agroflux`
- ✅ Criação de usuário via API `/api/auth/register` (em vez de inserção direta)
- ✅ Credenciais do usuário padrão:
  ```
  Nome: Produtor1
  Email: produtor@email.com
  Senha: 123456
  ```
- ✅ Tratamento de erro caso o servidor Next.js não esteja rodando
- ✅ Mensagens mais claras e instruções de uso

**Como usar:**
```powershell
# Certificar que o servidor está rodando
npm run dev

# Em outro terminal, executar o script
node init-database.js

# Opções disponíveis:
node init-database.js --force   # Limpa e recria tudo
node init-database.js --clean   # Apenas limpa o banco
node init-database.js --seed    # Cria dados completos
```

---

### 2. **check-database.js** v3.0
**Principais mudanças:**
- ✅ URI atualizada para `mongodb://localhost:27017/agroflux`
- ✅ Adicionado timer de execução
- ✅ Opção para exportar relatório JSON
- ✅ Análise de performance de queries
- ✅ Exibição de tamanho das coleções em KB

**Novas opções:**
```powershell
node check-database.js              # Verificação completa
node check-database.js --quick      # Verificação rápida
node check-database.js --validate   # Validação de integridade
node check-database.js --json       # Exporta relatório JSON
node check-database.js --performance # Análise de performance
```

**Relatório JSON gerado:**
- Arquivo: `database-report-YYYY-MM-DD.json`
- Contém: stats, gardens, zones, sensors, issues, recommendations

---

### 3. **add-example-zones.js** v3.0
**Principais mudanças:**
- ✅ URI atualizada para `mongodb://localhost:27017/agroflux`
- ✅ Nome do banco atualizado para `agroflux`

**Como usar:**
```powershell
node add-example-zones.js
```

---

### 4. **reinit-gardens.js** v3.0
**Principais mudanças:**
- ✅ URI atualizada para `mongodb://localhost:27017/agroflux`
- ✅ Nome do banco atualizado para `agroflux`

**Como usar:**
```powershell
node reinit-gardens.js
```

---

## 🚀 Fluxo de Inicialização Recomendado

### **Setup Completo do Zero:**

```powershell
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor Next.js (necessário para criar usuário)
npm run dev

# 3. Em outro terminal, inicializar o banco
node init-database.js

# 4. Adicionar zonas de exemplo
node add-example-zones.js

# 5. Verificar status do banco
node check-database.js

# 6. Acessar a aplicação
# http://localhost:3000
```

---

## 📊 Estrutura de Usuário Criado

Quando você executa `node init-database.js`, o script faz uma requisição para:

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Body:**
```json
{
  "name": "Produtor1",
  "email": "produtor@email.com",
  "password": "123456"
}
```

**Resposta de sucesso:**
```json
{
  "message": "User registered successfully"
}
```

---

## ⚠️ Requisitos Importantes

### **Para `init-database.js` funcionar corretamente:**

1. ✅ MongoDB rodando em `localhost:27017`
2. ✅ Servidor Next.js rodando em `localhost:3000` (para criar usuário)
3. ✅ Dependências instaladas (`npm install`)

### **Se o servidor não estiver rodando:**

Você verá a mensagem:
```
❌ Erro ao conectar com a API: [erro]
💡 Execute: npm run dev (em outro terminal)
```

---

## 🔧 Troubleshooting

### **Problema: Erro de conexão com MongoDB**
```powershell
# Verificar se MongoDB está rodando
mongosh mongodb://localhost:27017

# Ou iniciar MongoDB (se instalado localmente)
mongod
```

### **Problema: Erro ao criar usuário**
```powershell
# Verificar se o servidor está rodando
curl http://localhost:3000/api/test
```

### **Problema: Usuário já existe**
```powershell
# Limpar banco e recriar
node init-database.js --force
```

---

## 📈 Melhorias da v3.0

### **check-database.js:**
- 📊 Estatísticas de tamanho de coleções
- ⏱️ Timer de execução
- 📄 Exportação de relatório JSON
- ⚡ Análise de performance
- 🔍 Validação de integridade aprimorada

### **init-database.js:**
- 🔐 Criação de usuário via API (hash seguro com bcrypt)
- 🌐 Integração com servidor Next.js
- 📝 Mensagens de erro mais claras
- ✅ Validação de servidor rodando

---

## 📝 Próximos Passos Após Inicialização

1. **Login na aplicação:**
   ```
   Email: produtor@email.com
   Senha: 123456
   ```

2. **Endpoints disponíveis:**
   - `GET /api/gardens` - Listar gardens
   - `GET /api/zones` - Listar zonas
   - `GET /api/cultures` - Listar culturas
   - `GET /api/sensors` - Listar sensores (requer auth)
   - `POST /api/auth/login` - Fazer login

3. **Dashboards:**
   - `/large-producer` - Dashboard do Grande Produtor
   - `/small-producer` - Dashboard do Pequeno Produtor

---

## 📞 Suporte

Para mais informações sobre os scripts:
```powershell
node check-database.js --help
node init-database.js --help
```

---

**Versão:** 3.0  
**Data:** Outubro 2025  
**Compatibilidade:** Node.js 18+, MongoDB 6+, Next.js 15+
