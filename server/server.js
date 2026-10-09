require("dotenv").config();

const dns = require("node:dns");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Management API is running");
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


function studentData(req, res, next) {
  const { name, course, age } = req.body || {};
  if (typeof name !== "string" || !name.trim() || typeof course !== "string" || !course.trim() || typeof age !== "number" || !Number.isInteger(age) || age < 0) {
    return res.status(400).json({ message: "Name, course, and a non-negative whole-number age are required." });
  }
  req.studentData = { name: name.trim(), course: course.trim(), age };
  next();
}
app.param("id", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: "Invalid student ID." });
  next();
});
app.post("/students", studentData, async (req, res) => {
  try {
    const student = new Student(req.studentData);
    await student.save();
    res.status(201).json(student);
  } catch (error) { res.status(error.name === "ValidationError" ? 400 : 500).json({ message: error.message }); }
});
app.put("/students/:id", studentData, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.studentData, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (error) { res.status(error.name === "ValidationError" ? 400 : 500).json({ message: error.message }); }
});
app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ message: "Student deleted successfully." });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Add it to server/.env before starting the server.");
    process.exit(1);
  }

  try {
    // mongodb+srv URIs require DNS SRV lookups. Some Windows setups expose a
    // localhost DNS server to Node that refuses those queries.
    if (process.env.MONGO_URI.startsWith("mongodb+srv://")) {
      const configuredServers = dns.getServers();
      if (configuredServers.length === 0 || configuredServers.every((server) => server === "127.0.0.1" || server === "::1")) {
        dns.setServers(["1.1.1.1", "8.8.8.8"]);
      }
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
