// Script para adicionar zonas de exemplo para cada tipo de produtor
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/agroflux';
const DB_NAME = 'agroflux';

async function addExampleZones() {
  console.log('📍 Adicionando zonas de exemplo...\n');

  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);

    // Buscar gardens
    const gardens = await db.collection('gardens').find({}).toArray();
    const largeProducer = gardens.find(g => g.type === 'large-producer');
    const smallProducer = gardens.find(g => g.type === 'small-producer');

    // Buscar cultures e soil types
    const cultures = await db.collection('cultures').find({}).toArray();
    const soilTypes = await db.collection('soil_types').find({}).toArray();

    const milho = cultures.find(c => c.name === 'Milho');
    const soja = cultures.find(c => c.name === 'Soja');
    const tomate = cultures.find(c => c.name === 'Tomate');
    const alface = cultures.find(c => c.name === 'Alface');
    
    const argila = soilTypes.find(s => s.name === 'Argila');
    const arenoso = soilTypes.find(s => s.name === 'Arenoso');
    const humifero = soilTypes.find(s => s.name === 'Humífero');

    // Limpar zonas existentes
    await db.collection('zones').deleteMany({});

    // ==================== ZONAS PARA GRANDE PRODUTOR ====================
    console.log('🏞️  Criando zonas para Grande Produtor...');
    const largeProducerZones = [
      {
        garden_id: largeProducer._id.toString(),
        name: 'Zona Norte - Milho',
        location: {
          latitude: -23.5500,
          longitude: -46.6330
        },
        area: 80.0,
        culture: milho._id.toString(),
        soil_type: argila._id.toString(),
        sensors: [],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        garden_id: largeProducer._id.toString(),
        name: 'Zona Sul - Soja',
        location: {
          latitude: -23.5510,
          longitude: -46.6336
        },
        area: 95.5,
        culture: soja._id.toString(),
        soil_type: arenoso._id.toString(),
        sensors: [],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        garden_id: largeProducer._id.toString(),
        name: 'Zona Leste - Trigo',
        location: {
          latitude: -23.5505,
          longitude: -46.6320
        },
        area: 75.25,
        culture: cultures.find(c => c.name === 'Trigo')._id.toString(),
        soil_type: argila._id.toString(),
        sensors: [],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const largeZonesResult = await db.collection('zones').insertMany(largeProducerZones);
    console.log(`   ✓ ${Object.keys(largeZonesResult.insertedIds).length} zonas criadas`);
    console.log('   • Zona Norte - Milho (80 ha)');
    console.log('   • Zona Sul - Soja (95.5 ha)');
    console.log('   • Zona Leste - Trigo (75.25 ha)\n');

    // ==================== ZONAS PARA PEQUENO PRODUTOR ====================
    console.log('🌱 Criando zonas para Pequeno Produtor...');
    const smallProducerZones = [
      {
        garden_id: smallProducer._id.toString(),
        name: 'Horta de Tomates',
        location: {
          latitude: -23.5650,
          longitude: -46.6500
        },
        area: 5.5,
        culture: tomate._id.toString(),
        soil_type: humifero._id.toString(),
        sensors: [],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        garden_id: smallProducer._id.toString(),
        name: 'Canteiro de Alface',
        location: {
          latitude: -23.5655,
          longitude: -46.6505
        },
        area: 3.0,
        culture: alface._id.toString(),
        soil_type: humifero._id.toString(),
        sensors: [],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        garden_id: smallProducer._id.toString(),
        name: 'Área de Milho',
        location: {
          latitude: -23.5645,
          longitude: -46.6495
        },
        area: 7.0,
        culture: milho._id.toString(),
        soil_type: argila._id.toString(),
        sensors: [],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const smallZonesResult = await db.collection('zones').insertMany(smallProducerZones);
    console.log(`   ✓ ${Object.keys(smallZonesResult.insertedIds).length} zonas criadas`);
    console.log('   • Horta de Tomates (5.5 ha)');
    console.log('   • Canteiro de Alface (3 ha)');
    console.log('   • Área de Milho (7 ha)\n');

    // Atualizar gardens com as zonas
    const largeZoneIds = Object.values(largeZonesResult.insertedIds).map(id => id.toString());
    const smallZoneIds = Object.values(smallZonesResult.insertedIds).map(id => id.toString());

    await db.collection('gardens').updateOne(
      { _id: largeProducer._id },
      { $set: { zones: largeZoneIds, updated_at: new Date() } }
    );

    await db.collection('gardens').updateOne(
      { _id: smallProducer._id },
      { $set: { zones: smallZoneIds, updated_at: new Date() } }
    );

    console.log('🔗 Gardens atualizados com as zonas');

    // Resumo
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   ✅ ZONAS CRIADAS COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📊 Resumo:');
    console.log(`   Grande Produtor: ${largeProducerZones.length} zonas (${largeProducerZones.reduce((sum, z) => sum + z.area, 0)} ha)`);
    console.log(`   Pequeno Produtor: ${smallProducerZones.length} zonas (${smallProducerZones.reduce((sum, z) => sum + z.area, 0)} ha)\n`);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

addExampleZones().catch(console.error);
