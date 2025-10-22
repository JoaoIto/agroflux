import { NextResponse } from 'next/server'
import { getMongoClient } from '@/db/connectionDb'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'

// Rota GET para listar todas as culturas (cultures)
export async function GET() {
    try {
        const client = await getMongoClient();
        const db = client.db("agroflux");

        // Buscar todas as culturas
        const cultures = await db.collection('cultures').find().toArray();

        return NextResponse.json(cultures);
    } catch (error) {
        console.error('Error fetching cultures:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Rota POST para adicionar uma nova cultura (culture)
export async function POST(request: Request) {
    try {
        const cultureData: Omit<ICulture, '_id'> = await request.json();
        const client = await getMongoClient();
        const db = client.db("agroflux");

        const result = await db.collection('cultures').insertOne({
            ...cultureData,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return NextResponse.json({ message: 'Culture added successfully', id: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('Error adding culture:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
