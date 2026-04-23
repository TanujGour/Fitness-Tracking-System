const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const User = require("./models/User");

const GOOGLE_CLIENT_ID = "592965798708-vj3ekp140gv3neg2jaj71du2jm6kojsc.apps.googleusercontent.com";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.log("❌ DB Error:", err.message));

// ---------- AUTH MIDDLEWARE ----------
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send("Access denied");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).send("Invalid token");
  }
}

// ---------- AUTH ROUTES ----------
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("All fields required");
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

  const user = new User({
  username,
  password: hashed,
  profile: {
    fullName: username,
    email: username,
    goalSteps: 10000,
  },
  planner: [
    { title: "30 min cardio", completed: false },
    { title: "Drink 2L water", completed: false },
    { title: "Stretching session", completed: false },
  ],
  meals: [],
  healthLogs: [],
  data: [],
});

    await user.save();
    res.send("User registered successfully");
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("Server error during registration");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("All fields required");
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("Wrong password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      username: user.username,
    });
  } catch (err) {
  console.error("Google login error full:", err);
  console.error("Google login error message:", err.message);
  res.status(401).send(err.message || "Google authentication failed");
}
});

// ---------- GOOGLE LOGIN ----------
app.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).send("Missing Google credential");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID, // ✅ FIXED
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).send("Invalid Google account data");
    }

    const email = payload.email;
    const name = payload.name || email;
    const picture = payload.picture;

    let user = await User.findOne({ username: email });

    // ✅ CREATE USER IF NOT EXISTS
    if (!user) {
      const hashed = await bcrypt.hash("google_login_user", 10);

      user = new User({
        username: email,
        password: hashed,
        profile: {
          fullName: name,
          email: email,
          goalSteps: 10000,
          photoUrl: picture,
        },
        planner: [
          { title: "30 min cardio", completed: false },
          { title: "Drink 2L water", completed: false },
          { title: "Stretching session", completed: false },
        ],
        meals: [],
        healthLogs: [],
        data: [],
      });

      await user.save(); // ✅ VERY IMPORTANT
    }

    // ✅ UPDATE PHOTO IF MISSING
    if (!user.profile.photoUrl && picture) {
      user.profile.photoUrl = picture;
      await user.save();
    }

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      username: user.profile?.fullName || user.username,
    });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).send("Google authentication failed");
  }
});

// ---------- PROFILE ----------
app.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username profile");
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).send("Failed to fetch profile");
  }
});

app.put("/profile", auth, async (req, res) => {
  try {
    const { fullName, email, phone, dob, age, weight, height, goalSteps, photoUrl } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    user.profile.fullName = fullName ?? user.profile.fullName;
    user.profile.email = email ?? user.profile.email;
    user.profile.phone = phone ?? user.profile.phone;
    user.profile.dob = dob ?? user.profile.dob;
    user.profile.age = Number(age ?? user.profile.age);
    user.profile.weight = Number(weight ?? user.profile.weight);
    user.profile.height = Number(height ?? user.profile.height);
    user.profile.goalSteps = Number(goalSteps ?? user.profile.goalSteps);
    user.profile.photoUrl = photoUrl ?? user.profile.photoUrl;

    await user.save();
    res.json({ message: "Profile updated successfully", profile: user.profile });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).send("Failed to update profile");
  }
});

// ---------- FITNESS DATA ----------
app.post("/add", auth, async (req, res) => {
  try {
    const { steps, calories } = req.body;

    if (steps === undefined || calories === undefined) {
      return res.status(400).send("Steps and calories are required");
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    user.data.push({
      steps: Number(steps),
      calories: Number(calories),
      date: new Date(),
    });

    await user.save();
    res.send("Data added successfully");
  } catch (err) {
    console.error("Add data error:", err);
    res.status(500).send("Failed to add data");
  }
});

app.get("/data", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("data");
    if (!user) return res.status(404).send("User not found");
    res.json(user.data);
  } catch (err) {
    console.error("Get data error:", err);
    res.status(500).send("Failed to fetch data");
  }
});

// ---------- HEALTH LOGS ----------
app.post("/health-log", auth, async (req, res) => {
  try {
    const { water, sleep } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    user.healthLogs.push({
      water: Number(water || 0),
      sleep: Number(sleep || 0),
      date: new Date(),
    });

    await user.save();
    res.send("Health log saved");
  } catch (err) {
    console.error("Health log error:", err);
    res.status(500).send("Failed to save health log");
  }
});

app.get("/health-log", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("healthLogs");
    if (!user) return res.status(404).send("User not found");
    res.json(user.healthLogs);
  } catch (err) {
    console.error("Health log fetch error:", err);
    res.status(500).send("Failed to fetch health logs");
  }
});

// ---------- WORKOUT PLANNER ----------
app.get("/planner", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("planner");
    if (!user) return res.status(404).send("User not found");
    res.json(user.planner);
  } catch (err) {
    console.error("Planner fetch error:", err);
    res.status(500).send("Failed to fetch planner");
  }
});

app.post("/planner", auth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).send("Task title is required");

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    user.planner.push({ title, completed: false });
    await user.save();

    res.send("Planner task added");
  } catch (err) {
    console.error("Planner add error:", err);
    res.status(500).send("Failed to add planner task");
  }
});

app.put("/planner/:taskId/toggle", auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    const task = user.planner.id(taskId);
    if (!task) return res.status(404).send("Task not found");

    task.completed = !task.completed;
    await user.save();

    res.send("Planner task updated");
  } catch (err) {
    console.error("Planner toggle error:", err);
    res.status(500).send("Failed to update planner task");
  }
});

app.delete("/planner/:taskId", auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    user.planner = user.planner.filter((task) => task._id.toString() !== taskId);
    await user.save();

    res.send("Planner task removed");
  } catch (err) {
    console.error("Planner delete error:", err);
    res.status(500).send("Failed to remove planner task");
  }
});

// ---------- MEAL PLANNER ----------
app.get("/meals", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("meals");
    if (!user) return res.status(404).send("User not found");
    res.json(user.meals);
  } catch (err) {
    console.error("Meals fetch error:", err);
    res.status(500).send("Failed to fetch meals");
  }
});

app.post("/meals", auth, async (req, res) => {
  try {
    const { title, calories, mealType } = req.body;
    if (!title) return res.status(400).send("Meal title is required");

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    user.meals.push({
      title,
      calories: Number(calories || 0),
      mealType: mealType || "General",
    });

    await user.save();
    res.send("Meal added successfully");
  } catch (err) {
    console.error("Meal add error:", err);
    res.status(500).send("Failed to add meal");
  }
});

app.delete("/meals/:mealId", auth, async (req, res) => {
  try {
    const { mealId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    user.meals = user.meals.filter((meal) => meal._id.toString() !== mealId);
    await user.save();

    res.send("Meal removed successfully");
  } catch (err) {
    console.error("Meal delete error:", err);
    res.status(500).send("Failed to remove meal");
  }
});

// ---------- HEALTH CHECK ----------
app.get("/", (req, res) => {
  res.send("Fitness Training and Management System API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});