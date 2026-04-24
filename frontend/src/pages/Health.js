import { useState } from "react";

function Health() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const calculateBMI = () => {
    if (!weight || !height) return 0;
    return (weight / ((height / 100) * (height / 100))).toFixed(2);
  };

  return (
    <div className="page-container">
      <h2>Health Tracker</h2>

      <input
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <input
        placeholder="Height (cm)"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
      />

      <h3>BMI: {calculateBMI()}</h3>
    </div>
  );
}

export default Health;