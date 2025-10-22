import { NextResponse } from 'next/server'
import { getMongoClient } from '@/db/connectionDb'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'

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
        const gardenData: Omit<IGarden, '_id'> = await request.json();
        const client = await getMongoClient();
        const db = client.db("agroflux");

        const result = await db.collection('gardens').insertOne({
            ...gardenData,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return NextResponse.json({ message: 'Garden added successfully', id: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('Error adding garden:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
