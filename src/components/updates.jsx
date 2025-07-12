import './updates.css'

function Updates({ onClose }){
    return(
        <div className="about-modal-overlay" onClick={onClose}>
            <section className='updates' id='Updates-sec' onClick={e => e.stopPropagation()}>
                <div className='updates-container'>
                    <h2>Notification</h2>
                    <div className='update-btn'>
                        <button id='all'>All</button>
                        <button id='unread'>Unread</button>
                    </div>
                    <button className="popup-close" onClick={onClose}>✖</button>
                </div>
            </section>
        </div>    
    )
}

export default Updates;