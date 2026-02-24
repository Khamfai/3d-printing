export interface PricingInput {
  volumeCm3: number;
  materialDensity: number; // g/cm3
  materialCostPerGram: number; // $/gram
  infillPercent: number; // 5-100
  quality: "DRAFT" | "STANDARD" | "HIGH";
  machineCostPerHour: number; // $/hour
  markupPercent: number; // e.g., 30 for 30%
  minimumPrice: number;
  quantity: number;
}

export interface PricingResult {
  materialCost: number;
  timeCost: number;
  subtotal: number;
  total: number;
  estimatedHours: number;
  pricePerUnit: number;
}

const LAYER_HEIGHT_MAP: Record<string, number> = {
  DRAFT: 0.3, // mm
  STANDARD: 0.2, // mm
  HIGH: 0.1, // mm
};

const PRINT_SPEED_MAP: Record<string, number> = {
  DRAFT: 60, // mm/s
  STANDARD: 45, // mm/s
  HIGH: 30, // mm/s
};

export function calculatePrice(input: PricingInput): PricingResult {
  const {
    volumeCm3,
    materialDensity,
    materialCostPerGram,
    infillPercent,
    quality,
    machineCostPerHour,
    markupPercent,
    minimumPrice,
    quantity,
  } = input;

  // Calculate effective volume (infill reduces interior volume)
  // Assume ~10% of volume is shell (always 100% fill), rest is infill
  const shellPercent = 0.1;
  const effectiveVolume = volumeCm3 * (shellPercent + (1 - shellPercent) * (infillPercent / 100));

  // Material cost
  const materialWeight = effectiveVolume * materialDensity; // grams
  const materialCost = materialWeight * materialCostPerGram;

  // Estimated print time
  const layerHeight = LAYER_HEIGHT_MAP[quality] || 0.2;
  const printSpeed = PRINT_SPEED_MAP[quality] || 45;

  // Rough estimation: height / layer_height * (volume per layer / speed)
  // Simplified: larger volume and finer layers = more time
  const heightEstimate = Math.cbrt(volumeCm3) * 10; // approximate height in mm
  const numberOfLayers = heightEstimate / layerHeight;
  const timePerLayer = (effectiveVolume * 1000) / (numberOfLayers * printSpeed * 60); // hours per layer
  const estimatedHours = Math.max(0.5, numberOfLayers * timePerLayer);

  // Machine cost
  const timeCost = estimatedHours * machineCostPerHour;

  // Subtotal with markup
  const subtotal = (materialCost + timeCost) * (1 + markupPercent / 100);

  // Per-unit price (apply minimum)
  const pricePerUnit = Math.max(minimumPrice, subtotal);

  // Total
  const total = pricePerUnit * quantity;

  return {
    materialCost: round(materialCost),
    timeCost: round(timeCost),
    subtotal: round(subtotal),
    total: round(total),
    estimatedHours: round(estimatedHours),
    pricePerUnit: round(pricePerUnit),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
