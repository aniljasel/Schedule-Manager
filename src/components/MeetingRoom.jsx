import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, increment } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "./MeetingRoom.css";

const ManageMeetings = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    host: "",
    date: "",
    time: "",
    type: "Video",
    participants: 0,
  });

  // State for Join Meeting Form
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinFormData, setJoinFormData] = useState({
    name: "",
    meetingId: "",
  });

  // Open Join Meeting Form
  const openJoinForm = (meetingId) => {
    const meeting = data.find(d => d.id === meetingId);
    setJoinFormData({ name: "", meetingId: meetingId, roomId: meeting?.roomId });
    setJoinModalOpen(true);
  };

  // Handle Join Meeting Submit
  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinFormData.name) {
      alert("Please enter your name.");
      return;
    }
    try {
      await updateDoc(doc(db, "meetings", joinFormData.meetingId), {
        participants: increment(1),
      });
      await fetchMeetings();
      setJoinModalOpen(false);
      localStorage.setItem("meetingUserName", joinFormData.name); // Save name
      navigate(`/meeting/${joinFormData.roomId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to join meeting");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // etch all meetings
  const fetchMeetings = async () => {
    const snapshot = await getDocs(collection(db, "meetings"));
    const meetings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setData(meetings);
  };

  // Open create form
  const openCreateForm = () => {
    setEditingMeeting(null);
    setFormData({
      title: "",
      host: "",
      date: "",
      time: "",
      type: "Video",
      participants: 0,
    });
    setModalOpen(true);
  };

  // 🔹 Open edit form
  const openEditForm = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title || "",
      host: meeting.host || "",
      date: meeting.date || "",
      time: meeting.time || "",
      type: meeting.type || "Video",
      participants: meeting.participants || 0,
    });
    setModalOpen(true);
  };

  // 🔹 Save meeting (create or update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.host || !formData.date || !formData.time) {
      alert("Please fill all required fields.");
      return;
    }
    const meetingData = {
      title: formData.title,
      host: formData.host,
      date: formData.date,
      time: formData.time, 
      type: formData.type,
      participants: Number(formData.participants) || 0,
      roomId: editingMeeting?.roomId || crypto.randomUUID(),
      meetingUrl: editingMeeting?.meetingUrl || `${window.location.origin}/meeting/${editingMeeting?.roomId || crypto.randomUUID()}`
    };
    try {
      if (editingMeeting) {
        await updateDoc(doc(db, "meetings", editingMeeting.id), meetingData);
      } else {
        await addDoc(collection(db, "meetings"), meetingData);
      }
      await fetchMeetings();
      setModalOpen(false);
    } catch (err) {
      alert("Failed to save meeting.");
      console.error(err);
    }
  };

  // Join meeting (increase participants)
  const joinMeeting = async (meetingId) => {
    await updateDoc(doc(db, "meetings", meetingId), {
      participants: increment(1),
    });
    fetchMeetings();
  };

  // Delete meeting
  const handleDelete = async (meetingId) => {
    if (window.confirm("Delete meeting?")) {
      await deleteDoc(doc(db, "meetings", meetingId));
      fetchMeetings();
    }
  };

  // 🔹 Filtering logic
  const filteredData = data
    .filter((m) =>
      (m.title + m.host).toLowerCase().includes(search.toLowerCase())
    )
    .filter((m) => {
      const today = new Date();
      const meetingDate = new Date(`${m.date}T${time12to24(m.time) || "00:00"}`);
      if (filter === "today") return m.date === formatDate(today);
      if (filter === "upcoming") return meetingDate > today;
      if (filter === "past") return meetingDate < today;
      if (filter === "video") return (m.type || "").toLowerCase().includes("video");
      return true;
    });

  // 🔹 Helper to format date (YYYY-MM-DD)
  function formatDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function normalizeDate(d) {
    if (!d) return "";
    if (d.includes("-") && d.split("-")[0].length === 4) return d; // YYYY-MM-DD
    if (d.includes("-")) {
        const [day, month, year] = d.split("-");
        return `${year}-${month}-${day}`;
    }
    return d;
    }

  return (
    <main className="mm-main">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="controls">
          <div className="search">
            <i className="fa fa-search"></i>
            <input
              type="search"
              placeholder="Search meetings, participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn" onClick={openCreateForm}>
              + New
            </button>
          </div>
          <div className="filters">
            {["all", "today", "upcoming", "past", "video"].map((f) => (
              <button
                key={f}
                className={`chip ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="upcoming">
            <h3>Next meetings</h3>
            {filteredData.slice(0, 3).map((n) => (
              <div key={n.id} className="mini-card">
                <div className="mini-time">{n.time}</div>
                <div>
                  <div className="mini-title">{n.title}</div>
                  <div className="mini-meta">
                    {n.host} • {n.participants} participants
                  </div>
                </div>
              </div>
            ))}
            {filteredData.slice(0, 3).length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.6)" }}>
                No upcoming meetings
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <section className="content">
        <div className="topbar">
          <div>
            <div className="title">Your Meetings</div>
            <div
              className="subtitle"
              style={{ fontSize: "13px" }}
            >
              Smart view with priority & quick actions
            </div>
          </div>
          <div className="stats">
            <div className="stat">{data.length} meetings</div>
            <div className="stat">
              {data.filter((m) => normalizeDate(m.date) === formatDate(new Date())).length} today
            </div>
          </div>
        </div>

        <div className="grid">
          {filteredData.map((m) => (
            <div key={m.id} className="meeting-card">
              <div className="meeting-head">
                <div>
                  <h4 className="meeting-title">{m.title}</h4>
                  <div className="meeting-meta">
                    {m.host} • {m.date} {m.time}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {m.type} P. {m.participants}
                </div>
              </div>
              <div className="participants">
                <div className="avatar">
                  {m.host ? m.host[0].toUpperCase() : ""}
                </div>
                <div style={{ flex: 1 }}></div>
              </div>
              <div className="card-footer">
                <div
                  style={{
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    width: "260px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  ID: {m.id}
                </div>
                <div>
                  <button className="small-btn" onClick={() => openJoinForm(m.id)}>
                    Join
                  </button>
                  <button className="small-btn" onClick={() => openEditForm(m)}>
                    Edit
                  </button>
                  <button className="small-btn" onClick={() => handleDelete(m.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <aside className="timeline">
        <h3>Today timeline</h3>
        <div className="timeline-list">
          {data
            .filter((m) => normalizeDate(m.date) === formatDate(new Date()))
            .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
            .map((t) => (
                <div key={t.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div>
                    <div style={{ fontWeight: "700" }}>{t.title}</div>
                    <div className="timeline-content">
                    {t.time} • {t.host} • {t.type}
                    </div>
                </div>
                </div>
            ))}
          {data.filter((m) => normalizeDate(m.date) === formatDate(new Date())).length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.6)" }}>No items today</div>
          )}
        </div>
      </aside>

      {/* Modal for Create / Edit */}
      {modalOpen && (
        <div className="popup-overlay" >
          <form onSubmit={handleFormSubmit} className="modal-form">
          <button className="popup-close-btn" onClick={() => setModalOpen(false)}>✖</button>
            <h2>{editingMeeting ? "Edit Meeting" : "New Meeting"}</h2>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Host Name"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <input
              type="time"
              value={formData.time ? time12to24(formData.time) : ""}
              onChange={(e) => setFormData({ ...formData, time: time24to12(e.target.value) })}
              required
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Video">Video</option>
              <option value="In-Person">In-Person</option>
            </select>
            <input
              type="number"
              placeholder="Participants"
              value={formData.participants}
              min={0}
              onChange={(e) =>
                setFormData({ ...formData, participants: e.target.value })
              }
            />
            <div className="modal-actions">
              <button type="submit" className="btn">
                Save
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      { /* Modal for Join Meeting */ }
      {joinModalOpen && (
        <div className="popup-overlay">
          <form onSubmit={handleJoinSubmit} className="modal-form">
            <button className="popup-close-btn" onClick={() => setJoinModalOpen(false)}>✖</button>
            <h2>Join Meeting</h2>

            <input
              type="text"
              placeholder="Your Name"
              value={joinFormData.name}
              onChange={(e) => setJoinFormData({ ...joinFormData, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Meeting ID"
              value={joinFormData.meetingId}
              readOnly
            />

            <div className="modal-actions">
              <button
                type="submit"
                className="btn"
                onClick={() => navigate(`/meeting/${joinFormData.roomId}`)}
              >
                Join Meeting
              </button>
              <button type="button" className="btn btn-cancel" onClick={() => setJoinModalOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

// 🔹 Convert "10:30 AM" → "10:30"
function time12to24(time12) {
  if (!time12) return "";
  let [time, modifier] = time12.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// 🔹 Convert "10:30" → "10:30 AM"
function time24to12(time24) {
  if (!time24) return "";
  let [h, m] = time24.split(":");
  h = parseInt(h, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export default ManageMeetings;
