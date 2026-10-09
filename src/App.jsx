import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "/api"),
});
const empty = { name: "", course: "", age: "" };
export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function loadStudents() { const { data } = await api.get("/students"); setStudents(data); }
  function report(error) { setError(error.response?.data?.message || "Request failed. Check the backend and MongoDB connection."); }
  useEffect(() => {
    let active = true;
    api.get("/students")
      .then(({ data }) => { if (active) setStudents(data); })
      .catch(error => { if (active) report(error); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  function reset() { setForm(empty); setEditingId(null); }
  function edit(student) {
    setEditingId(student._id);
    setForm({ name: student.name, course: student.course, age: String(student.age) });
    setError(""); setMessage("");
  }
  async function save(event) {
    event.preventDefault();
    const data = { name: form.name.trim(), course: form.course.trim(), age: Number(form.age) };
    if (!data.name || !data.course || form.age === "" || !Number.isInteger(data.age) || data.age < 0) {
      setError("Enter a name, course, and a non-negative whole-number age."); return;
    }
    setBusy(true); setError(""); setMessage("");
    try {
      if (editingId) await api.put(`/students/${editingId}`, data);
      else await api.post("/students", data);
      setMessage(editingId ? "Student updated successfully." : "Student added successfully.");
      reset(); await loadStudents();
    } catch (error) { report(error); } finally { setBusy(false); }
  }
  async function remove(student) {
    if (!window.confirm(`Delete ${student.name}?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await api.delete(`/students/${student._id}`);
      if (editingId === student._id) reset();
      setMessage("Student deleted successfully."); await loadStudents();
    } catch (error) { report(error); } finally { setBusy(false); }
  }
  return <main className="app">
    <h1>Student Management System</h1>
    <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
    <form onSubmit={save}><fieldset disabled={busy || loading}>
      <label htmlFor="name">Name</label>
      <input id="name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <label htmlFor="course">Course</label>
      <input id="course" required value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
      <label htmlFor="age">Age</label>
      <input id="age" type="number" min="0" step="1" required value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
      <div className="actions"><button type="submit">{busy ? "Saving..." : editingId ? "Update Student" : "Add Student"}</button>
      {editingId && <button type="button" onClick={reset}>Cancel</button>}</div>
    </fieldset></form>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    <h2>Students ({students.length})</h2>
    {loading ? <p>Loading students...</p> : students.length === 0 ? <p>No students found.</p> : <ul>
      {students.map(student => <li key={student._id}>
        <div className="student-details"><strong>{student.name}</strong><span>{student.course}</span><span>Age: {student.age}</span></div>
        <div className="actions"><button disabled={busy} onClick={() => edit(student)}>Edit</button><button className="danger" disabled={busy} onClick={() => remove(student)}>Delete</button></div>
      </li>)}
    </ul>}
  </main>;
}

