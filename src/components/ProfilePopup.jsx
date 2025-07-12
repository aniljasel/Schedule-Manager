import './ProfilePopup.css';

function ProfilePopup({ user, onClose, onLoginClick, onRegisterClick, onLogout }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        {user ? (
          <>
            <div className="popup-header">
              <img
                src={user.avatar}
                alt="avatar"
                className="popup-avatar"
              />
            </div>
            <div className="popup-body">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <button className="popup-button logout-btn" onClick={onLogout}>Logout</button>
              <button className="popup-close" onClick={onClose}>✖</button>
            </div>
          </>
        ) : (
          <div className="popup-body">
            <h2>Not Logged In</h2>
            <p>Please log in or create an account to access your profile.</p>
            <button className="popup-button edit-btn" onClick={onLoginClick}>Login</button>
            <button className="popup-button logout-btn" onClick={onRegisterClick}>Register</button>
            <button className="popup-close" onClick={onClose}>✖</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePopup;
