import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import './AuthPopup.css';
import apple from '../assets/apple.png';
import google from '../assets/google.png';

function RegisterPopup({ onClose, onLoginClick }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: userCredential.user.email,
        uid: userCredential.user.uid,
      });

      onClose(); // close popup after success
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
      }, { merge: true });

      onClose();
    } catch (err) {
      console.error("Google sign-in error:", err.message);
      setError(err.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        uid: user.uid,
      }, { merge: true });

      onClose();
    } catch (err) {
      console.error("Apple sign-in error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="popup-button edit-btn">Register</button>
          <span>Already have an account? <a href="#" onClick={e => {
            e.preventDefault();
            onLoginClick();
          }}>Login</a></span>
        </form>

        <button className="social-button" onClick={handleGoogleSignIn}>
          <img
            src={google} alt="Google logo"
            className="social-logo"
          />
          Continue with Google
        </button>

        <button className="social-button" onClick={handleAppleSignIn}>
          <img
            src={apple} alt="Apple logo"
            className="social-logo"
          />
          Continue with Apple
        </button>

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        <button className="popup-close" onClick={onClose}>✖</button>
      </div>
    </div>
  );
}

export default RegisterPopup;