import './HelpSupport.css';

function HelpSupport({ onClose }) {
  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <section className='help-support' id='HelpSupport' onClick={e => e.stopPropagation()}>
        <div className="popup-content">
          <h2>Help & Support</h2>
          <p>Welcome to the Help & Support center. We're here to assist you with any questions or issues you may have while using the application.</p>
          <p>Please review the frequently asked questions below. If you need further assistance, feel free to contact us!</p>

          <h3>FAQs</h3>
          <ul>
            <li>How to add a task?</li>
            <li>How to mark a task as complete?</li>
            <li>How to create a team?</li>
            <li>How to edit or delete a task?</li>
            <li>How to set task reminders?</li>
            <li>How do I filter tasks by date?</li>
            <li>How do I update a task's details?</li>
            <li>How do I reset my password?</li>
            <li>How can I export my schedule?</li>
          </ul>

          <h3>Contact Us</h3>
          <p>Email: support@schedulemanager.com</p>
          <p>Phone: +91-XXXXXXXXXX</p>
          <p>We aim to respond within 24 hours on business days.</p>
          <button className="popup-close" onClick={onClose}>✖</button>
        </div>
      </section>
    </div>
  );
}

export default HelpSupport;
