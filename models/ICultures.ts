interface ICulture {
    _id: string;
    name: string;
    description: string;
    optimal_conditions: {
        temperature_range: [number, number];
        humidity_range: [number, number];
    };
    created_at: Date;
    updated_at: Date;
}
