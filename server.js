const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "https://student-achievements-frontend-final.onrender.com",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));


// ---------------- MONGODB CONNECTION ----------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

// ---------------- SCHEMA ----------------
const StudentSchema = new mongoose.Schema({
  username: String,
  achievements: [
    {
      title: String,
      description: String,
      category: String,
    },
  ],
});

const Student = mongoose.model("Student", StudentSchema);

// ---------------- LOGIN API ----------------
app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  // Admin Login
  if (role === "Admin") {
    if (username === "admin" && password === "admin123") {
      return res.json({ success: true, role: "Admin", username });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }
  }

  // Student Login
  if (role === "Student") {
    if (password !== "student") {
      return res
        .status(401)
        .json({ success: false, message: "Student password incorrect" });
    }

    // Create if not exists
    let student = await Student.findOne({ username });
    if (!student) {
      student = new Student({ username, achievements: [] });
      await student.save();
    }

    return res.json({ success: true, role: "Student", username });
  }

  res.status(400).json({ success: false, message: "Invalid role" });
});

// ---------------- ADD ACHIEVEMENT ----------------
app.post("/achievements", async (req, res) => {
  const { username, title, description, category } = req.body;

  let student = await Student.findOne({ username });
  if (!student) return res.status(404).json({ message: "Student not found" });

  student.achievements.push({ title, description, category });
  await student.save();

  res.json({ message: "Achievement added", achievements: student.achievements });
});

// ---------------- GET STUDENT ACHIEVEMENTS ----------------
app.get("/achievements/:username", async (req, res) => {
  const student = await Student.findOne({ username: req.params.username });
  if (!student) return res.status(404).json({ message: "Student not found" });

  res.json(student.achievements);
});

// ---------------- START SERVER ----------------
app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
