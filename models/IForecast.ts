interface IForecast {
    _id: string;
    garden_id: string;
    zone_id: string;
    forecast_data: {
        temperature: number;
        humidity: number;
        evapotranspiration: number;
    };
    alert: "Warning" | "Info" | "Critical";
    insight: string;
    created_at: Date;
    updated_at: Date;
}
