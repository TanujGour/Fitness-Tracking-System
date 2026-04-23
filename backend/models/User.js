const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    steps: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const plannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const mealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    calories: { type: Number, default: 0 },
    mealType: { type: String, default: "General" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const healthLogSchema = new mongoose.Schema(
  {
    water: { type: Number, default: 0 },
    sleep: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },

profile: {
  fullName: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  dob: { type: String, default: "" },
  age: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  height: { type: Number, default: 0 }, // store in cm
  goalSteps: { type: Number, default: 10000 },
  photoUrl: { type: String, default: "" }
},


  data: [activitySchema],
  planner: [plannerSchema],
  meals: [mealSchema],
  healthLogs: [healthLogSchema],
});

module.exports = mongoose.model("User", userSchema);