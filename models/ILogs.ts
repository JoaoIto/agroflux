interface ILog {
    _id: string;
    sensor_id: string;
    zone_id: string;
    garden_id: string;
    data: { timestamp: Date; value: number }[];
    created_at: Date;
}
