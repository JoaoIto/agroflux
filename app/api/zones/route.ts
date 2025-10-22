import { NextResponse } from 'next/server'
import { getMongoClient } from '@/db/connectionDb'
import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'

// Rota GET para listar todas as zonas (zones)
export async function GET() {
    try {
        const client = await getMongoClient();
        const db = client.db("agroflux");

        // Buscar todas as zonas
        const zones = await db.collection('zones').find().toArray();

        return NextResponse.json(zones);
    } catch (error) {
        console.error('Error fetching zones:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Rota POST para adicionar uma nova zona (zone)
export async function POST(request: Request) {
    try {
        const zoneData: Omit<IZone, '_id'> = await request.json();
        const client = await getMongoClient();
        const db = client.db("agroflux");

        const result = await db.collection('zones').insertOne({
            ...zoneData,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return NextResponse.json({ message: 'Zone added successfully', id: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('Error adding zone:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

