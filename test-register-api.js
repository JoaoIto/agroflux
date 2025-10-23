// Script para testar a API de registro de usuários
// Execute com: node test-register-api.js

const API_BASE_URL = 'http://localhost:3000';

async function testarRegistro() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🧪 TESTE DA API DE REGISTRO');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📡 Testando conexão com o servidor...\n');

  // Teste 1: Verificar se servidor está online
  try {
    console.log('1️⃣  Verificando se servidor está rodando...');
    const healthCheck = await fetch(`${API_BASE_URL}/api/test`);
    
    if (healthCheck.ok) {
      console.log('   ✅ Servidor está online!\n');
    } else {
      console.log('   ⚠️  Servidor respondeu com status:', healthCheck.status, '\n');
    }
  } catch (error) {
    console.log('   ❌ Servidor não está respondendo');
    console.log('   💡 Execute: npm run dev\n');
    return;
  }

  // Teste 2: Fazer registro
  console.log('2️⃣  Tentando registrar usuário...');
  console.log('   Dados:');
  console.log('   - Nome: Produtor1');
  console.log('   - Email: produtor@email.com');
  console.log('   - Senha: 123456\n');

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Produtor1',
        email: 'produtor@email.com',
        password: '123456'
      })
    });

    console.log('   Status HTTP:', response.status);
    console.log('   Status Text:', response.statusText, '\n');

    const data = await response.json();
    
    console.log('3️⃣  Resposta da API:');
    console.log('   ', JSON.stringify(data, null, 2), '\n');

    if (response.ok) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('   ✅ USUÁRIO REGISTRADO COM SUCESSO!');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('📧 Credenciais:');
      console.log('   Email: produtor@email.com');
      console.log('   Senha: 123456\n');
      console.log('🚀 Próximo passo:');
      console.log('   Acesse: http://localhost:3000');
      console.log('   Faça login com as credenciais acima\n');
    } else {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('   ⚠️  ERRO AO REGISTRAR USUÁRIO');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('❌ Erro:', data.error || 'Erro desconhecido\n');
      
      if (data.error === 'User already exists') {
        console.log('💡 O usuário já está cadastrado!');
        console.log('   Opções:');
        console.log('   1. Faça login: http://localhost:3000');
        console.log('   2. Use outro email');
        console.log('   3. Limpe o banco: node init-database.js --force\n');
      }
    }
  } catch (error) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ❌ ERRO DE CONEXÃO');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Erro:', error.message, '\n');
    console.log('💡 Possíveis causas:');
    console.log('   1. Servidor não está rodando (execute: npm run dev)');
    console.log('   2. Porta errada (verifique se é 3000)');
    console.log('   3. MongoDB não está conectado');
    console.log('   4. Erro no código da API\n');
  }
}

testarRegistro();
