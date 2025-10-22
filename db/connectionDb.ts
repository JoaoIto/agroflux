import { MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv';
dotenv.config();

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
// eslint-disable-next-line @typescript-eslint/no-explicit-any

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  ssl: true, // SSL deve estar habilitado
  tlsInsecure: false, // Não permite protocolos inseguros
};

let client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getMongoClient(): Promise<MongoClient> {
  try {
    const client = await clientPromise;
    console.log("Conexão ao MongoDB estabelecida com sucesso!");
    return client;
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    throw error;
  }
}
// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise