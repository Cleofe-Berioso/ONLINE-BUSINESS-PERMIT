// EB Magalona geographic constants (approximate v1 validation)
export const EB_MAGALONA = {
  center: { lat: 10.4069, lon: 122.9701 },
  bounds: {
    north: 10.4569,
    south: 10.3569,
    east: 123.0201,
    west: 122.9201,
  },
  zoom: 14,
};

export const BUSINESS_TYPE_COLORS: Record<string, string> = {
  Retail: "#3B82F6",
  Service: "#10B981",
  Manufacturing: "#EF4444",
  Construction: "#F59E0B",
  Food: "#EC4899",
  default: "#6B7280",
};

export function getMarkerColor(businessType?: string | null): string {
  if (!businessType) return BUSINESS_TYPE_COLORS.default;
  return (
    BUSINESS_TYPE_COLORS[businessType as keyof typeof BUSINESS_TYPE_COLORS] ||
    BUSINESS_TYPE_COLORS.default
  );
}
