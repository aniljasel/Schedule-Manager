import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase"; // ✅ Adjust if your path is different
import "./AddTaskPopup.css";

function AddTaskPopup({ onClose }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("You must be logged in to add a task.");
        return;
      }

      await addDoc(collection(db, "tasks"), {
        title,
        description: desc,
        dueDate: Timestamp.fromDate(new Date(date)),
        completed: false,
        createdBy: userId,
        createdAt: Timestamp.now(),
      });

      onClose();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Error adding task. Please try again.");
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h2>Add Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
          />
          <button type="submit" className="popup-button">Add</button>
        </form>
        <button className="popup-close" onClick={onClose}>✖</button>
      </div>
    </div>
  );
}

export default AddTaskPopup;
