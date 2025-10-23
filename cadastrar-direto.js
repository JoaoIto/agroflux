// Script para cadastrar usuário diretamente no MongoDB (sem usar API)
// Execute com: node cadastrar-direto.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:32768/agroflux';
const DB_NAME = 'agroflux';

async function cadastrarUsuarioDireto() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   👤 CADASTRO DIRETO NO MONGODB');
  console.log('   (Sem precisar do servidor Next.js)');
  console.log('═══════════════════════════════════════════════════════════\n');

  let client;

  try {
    // Conectar ao MongoDB
    console.log('📡 Conectando ao MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    const db = client.db(DB_NAME);

    // Verificar se usuário já existe
    console.log('🔍 Verificando se usuário já existe...');
    const existingUser = await db.collection('users').findOne({ 
      email: 'produtor@email.com' 
    });

    if (existingUser) {
      console.log('⚠️  Usuário já existe!\n');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Nome:', existingUser.name);
      console.log('🆔 ID:', existingUser._id, '\n');
      console.log('💡 Para cadastrar novamente, execute:');
      console.log('   node init-database.js --force\n');
      return;
    }

    console.log('✅ Email disponível!\n');

    // Criar índice único no email (se não existir)
    console.log('📝 Criando índice único no campo email...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Índice criado!\n');

    // Criptografar senha
    console.log('🔐 Criptografando senha...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log('✅ Senha criptografada!\n');

    // Inserir usuário
    console.log('💾 Inserindo usuário no banco...');
    const result = await db.collection('users').insertOne({
      name: 'Produtor1',
      email: 'produtor@email.com',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Usuário inserido com sucesso!\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ✅ USUÁRIO CADASTRADO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📋 Detalhes do usuário:');
    console.log('   🆔 ID:', result.insertedId);
    console.log('   👤 Nome: Produtor1');
    console.log('   📧 Email: produtor@email.com');
    console.log('   🔑 Senha: 123456 (criptografada com bcrypt)');
    console.log('   📅 Criado em:', new Date().toLocaleString('pt-BR'), '\n');

    console.log('🚀 Próximos passos:');
    console.log('   1. Execute: npm run dev');
    console.log('   2. Acesse: http://localhost:3000');
    console.log('   3. Faça login com:');
    console.log('      Email: produtor@email.com');
    console.log('      Senha: 123456\n');

    // Verificar total de usuários
    const totalUsers = await db.collection('users').countDocuments();
    console.log('📊 Total de usuários cadastrados:', totalUsers, '\n');

  } catch (error) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ❌ ERRO AO CADASTRAR USUÁRIO');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.error('Erro:', error.message, '\n');

    if (error.code === 11000) {
      console.log('💡 Usuário já existe (email duplicado)');
      console.log('   Solução: node init-database.js --force\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB não está rodando');
      console.log('   Verifique se MongoDB está ativo na porta 32768\n');
    } else {
      console.log('💡 Erro inesperado. Detalhes:\n');
      console.error(error);
    }
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão fechada.\n');
    }
  }
}

// Executar
cadastrarUsuarioDireto();
