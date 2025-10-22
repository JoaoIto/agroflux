interface ISoilType {
    _id: string;
    name: string;
    description: string;
    ph_range: [number, number];
    created_at: Date;
    updated_at: Date;
}
