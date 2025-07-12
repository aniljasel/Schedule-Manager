import React from "react";
import "./AddTeamPopup.css";

function TermsOfService({ onClose }) {
  return (
    <div className="addteam-overlay" onClick={onClose}>
      <div className="addteam-card" onClick={e => e.stopPropagation()}>
        <h2>Terms of Service</h2>
        <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 20, color: "var(--sub-heading)" }}>
          <p>
            Welcome to Schedule Manager! By creating or joining a team, you agree to use this platform responsibly.
            <br /><br />
            <b>1. Usage:</b> You will not misuse the service or share inappropriate content.<br />
            <b>2. Privacy:</b> Your team data is private and only visible to your team members.<br />
            <b>3. Security:</b> Do not share your login credentials.<br />
            <b>4. Changes:</b> We may update these terms at any time.<br />
            <br />
            For questions, contact support.
          </p>
        </div>
        <button className="popup-close" onClick={onClose} style={{ position: "absolute", top: 10, right: 10, border: "none", fontSize: 22, cursor: "pointer" }}>✖</button>
      </div>
    </div>
  );
}

export default TermsOfService;