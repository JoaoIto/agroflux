// Script para verificar o estado atual do banco de dados
// Execute com: node check-database.js
//
// Opções:
//   node check-database.js              - Verificação completa
//   node check-database.js --quick      - Verificação rápida (apenas contagens)
//   node check-database.js --validate   - Validação de integridade dos dados
//   node check-database.js --json       - Exporta relatório em formato JSON
//   node check-database.js --performance - Análise de performance de queries

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const MONGODB_URI = 'mongodb://localhost:32768/agroflux';
const DB_NAME = 'agroflux';

// Argumentos da linha de comando
const args = process.argv.slice(2);
const quickMode = args.includes('--quick');
const validateMode = args.includes('--validate');
const jsonMode = args.includes('--json');
const performanceMode = args.includes('--performance');

async function checkDatabaseStatus() {
  const startTime = Date.now();
  const report = {
    timestamp: new Date().toISOString(),
    stats: {},
    gardens: [],
    zones: [],
    sensors: [],
    issues: [],
    recommendations: []
  };

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   📊 VERIFICAÇÃO DO BANCO DE DADOS AGROFLUX');
  console.log('   Versão: 3.0 | Data: ' + new Date().toLocaleString('pt-BR'));
  console.log('═══════════════════════════════════════════════════════════\n');

  let client;
    try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');
    
    const db = client.db(DB_NAME);

    // Estatísticas gerais
    report.stats = await printGeneralStats(db);

    if (quickMode) {
      console.log('\n💡 Use sem --quick para ver detalhes completos\n');
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⏱️  Tempo de execução: ${elapsed}s\n`);
      return;
    }

    // Detalhes completos
    const gardens = await db.collection('gardens').find({}).toArray();
    const zones = await db.collection('zones').find({}).toArray();
    const sensors = await db.collection('sensors').find({}).toArray();
    const cultures = await db.collection('cultures').find({}).toArray();
    const soilTypes = await db.collection('soil_types').find({}).toArray();
    const logs = await db.collection('logs').find({}).limit(5).sort({ created_at: -1 }).toArray();
    const forecasts = await db.collection('forecasts').find({}).limit(5).sort({ created_at: -1 }).toArray();

    report.gardens = gardens;
    report.zones = zones;
    report.sensors = sensors;

    await printGardenDetails(gardens, zones, db);
    await printZoneDetails(zones, gardens, cultures, soilTypes, sensors, db);
    await printSensorDetails(sensors, zones, db);
    await printCulturesList(cultures);
    await printSoilTypesList(soilTypes);
    await printRecentLogs(logs);
    await printRecentForecasts(forecasts, gardens);

    // Análise de performance
    if (performanceMode) {
      await performanceAnalysis(db);
    }

    // Validação de integridade
    if (validateMode) {
      const issues = await validateDataIntegrity(db, gardens, zones, sensors);
      report.issues = issues;
    }

    // Resumo final e recomendações
    const recommendations = await printFinalSummary(db, gardens, zones, sensors);
    report.recommendations = recommendations;

    // Exportar relatório JSON se solicitado
    if (jsonMode) {
      const filename = `database-report-${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
      console.log(`\n📄 Relatório exportado: ${filename}\n`);
    }

    // Tempo de execução
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Tempo de execução: ${elapsed}s\n`);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Função para imprimir estatísticas gerais
async function printGeneralStats(db) {
  console.log('📋 ESTATÍSTICAS GERAIS:\n');
  const collections = ['users', 'cultures', 'soil_types', 'gardens', 'zones', 'sensors', 'logs', 'forecasts'];
  
  const stats = {};
  let totalDocs = 0;
  
  for (const collName of collections) {
    try {
      const count = await db.collection(collName).countDocuments();
      stats[collName] = count;
      totalDocs += count;
      const icon = count > 0 ? '✅' : '⚪';
      const sizeInfo = count > 0 ? await getCollectionSize(db, collName) : '';
      console.log(`   ${icon} ${collName.padEnd(15)} ${count.toString().padStart(5)} documento(s) ${sizeInfo}`);
    } catch (error) {
      console.log(`   ❌ ${collName.padEnd(15)} Erro ao acessar`);
    }
  }
  
  console.log(`\n   📦 Total de documentos: ${totalDocs}`);
  
  return stats;
}

// Função auxiliar para obter tamanho da coleção
async function getCollectionSize(db, collName) {
  try {
    const stats = await db.collection(collName).stats();
    const sizeKB = (stats.size / 1024).toFixed(2);
    return `(${sizeKB} KB)`;
  } catch {
    return '';
  }
}

// Função para imprimir detalhes dos gardens
async function printGardenDetails(gardens, zones, db) {
  console.log('\n🏞️  GARDENS (Propriedades):\n');
  
  if (gardens.length === 0) {
    console.log('   ⚠️  Nenhum garden encontrado');
    console.log('   💡 Execute: node init-database.js\n');
    return;
  }

  for (const garden of gardens) {
    const gardenZones = zones.filter(z => z.garden_id === garden._id.toString());
    const totalArea = gardenZones.reduce((sum, z) => sum + (z.area || 0), 0);
    
    console.log(`   📍 ${garden.name}`);
    console.log(`      ID: ${garden._id}`);
    console.log(`      Tipo: ${garden.type || 'não especificado'}`);
    console.log(`      Descrição: ${garden.description || 'N/A'}`);
    console.log(`      Área Total: ${garden.area} ha`);
    console.log(`      Área Utilizada: ${totalArea.toFixed(2)} ha (${((totalArea/garden.area)*100).toFixed(1)}%)`);
    console.log(`      Zonas: ${gardenZones.length}`);
    console.log(`      Localização: ${garden.location.latitude.toFixed(4)}, ${garden.location.longitude.toFixed(4)}`);
    console.log(`      Criado em: ${new Date(garden.created_at).toLocaleDateString('pt-BR')}\n`);
  }
}

// Função para imprimir detalhes das zonas
async function printZoneDetails(zones, gardens, cultures, soilTypes, sensors, db) {
  console.log('📍 ZONAS (Áreas de Plantio):\n');
  
  if (zones.length === 0) {
    console.log('   ⚠️  Nenhuma zona encontrada');
    console.log('   💡 Execute: node add-example-zones.js\n');
    return;
  }

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
    const gardenName = garden ? garden.name : `Garden ID: ${gardenId}`;
    console.log(`   🏞️  ${gardenName}:`);
    
    for (const zone of zonesByGarden[gardenId]) {
      const culture = cultures.find(c => c._id && c._id.toString() === zone.culture);
      const soilType = soilTypes.find(s => s._id && s._id.toString() === zone.soil_type);
      const zoneSensors = sensors.filter(s => s.zone_id === zone._id.toString());
      
      console.log(`      • ${zone.name}`);
      console.log(`        Área: ${zone.area} ha`);
      console.log(`        Cultura: ${culture ? culture.name : 'N/A'}`);
      console.log(`        Solo: ${soilType ? soilType.name : 'N/A'}`);
      console.log(`        Sensores: ${zoneSensors.length}`);
      if (zone.location) {
        console.log(`        Localização: ${zone.location.latitude.toFixed(4)}, ${zone.location.longitude.toFixed(4)}`);
      }
    }
    console.log('');
  }
}

// Função para imprimir detalhes dos sensores
async function printSensorDetails(sensors, zones, db) {
  if (sensors.length === 0) {
    return;
  }

  console.log('📡 SENSORES IOT:\n');
  
  const sensorsByZone = {};
  for (const sensor of sensors) {
    if (!sensorsByZone[sensor.zone_id]) {
      sensorsByZone[sensor.zone_id] = [];
    }
    sensorsByZone[sensor.zone_id].push(sensor);
  }

  for (const zoneId in sensorsByZone) {
    const zone = zones.find(z => z._id.toString() === zoneId);
    const zoneName = zone ? zone.name : `Zone ID: ${zoneId}`;
    console.log(`   📍 ${zoneName}:`);
    
    for (const sensor of sensorsByZone[zoneId]) {
      const statusIcon = sensor.status === 'On' ? '🟢' : '🔴';
      const lastReading = sensor.data && sensor.data.length > 0 ? 
        sensor.data[sensor.data.length - 1].value : 'N/A';
      
      console.log(`      ${statusIcon} ${sensor.name} (${sensor.sensor_type})`);
      console.log(`         Status: ${sensor.status}`);
      console.log(`         Última leitura: ${lastReading}`);
      console.log(`         Total de leituras: ${sensor.data ? sensor.data.length : 0}`);
    }
    console.log('');
  }
}

// Função para imprimir lista de culturas
async function printCulturesList(cultures) {
  console.log('🌾 CULTURAS DISPONÍVEIS:\n');
  
  if (cultures.length === 0) {
    console.log('   ⚠️  Nenhuma cultura encontrada\n');
    return;
  }

  cultures.forEach(culture => {
    const tempRange = culture.optimal_conditions?.temperature_range || [0, 0];
    const humRange = culture.optimal_conditions?.humidity_range || [0, 0];
    console.log(`   • ${culture.name}`);
    console.log(`     Temperatura: ${tempRange[0]}-${tempRange[1]}°C`);
    console.log(`     Umidade: ${humRange[0]}-${humRange[1]}%`);
  });
  console.log('');
}

// Função para imprimir lista de tipos de solo
async function printSoilTypesList(soilTypes) {
  console.log('🏜️  TIPOS DE SOLO DISPONÍVEIS:\n');
  
  if (soilTypes.length === 0) {
    console.log('   ⚠️  Nenhum tipo de solo encontrado\n');
    return;
  }

  soilTypes.forEach(soil => {
    const phRange = soil.ph_range || [0, 0];
    console.log(`   • ${soil.name} (pH: ${phRange[0]}-${phRange[1]})`);
    console.log(`     ${soil.description}`);
  });
  console.log('');
}

// Função para imprimir logs recentes
async function printRecentLogs(logs) {
  if (logs.length === 0) {
    return;
  }

  console.log('📝 LOGS RECENTES (últimos 5):\n');
  
  for (const log of logs) {
    const date = new Date(log.created_at).toLocaleString('pt-BR');
    console.log(`   • [${date}] ${log.message || 'Log sem mensagem'}`);
    if (log.data) {
      console.log(`     Dados: ${JSON.stringify(log.data)}`);
    }
  }
  console.log('');
}

// Função para imprimir previsões recentes
async function printRecentForecasts(forecasts, gardens) {
  if (forecasts.length === 0) {
    return;
  }

  console.log('🌤️  PREVISÕES RECENTES (últimas 5):\n');
  
  for (const forecast of forecasts) {
    const garden = gardens.find(g => g._id.toString() === forecast.garden_id);
    const gardenName = garden ? garden.name : `Garden ID: ${forecast.garden_id}`;
    const date = new Date(forecast.date).toLocaleDateString('pt-BR');
    
    console.log(`   • ${gardenName} - ${date}`);
    if (forecast.temperature) {
      console.log(`     Temperatura: ${forecast.temperature.min}°C - ${forecast.temperature.max}°C`);
    }
    if (forecast.precipitation) {
      console.log(`     Precipitação: ${forecast.precipitation}mm`);
    }
    if (forecast.humidity) {
      console.log(`     Umidade: ${forecast.humidity}%`);
    }
  }
  console.log('');
}

// Função para análise de performance
async function performanceAnalysis(db) {
  console.log('⚡ ANÁLISE DE PERFORMANCE:\n');
  
  const startTime = Date.now();
  
  // Teste 1: Query simples em gardens
  const t1 = Date.now();
  await db.collection('gardens').find({}).toArray();
  const q1Time = Date.now() - t1;
  console.log(`   • Query gardens.find()          : ${q1Time}ms`);
  
  // Teste 2: Query com join (zones + gardens)
  const t2 = Date.now();
  await db.collection('zones').aggregate([
    {
      $lookup: {
        from: 'gardens',
        localField: 'garden_id',
        foreignField: '_id',
        as: 'garden'
      }
    }
  ]).toArray();
  const q2Time = Date.now() - t2;
  console.log(`   • Query zones com lookup        : ${q2Time}ms`);
  
  // Teste 3: Query com índice (zones por garden_id)
  const gardens = await db.collection('gardens').find({}).limit(1).toArray();
  if (gardens.length > 0) {
    const t3 = Date.now();
    await db.collection('zones').find({ garden_id: gardens[0]._id.toString() }).toArray();
    const q3Time = Date.now() - t3;
    console.log(`   • Query zones by garden_id      : ${q3Time}ms`);
  }
  
  // Teste 4: Contagem total
  const t4 = Date.now();
  await db.collection('logs').countDocuments();
  const q4Time = Date.now() - t4;
  console.log(`   • Count logs                    : ${q4Time}ms`);
  
  const totalTime = Date.now() - startTime;
  console.log(`\n   ⏱️  Tempo total de análise: ${totalTime}ms\n`);
  
  // Recomendações de performance
  if (q2Time > 100) {
    console.log('   ⚠️  ATENÇÃO: Query com lookup está lenta. Considere criar índices.\n');
  } else {
    console.log('   ✅ Performance das queries está adequada.\n');
  }
}

// Função para validar integridade dos dados
async function validateDataIntegrity(db, gardens, zones, sensors) {
  console.log('🔍 VALIDAÇÃO DE INTEGRIDADE DOS DADOS:\n');
  
  let issues = 0;

  // Validar referências de zonas para gardens
  for (const zone of zones) {
    const garden = gardens.find(g => g._id.toString() === zone.garden_id);
    if (!garden) {
      console.log(`   ⚠️  Zona "${zone.name}" referencia garden inexistente: ${zone.garden_id}`);
      issues++;
    }
  }

  // Validar referências de sensores para zonas
  for (const sensor of sensors) {
    const zone = zones.find(z => z._id.toString() === sensor.zone_id);
    if (!zone) {
      console.log(`   ⚠️  Sensor "${sensor.name}" referencia zona inexistente: ${sensor.zone_id}`);
      issues++;
    }
  }

  // Validar arrays de zones em gardens
  for (const garden of gardens) {
    if (garden.zones && garden.zones.length > 0) {
      const actualZones = zones.filter(z => z.garden_id === garden._id.toString()).length;
      if (garden.zones.length !== actualZones) {
        console.log(`   ⚠️  Garden "${garden.name}" tem inconsistência na contagem de zonas`);
        console.log(`       Declarado: ${garden.zones.length}, Real: ${actualZones}`);
        issues++;
      }
    }
  }

  if (issues === 0) {
    console.log('   ✅ Nenhum problema de integridade encontrado\n');
  } else {
    console.log(`\n   ⚠️  Total de problemas encontrados: ${issues}\n`);
  }
}

// Função para imprimir resumo final e recomendações
async function printFinalSummary(db, gardens, zones, sensors) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ✅ VERIFICAÇÃO CONCLUÍDA');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Calcular estatísticas
  const totalArea = gardens.reduce((sum, g) => sum + g.area, 0);
  const usedArea = zones.reduce((sum, z) => sum + (z.area || 0), 0);
  const activeSensors = sensors.filter(s => s.status === 'On').length;

  console.log('📈 RESUMO:');
  console.log(`   • Gardens: ${gardens.length}`);
  console.log(`   • Área Total: ${totalArea.toFixed(2)} ha`);
  console.log(`   • Área Utilizada: ${usedArea.toFixed(2)} ha (${((usedArea/totalArea)*100).toFixed(1)}%)`);
  console.log(`   • Zonas: ${zones.length}`);
  console.log(`   • Sensores: ${sensors.length} (${activeSensors} ativos)`);
  console.log('');

  // Recomendações
  console.log('💡 PRÓXIMOS PASSOS:\n');
  
  if (gardens.length === 0) {
    console.log('   1. Execute: node init-database.js');
    console.log('      → Criar gardens e dados base\n');
  } else if (zones.length === 0) {
    console.log('   1. Execute: node add-example-zones.js');
    console.log('      → Adicionar zonas de plantio\n');
  } else if (sensors.length === 0) {
    console.log('   1. Adicione sensores via API ou interface');
    console.log('      → POST /api/sensors\n');
  } else {
    console.log('   ✅ Banco de dados pronto para uso!\n');
    console.log('   📝 Sugestões:');
    console.log('   1. Acesse: http://localhost:3000');
    console.log('   2. Registre usuário: POST /api/auth/register');
    console.log('   3. Faça login: POST /api/auth/login');
    console.log('   4. Explore os dashboards!\n');
  }

  console.log('🔧 COMANDOS ÚTEIS:');
  console.log('   node check-database.js --quick      → Verificação rápida');
  console.log('   node check-database.js --validate   → Validar integridade');
  console.log('   node init-database.js --force       → Reiniciar banco');
  console.log('   node init-database.js --clean       → Limpar dados\n');
}

checkDatabaseStatus().catch(console.error);
