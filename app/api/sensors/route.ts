import { NextResponse } from 'next/server'
import { getMongoClient } from '@/db/connectionDb'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Classe de erro personalizada para autenticação
class AuthError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = 'AuthError';
    }
}

// Função para obter o ID do usuário do token JWT
async function getUserIdFromToken() {
    const token = (await cookies()).get('auth_token')?.value
    if (!token) {
        throw new AuthError('No token provided', 401)
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        return new ObjectId(decoded.userId)
    } catch (error) {
        console.error('Invalid token:', error)
        throw new AuthError('Invalid token', 401)
    }
}

// Rota GET para listar os sensores do usuário
export async function GET() {
    try {
        const userId = await getUserIdFromToken()
        console.log("UserId log: ", userId)

        const client = await getMongoClient();
        const db = client.db("agroflux");

        // Ajustando a consulta e fazendo o cast para ISensor[]
        const sensors = await db.collection('sensors')
            .find({ userId })
            .toArray()

        return NextResponse.json(sensors)
    } catch (error) {
        console.error('Get sensors error:', error)
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        if (error instanceof Error && error.name === 'MongoNetworkError') {
            return NextResponse.json({ error: 'Database connection error' }, { status: 503 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Rota POST para adicionar um novo sensor
export async function POST(request: Request) {
    try {
        const userId = await getUserIdFromToken()
        const client = await getMongoClient();
        const db = client.db("agroflux");

        const sensorData: Omit<ISensor, '_id'> = await request.json()

        // Inserindo o novo sensor no banco de dados
        const result = await db.collection('sensors').insertOne({
            ...sensorData,
            userId,
            createdAt: new Date(),
        })

        return NextResponse.json({ message: 'Sensor added successfully', id: result.insertedId }, { status: 201 })
    } catch (error) {
        console.error('Add sensor error:', error)
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status })
        }
        if (error instanceof Error) {
            if (error.name === 'MongoNetworkError') {
                return NextResponse.json({ error: 'Database connection error' }, { status: 503 })
            }
            if (error.name === 'ValidationError') {
                return NextResponse.json({ error: 'Invalid sensor data' }, { status: 400 })
            }
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
