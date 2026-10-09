import { connectDatabase, sendError, Student, studentData } from "../_db.js";

export default async function handler(request, response) {
  try {
    await connectDatabase();

    if (request.method === "GET") {
      return response.status(200).json(await Student.find());
    }

    if (request.method === "POST") {
      const data = studentData(request.body);
      if (!data) return response.status(400).json({ message: "Name, course, and a non-negative whole-number age are required." });
      return response.status(201).json(await Student.create(data));
    }

    response.setHeader("Allow", ["GET", "POST"]);
    return response.status(405).json({ message: "Method not allowed." });
  } catch (error) {
    return sendError(response, error);
  }
}
