// Script para verificar o estado atual do banco de dados
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:32768/hackaton-scti-agua';

async function checkDatabaseStatus() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   📊 VERIFICAÇÃO DO BANCO DE DADOS AGROFLUX');
  console.log('═══════════════════════════════════════════════════════════\n');

  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');
    
    const db = client.db('hackaton-scti-agua');

    // Estatísticas gerais
    console.log('📋 ESTATÍSTICAS GERAIS:\n');
    const collections = ['users', 'cultures', 'soil_types', 'gardens', 'zones', 'sensors', 'logs', 'forecasts'];
    
    for (const collName of collections) {
      const count = await db.collection(collName).countDocuments();
      const icon = count > 0 ? '✅' : '⚪';
      console.log(`   ${icon} ${collName.padEnd(15)} ${count} documento(s)`);
    }

    // Detalhes dos Gardens
    console.log('\n🏞️  GARDENS (Propriedades):\n');
    const gardens = await db.collection('gardens').find({}).toArray();
    
    if (gardens.length === 0) {
      console.log('   ⚠️  Nenhum garden encontrado\n');
    } else {
      for (const garden of gardens) {
        console.log(`   📍 ${garden.name}`);
        console.log(`      ID: ${garden._id}`);
        console.log(`      Tipo: ${garden.type || 'não especificado'}`);
        console.log(`      Área: ${garden.area} ha`);
        console.log(`      Zonas: ${garden.zones ? garden.zones.length : 0}`);
        console.log(`      Localização: ${garden.location.latitude}, ${garden.location.longitude}\n`);
      }
    }

    // Detalhes das Zonas
    console.log('📍 ZONAS (Áreas de Plantio):\n');
    const zones = await db.collection('zones').find({}).toArray();
    
    if (zones.length === 0) {
      console.log('   ⚠️  Nenhuma zona encontrada\n');
    } else {
      // Agrupar zonas por garden
      const zonesByGarden = {};
      for (const zone of zones) {
        if (!zonesByGarden[zone.garden_id]) {
          zonesByGarden[zone.garden_id] = [];
        }
        zonesByGarden[zone.garden_id].push(zone);
      }

      for (const gardenId in zonesByGarden) {
        const garden = gardens.find(g => g._id.toString() === gardenId);
        console.log(`   🏞️  ${garden ? garden.name : 'Garden não encontrado'}:`);
        
        for (const zone of zonesByGarden[gardenId]) {
          const culture = await db.collection('cultures').findOne({ _id: zone.culture });
          console.log(`      • ${zone.name} (${zone.area} ha)`);
          console.log(`        Cultura: ${culture ? culture.name : 'N/A'}`);
        }
        console.log('');
      }
    }

    // Culturas disponíveis
    console.log('🌾 CULTURAS DISPONÍVEIS:\n');
    const cultures = await db.collection('cultures').find({}).toArray();
    cultures.forEach(culture => {
      console.log(`   • ${culture.name}`);
      console.log(`     Temperatura: ${culture.optimal_conditions.temperature_range[0]}-${culture.optimal_conditions.temperature_range[1]}°C`);
      console.log(`     Umidade: ${culture.optimal_conditions.humidity_range[0]}-${culture.optimal_conditions.humidity_range[1]}%`);
    });

    // Tipos de solo
    console.log('\n🏜️  TIPOS DE SOLO DISPONÍVEIS:\n');
    const soilTypes = await db.collection('soil_types').find({}).toArray();
    soilTypes.forEach(soil => {
      console.log(`   • ${soil.name} (pH: ${soil.ph_range[0]}-${soil.ph_range[1]})`);
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   ✅ VERIFICAÇÃO CONCLUÍDA');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Recomendações
    if (gardens.length === 0) {
      console.log('💡 RECOMENDAÇÃO: Execute "node init-database.js" para criar gardens iniciais\n');
    } else if (zones.length === 0) {
      console.log('💡 RECOMENDAÇÃO: Execute "node add-example-zones.js" para criar zonas de exemplo\n');
    } else {
      console.log('🎯 STATUS: Banco de dados pronto para uso!\n');
      console.log('📝 Próximos passos:');
      console.log('   1. Acesse http://localhost:3000');
      console.log('   2. Registre um usuário em /api/auth/register');
      console.log('   3. Faça login em /api/auth/login');
      console.log('   4. Comece a monitorar seus jardins!\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkDatabaseStatus().catch(console.error);
