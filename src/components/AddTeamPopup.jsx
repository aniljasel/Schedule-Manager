import React, { useState } from "react";
import "./AddTeamPopup.css";
import TermsOfService from "./TermsOfService";

function AddTeamPopup({ onClose, onAddTeam }) {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [industry, setIndustry] = useState("");
  const [work, setWork] = useState("");
  const [role, setRole] = useState("");
  const [numMembers, setNumMembers] = useState(1);
  const [members, setMembers] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Step 1: Team Name
  const handleContinue = (e) => {
    e.preventDefault();
    if (teamName.trim()) setStep(2);
  };

  // Step 2: Industry/Work/Role
  const handleContinue2 = (e) => {
    e.preventDefault();
    if (industry && work && role) setStep(3);
  };

  // Step 3: Members
  const handleNumMembersChange = (e) => {
    let n = parseInt(e.target.value, 10);
    if (isNaN(n) || n < 0) n = 0;
    if (n > 20) n = 20;
    setNumMembers(n);
    setMembers((prev) => {
      const arr = [...prev];
      arr.length = n;
      for (let i = 0; i < n; i++) if (!arr[i]) arr[i] = "";
      return arr;
    });
  };

  const handleMemberNameChange = (idx, value) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? value : m)));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAddTeam({
      name: teamName,
      industry,
      work,
      role,
      members: members.filter((m) => m.trim()),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="addteam-overlay" onClick={onClose}>
      <div className="addteam-card" onClick={e => e.stopPropagation()}>
        {step === 1 && (
          <>
            <h2>Create your team</h2>
            <p>Empower your teammates with Schedule Manager.</p>
            <form onSubmit={handleContinue}>
              <label>Team name</label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                maxLength={120}
                required
                placeholder="Enter team name"
              />
              <div style={{ textAlign: "right", color: "var(--sub-heading)", fontSize: 13, marginBottom: 16 }}>
                {teamName.length}/120
              </div>
              <button type="submit" className="addteam-btn" disabled={!teamName.trim()}>
                Continue
              </button>
            </form>
            <p className="addteam-terms">
              By creating a team, you agree to our{" "}
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setShowTerms(true);
                }}
              >
                Terms of Service
              </a>.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2>About {teamName || "your team"}</h2>
            <p>Your answers will tailor your experience.</p>
            <form onSubmit={handleContinue2}>
              <label>What industry do you work in?</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} required>
                <option value="">Select your answer</option>
                <option value="IT">IT</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
              <label>What work do you do?</label>
              <select value={work} onChange={e => setWork(e.target.value)} required>
                <option value="">Select your answer</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Management">Management</option>
                <option value="Testing">Testing</option>
                <option value="Other">Other</option>
              </select>
              <label>What's your role?</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                required
                placeholder="Enter your role"
              />
              <button type="submit" className="addteam-btn" disabled={!industry || !work || !role}>
                Continue
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Team Members</h2>
            <form onSubmit={handleCreateTeam}>
              <label>Number of team members</label>
              <input
                type="number"
                min={0}
                max={20}
                value={numMembers}
                onChange={handleNumMembersChange}
                required
              />
              {numMembers > 0 && Array.from({ length: numMembers }).map((_, idx) => (
                <div key={idx}>
                  <label>Member {idx + 1} Name</label>
                  <input
                    type="text"
                    value={members[idx] || ""}
                    onChange={e => handleMemberNameChange(idx, e.target.value)}
                    required
                    placeholder={`Enter member ${idx + 1} name`}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="addteam-btn"
                disabled={members.some(m => !m.trim()) || loading}
              >
                {loading ? "Creating..." : "Create your team"}
              </button>
            </form>
          </>
        )}

        <button className="popup-close" onClick={onClose} style={{ position: "absolute", top: 10, right: 10, border: "none", fontSize: 22, cursor: "pointer" }}>✖</button>
      </div>
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
    </div>
  );
}

export default AddTeamPopup;