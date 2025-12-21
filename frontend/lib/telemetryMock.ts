// A lightweight telemetry simulator/utility for demoing how vehicles might send data
export function generateTelemetry(vehicleId: string) {
  return {
    vehicleId,
    timestamp: new Date().toISOString(),
    location: { lat: -15.416, lng: 28.283 }, // central Zambia (Lusaka)
    speedKph: Math.floor(Math.random() * 120),
    batteryPercent: Math.floor(Math.random() * 100),
    odometerKm: 5000 + Math.floor(Math.random() * 100000),
    fuelLevelPercent: Math.floor(Math.random() * 100)
  };
}
