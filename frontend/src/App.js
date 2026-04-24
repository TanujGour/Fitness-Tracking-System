import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Activity from "./pages/Activity";
import Health from "./pages/Health";
import Planner from "./pages/Planner";
import AI from "./pages/AI";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activity" element={<Dashboard />} />
        <Route path="/health" element={<Dashboard />} />
        <Route path="/planner" element={<Dashboard />} />
        <Route path="/ai" element={<Dashboard />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/health" element={<Health />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/ai" element={<AI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;