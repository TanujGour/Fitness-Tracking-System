import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  FaWalking,
  FaFire,
  FaRobot,
  FaTint,
  FaMoon,
  FaSun,
  FaCalculator,
  FaClipboardList,
  FaBed,
  FaAppleAlt,
  FaTrophy,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  console.log("API_URL:", API_URL);
  const [steps, setSteps] = useState("");
  const [calories, setCalories] = useState("");
  const [fitnessData, setFitnessData] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [planner, setPlanner] = useState([]);
  const [meals, setMeals] = useState([]);
  const [profile, setProfile] = useState({ goalSteps: 10000 });


  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);

  const [waterCount, setWaterCount] = useState(0);
  const [sleepHours, setSleepHours] = useState("");

  const [plannerTask, setPlannerTask] = useState("");
  const [mealTitle, setMealTitle] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealType, setMealType] = useState("Breakfast");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I’m your fitness assistant. Ask me about workouts, water, sleep, BMI, or diet.",
    },
  ]);
  const [darkMode, setDarkMode] = useState(false);
 
  const location = useLocation();
  const path = location.pathname;

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "User";

  const fetchDashboardData = useCallback(async () => {
    try {
      const [dataRes, healthRes, plannerRes, mealsRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/data`, {
          headers: { Authorization: token },
        }),
        axios.get(`${API_URL}/health-log`, {
          headers: { Authorization: token },
        }),
        axios.get(`${API_URL}/planner`, {
          headers: { Authorization: token },
        }),
        axios.get(`${API_URL}/meals`, {
          headers: { Authorization: token },
        }),
        axios.get(`${API_URL}/profile`, {
          headers: { Authorization: token },
        }),
      ]);

      setFitnessData(dataRes.data);
      setHealthLogs(healthRes.data);
      setPlanner(plannerRes.data);
      setMeals(mealsRes.data);
      setProfile(profileRes.data.profile);

      if (profileRes.data.profile.weight) setWeight(profileRes.data.profile.weight);
      if (profileRes.data.profile.height) setHeight(profileRes.data.profile.height);
    } catch (error) {
      alert("Failed to load dashboard data");
    }
  }, [API_URL, token]);

 useEffect(() => {
  fetchDashboardData();
}, [fetchDashboardData]);

  const addData = async () => {
    if (!steps || !calories) {
      alert("Please enter both steps and calories");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/add`,
        {
          steps: Number(steps),
          calories: Number(calories),
        },
        { headers: { Authorization: token } }
      );

      setSteps("");
      setCalories("");
      fetchDashboardData();
    } catch (error) {
      alert("Failed to add data");
    }
  };

  const saveHealthLog = async () => {
    try {
      await axios.post(
       `${API_URL}/health-log`,
        {
          water: waterCount,
          sleep: Number(sleepHours || 0),
        },
        { headers: { Authorization: token } }
      );

      alert("Health log saved");
      setSleepHours("");
      fetchDashboardData();
    } catch (error) {
      alert("Failed to save health log");
    }
  };

  const addPlannerTask = async () => {
    if (!plannerTask.trim()) return;

    try {
      await axios.post(
        `${API_URL}/planner`,
        { title: plannerTask },
        { headers: { Authorization: token } }
      );
      setPlannerTask("");
      fetchDashboardData();
    } catch (error) {
      alert("Failed to add planner task");
    }
  };

  const togglePlannerTask = async (taskId) => {
    try {
      await axios.put(
        `${API_URL}/planner/${taskId}/toggle`,
        {},
        { headers: { Authorization: token } }
      );
      fetchDashboardData();
    } catch (error) {
      alert("Failed to update planner task");
    }
  };

  const deletePlannerTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/planner/${taskId}`, {
        headers: { Authorization: token },
      });
      fetchDashboardData();
    } catch (error) {
      alert("Failed to remove planner task");
    }
  };

  const addMeal = async () => {
    if (!mealTitle.trim()) return;

    try {
      await axios.post(
        `${API_URL}/meals`,
        {
          title: mealTitle,
          calories: Number(mealCalories || 0),
          mealType,
        },
        { headers: { Authorization: token } }
      );

      setMealTitle("");
      setMealCalories("");
      setMealType("Breakfast");
      fetchDashboardData();
    } catch (error) {
      alert("Failed to add meal");
    }
  };

  const deleteMeal = async (mealId) => {
    try {
      await axios.delete(`${API_URL}/meals/${mealId}`, {
        headers: { Authorization: token },
      });
      fetchDashboardData();
    } catch (error) {
      alert("Failed to remove meal");
    }
  };

  const calculateBMI = () => {
    if (!weight || !height) {
      alert("Enter weight and height");
      return;
    }
    const heightInMeters = Number(height) / 100;
    const bmiValue = (Number(weight) / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);
  };

  const bmiStatus = () => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const totalSteps = fitnessData.reduce((sum, item) => sum + item.steps, 0);
  const totalCalories = fitnessData.reduce((sum, item) => sum + item.calories, 0);
  const totalRecords = fitnessData.length;
  const avgSteps = totalRecords ? Math.round(totalSteps / totalRecords) : 0;
  const avgCalories = totalRecords ? Math.round(totalCalories / totalRecords) : 0;
  const latestSteps = totalRecords ? fitnessData[fitnessData.length - 1].steps : 0;

  const latestHealth = healthLogs.length ? healthLogs[healthLogs.length - 1] : { water: 0, sleep: 0 };
  const latestWater = latestHealth.water || 0;
  const latestSleep = latestHealth.sleep || 0;

  const goal = profile.goalSteps || 10000;

  const labels = fitnessData.map((_, index) => `Day ${index + 1}`);

  const stepsChartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Steps",
          data: fitnessData.map((item) => item.steps),
          borderColor: "#6d28d9",
          backgroundColor: "rgba(109,40,217,0.18)",
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [fitnessData, labels]
  );

  const caloriesChartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Calories",
          data: fitnessData.map((item) => item.calories),
          backgroundColor: ["#06b6d4", "#3b82f6", "#8b5cf6", "#f97316", "#10b981"],
          borderRadius: 10,
        },
      ],
    }),
    [fitnessData, labels]
  );

  const goalChartData = {
    labels: ["Achieved", "Remaining"],
    datasets: [
      {
        data: [Math.min(avgSteps, goal), Math.max(goal - avgSteps, 0)],
        backgroundColor: ["#10b981", "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };

  const weeklyStreak = fitnessData.length >= 7 ? 7 : fitnessData.length;

  const achievements = [
    { title: "First Record", unlocked: totalRecords >= 1 },
    { title: "Hydration Starter", unlocked: latestWater >= 4 },
    { title: "Sleep Focus", unlocked: latestSleep >= 7 },
    { title: "10K Step Hero", unlocked: latestSteps >= 10000 },
    { title: "Planner Pro", unlocked: planner.length >= 3 },
  ];

  const aiRecommendation = () => {
    if (latestSteps === 0) return "Start by adding your first activity record today.";
    if (latestSteps < 3000) return "Low activity detected. Take a brisk 20-minute walk.";
    if (latestSteps < 7000) return "Good start. Add mobility or light strength training.";
    if (latestSteps < goal) return "You are close to your goal. Try an evening walk.";
    return "Excellent work. Maintain consistency and focus on recovery.";
  };

  const hydrationTip = () => {
    if (latestWater >= 8) return "Excellent hydration today.";
    if (latestWater >= 4) return "Good hydration. Drink a little more to hit the target.";
    return "Hydration is low today. Aim for 8 glasses.";
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: "user", text: chatInput };
    let aiText = "Stay consistent and track your daily routine.";

    const lower = chatInput.toLowerCase();

    if (lower.includes("workout")) {
      aiText = "Recommended workout: 20 min cardio + 15 min strength + 10 min stretching.";
    } else if (lower.includes("water")) {
      aiText = "Try to drink 8–10 glasses of water each day.";
    } else if (lower.includes("diet") || lower.includes("meal")) {
      aiText = "Focus on balanced meals with protein, vegetables, fruit, and enough water.";
    } else if (lower.includes("steps")) {
      aiText = "Aim for 8,000–10,000 steps daily and stay consistent.";
    } else if (lower.includes("sleep")) {
      aiText = "Target 7–8 hours of sleep for recovery and energy.";
    } else if (lower.includes("bmi")) {
      aiText = "BMI is a basic indicator. Combine it with fitness, sleep, and food habits.";
    }

    setChatMessages([...chatMessages, userMessage, { sender: "ai", text: aiText }]);
    setChatInput("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <div className={`dashboard-page ${darkMode ? "dark-theme" : "light-theme"}`}>
     <nav className="navbar">
  <div className="logo">🏋️ Fitness Training and Management System</div>
  <div className="nav-links">
    <Link to="/dashboard">Dashboard</Link>
    <Link to="/activity">Activity</Link>
    <Link to="/health">Health</Link>
    <Link to="/planner">Planner</Link>
    <Link to="/ai">AI Coach</Link>
  </div>

  <div className="nav-right">
    <Link to="/profile" className="user-pill">
      <img
        src={localStorage.getItem("photo") || "https://i.pravatar.cc/100"}
        alt="profile"
        className="nav-avatar"
      />
      {username}
    </Link>

    <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
      {darkMode ? <FaSun /> : <FaMoon />}
    </button>

    <button className="logout-btn" onClick={logout}>
      Logout
    </button>
  </div>
</nav>

      {path === "/dashboard" && (
      <div className="dashboard-container">
        <section className="hero-section">
          <div>
            
            <h1>Smart Fitness Dashboard</h1>
            <p>Analyze progress, track health, plan workouts, and follow AI-powered insights.</p>
          </div>
          
          <div className="goal-box">
            <h3>Daily Goal</h3>
            <p>{goal} steps</p>
          </div>
          
        </section>

        <section className="stats-grid">
          <div className="stat-card purple">
            <h3><FaWalking /> Total Steps</h3>
            <p>{totalSteps}</p>
          </div>
          <div className="stat-card blue">
            <h3><FaFire /> Total Calories</h3>
            <p>{totalCalories}</p>
          </div>
          <div className="stat-card green">
            <h3>Records Added</h3>
            <p>{totalRecords}</p>
          </div>
          <div className="stat-card orange">
            <h3>Average Steps</h3>
            <p>{avgSteps}</p>
          </div>
        </section>

        <section className="main-grid">
          <div className="left-panel">
            <div className="glass-card">
              <h2>Add Daily Fitness Record</h2>
              <div className="form-row">
                <input
                  type="number"
                  placeholder="Enter steps"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Enter calories"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
                <button className="primary-btn" onClick={addData}>
                  Add Data
                </button>
              </div>
            </div>

            <div className="charts-grid">
              <div className="glass-card chart-card">
                <h2>Steps Progress</h2>
                <Line data={stepsChartData} />
              </div>

              <div className="glass-card chart-card">
                <h2>Calories Analysis</h2>
                <Bar data={caloriesChartData} />
              </div>
            </div>

            <div className="glass-card">
              <h2><FaClipboardList /> Workout Planner</h2>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Add workout task"
                  value={plannerTask}
                  onChange={(e) => setPlannerTask(e.target.value)}
                />
                <button className="primary-btn" onClick={addPlannerTask}>
                  Add Plan
                </button>
              </div>

              <ul className="planner-list">
                {planner.map((task) => (
                  <li key={task._id}>
                    <span className={task.completed ? "task-completed" : ""}>{task.title}</span>
                    <div className="planner-actions">
                      <button onClick={() => togglePlannerTask(task._id)}>
                        {task.completed ? "Undo" : "Done"}
                      </button>
                      <button onClick={() => deletePlannerTask(task._id)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card">
              <h2><FaAppleAlt /> Meal Planner</h2>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Meal title"
                  value={mealTitle}
                  onChange={(e) => setMealTitle(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Calories"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                />
                <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="styled-select">
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
                <button className="primary-btn" onClick={addMeal}>
                  Add Meal
                </button>
              </div>

              <ul className="planner-list">
                {meals.map((meal) => (
                  <li key={meal._id}>
                    <span>
                      {meal.title} - {meal.calories} cal ({meal.mealType})
                    </span>
                    <button onClick={() => deleteMeal(meal._id)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card ai-chat-card">
              <h2><FaRobot /> AI Fitness Chatbot</h2>
              <div className="chat-box">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.sender === "user" ? "user-msg" : "ai-msg"}`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="form-row">
                <input
                  type="text"
                  placeholder="Ask about workout, water, sleep, BMI, meals..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button className="primary-btn" onClick={sendChat}>
                  Send
                </button>
              </div>
            </div>

            <div className="glass-card">
              <h2>Recent Fitness Records</h2>
              {fitnessData.length === 0 ? (
                <p>No data found yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Steps</th>
                      <th>Calories</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fitnessData.map((item) => (
                      <tr key={item._id}>
                        <td>{item.steps}</td>
                        <td>{item.calories}</td>
                        <td>{new Date(item.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="right-panel">
            <div className="glass-card ai-card">
              <h2><FaRobot /> AI Recommendation</h2>
              <p>{aiRecommendation()}</p>
            </div>

            <div className="glass-card tip-card">
              <h2><FaTint /> Water Tracker</h2>
              <p>{hydrationTip()}</p>
              <div className="water-controls">
                <button onClick={() => setWaterCount(Math.max(waterCount - 1, 0))}>-</button>
                <span>{waterCount} glasses</span>
                <button onClick={() => setWaterCount(waterCount + 1)}>+</button>
              </div>
            </div>

            <div className="glass-card sleep-card">
              <h2><FaBed /> Sleep Tracker</h2>
              <input
                type="number"
                placeholder="Sleep hours"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />
              <button className="primary-btn full-btn" onClick={saveHealthLog}>
                Save Health Log
              </button>
              <p>Last saved sleep: {latestSleep} hrs</p>
              <p>Last saved water: {latestWater} glasses</p>
            </div>

            <div className="glass-card progress-card">
              <h2>Goal Progress</h2>
              <div className="goal-chart-wrap">
                <Doughnut data={goalChartData} />
              </div>
              <p>{avgSteps} / {goal} average steps</p>
            </div>

            <div className="glass-card bmi-card">
              <h2><FaCalculator /> BMI Calculator</h2>
              <input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <button className="primary-btn full-btn" onClick={calculateBMI}>
                Calculate BMI
              </button>

              {bmi && (
                <div className="bmi-result">
                  <h3>BMI: {bmi}</h3>
                  <p>Status: {bmiStatus()}</p>
                </div>
              )}
            </div>

            <div className="glass-card streak-card">
              <h2><FaTrophy /> Weekly Streak</h2>
              <p>{weeklyStreak} active day(s) recorded</p>
              <div className="badge-grid">
                {achievements.map((badge, index) => (
                  <div
                    key={index}
                    className={`badge-card ${badge.unlocked ? "unlocked" : "locked"}`}
                  >
                    {badge.title}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card quick-metrics">
              <h2>Quick Insights</h2>
              <ul>
                <li>Average Calories: {avgCalories}</li>
                <li>Latest Steps: {latestSteps}</li>
                <li>Workout Consistency: {totalRecords >= 5 ? "Strong" : "Improving"}</li>
                <li>Suggested Goal: {avgSteps < 7000 ? "8,000+" : "10,000+"}</li>
                <li>Meals Added: {meals.length}</li>
              </ul>
            </div>
            
          </div>
          
        </section>
      </div>
      )}

      {path === "/activity" && (
        <div className="dashboard-container">
          <h1>Activity Tracking</h1>
          <p>Track your steps, calories, and daily fitness records here.</p>
        </div>
      )}

      {path === "/health" && (
        <div className="dashboard-container">
          <h1>Health Tracker</h1>
          <p>Track water, sleep, BMI, and health logs here.</p>
        </div>
      )}

      {path === "/planner" && (
        <div className="dashboard-container">
          <h1>Workout & Meal Planner</h1>
          <p>Manage workout tasks and meal plans here.</p>
        </div>
      )}

      {path === "/ai" && (
        <div className="dashboard-container">
          <h1>AI Fitness Coach</h1>
          <p>Get AI-based fitness suggestions and chatbot support here.</p>
        </div>
      )}
    </div>
              
  );
}

export default Dashboard;