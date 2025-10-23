// Script para limpar e reinicializar apenas a coleção gardens
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:32768/hackaton-scti-agua';

async function reinitGardens() {
  console.log('🔄 Reinicializando coleção gardens...\n');

  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('hackaton-scti-agua');

    // Limpar coleção gardens
    console.log('🗑️  Removendo gardens antigos...');
    await db.collection('gardens').deleteMany({});
    console.log('   ✓ Coleção limpa\n');

    // Inserir novos gardens
    console.log('🏞️  Criando novos gardens...');
    const gardensData = [
      {
        name: 'Fazenda Grande Produtor',
        description: 'Propriedade para grande produção agrícola',
        type: 'large-producer',
        location: {
          latitude: -23.5505,
          longitude: -46.6333
        },
        area: 250.75,
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
        area: 15.5,
        zones: [],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const result = await db.collection('gardens').insertMany(gardensData);
    console.log(`   ✓ ${Object.keys(result.insertedIds).length} gardens criados:`);
    console.log('   • Fazenda Grande Produtor (250.75 ha)');
    console.log('   • Sítio Pequeno Produtor (15.5 ha)\n');

    // Mostrar IDs
    console.log('📋 IDs dos Gardens:');
    const gardens = await db.collection('gardens').find({}).toArray();
    gardens.forEach(garden => {
      console.log(`   • ${garden.name}: ${garden._id}`);
    });

    console.log('\n✅ Reinicialização concluída com sucesso!\n');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

reinitGardens().catch(console.error);
