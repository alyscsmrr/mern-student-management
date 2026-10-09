import dns from "node:dns";
import mongoose from "mongoose";

let connectionPromise;

export function connectDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured in Vercel.");
  }

  if (process.env.MONGO_URI.startsWith("mongodb+srv://")) {
    const servers = dns.getServers();
    if (servers.length === 0 || servers.every((server) => server === "127.0.0.1" || server === "::1")) {
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
    }
  }

  connectionPromise ||= mongoose.connect(process.env.MONGO_URI);
  return connectionPromise;
}

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0 },
});

export const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

export function studentData(body) {
  const { name, course, age } = body || {};
  if (typeof name !== "string" || !name.trim() || typeof course !== "string" || !course.trim() || !Number.isInteger(age) || age < 0) {
    return null;
  }
  return { name: name.trim(), course: course.trim(), age };
}

export function sendError(response, error) {
  console.error(error);
  response.status(error.name === "ValidationError" ? 400 : 500).json({ message: error.message });
}
