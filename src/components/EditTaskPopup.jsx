import React, { useState, useEffect } from 'react';
import './AuthPopup.css';

function EditTaskPopup({ onClose, onUpdate, initialTask }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDesc(initialTask.desc || initialTask.description || "");
      if (initialTask.dueDate) {
        let dateObj = initialTask.dueDate.toDate ? initialTask.dueDate.toDate() : new Date(initialTask.dueDate);
        setDate(dateObj.toISOString().slice(0, 10));
      } else {
        setDate("");
      }
    }
  }, [initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onUpdate({ ...initialTask, title, desc, date });
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <h2>Edit Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
          />
          <button type="submit" className="popup-button">Update</button>
        </form>
        <button className="popup-close" onClick={onClose}>✖</button>
      </div>
    </div>
  );
}

export default EditTaskPopup;