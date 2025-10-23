import { MongoClient, ServerApiVersion } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Por favor, adicione a variável MONGODB_URI no arquivo .env.local")
}

const uri = process.env.MONGODB_URI

// Opções de conexão atualizadas (sem opções depreciadas)
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  // Em desenvolvimento, use uma variável global para preservar o valor
  // entre recarregamentos de módulo causados por HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // Em produção, é melhor não usar uma variável global
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Função auxiliar para obter o cliente conectado
export async function getMongoClient(): Promise<MongoClient> {
  try {
    const client = await clientPromise
    // Testa a conexão
    await client.db("agroflux").command({ ping: 1 })
    console.log("[v0] Conexão ao MongoDB estabelecida com sucesso!")
    return client
  } catch (error) {
    console.error("[v0] Erro ao conectar ao MongoDB:", error)
    throw error
  }
}

// Função para obter o banco de dados
export async function getDatabase(dbName = "agroflux") {
  const client = await getMongoClient()
  return client.db(dbName)
}

// Exporta a promise do cliente
export default clientPromise
