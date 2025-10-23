// Script para testar login do usuário criado
const MONGODB_URI = 'mongodb://localhost:32768/agroflux';
const API_BASE_URL = 'http://localhost:3000';

async function testLogin() {
  console.log('🔐 Testando login do usuário criado...\n');

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'produtor@email.com',
        password: '123456'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login realizado com sucesso!');
      console.log('\n📋 Dados retornados:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n🎉 Usuário está funcionando corretamente!\n');
    } else {
      const error = await response.json();
      console.log('❌ Erro no login:', error);
      console.log('\n💡 Verifique se:');
      console.log('   1. O servidor está rodando (npm run dev)');
      console.log('   2. O usuário foi criado (node init-database.js)');
      console.log('   3. As credenciais estão corretas\n');
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com a API:', error.message);
    console.log('\n💡 Execute: npm run dev (em outro terminal)\n');
  }
}

testLogin().catch(console.error);
