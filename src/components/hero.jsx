import './hero.css'

function Hero() {
    return (
        <section className="hero">
            <div className="container">
                <div className="hero-left">
                    <div className='hero-header'>
                        <div className='user'>
                            <a href="#" className='icon'><i className="fa fa-user"></i></a>
                        </div>
                        <div className='divider'>
                            <a href="#" className='icon'><i className="fas fa-bell"></i></a>
                            <a href="#" className='icon'>
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <rect x="6" y="8" width="20" height="16" rx="2" fill="none" stroke="#000" strokeWidth="2"/>
                                    <line x1="14" y1="8" x2="14" y2="24" stroke="#000" strokeWidth="2"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className='left-buttons'>
                        <a href='#' className="icon"><i className='fas fa-search'></i>Search</a>
                        <a href='#' className="icon"><i className='fas fa-inbox'></i>inbox</a>
                        <a href='#' className="icon"><i className='fas fa-calendar-day'></i>Today</a>
                        <a href='#' className="icon"><i className='fas fa-calendar'></i>Upcoming</a>
                        <a href='#' className="icon"><i className='fas fa-filter'></i>Filters</a>
                        <a href='#' className="icon"><i className='fas fa-check'></i>Completed</a>
                    </div>

                    <div className='hero-footer'>
                        <a href=""><i className="fas fa-plus"></i>Add a Team</a>
                        <a href="#" title="Help"><i className="fas fa-question-circle"></i>Help & Support</a>
                    </div>
                </div>
                
                <div className="hero-right">
                    <h1>Inbox</h1>
                    <p>Manage your schedules efficiently and effectively.</p>
                </div>
            </div>
        </section>
    );
}

export default Hero;