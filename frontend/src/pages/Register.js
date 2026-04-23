import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const GOOGLE_CLIENT_ID = "592965798708-vj3ekp140gv3neg2jaj71du2jm6kojsc.apps.googleusercontent.com";

  const handleRegister = async () => {
    if (!form.username || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/register`, form);
      alert(res.data);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        alert("Registration failed: " + error.response.data);
      } else {
        alert("Registration failed: backend not reachable");
      }
    }
  };

  useEffect(() => {
    if (!window.google || !googleBtnRef.current) return;
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const profile = jwtDecode(response.credential);

          const res = await axios.post(`${API_URL}/google-login`, {
            credential: response.credential,
            profile,
          });

          if (res.data.token) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("username", res.data.username || profile.name || "Google User");
            navigate("/dashboard");
          }
        } catch (err) {
          alert("Google sign-in failed");
          console.error(err);
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      type: "standard",
      text: "signup_with",
      shape: "pill",
      width: 320,
    });
  }, [navigate, API_URL]);

  return (
    <div className="auth-modern-page register-modern-bg">
      <div className="auth-modern-wrapper">
        <div className="auth-side-content">
          <span className="badge-pill">Create Your Fitness Account</span>
          <h1>Join Us</h1>
          <p>
            Build better habits, monitor your health, and unlock AI-powered
            suggestions designed for your activity patterns.
          </p>

          <div className="auth-side-points">
            <div className="side-point">✔ Track steps and calories</div>
            <div className="side-point">✔ Get smart AI advice</div>
            <div className="side-point">✔ Watch your progress visually</div>
            <div className="side-point">✔ Stay motivated every day</div>
          </div>
        </div>

        <div className="auth-modern-card">
          <div className="back-btn-wrap">
  <Link to="/" className="back-btn">
    ← Back to Home
  </Link>
</div>
          <h2>Create Account</h2>
          <p>Start your fitness transformation today</p>

          <input
            type="text"
            placeholder="Choose username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Choose password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </button>

          <button className="btn btn-primary full-btn" onClick={handleRegister}>
            Create Account
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div ref={googleBtnRef} className="google-btn-wrap"></div>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;