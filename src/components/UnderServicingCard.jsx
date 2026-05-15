"use client";

export default function UnderServicingCard({ vehicle, onComplete }) {
  const handleComplete = () => {
    if (onComplete) onComplete(vehicle.id);
  };

  return (
    <div className="p-4 border rounded shadow-md w-72 bg-white">
      <h2 className="text-lg font-bold">🔧 Under Servicing</h2>
      <p className="mt-2"><strong>Number Plate:</strong> {vehicle.numberPlate}</p>
      <p><strong>Model:</strong> {vehicle.model}</p>

      <button
        onClick={handleComplete}
        className="mt-4 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
      >
        Mark Complete
      </button>
    </div>
  );
}