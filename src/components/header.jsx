import './header.css';

function Header() {
  return (
    <header className="header">
        <nav className="nav-left">
            <img src="src//assets//user.png" alt="image" />
            <a href=""><h1>Schedule Manager</h1></a>
        </nav>
        <nav className="nav-right">
            <a href="">About</a>
        </nav>
    </header>
  )
}

export default Header;