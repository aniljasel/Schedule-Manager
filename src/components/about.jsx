import './about.css'

function About({ onClose, onPrivacy }) {
    return (
        <div className="about-modal-overlay" onClick={onClose}>
            <section className="About-Container" id="aboutContainer" onClick={e => e.stopPropagation()}>
                <div className="about-content">
                    <h2>About Schedule Manager</h2>
                    <p>
                        Schedule Manager is a simple and efficient web application built using <strong> React </strong>
                        it helps users plan, organize, and manage their daily tasks or appointments effictively.
                    </p>
                    <h3>Key Features:</h3>
                    <ul>
                        <li>Create New Task.</li>
                        <li>update, and delete Scheduled Tasks.</li>
                        <li>Clean and Responsive user friendly interface.</li>
                        <li>Persistent data using localstorage and Firebase.</li>
                    </ul>
                    <h3>Technologies Used:</h3>
                    <ul>
                        <li>React JS-For dynamic UI and state management.</li>
                        <li>HTML5 & CSS3 - For structure and styling.</li>
                        <li>JavaScript - For logic and interactivity.</li>
                    </ul>
                    <p>
                        Read our <a href="#" onClick={e => { e.preventDefault(); onPrivacy(); }}>Privacy Policy</a>.
                    </p>
                    <button className="popup-close" onClick={onClose}>✖</button>
                </div>
            </section>
        </div>
    );
}


export default About;