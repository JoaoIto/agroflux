interface ILocation {
    latitude: number;
    longitude: number;
}

export interface IGarden {
    _id: string
    name: string
    location: ILocation
    area: number
    altitude: number
    zones: string[]
    created_at: Date
    updated_at: Date
    cropType: "tomato" | "lettuce" | "carrot" | "corn" | "beans" | "potato" | "other"
    kc: number
    user_id: string
}

export const CROP_KC_VALUES: Record<string, number> = {
    tomato: 1.15,
    lettuce: 1.0,
    carrot: 1.05,
    corn: 1.2,
    beans: 1.05,
    potato: 1.15,
    other: 1.0,
}