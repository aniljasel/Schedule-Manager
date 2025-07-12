import './PrivacyPolicy.css';

function PrivacyPolicy({ onClose }) {
  return (
    <div className="privacy-modal-overlay" onClick={onClose}>
      <section className="privacy-Container" onClick={e => e.stopPropagation()}>
        <div className="privacy-content">
          <h2>Privacy Policy</h2>
          <p>
            <strong>Schedule Manager</strong> values your privacy. We are committed to protecting your personal information and your right to privacy.
          </p>
          <h3>What Data We Collect</h3>
          <ul>
            <li>Your name, email, and password (encrypted, never shared).</li>
            <li>Your tasks, teams, and schedule data (private to your account).</li>
          </ul>
          <h3>How We Use Your Data</h3>
          <ul>
            <li>To provide and improve our scheduling and team management services.</li>
            <li>To keep your data secure and accessible only to you.</li>
            <li>We never sell or share your data with third parties.</li>
          </ul>
          <h3>Your Rights</h3>
          <ul>
            <li>You can delete your account and all your data at any time.</li>
            <li>You can contact us for any privacy-related questions.</li>
          </ul>
          <h3>Security</h3>
          <p>
            All your data is stored securely using modern encryption and authentication via Firebase. Only you have access to your private information.
          </p>
          <h3>Contact</h3>
          <p>
            For privacy concerns, contact us at <a href="mailto:support@schedulemanager.com">support@schedulemanager.com</a>
          </p>
          <button className="popup-close" onClick={onClose}>✖</button>
        </div>
      </section>
    </div>
  );
}

export default PrivacyPolicy;