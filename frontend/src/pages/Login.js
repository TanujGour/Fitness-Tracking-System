import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  console.log("API_URL:", API_URL);

  const GOOGLE_CLIENT_ID = "592965798708-vj3ekp140gv3neg2jaj71du2jm6kojsc.apps.googleusercontent.com";

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/login`, form);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", form.username);
        navigate("/dashboard");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      if (error.response) {
        alert("Login failed: " + error.response.data);
      } else {
        alert("Login failed: backend not reachable");
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
            localStorage.setItem("username", res.data.username || profile.name);
            localStorage.setItem("photo", profile.picture);
            navigate("/dashboard");
          }
        } catch (err) {
          alert("Google login failed");
          console.error(err);
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "filled_blue",
      size: "large",
      type: "standard",
      text: "signin_with",
      shape: "pill",
      width: 320,
    });
  }, [navigate, API_URL]);

  return (
    <div className="auth-modern-page login-modern-bg">
      <div className="auth-modern-wrapper">
        <div className="auth-side-content">
          <span className="badge-pill">Welcome Back</span>
          <h1>Continue Your Journey</h1>
          <p>
            Log in to view your dashboard, add new records, monitor progress,
            and access AI-powered fitness guidance.
          </p>

          <div className="auth-side-points">
            <div className="side-point">✔ Daily health tracking</div>
            <div className="side-point">✔ Progress charts</div>
            <div className="side-point">✔ Goal-based dashboard</div>
            <div className="side-point">✔ Personalized recommendations</div>
          </div>
        </div>

        <div className="auth-modern-card">
          <div className="back-btn-wrap">
  <Link to="/" className="back-btn">
    ← Back to Home
  </Link>
</div>
          <h2>Login</h2>
          <p>Access your smart fitness dashboard</p>

          <input
            type="text"
            placeholder="Enter username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </button>

          <button className="btn btn-primary full-btn" onClick={handleLogin}>
            Sign In
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div ref={googleBtnRef} className="google-btn-wrap"></div>

          <p className="auth-switch-text">
            New here? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;