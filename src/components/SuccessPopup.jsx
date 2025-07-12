import './SuccessPopup.css';

function SuccessPopup({ message, onClose }) {
  return (
    <div className="success-popup-overlay" onClick={onClose}>
      <div className="success-popup-card" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default SuccessPopup;
