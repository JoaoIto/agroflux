import { NextResponse } from 'next/server'
import { getMongoClient } from '@/db/connectionDb'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'
import { IGarden } from '@/models/IGarden';

// Rota GET para listar todos os jardins (gardens)
export async function GET() {
    try {
        const client = await getMongoClient();
        const db = client.db("agroflux");

        // Buscar todos os jardins
        const gardens = await db.collection('gardens').find().toArray();

        return NextResponse.json(gardens);
    } catch (error) {
        console.error('Error fetching gardens:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Rota POST para adicionar um novo jardim (garden)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, location, area, user_id, cropType, kc, altitude, zones } = body

        if (!name || !location || !area || !user_id || !cropType || kc === undefined) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
        }

        const client = await getMongoClient();
        const db = client.db("agroflux");
        const result = await db.collection("gardens").insertOne({
            name,
            location,
            area,
            altitude: altitude || 0,
            zones: zones || [],
            cropType,
            kc,
            user_id,
            created_at: new Date(),
            updated_at: new Date(),
        })

        return NextResponse.json({
            _id: result.insertedId,
            name,
            location,
            area,
            altitude,
            zones,
            cropType,
            kc,
            user_id,
        })
    } catch (error) {
        console.error("[v0] Erro ao criar jardim:", error)
        return NextResponse.json({ error: "Erro ao criar jardim" }, { status: 500 })
    }
}