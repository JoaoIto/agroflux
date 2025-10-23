// AgroFlux - Servidor API REST no ESP8266
// Hardware: ESP8266 (NodeMCU/Wemos D1 Mini)
// Funcionalidade: API REST local para controlar sensores e bomba

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHTesp.h>

// ===== CONFIGURAÇÕES WIFI =====
const char* ssid = "SCTI_2025";
const char* password = "uniscti25";

// ===== PINAGEM =====
#define PIN_SOIL A0
#define PIN_RELAY D1
#define PIN_DHT D4

// ===== CONFIGURAÇÃO =====
const bool releAtivoEmLow = true;
int soilDryADC = 800;
int soilWetADC = 400;

// ===== OBJETOS =====
ESP8266WebServer server(80);  // Servidor HTTP na porta 80
DHTesp dht;

// ===== VARIÁVEIS GLOBAIS =====
bool relayState = false;
bool modoAutomatico = true;  // Controle automático ativo por padrão

// ===== FUNÇÃO AUXILIAR =====
int clampi(int x, int lo, int hi) { 
  return x < lo ? lo : (x > hi ? hi : x); 
}

// ===== LEITURA SENSOR DE SOLO =====
void readSoilSensor(int &adc, int &percent) {
  adc = analogRead(PIN_SOIL);
  percent = map(adc, soilDryADC, soilWetADC, 0, 100);
  percent = clampi(percent, 0, 100);
}

// ===== LEITURA SENSOR DHT =====
void readDHTSensor(float &temp, float &hum) {
  TempAndHumidity th = dht.getTempAndHumidity();
  temp = th.temperature;
  hum = th.humidity;
}

// ═════════════════════════════════════════════════════════
// ENDPOINTS DA API REST
// ═════════════════════════════════════════════════════════

// ===== GET / - Página inicial com documentação =====
void handleRoot() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta charset='UTF-8'>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
  html += "<title>AgroFlux API</title>";
  html += "<style>";
  html += "body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }";
  html += "h1 { color: #2c3e50; border-bottom: 3px solid #27ae60; padding-bottom: 10px; }";
  html += "h2 { color: #27ae60; margin-top: 30px; }";
  html += ".endpoint { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #27ae60; }";
  html += ".method { display: inline-block; padding: 3px 8px; border-radius: 3px; font-weight: bold; margin-right: 10px; }";
  html += ".get { background: #3498db; color: white; }";
  html += ".post { background: #e67e22; color: white; }";
  html += ".put { background: #9b59b6; color: white; }";
  html += "code { background: #ecf0f1; padding: 2px 6px; border-radius: 3px; }";
  html += ".status { background: #ecf0f1; padding: 10px; border-radius: 5px; margin: 10px 0; }";
  html += "</style></head><body>";
  
  html += "<h1>🌱 AgroFlux API REST</h1>";
  html += "<div class='status'>";
  html += "<strong>📍 IP do Servidor:</strong> " + WiFi.localIP().toString() + "<br>";
  html += "<strong>📶 WiFi RSSI:</strong> " + String(WiFi.RSSI()) + " dBm<br>";
  html += "<strong>⏱️ Uptime:</strong> " + String(millis() / 1000) + " segundos<br>";
  html += "<strong>🔧 Modo Automático:</strong> " + String(modoAutomatico ? "ATIVO" : "DESATIVADO");
  html += "</div>";
  
  html += "<h2>📊 Endpoints - Status dos Sensores</h2>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method get'>GET</span><code>/api/status</code><br>";
  html += "<strong>Descrição:</strong> Status completo do sistema<br>";
  html += "<strong>Resposta:</strong> JSON com todos os sensores e estado da bomba";
  html += "</div>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method get'>GET</span><code>/api/solo</code><br>";
  html += "<strong>Descrição:</strong> Dados do sensor de solo<br>";
  html += "<strong>Resposta:</strong> JSON com ADC e porcentagem de umidade";
  html += "</div>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method get'>GET</span><code>/api/dht</code><br>";
  html += "<strong>Descrição:</strong> Dados do sensor DHT11 (temperatura e umidade do ar)<br>";
  html += "<strong>Resposta:</strong> JSON com temperatura e umidade";
  html += "</div>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method get'>GET</span><code>/api/bomba</code><br>";
  html += "<strong>Descrição:</strong> Status da bomba de irrigação<br>";
  html += "<strong>Resposta:</strong> JSON com estado da bomba e modo";
  html += "</div>";
  
  html += "<h2>🎮 Endpoints - Controle</h2>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method post'>POST</span><code>/api/bomba/ligar</code><br>";
  html += "<strong>Descrição:</strong> Liga a bomba manualmente (desativa modo automático)<br>";
  html += "<strong>Resposta:</strong> JSON com confirmação";
  html += "</div>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method post'>POST</span><code>/api/bomba/desligar</code><br>";
  html += "<strong>Descrição:</strong> Desliga a bomba manualmente (desativa modo automático)<br>";
  html += "<strong>Resposta:</strong> JSON com confirmação";
  html += "</div>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method post'>POST</span><code>/api/modo/automatico</code><br>";
  html += "<strong>Descrição:</strong> Ativa o modo automático de irrigação<br>";
  html += "<strong>Resposta:</strong> JSON com confirmação";
  html += "</div>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method post'>POST</span><code>/api/modo/manual</code><br>";
  html += "<strong>Descrição:</strong> Ativa o modo manual de irrigação<br>";
  html += "<strong>Resposta:</strong> JSON com confirmação";
  html += "</div>";
  
  html += "<div class='endpoint'>";
  html += "<span class='method put'>PUT</span><code>/api/calibracao?seco=800&molhado=400</code><br>";
  html += "<strong>Descrição:</strong> Ajusta calibração do sensor de solo<br>";
  html += "<strong>Parâmetros:</strong> seco (ADC solo seco), molhado (ADC solo molhado)<br>";
  html += "<strong>Resposta:</strong> JSON com novos valores";
  html += "</div>";
  
  html += "<h2>💡 Como Usar</h2>";
  html += "<p><strong>No navegador:</strong> Acesse <code>http://" + WiFi.localIP().toString() + "/api/status</code></p>";
  html += "<p><strong>No Postman:</strong> Use as URLs acima com métodos GET/POST/PUT</p>";
  html += "<p><strong>Com cURL:</strong> <code>curl http://" + WiFi.localIP().toString() + "/api/status</code></p>";
  
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

// ===== GET /api/status - Status completo =====
void handleStatus() {
  int soilADC, soilPercent;
  float airTemp, airHum;
  
  readSoilSensor(soilADC, soilPercent);
  readDHTSensor(airTemp, airHum);
  
  String json = "{";
  json += "\"timestamp\":" + String(millis()) + ",";
  json += "\"device_id\":\"agroflux_001\",";
  json += "\"uptime_seconds\":" + String(millis() / 1000) + ",";
  json += "\"wifi_rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"solo\":{";
  json += "\"adc\":" + String(soilADC) + ",";
  json += "\"umidade_percent\":" + String(soilPercent);
  json += "},";
  json += "\"ar\":{";
  json += "\"temperatura\":" + String(airTemp, 1) + ",";
  json += "\"umidade\":" + String(airHum, 1);
  json += "},";
  json += "\"bomba\":{";
  json += "\"estado\":\"" + String(relayState ? "LIGADA" : "DESLIGADA") + "\",";
  json += "\"modo\":\"" + String(modoAutomatico ? "AUTOMATICO" : "MANUAL") + "\"";
  json += "}";
  json += "}";
  
  server.send(200, "application/json", json);
}

// ===== GET /api/solo - Dados do solo =====
void handleSolo() {
  int soilADC, soilPercent;
  readSoilSensor(soilADC, soilPercent);
  
  String json = "{";
  json += "\"timestamp\":" + String(millis()) + ",";
  json += "\"adc\":" + String(soilADC) + ",";
  json += "\"umidade_percent\":" + String(soilPercent) + ",";
  json += "\"status\":\"";
  if (soilADC > soilDryADC) json += "SECO";
  else if (soilADC > soilWetADC) json += "IDEAL";
  else json += "ENCHARCADO";
  json += "\"}";
  
  server.send(200, "application/json", json);
}

// ===== GET /api/dht - Dados temperatura e umidade do ar =====
void handleDHT() {
  float airTemp, airHum;
  readDHTSensor(airTemp, airHum);
  
  String json = "{";
  json += "\"timestamp\":" + String(millis()) + ",";
  json += "\"temperatura\":" + String(airTemp, 1) + ",";
  json += "\"umidade\":" + String(airHum, 1);
  json += "}";
  
  server.send(200, "application/json", json);
}

// ===== GET /api/bomba - Status da bomba =====
void handleBombaStatus() {
  String json = "{";
  json += "\"timestamp\":" + String(millis()) + ",";
  json += "\"estado\":\"" + String(relayState ? "LIGADA" : "DESLIGADA") + "\",";
  json += "\"modo\":\"" + String(modoAutomatico ? "AUTOMATICO" : "MANUAL") + "\",";
  json += "\"pino\":\"D1\",";
  json += "\"ativo_em\":\"" + String(releAtivoEmLow ? "LOW" : "HIGH") + "\"";
  json += "}";
  
  server.send(200, "application/json", json);
}

// ===== POST /api/bomba/ligar - Liga bomba manualmente =====
void handleBombaLigar() {
  modoAutomatico = false;
  digitalWrite(PIN_RELAY, releAtivoEmLow ? LOW : HIGH);
  relayState = true;
  
  String json = "{";
  json += "\"success\":true,";
  json += "\"message\":\"Bomba ligada manualmente\",";
  json += "\"estado\":\"LIGADA\",";
  json += "\"modo\":\"MANUAL\"";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("💧 API: Bomba ligada manualmente");
}

// ===== POST /api/bomba/desligar - Desliga bomba manualmente =====
void handleBombaDesligar() {
  modoAutomatico = false;
  digitalWrite(PIN_RELAY, releAtivoEmLow ? HIGH : LOW);
  relayState = false;
  
  String json = "{";
  json += "\"success\":true,";
  json += "\"message\":\"Bomba desligada manualmente\",";
  json += "\"estado\":\"DESLIGADA\",";
  json += "\"modo\":\"MANUAL\"";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("🛑 API: Bomba desligada manualmente");
}

// ===== POST /api/modo/automatico - Ativa modo automático =====
void handleModoAutomatico() {
  modoAutomatico = true;
  
  String json = "{";
  json += "\"success\":true,";
  json += "\"message\":\"Modo automático ativado\",";
  json += "\"modo\":\"AUTOMATICO\"";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("🤖 API: Modo automático ativado");
}

// ===== POST /api/modo/manual - Ativa modo manual =====
void handleModoManual() {
  modoAutomatico = false;
  
  String json = "{";
  json += "\"success\":true,";
  json += "\"message\":\"Modo manual ativado\",";
  json += "\"modo\":\"MANUAL\"";
  json += "}";
  
  server.send(200, "application/json", json);
  Serial.println("👤 API: Modo manual ativado");
}

// ===== PUT /api/calibracao - Ajusta calibração do sensor =====
void handleCalibracao() {
  if (server.hasArg("seco") && server.hasArg("molhado")) {
    soilDryADC = server.arg("seco").toInt();
    soilWetADC = server.arg("molhado").toInt();
    
    String json = "{";
    json += "\"success\":true,";
    json += "\"message\":\"Calibração atualizada\",";
    json += "\"solo_seco_adc\":" + String(soilDryADC) + ",";
    json += "\"solo_molhado_adc\":" + String(soilWetADC);
    json += "}";
    
    server.send(200, "application/json", json);
    Serial.println("⚙️ API: Calibração atualizada - Seco:" + String(soilDryADC) + " Molhado:" + String(soilWetADC));
  } else {
    String json = "{";
    json += "\"success\":false,";
    json += "\"message\":\"Parâmetros 'seco' e 'molhado' são obrigatórios\"";
    json += "}";
    server.send(400, "application/json", json);
  }
}

// ===== Endpoint não encontrado =====
void handleNotFound() {
  String json = "{";
  json += "\"error\":\"Endpoint não encontrado\",";
  json += "\"uri\":\"" + server.uri() + "\",";
  json += "\"method\":\"" + String(server.method() == HTTP_GET ? "GET" : server.method() == HTTP_POST ? "POST" : "PUT") + "\",";
  json += "\"message\":\"Acesse http://" + WiFi.localIP().toString() + "/ para ver a documentação\"";
  json += "}";
  
  server.send(404, "application/json", json);
}

// ═════════════════════════════════════════════════════════
// CONTROLE AUTOMÁTICO
// ═════════════════════════════════════════════════════════

void controleAutomatico() {
  if (!modoAutomatico) return;
  
  int soilADC = analogRead(PIN_SOIL);
  
  // Solo muito seco - Liga bomba
  if (soilADC > 900 && !relayState) {
    digitalWrite(PIN_RELAY, releAtivoEmLow ? LOW : HIGH);
    relayState = true;
    Serial.println("💧 AUTO: Bomba ligada - Solo seco");
  }
  // Solo adequado - Desliga bomba
  else if (soilADC < 500 && relayState) {
    digitalWrite(PIN_RELAY, releAtivoEmLow ? HIGH : LOW);
    relayState = false;
    Serial.println("🌿 AUTO: Bomba desligada - Solo adequado");
  }
}

// ═════════════════════════════════════════════════════════
// SETUP E LOOP
// ═════════════════════════════════════════════════════════

void setup() {
  Serial.begin(9600);
  delay(500);
  
  // Configurar pinos
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, releAtivoEmLow ? HIGH : LOW);
  dht.setup(PIN_DHT, DHTesp::DHT11);
  
  Serial.println("\n🚀 AgroFlux - Servidor API REST");
  Serial.println("================================");
  
  // Conectar WiFi
  Serial.print("📶 Conectando WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi conectado!");
    Serial.print("📍 IP do Servidor: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("❌ Falha ao conectar WiFi");
    return;
  }
  
  // Configurar rotas da API
  server.on("/", handleRoot);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/solo", HTTP_GET, handleSolo);
  server.on("/api/dht", HTTP_GET, handleDHT);
  server.on("/api/bomba", HTTP_GET, handleBombaStatus);
  server.on("/api/bomba/ligar", HTTP_POST, handleBombaLigar);
  server.on("/api/bomba/desligar", HTTP_POST, handleBombaDesligar);
  server.on("/api/modo/automatico", HTTP_POST, handleModoAutomatico);
  server.on("/api/modo/manual", HTTP_POST, handleModoManual);
  server.on("/api/calibracao", HTTP_PUT, handleCalibracao);
  server.onNotFound(handleNotFound);
  
  // Iniciar servidor
  server.begin();
  Serial.println("✅ Servidor HTTP iniciado!");
  Serial.println("================================");
  Serial.println("📖 Acesse a documentação em:");
  Serial.print("   http://");
  Serial.println(WiFi.localIP());
  Serial.println("================================\n");
  
  delay(2000);
}

void loop() {
  server.handleClient();  // Processa requisições HTTP
  
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck >= 5000) {  // Verifica a cada 5 segundos
    lastCheck = millis();
    controleAutomatico();
  }
  
  delay(10);
}

/*
═══════════════════════════════════════════════════════════════════
🌱 AgroFlux - Servidor API REST

ENDPOINTS DISPONÍVEIS:

📊 STATUS (GET):
  /api/status       → Status completo do sistema
  /api/solo         → Dados do sensor de solo
  /api/dht          → Dados de temperatura e umidade do ar
  /api/bomba        → Status da bomba

🎮 CONTROLE (POST):
  /api/bomba/ligar      → Liga bomba manualmente
  /api/bomba/desligar   → Desliga bomba manualmente
  /api/modo/automatico  → Ativa modo automático
  /api/modo/manual      → Ativa modo manual

⚙️ CONFIGURAÇÃO (PUT):
  /api/calibracao?seco=800&molhado=400  → Ajusta calibração

💡 COMO USAR:
1. Carregue este código no ESP8266
2. Anote o IP mostrado no Serial Monitor
3. Acesse http://IP_DO_ESP8266/ no navegador
4. Use Postman ou cURL para fazer requisições

EXEMPLOS:
  curl http://192.168.1.100/api/status
  curl -X POST http://192.168.1.100/api/bomba/ligar
  curl -X PUT http://192.168.1.100/api/calibracao?seco=850&molhado=420

═══════════════════════════════════════════════════════════════════
*/
