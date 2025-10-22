interface ISensor {
    _id: string;
    name: string;
    sensor_type: "Humidity" | "Temperature" | "Evapotranspiration" | string;
    status: "On" | "Off";
    location: ILocation;
    zone_id: string;
    data: { timestamp: Date; value: number }[];
    created_at: Date;
    updated_at: Date;
}
