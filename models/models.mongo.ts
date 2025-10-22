import { Schema, model, Document } from "mongoose";

// **1. Modelo Garden**
const GardenSchema = new Schema<IGarden>({
    name: { type: String, required: true },
    location: { latitude: Number, longitude: Number },
    area: { type: Number, required: true },
    zones: [{ type: Schema.Types.ObjectId, ref: "Zone" }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const GardenModel = model<IGarden & Document>("Garden", GardenSchema);

// **2. Modelo Zone**
const ZoneSchema = new Schema<IZone>({
    garden_id: { type: Schema.Types.ObjectId, ref: "Garden" },
    name: { type: String, required: true },
    location: { latitude: Number, longitude: Number },
    area: { type: Number, required: true },
    culture: { type: Schema.Types.ObjectId, ref: "Culture" },
    soil_type: { type: Schema.Types.ObjectId, ref: "SoilType" },
    sensors: [{ type: Schema.Types.ObjectId, ref: "Sensor" }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const ZoneModel = model<IZone & Document>("Zone", ZoneSchema);

// **3. Modelo Culture**
const CultureSchema = new Schema<ICulture>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    optimal_conditions: {
        temperature_range: [Number, Number],
        humidity_range: [Number, Number],
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const CultureModel = model<ICulture & Document>("Culture", CultureSchema);

// **4. Modelo SoilType**
const SoilTypeSchema = new Schema<ISoilType>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    ph_range: [Number, Number],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const SoilTypeModel = model<ISoilType & Document>("SoilType", SoilTypeSchema);

// **5. Modelo Sensor**
const SensorSchema = new Schema<ISensor>({
    name: { type: String, required: true },
    sensor_type: { type: String, required: true },
    status: { type: String, required: true },
    location: { latitude: Number, longitude: Number },
    zone_id: { type: Schema.Types.ObjectId, ref: "Zone" },
    data: [{ timestamp: Date, value: Number }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const SensorModel = model<ISensor & Document>("Sensor", SensorSchema);

// **6. Modelo Forecast**
const ForecastSchema = new Schema<IForecast>({
    garden_id: { type: Schema.Types.ObjectId, ref: "Garden" },
    zone_id: { type: Schema.Types.ObjectId, ref: "Zone" },
    forecast_data: {
        temperature: Number,
        humidity: Number,
        evapotranspiration: Number,
    },
    alert: { type: String, required: true },
    insight: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const ForecastModel = model<IForecast & Document>("Forecast", ForecastSchema);

// **7. Modelo Log**
const LogSchema = new Schema<ILog>({
    sensor_id: { type: Schema.Types.ObjectId, ref: "Sensor" },
    zone_id: { type: Schema.Types.ObjectId, ref: "Zone" },
    garden_id: { type: Schema.Types.ObjectId, ref: "Garden" },
    data: [{ timestamp: Date, value: Number }],
    created_at: { type: Date, default: Date.now },
});

const LogModel = model<ILog & Document>("Log", LogSchema);

export {
    GardenModel,
    ZoneModel,
    CultureModel,
    SoilTypeModel,
    SensorModel,
    ForecastModel,
    LogModel,
};
