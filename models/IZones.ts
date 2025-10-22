interface IZone {
    _id: string;
    garden_id: string;
    name: string;
    location: ILocation;
    area: number;
    culture: string;
    soil_type: string;
    sensors: string[];
    created_at: Date;
    updated_at: Date;
}
