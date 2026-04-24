import { useState } from "react";

function Planner() {
  const [tasks, setTasks] = useState([
    "30 min cardio",
    "Drink water",
    "Stretching"
  ]);

  return (
    <div className="page-container">
      <h2>Workout Planner</h2>

      {tasks.map((task, i) => (
        <div key={i} className="card">
          {task}
        </div>
      ))}
    </div>
  );
}

export default Planner;