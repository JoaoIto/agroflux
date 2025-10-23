// Script para inicializar o banco de dados MongoDB do AgroFlux
// Execute com: node init-database.js
// 
// Opções:
//   node init-database.js           - Inicialização normal (não sobrescreve dados)
//   node init-database.js --force   - Limpa e recria tudo
//   node init-database.js --clean   - Apenas limpa o banco
//   node init-database.js --seed    - Criar dados de exemplo completos (zones, sensors, logs)

const { MongoClient } = require('mongodb');

// Configuração da URI do MongoDB (mesmo do .env.local)
const MONGODB_URI = 'mongodb://localhost:32768/agroflux';
const DB_NAME = 'agroflux';
const API_BASE_URL = 'http://localhost:3000';

// Argumentos da linha de comando
const args = process.argv.slice(2);
const forceMode = args.includes('--force');
const cleanMode = args.includes('--clean');
const seedMode = args.includes('--seed');

async function initDatabase() {
  const startTime = Date.now();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🌱 INICIALIZAÇÃO DO BANCO DE DADOS AGROFLUX');
  console.log('   Versão: 3.0 | Data: ' + new Date().toLocaleDateString('pt-BR'));
  console.log('═══════════════════════════════════════════════════════════\n');

  if (forceMode) {
    console.log('⚠️  MODO FORCE: Todos os dados existentes serão removidos!\n');
  } else if (cleanMode) {
    console.log('🗑️  MODO CLEAN: Apenas limpando banco de dados...\n');
  } else if (seedMode) {
    console.log('🌾 MODO SEED: Criando dados de exemplo completos...\n');
  }

  let client;
    try {
    // Conectar ao MongoDB
    console.log('📡 Conectando ao MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    const db = client.db(DB_NAME);

    // Se modo clean, apenas limpar e sair
    if (cleanMode) {
      await cleanDatabase(db);
      return;
    }

    // Se modo force, limpar antes de criar
    if (forceMode) {
      await cleanDatabase(db);
    }    // ==================== COLEÇÃO: users ====================
    console.log('👥 Criando coleção: users');
    await db.createCollection('users').catch(() => {});
    await db.collection('users').createIndex({ email: 1 }, { unique: true }).catch(() => {});
    console.log('   ✓ Índice único criado no campo email');
    
    // Criar usuário via API /api/auth/register
    const usersCount = await db.collection('users').countDocuments();
    if (usersCount === 0) {
      console.log('   ℹ Criando usuário via API /api/auth/register...');
      
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

        const data = await response.json();

        if (response.ok) {
          console.log('   ✓ Usuário criado com sucesso!');
          console.log('   📧 Email: produtor@email.com');
          console.log('   🔑 Senha: 123456\n');
        } else {
          console.log(`   ⚠️  Erro ao criar usuário via API: ${data.error || 'Unknown error'}`);
          console.log('   💡 Certifique-se de que o servidor está rodando em http://localhost:3000\n');
        }
      } catch (error) {
        console.log('   ❌ Erro ao conectar com a API:', error.message);
        console.log('   💡 Execute: npm run dev (em outro terminal)');
        console.log('   💡 Ou o servidor pode estar usando outra porta\n');
      }
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

    // ==================== SEED DE DADOS COMPLETOS ====================
    if (seedMode || forceMode) {
      await seedCompleteData(db);
    }

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

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Tempo de execução: ${elapsed}s\n`);    console.log('📝 Próximos Passos:');
    if (seedMode || forceMode) {
      console.log('   ✅ Banco completo com dados de exemplo!');
      console.log('   1. Execute: npm run dev');
      console.log('   2. Acesse: http://localhost:3000');
      console.log('   3. Login: produtor@email.com / 123456\n');
    } else {
      console.log('   1. Execute: node init-database.js --seed (dados completos)');
      console.log('   2. Execute: node add-example-zones.js (apenas zonas)');
      console.log('   3. Acesse: http://localhost:3000');
      console.log('   4. Login: produtor@email.com / 123456\n');
    }

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

// Função para limpar o banco de dados
async function cleanDatabase(db) {
  console.log('🗑️  Limpando banco de dados...\n');
  
  const collections = ['users', 'cultures', 'soil_types', 'gardens', 'zones', 'sensors', 'logs', 'forecasts'];
  
  for (const collName of collections) {
    try {
      const count = await db.collection(collName).countDocuments();
      if (count > 0) {
        await db.collection(collName).deleteMany({});
        console.log(`   ✓ ${collName}: ${count} documento(s) removido(s)`);
      } else {
        console.log(`   • ${collName}: vazia`);
      }
    } catch (error) {
      console.log(`   ⚠ ${collName}: coleção não existe`);
    }
  }
  
  console.log('\n✅ Limpeza concluída!\n');
}

// Função para criar dados completos de exemplo (seed)
async function seedCompleteData(db) {
  console.log('\n🌾 CRIANDO DADOS DE EXEMPLO COMPLETOS...\n');
  
  // Obter gardens criados
  const gardens = await db.collection('gardens').find({}).toArray();
  if (gardens.length === 0) {
    console.log('   ⚠️  Nenhum garden encontrado. Execute sem --seed primeiro.\n');
    return;
  }

  // Obter cultures e soil_types
  const cultures = await db.collection('cultures').find({}).toArray();
  const soilTypes = await db.collection('soil_types').find({}).toArray();

  // Criar zonas para cada garden
  const zonesData = [];
  const largeProducerGarden = gardens.find(g => g.type === 'large-producer');
  const smallProducerGarden = gardens.find(g => g.type === 'small-producer');

  if (largeProducerGarden) {
    const milho = cultures.find(c => c.name === 'Milho');
    const soja = cultures.find(c => c.name === 'Soja');
    const trigo = cultures.find(c => c.name === 'Trigo');
    const soilArgila = soilTypes.find(s => s.name === 'Argila');

    zonesData.push(
      {
        garden_id: largeProducerGarden._id.toString(),
        name: 'Zona Norte - Milho',
        area: 80,
        culture: milho._id.toString(),
        soil_type: soilArgila._id.toString(),
        location: {
          latitude: -23.5505,
          longitude: -46.6333
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        garden_id: largeProducerGarden._id.toString(),
        name: 'Zona Sul - Soja',
        area: 95.5,
        culture: soja._id.toString(),
        soil_type: soilArgila._id.toString(),
        location: {
          latitude: -23.5510,
          longitude: -46.6335
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        garden_id: largeProducerGarden._id.toString(),
        name: 'Zona Leste - Trigo',
        area: 75.25,
        culture: trigo._id.toString(),
        soil_type: soilArgila._id.toString(),
        location: {
          latitude: -23.5515,
          longitude: -46.6340
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    );
  }

  if (smallProducerGarden) {
    const tomate = cultures.find(c => c.name === 'Tomate');
    const alface = cultures.find(c => c.name === 'Alface');
    const milho = cultures.find(c => c.name === 'Milho');
    const soilHumifero = soilTypes.find(s => s.name === 'Humífero');

    zonesData.push(
      {
        garden_id: smallProducerGarden._id.toString(),
        name: 'Horta de Tomates',
        area: 5.5,
        culture: tomate._id.toString(),
        soil_type: soilHumifero._id.toString(),
        location: {
          latitude: -23.5650,
          longitude: -46.6500
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        garden_id: smallProducerGarden._id.toString(),
        name: 'Canteiro de Alface',
        area: 3,
        culture: alface._id.toString(),
        soil_type: soilHumifero._id.toString(),
        location: {
          latitude: -23.5655,
          longitude: -46.6505
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        garden_id: smallProducerGarden._id.toString(),
        name: 'Área de Milho',
        area: 7,
        culture: milho._id.toString(),
        soil_type: soilHumifero._id.toString(),
        location: {
          latitude: -23.5660,
          longitude: -46.6510
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    );
  }

  // Inserir zonas
  const zonesResult = await db.collection('zones').insertMany(zonesData);
  console.log(`   ✓ ${Object.keys(zonesResult.insertedIds).length} zonas criadas`);

  // Criar sensores para cada zona
  const sensorsData = [];
  const insertedZones = await db.collection('zones').find({}).toArray();

  for (const zone of insertedZones) {
    // Criar 3 sensores por zona: umidade do solo, temperatura, umidade do ar
    sensorsData.push(
      {
        zone_id: zone._id.toString(),
        name: `Sensor Umidade Solo - ${zone.name}`,
        sensor_type: 'Umidade do Solo',
        status: 'On',
        data: generateSensorData('humidity', 30),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        zone_id: zone._id.toString(),
        name: `Sensor Temperatura - ${zone.name}`,
        sensor_type: 'Temperatura',
        status: 'On',
        data: generateSensorData('temperature', 30),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        zone_id: zone._id.toString(),
        name: `Sensor Umidade Ar - ${zone.name}`,
        sensor_type: 'Umidade do Ar',
        status: 'On',
        data: generateSensorData('air_humidity', 30),
        created_at: new Date(),
        updated_at: new Date()
      }
    );
  }

  const sensorsResult = await db.collection('sensors').insertMany(sensorsData);
  console.log(`   ✓ ${Object.keys(sensorsResult.insertedIds).length} sensores criados`);

  // Criar logs de exemplo
  const logsData = [];
  const insertedSensors = await db.collection('sensors').find({}).limit(5).toArray();

  for (const sensor of insertedSensors) {
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      
      logsData.push({
        sensor_id: sensor._id.toString(),
        message: `Leitura automática do sensor ${sensor.name}`,
        data: {
          value: sensor.data && sensor.data.length > 0 ? sensor.data[0].value : 0,
          unit: sensor.sensor_type === 'Temperatura' ? '°C' : '%'
        },
        created_at: date
      });
    }
  }

  if (logsData.length > 0) {
    const logsResult = await db.collection('logs').insertMany(logsData);
    console.log(`   ✓ ${Object.keys(logsResult.insertedIds).length} logs criados`);
  }

  // Criar previsões de exemplo
  const forecastsData = [];
  for (const garden of gardens) {
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecastsData.push({
        garden_id: garden._id.toString(),
        date: date,
        temperature: {
          min: 15 + Math.floor(Math.random() * 5),
          max: 25 + Math.floor(Math.random() * 5)
        },
        precipitation: Math.floor(Math.random() * 20),
        humidity: 60 + Math.floor(Math.random() * 20),
        wind_speed: 5 + Math.floor(Math.random() * 10),
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  const forecastsResult = await db.collection('forecasts').insertMany(forecastsData);
  console.log(`   ✓ ${Object.keys(forecastsResult.insertedIds).length} previsões criadas\n`);
}

// Função auxiliar para gerar dados de sensor
function generateSensorData(type, count) {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);
    
    let value;
    switch (type) {
      case 'temperature':
        value = 20 + Math.random() * 10; // 20-30°C
        break;
      case 'humidity':
        value = 50 + Math.random() * 30; // 50-80%
        break;
      case 'air_humidity':
        value = 60 + Math.random() * 25; // 60-85%
        break;
      default:
        value = Math.random() * 100;
    }
    
    data.push({
      value: parseFloat(value.toFixed(2)),
      timestamp: date
    });
  }
  
  return data.reverse(); // Mais antigo primeiro
}

// Executar inicialização
initDatabase().catch(console.error);
