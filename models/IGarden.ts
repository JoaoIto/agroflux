interface ILocation {
    latitude: number;
    longitude: number;
}

interface IGarden {
    _id: string;
    name: string;
    location: ILocation;
    area: number;
    zones: string[];
    created_at: Date;
    updated_at: Date;
}
