export const getVehicleImage = (model) => {
  if (!model) return "/vehicles/suv.png";
  const m = model.toLowerCase();
  
  if (m.includes("575") || m.includes("tractor")) return "/vehicles/tractor.png";
  if (m.includes("xuv")) return "/vehicles/suv.png";
  if (m.includes("pickup") || m.includes("bolero")) return "/vehicles/pickup.png";
  if (m.includes("leyland") || m.includes("truck")) return "/vehicles/truck.png";
  
  return "/vehicles/suv.png"; // Fallback for other vehicles
};
