import './hero.css';
import './calendar.css';
import './inbox.css';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { onSnapshot, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import ProfilePopup from './ProfilePopup';
import LoginPopup from './LoginPopup';
import RegisterPopup from './RegisterPopup';
import SuccessPopup from './SuccessPopup';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import AddTaskPopup from './AddTaskPopup';
import EditTaskPopup from './EditTaskPopup';
import AddTeamPopup from './AddTeamPopup';
import userImg from '../assets/user.png';

// function to get date in yyyy-mm-dd format
function getTaskDate(dueDate) {
  if (!dueDate) return '';
  let dateObj;
  if (dueDate.toDate) {
    dateObj = dueDate.toDate();
  } else {
    dateObj = new Date(dueDate);
  }
  return dateObj.toISOString().slice(0, 10);
}

function Hero({ onUpdatesClick, onHelpClick }) {
  // Show Calander-----
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  // show inbox and today and Completed-----
  const [showInbox, setShowInbox] = useState(false);
  const [showToday, setShowToday] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  // Show profile, Login, Register, successMsg, Teams-------
  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  // Show add task popup-----
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  // show teams...
  const [showTeams, setShowTeams] = useState(false);
  // show meeting room
  const [showMeeting, setShowMeeting] = useState(false);


  // Fetch tasks from Firestore
  const fetchTasks = async (userId) => {
    setLoadingTasks(true);
    try {
      const q = query(collection(db, "tasks"), where("createdBy", "==", userId));
      const querySnapshot = await getDocs(q);
      const loadedTasks = [];
      querySnapshot.forEach((doc) => {
        loadedTasks.push({ id: doc.id, ...doc.data() });
      });
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setLoadingTasks(false);
  };

  const handleAddTask = async (task) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "tasks"), {
        ...task,
        createdBy: user.uid,
        completed: false,
        createdAt: new Date(),
        dueDate: task.dueDate || new Date(), // fallback to today
      });
      setSuccessMessage('Task added!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setShowAddTask(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Delete, Completed, Update buttons for task-----
  const handleDeleteTask = async (idx) => {
    const taskToDelete = tasks[idx];
    if (!taskToDelete) return;
    try {
      await deleteDoc(doc(db, "tasks", taskToDelete.id));
      setTasks(prev => prev.filter((_, i) => i !== idx));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleCompleteTask = async (idx) => {
    const taskToUpdate = tasks[idx];
    if (!taskToUpdate) return;
    try {
      await updateDoc(doc(db, "tasks", taskToUpdate.id), { completed: true });
      setTasks(prev => prev.map((t, i) => i === idx ? { ...t, completed: true } : t));
    } catch (error) {
      console.error("Error marking task as complete:", error);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    const taskToEdit = tasks[editIdx];
    if (!taskToEdit) return;
    try {
      await updateDoc(doc(db, "tasks", taskToEdit.id), updatedTask);
      setTasks(prev => prev.map((t, i) => i === editIdx ? { ...t, ...updatedTask } : t));
      setEditIdx(null);
      setEditTask(null);
      setSuccessMessage('Task updated!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const [editIdx, setEditIdx] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const handleEditTask = (idx) => {
    setEditIdx(idx);
    setEditTask(tasks[idx]);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setSuccessMessage('Logged in successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Listen to tasks live
        const q = query(collection(db, "tasks"), where("createdBy", "==", firebaseUser.uid));
        const unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
          const loadedTasks = [];
          querySnapshot.forEach((doc) => {
            loadedTasks.push({ id: doc.id, ...doc.data() });
          });
          setTasks(loadedTasks);
        });

        // Load teams and users (these are still fetched once)
        loadTeams(firebaseUser.uid);
        loadUsers(firebaseUser.uid);

        // Return cleanup function for tasks listener
        return () => {
          unsubscribeTasks();
        };
      } else {
        setTasks([]);
        setTeams([]);
        setAllUsers([]);
      }
    });

    // Return cleanup function for auth listener
    return () => unsubscribeAuth();
  }, []);

  // function for Logout
  const handleLogout = () => {
    signOut(auth).then(() => {
      setSuccessMessage('Logged out successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowProfile(false);
      setTeams([]);
      setAllUsers([]);
    });
  };
  // function for Calander
  const toggleCalendar = () => {
    setShowCalendar(prev => !prev);
    setShowInbox(false);
    setShowToday(false);
  };
  // function for inbox, today, completed----
  const toggleInbox = () => {
    setShowInbox(prev => !prev);
    setShowCalendar(false);
    setShowToday(false);
  };
  const toggleToday = () => {
    setShowToday(prev => !prev);
    setShowCalendar(false);
    setShowInbox(false);
  };
  const toggleCompleted = () => {
    setShowCompleted(prev => !prev);
    setShowInbox(false);
    setShowToday(false);
    setShowCalendar(false);
  };

  //function for meeting room
  const toggleMeeting = () => {
    setShowMeeting(prev => !prev);
    setShowInbox(false);
    setShowToday(false);
    setShowCalendar(false);
    setShowTeams(false);
  }

  // function for hand left toggle
  const handleLeftToggle = () => {
    const leftSection = document.querySelector('.hero-left');
    const rightSection = document.querySelector('.hero-right');
    const leftToggle = document.getElementById('left-toggle');

    if (leftSection && rightSection && leftToggle) {
      leftSection.classList.toggle('collapsed');
      rightSection.classList.toggle('expanded');
      leftToggle.classList.toggle('active');
      setTimeout(() => setCalendarKey(k => k + 1), 400);
    }
  };

  // function for Teams
  const loadTeams = async (userId) => {
    try {
      const q = query(collection(db, "teams"), where("createdBy", "==", userId));
      const querySnapshot = await getDocs(q);
      const loadedTeams = [];
      querySnapshot.forEach((doc) => {
        loadedTeams.push({ id: doc.id, ...doc.data() });
      });
      console.log("Loaded teams:", loadedTeams); // Debug line
      setTeams(loadedTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleDeleteTeam = async (idx) => {
    const teamToDelete = teams[idx];
    if (!teamToDelete) return;
    try {
      await deleteDoc(doc(db, "teams", teamToDelete.id));
      setTeams(prev => prev.filter((_, i) => i !== idx));
      setSuccessMessage('Team deleted!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error deleting team:", error);
      setSuccessMessage('Failed to delete team.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const loadUsers = async (currentUserId) => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== currentUserId) { // ← Fix here
          users.push({ id: doc.id, ...data });
        }
      });
      setAllUsers(users);
      console.log("Users loaded:", users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // function for create teams
  const handleCreateTeam = async (newTeam) => {
    if (!user) {
      setSuccessMessage("You must be logged in to create a team!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "teams"), {
        ...newTeam,
        createdBy: user.uid,
        createdAt: new Date(),
      });
      setTeams((prev) => [...prev, { id: docRef.id, ...newTeam }]);
      setSuccessMessage(`Team "${newTeam.name}" added!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowAddTeam(false);
    } catch (error) {
      console.error("Error adding team:", error);
      setSuccessMessage("Failed to add team. Please try again.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <section className="hero">
      <div className="container">
        <svg width="32" height="32" viewBox="0 0 32 32" id='left-toggle' onClick={handleLeftToggle}>
          <rect x="6" y="8" width="20" height="16" rx="2" fill="none" stroke="#000" strokeWidth="2" />
          <line x1="14" y1="8" x2="14" y2="24" stroke="#000" strokeWidth="2" />
        </svg>
        <div className="hero-left">
          <div className='hero-header'>
            <a href="#" className='icon' onClick={onUpdatesClick}><i className="fas fa-bell"></i></a>
            <a href="#" className='icon' onClick={() => setShowProfile(true)}><i className="fa fa-user-tie"></i></a>
          </div>

          <div className='left-buttons'>
            <a href="#" className="add-task-btn" id='task' onClick={() => setShowAddTask(true)} ><i className='fas fa-add'></i>Add Task</a>
            {/* <a href='#' className="icon"><i className='fas fa-search'></i>Search</a> */}
            <a href='#' className="icon" onClick={toggleInbox}><i className='fas fa-inbox'></i>Inbox</a>
            <a href='#' className="icon" onClick={toggleToday}><i className='fas fa-calendar-day'></i>Today</a>
            <a href='#' className="icon" id='calander' onClick={toggleCalendar}><i className='fas fa-calendar'></i>Upcoming</a>
            <a href='#' className="icon" onClick={toggleCompleted}><i className='fas fa-check-circle'></i>Completed</a>
            <a href='#' className="icon" onClick={() => {
              setShowTeams(true);
              setShowInbox(false);
              setShowToday(false);
              setShowCalendar(false);
              setShowCompleted(false);
            }}>
              <i className='fas fa-user-group'></i>Teams</a>
            <a href='#' className='icon' onClick={toggleMeeting}><i className='fas fa-users' ></i>Meeting Room</a>
          </div>

          <div className='hero-footer'>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (user) {
                  setShowAddTeam(true);
                } else {
                  setSuccessMessage('Please log in to manage teams!');
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 3000);
                }
              }}
            >
              <i className="fas fa-user-plus"></i>Add Team
            </a>
            <a href="#" title="Help" onClick={onHelpClick}><i className="fas fa-headset"></i>Help & Support</a>
          </div>
        </div>

        <div className="hero-right">
          <h1>{showInbox ? 'Inbox' : showCalendar ? 'Upcoming Calendar' : showToday ? 'Today' : showCompleted ? 'Completed Tasks' : showTeams ? 'Your Teams' : showMeeting ? 'Manage Your Meetings' : 'Welcome to our Schedule Manager'}</h1>
          {
            showInbox ? (
              <div className="inbox-container">
                <div className="task-list">
                  {tasks.map((task, idx) => (
                    <div className={`task-card${task.completed ? ' completed' : ''}`} key={idx}>
                      <div className="task-header">
                        <input
                          type="checkbox" className='checkbox'
                          checked={task.completed}
                          onChange={() => handleCompleteTask(idx)}
                          title="Mark as complete"
                        />
                        <span className="task-title">{task.title}</span>
                        <span className="task-date">{getTaskDate(task.dueDate)}</span>
                      </div>
                      <div className="task-desc">{task.description}</div>
                      <div className="task-actions">
                        <button className="icon-btn edit" title="Edit" onClick={() => handleEditTask(idx)}>
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="icon-btn delete" title="Delete" onClick={() => handleDeleteTask(idx)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : showCalendar ? (
              <div className="calendar-container">
                <FullCalendar
                  key={calendarKey}
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  height="auto"
                  aspectRatio={1.6}
                  headerToolbar={{
                    center: '',
                    left: 'title',
                    right: 'today prev,next'
                  }}
                  contentHeight="auto"
                  dayMaxEventRows={true}
                  fixedWeekCount={false}
                />
              </div>
            ) : showToday ? (
              <div className="today-container">
                <div className="task-list">
                  {tasks
                    .map((task, idx) => ({ task, idx }))
                    .filter(({ task }) => {
                      if (task.completed) return false;
                      const dueDateStr = getTaskDate(task.dueDate);
                      return dueDateStr === new Date().toISOString().slice(0, 10);
                    })
                    .map(({ task, idx }) => (
                      <div className={`task-card${task.completed ? ' completed' : ''}`} key={idx}>
                        <div className="task-header">
                          <input
                            type="checkbox" className='checkbox'
                            checked={task.completed}
                            onChange={() => handleCompleteTask(idx)}
                            title="Mark as complete"
                          />
                          <span className="task-title">{task.title}</span>
                          <span className="task-date">{getTaskDate(task.dueDate)}</span>
                        </div>
                        <div className="task-desc">{task.description}</div>
                        <div className="task-actions">
                          <button className="icon-btn edit" title="Edit" onClick={() => handleEditTask(idx)}>
                            <i className="fas fa-pen"></i>
                          </button>
                          <button className="icon-btn delete" title="Delete" onClick={() => handleDeleteTask(idx)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : showCompleted ? (
              <div className="completed-container">
                <div className="task-list">
                  {tasks
                    .filter(task => task.completed)
                    .map((task, idx) => (
                      <div className="task-card completed" key={idx}>
                        <div className="task-header">
                          <input
                            type="checkbox"
                            checked={true}
                            disabled
                            title="Completed"
                          />
                          <span className="task-title">{task.title}</span>
                          <span className="task-date">{getTaskDate(task.dueDate)}</span>
                        </div>
                        <div className="task-desc">{task.description}</div>
                        <div className="task-actions">
                          <button className="icon-btn delete" title="Delete" onClick={() => handleDeleteTask(idx)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : showTeams ? (
              <div className="teams-container">
                {teams.length === 0 ? (
                  <p>No teams found. Create your first team!</p>
                ) : (
                  <ul className="teams-list">
                    {teams.map((team, idx) => (
                      <li key={team.id || idx} className="team-card">
                        <div className="team-card-header">
                          <i className="fas fa-user-friends"></i>
                          <span className="team-name">{team.name}</span>
                          <button
                            className="icon-btn delete"
                            title="Delete Team"
                            style={{ marginLeft: "auto" }}
                            onClick={() => handleDeleteTeam(idx)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        <div className="team-details">
                          <div><b>Industry:</b> <span>{team.industry || <span className="team-na">N/A</span>}</span></div>
                          <div><b>Work:</b> <span>{team.work || <span className="team-na">N/A</span>}</span></div>
                          <div><b>Role:</b> <span>{team.role || <span className="team-na">N/A</span>}</span></div>
                          <div>
                            <b>Members:</b>{" "}
                            <span>
                              {Array.isArray(team.members) && team.members.length > 0
                                ? team.members.join(", ")
                                : <span className="team-na">N/A</span>}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className="add-team-btn"
                  onClick={() => setShowAddTeam(true)}
                  style={{ marginTop: "18px" }}
                >
                  <i className="fas fa-user-plus"></i> Add Team
                </button>
              </div>
            ) : showMeeting ? (
              <div className="meeting-container">
                  <iframe
                    src="https://meet.jit.si/YourCustomRoomName" // Replace with your desired room name
                    style={{ width: '100%', height: '600px', border: 'none' }}
                    allow="camera; microphone; fullscreen; display-capture"
                    title="Meeting Room"
                  ></iframe>
              </div>
            ) : (
              <p>Manage your schedules efficiently and effectively.</p>
            )
          }
        </div>
      </div>

      {showProfile && (
        <ProfilePopup
          user={user ? {
            name: user.displayName,
            email: user.email,
            avatar: userImg,
          } : null}
          onClose={() => setShowProfile(false)}
          onLoginClick={() => { setShowProfile(false); setShowLogin(true); }}
          onRegisterClick={() => { setShowProfile(false); setShowRegister(true); }}
          onLogout={handleLogout}
        />
      )}

      {showLogin && (
        <LoginPopup
          onClose={() => setShowLogin(false)}
          onRegisterClick={() => { setShowLogin(false); setShowRegister(true); }}
        />
      )}
      {showRegister && (
        <RegisterPopup
          onClose={() => setShowRegister(false)}
          onLoginClick={() => { setShowRegister(false); setShowLogin(true); }}
        />
      )}
      {showSuccess && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showAddTask && (
        <AddTaskPopup
          onClose={() => setShowAddTask(false)}
          onAdd={handleAddTask}
        />
      )}

      {editIdx !== null && editTask && (
        <EditTaskPopup
          onClose={() => { setEditIdx(null); setEditTask(null); }}
          onUpdate={handleUpdateTask}
          initialTask={editTask}
        />
      )}

      {showAddTeam && (
        <AddTeamPopup
          onClose={() => setShowAddTeam(false)}
          onAddTeam={handleCreateTeam}
          users={allUsers}
        />
      )}
    </section>
  );
}

export default Hero;
