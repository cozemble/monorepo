export interface ImageWithQrCode {
    id: string
    code: string
    image: string
}

export interface SensorTypeId {
    _type: 'sensor.type.id'
    value: string
}

export interface LocationId {
    _type: 'location.id'
    value: string
}

export interface SensorType {
    id: SensorTypeId
    name: string
}

export interface Location {
    id: LocationId
    name: string
    sensors: SensorType[]
}

export interface BatchType {
    _type: 'batch.type'
    id: string
    name: string
    sensors: SensorPath[]
}

export interface SensorPath {
    locationId: LocationId
    sensorTypeId: SensorTypeId
}

export interface ScannedSensor {
    _type: "scanned.sensor"
    path: SensorPath
    scan: ImageWithQrCode
}

export interface BatchInstance {
    _type: 'batch.instance'
    id: string
    type: BatchType
    gateway: ImageWithQrCode
    scannedSensors: ScannedSensor[]
}

const temperatureSensor: SensorType = {
    id: {
        _type: 'sensor.type.id',
        value: 'temp.humidity.sensor',
    },
    name: 'Temp / Humidity',

}

const breakSensor: SensorType = {
    id: {
        _type: 'sensor.type.id',
        value: 'break.sensor',
    },
    name: 'Break',
}

const kitchen: Location = {
    id: {
        _type: 'location.id',
        value: 'kitchen',
    },
    name: 'Kitchen',
    sensors: [temperatureSensor, breakSensor],
}

const bathroom: Location = {
    id: {
        _type: 'location.id',
        value: 'bathroom',
    },
    name: 'Bathroom',
    sensors: [temperatureSensor, breakSensor],
}

const livingRoom: Location = {
    id: {
        _type: 'location.id',
        value: 'living.room',
    },
    name: 'Living Room',
    sensors: [temperatureSensor, breakSensor],
}

const mainBedroom: Location = {
    id: {
        _type: 'location.id',
        value: 'main.bedroom',
    },
    name: 'Main Bedroom',
    sensors: [temperatureSensor, breakSensor],
}

const secondBedroom: Location = {
    id: {
        _type: 'location.id',
        value: 'second.bedroom',
    },
    name: 'Second Bedroom',
    sensors: [temperatureSensor, breakSensor],
}

const thirdBedroom: Location = {
    id: {
        _type: 'location.id',
        value: 'third.bedroom',
    },
    name: 'Third Bedroom',
    sensors: [temperatureSensor, breakSensor],
}

const fourthBedroom: Location = {
    id: {
        _type: 'location.id',
        value: 'fourth.bedroom',
    },
    name: 'Fourth Bedroom',
    sensors: [temperatureSensor, breakSensor],
}

export const oneBedroomHouse: BatchType = {
    _type: 'batch.type',
    id: 'one-bedroom-house',
    name: 'One Bedroom House',
    sensors: [
        {locationId: kitchen.id, sensorTypeId: temperatureSensor.id},
        {locationId: kitchen.id, sensorTypeId: breakSensor.id},
        {locationId: bathroom.id, sensorTypeId: temperatureSensor.id},
        {locationId: bathroom.id, sensorTypeId: breakSensor.id},
        {locationId: livingRoom.id, sensorTypeId: temperatureSensor.id},
        {locationId: livingRoom.id, sensorTypeId: breakSensor.id},
        {locationId: mainBedroom.id, sensorTypeId: temperatureSensor.id},
        {locationId: mainBedroom.id, sensorTypeId: breakSensor.id},
    ],
}

export const twoBedroomHouse: BatchType = {
    _type: 'batch.type',
    id: 'two-bedroom-house',
    name: 'Two Bedroom House',
    sensors: [
        ...oneBedroomHouse.sensors,
        {locationId: secondBedroom.id, sensorTypeId: temperatureSensor.id},
        {locationId: secondBedroom.id, sensorTypeId: breakSensor.id},
    ]
}

export const threeBedroomHouse: BatchType = {
    _type: 'batch.type',
    id: 'three-bedroom-house',
    name: 'Three Bedroom House',
    sensors: [
        ...twoBedroomHouse.sensors,
        {locationId: thirdBedroom.id, sensorTypeId: temperatureSensor.id},
        {locationId: thirdBedroom.id, sensorTypeId: breakSensor.id},
    ]
}

export const fourBedroomHouse: BatchType = {
    _type: 'batch.type',
    id: 'four-bedroom-house',
    name: 'Four Bedroom House',
    sensors: [
        ...threeBedroomHouse.sensors,
        {locationId: fourthBedroom.id, sensorTypeId: temperatureSensor.id},
        {locationId: fourthBedroom.id, sensorTypeId: breakSensor.id},
    ]
}

export const nullBatchType: BatchType = {
    _type: 'batch.type',
    id: 'null.batch.type',
    name: '-----',
    sensors: []
}

export const batchTypes: BatchType[] = [
    nullBatchType,
    oneBedroomHouse,
    twoBedroomHouse,
    threeBedroomHouse,
    fourBedroomHouse,
]