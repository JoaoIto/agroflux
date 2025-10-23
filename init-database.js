// Script para inicializar o banco de dados MongoDB do AgroFlux
// Execute com: node init-database.js

const { MongoClient } = require('mongodb');

// Configuração da URI do MongoDB (mesmo do .env.local)
const MONGODB_URI = 'mongodb://localhost:32768/hackaton-scti-agua';

async function initDatabase() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🌱 INICIALIZAÇÃO DO BANCO DE DADOS AGROFLUX');
  console.log('═══════════════════════════════════════════════════════════\n');

  let client;
  
  try {
    // Conectar ao MongoDB
    console.log('📡 Conectando ao MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    const db = client.db('hackaton-scti-agua');

    // ==================== COLEÇÃO: users ====================
    console.log('👥 Criando coleção: users');
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('   ✓ Índice único criado no campo email');
    
    // Dados de exemplo - Usuário admin
    const usersData = [
      {
        name: 'Admin AgroFlux',
        email: 'admin@agroflux.com',
        password: '$2a$10$YourHashedPasswordHere', // Será necessário criar via /api/auth/register
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const usersCount = await db.collection('users').countDocuments();
    if (usersCount === 0) {
      await db.collection('users').insertMany(usersData);
      console.log('   ✓ Dados de exemplo inseridos\n');
    } else {
      console.log('   ⚠ Coleção já contém dados\n');
    }

    // ==================== COLEÇÃO: cultures ====================
    console.log('🌾 Criando coleção: cultures');
    await db.createCollection('cultures');
    
    const culturesData = [
      {
        name: 'Milho',
        description: 'Cultura de milho para produção de grãos',
        optimal_conditions: {
          temperature_range: [18, 30],
          humidity_range: [60, 80]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Soja',
        description: 'Cultura de soja para produção de grãos',
        optimal_conditions: {
          temperature_range: [20, 30],
          humidity_range: [60, 85]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Trigo',
        description: 'Cultura de trigo para produção de grãos',
        optimal_conditions: {
          temperature_range: [15, 24],
          humidity_range: [50, 70]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Tomate',
        description: 'Cultura de tomate para produção de frutos',
        optimal_conditions: {
          temperature_range: [20, 28],
          humidity_range: [60, 80]
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Alface',
        description: 'Cultura de alface para produção de folhas',
        optimal_conditions: {
          temperature_range: [15, 20],
          humidity_range: [70, 85]
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const culturesCount = await db.collection('cultures').countDocuments();
    if (culturesCount === 0) {
      const culturesResult = await db.collection('cultures').insertMany(culturesData);
      console.log(`   ✓ ${Object.keys(culturesResult.insertedIds).length} culturas inseridas\n`);
    } else {
      console.log('   ⚠ Coleção já contém dados\n');
    }

    // ==================== COLEÇÃO: soil_types ====================
    console.log('🏜️  Criando coleção: soil_types');
    await db.createCollection('soil_types');
    
    const soilTypesData = [
      {
        name: 'Argila',
        description: 'Solo argiloso com boa retenção de água',
        ph_range: [6.0, 7.5],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Arenoso',
        description: 'Solo arenoso com boa drenagem',
        ph_range: [5.5, 7.0],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Argiloso',
        description: 'Solo com textura argilosa',
        ph_range: [6.0, 7.5],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Humífero',
        description: 'Solo rico em matéria orgânica',
        ph_range: [6.0, 7.0],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const soilTypesCount = await db.collection('soil_types').countDocuments();
    if (soilTypesCount === 0) {
      const soilTypesResult = await db.collection('soil_types').insertMany(soilTypesData);
      console.log(`   ✓ ${Object.keys(soilTypesResult.insertedIds).length} tipos de solo inseridos\n`);
    } else {
      console.log('   ⚠ Coleção já contém dados\n');
    }    // ==================== COLEÇÃO: gardens ====================
    console.log('🏞️  Criando coleção: gardens');
    await db.createCollection('gardens');
    
    const gardensData = [
      {
        name: 'Fazenda Grande Produtor',
        description: 'Propriedade para grande produção agrícola',
        type: 'large-producer',
        location: {
          latitude: -23.5505,
          longitude: -46.6333
        },
        area: 250.75, // em hectares
        zones: [],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sítio Pequeno Produtor',
        description: 'Propriedade para agricultura familiar',
        type: 'small-producer',
        location: {
          latitude: -23.5650,
          longitude: -46.6500
        },
        area: 15.5, // em hectares
        zones: [],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    const gardensCount = await db.collection('gardens').countDocuments();
    if (gardensCount === 0) {
      const gardensResult = await db.collection('gardens').insertMany(gardensData);
      console.log(`   ✓ ${Object.keys(gardensResult.insertedIds).length} jardim(s) inserido(s)`);
      console.log('   • Fazenda Grande Produtor (250.75 ha)');
      console.log('   • Sítio Pequeno Produtor (15.5 ha)\n');
    } else {
      console.log('   ⚠ Coleção já contém dados\n');
    }

    // ==================== COLEÇÃO: zones ====================
    console.log('📍 Criando coleção: zones');
    await db.createCollection('zones');
    await db.collection('zones').createIndex({ garden_id: 1 });
    console.log('   ✓ Índice criado no campo garden_id');
    console.log('   ℹ Zonas serão criadas dinamicamente pela aplicação\n');

    // ==================== COLEÇÃO: sensors ====================
    console.log('📡 Criando coleção: sensors');
    await db.createCollection('sensors');
    await db.collection('sensors').createIndex({ zone_id: 1 });
    console.log('   ✓ Índice criado no campo zone_id');
    console.log('   ℹ Sensores serão criados dinamicamente pela aplicação\n');

    // ==================== COLEÇÃO: logs ====================
    console.log('📋 Criando coleção: logs');
    await db.createCollection('logs');
    await db.collection('logs').createIndex({ sensor_id: 1 });
    await db.collection('logs').createIndex({ created_at: -1 });
    console.log('   ✓ Índice criado no campo sensor_id');
    console.log('   ✓ Índice criado no campo created_at (ordem decrescente)');
    console.log('   ℹ Logs serão criados automaticamente pelos sensores\n');

    // ==================== COLEÇÃO: forecasts ====================
    console.log('🌤️  Criando coleção: forecasts');
    await db.createCollection('forecasts');
    await db.collection('forecasts').createIndex({ garden_id: 1, created_at: -1 });
    console.log('   ✓ Índice composto criado (garden_id + created_at)');
    console.log('   ℹ Previsões serão geradas automaticamente\n');

    // ==================== RESUMO ====================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   ✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📊 Resumo das Coleções Criadas:\n');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   • ${collection.name.padEnd(20)} - ${count} documento(s)`);
    }

    console.log('\n📝 Próximos Passos:');
    console.log('   1. Registre um usuário através de /api/auth/register');
    console.log('   2. Faça login através de /api/auth/login');
    console.log('   3. Crie jardins, zonas e sensores através da interface\n');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão fechada.\n');
    }
  }
}

// Executar inicialização
initDatabase().catch(console.error);
