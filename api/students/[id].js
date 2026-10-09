import mongoose from "mongoose";
import { connectDatabase, sendError, Student, studentData } from "../_db.js";

export default async function handler(request, response) {
  const { id } = request.query;
  if (!mongoose.isObjectIdOrHexString(id)) {
    return response.status(400).json({ message: "Invalid student ID." });
  }

  try {
    await connectDatabase();

    if (request.method === "PUT") {
      const data = studentData(request.body);
      if (!data) return response.status(400).json({ message: "Name, course, and a non-negative whole-number age are required." });
      const student = await Student.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      return student ? response.status(200).json(student) : response.status(404).json({ message: "Student not found." });
    }

    if (request.method === "DELETE") {
      const student = await Student.findByIdAndDelete(id);
      return student ? response.status(200).json({ message: "Student deleted successfully." }) : response.status(404).json({ message: "Student not found." });
    }

    response.setHeader("Allow", ["PUT", "DELETE"]);
    return response.status(405).json({ message: "Method not allowed." });
  } catch (error) {
    return sendError(response, error);
  }
}
