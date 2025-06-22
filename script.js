document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const newEventBtn = document.getElementById('newEventBtn');
    const eventModal = document.getElementById('eventModal');
    const closeModal = document.getElementById('closeModal');
    const cancelEvent = document.getElementById('cancelEvent');
    const eventForm = document.getElementById('eventForm');
    const confirmModal = document.getElementById('confirmModal');
    const closeConfirmModal = document.getElementById('closeConfirmModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const currentWeekText = document.getElementById('currentWeek');
    const weeklyCalendar = document.getElementById('weeklyCalendar');
    const dayView = document.getElementById('dayView');
    const dayViewTitle = document.getElementById('dayViewTitle');
    const dayViewEvents = document.getElementById('dayViewEvents');
    const upcomingEvents = document.getElementById('upcomingEvents');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // State variables
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('scheduleEvents')) || [];
    let eventToDelete = null;
    let currentFilter = 'all';

    // Initialize the app
    init();

    function init() {
        renderWeeklyCalendar();
        renderUpcomingEvents();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Modal controls
        newEventBtn.addEventListener('click', () => openEventModal());
        closeModal.addEventListener('click', () => closeEventModal());
        cancelEvent.addEventListener('click', () => closeEventModal());
        closeConfirmModal.addEventListener('click', () => closeConfirmModalFunc());
        cancelDelete.addEventListener('click', () => closeConfirmModalFunc());

        // Form submission
        eventForm.addEventListener('submit', handleEventFormSubmit);

        // Week navigation
        prevWeekBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 7);
            renderWeeklyCalendar();
        });

        nextWeekBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 7);
            renderWeeklyCalendar();
        });

        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderWeeklyCalendar();
                renderUpcomingEvents();
            });
        });

        // Confirm delete
        confirmDelete.addEventListener('click', () => {
            if (eventToDelete) {
                deleteEvent(eventToDelete.id);
                closeConfirmModalFunc();
            }
        });
    }

    function openEventModal(event = null) {
        const modalTitle = document.getElementById('modalTitle');
        const eventId = document.getElementById('eventId');
        const eventTitle = document.getElementById('eventTitle');
        const eventDate = document.getElementById('eventDate');
        const eventTime = document.getElementById('eventTime');
        const eventCategory = document.getElementById('eventCategory');
        const eventDescription = document.getElementById('eventDescription');

        if (event) {
            // Edit mode
            modalTitle.textContent = 'Edit Event';
            eventId.value = event.id;
            eventTitle.value = event.title;
            eventDate.value = formatDateForInput(event.date);
            eventTime.value = event.time;
            eventCategory.value = event.category;
            eventDescription.value = event.description || '';
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Event';
            eventId.value = '';
            eventForm.reset();

            // Set default date to today
            const today = new Date();
            eventDate.value = formatDateForInput(today);

            // Set default time to next hour
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
            eventTime.value = formatTimeForInput(nextHour);
        }

        eventModal.classList.remove('hidden');
    }

    function closeEventModal() {
        eventModal.classList.add('hidden');
    }

    function closeConfirmModalFunc() {
        confirmModal.classList.add('hidden');
        eventToDelete = null;
    }

    function openConfirmModal(event) {
        eventToDelete = event;
        confirmModal.classList.remove('hidden');
    }

    function handleEventFormSubmit(e) {
        e.preventDefault();

        const eventId = document.getElementById('eventId').value;
        const eventTitle = document.getElementById('eventTitle').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const eventCategory = document.getElementById('eventCategory').value;
        const eventDescription = document.getElementById('eventDescription').value;

        const event = {
            id: eventId || generateId(),
            title: eventTitle,
            date: new Date(eventDate),
            time: eventTime,
            category: eventCategory,
            description: eventDescription
        };

        if (eventId) {
            // Edit existing event
            events = events.map(ev => ev.id === eventId ? event : ev);
        } else {
            // Add new event
            events.push(event);
        }

        localStorage.setItem('scheduleEvents', JSON.stringify(events));
        closeEventModal();
        renderWeeklyCalendar();
        renderUpcomingEvents();
    }

    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function formatDateForInput(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    function formatTimeForInput(date) {
        const d = new Date(date);
        return d.toTimeString().slice(0, 5);
    }

    function renderWeeklyCalendar() {
        // Calculate start of week (Sunday)
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            days.push(day);
        }

        // Set week range text
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        currentWeekText.textContent = `Week of ${days[0].toLocaleDateString(undefined, options)}`;

        // Render days
        weeklyCalendar.innerHTML = '';
        days.forEach(day => {
            const dayEvents = events
                .filter(ev => {
                    const evDate = new Date(ev.date);
                    return evDate.toDateString() === day.toDateString() &&
                        (currentFilter === 'all' || ev.category === currentFilter);
                })
                .sort((a, b) => a.time.localeCompare(b.time));

            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day p-3 cursor-pointer hover:bg-gray-50 transition-colors min-h-[120px]';
            if (day.toDateString() === new Date().toDateString()) {
                dayDiv.classList.add('active');
            }

            // Day label
            const dateLabel = document.createElement('div');
            dateLabel.className = 'text-xs text-gray-400 mb-2';
            dateLabel.textContent = day.getDate();
            dayDiv.appendChild(dateLabel);

            // Events
            dayEvents.forEach(ev => {
                const evDiv = document.createElement('div');
                evDiv.className = 'event-item flex items-center gap-2 mb-1 px-2 py-1 rounded hover:bg-indigo-50 group';
                evDiv.innerHTML = `
                                <span class="event-dot ${getCategoryDotClass(ev.category)}"></span>
                                <span class="text-xs font-medium truncate">${ev.title}</span>
                                <span class="ml-auto text-xs text-gray-400">${ev.time}</span>
                                <button class="ml-2 text-gray-400 hover:text-indigo-600 edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                                <button class="ml-1 text-gray-400 hover:text-red-600 delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                            `;
                // Edit event
                evDiv.querySelector('.edit-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEventModal(ev);
                });
                // Delete event
                evDiv.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openConfirmModal(ev);
                });
                dayDiv.appendChild(evDiv);
            });

            // Click to open day view
            dayDiv.addEventListener('click', () => {
                renderDayView(day);
            });

            weeklyCalendar.appendChild(dayDiv);
        });
    }

    function getCategoryDotClass(category) {
        switch (category) {
            case 'work': return 'bg-indigo-500';
            case 'personal': return 'bg-green-500';
            case 'meeting': return 'bg-purple-500';
            case 'urgent': return 'bg-red-500';
            case 'reminder': return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    }

    function renderUpcomingEvents() {
        // Upcoming events: next 7 days, sorted by date/time
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        const upcoming = events
            .filter(ev => {
                const evDate = new Date(ev.date);
                return evDate >= now && evDate <= nextWeek &&
                    (currentFilter === 'all' || ev.category === currentFilter);
            })
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.time);
                const dateB = new Date(b.date + 'T' + b.time);
                return dateA - dateB;
            });

        upcomingEvents.innerHTML = '';
        if (upcoming.length === 0) {
            upcomingEvents.innerHTML = '<div class="text-gray-400 text-sm">No upcoming events.</div>';
            return;
        }

        upcoming.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'flex items-center gap-2 bg-gray-50 rounded px-2 py-1';
            evDiv.innerHTML = `
                            <span class="event-dot ${getCategoryDotClass(ev.category)}"></span>
                            <span class="text-xs font-medium truncate">${ev.title}</span>
                            <span class="ml-auto text-xs text-gray-400">${formatDateForInput(ev.date)} ${ev.time}</span>
                        `;
            upcomingEvents.appendChild(evDiv);
        });
    }

    function renderDayView(day) {
        dayView.classList.remove('hidden');
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dayViewTitle.textContent = day.toLocaleDateString(undefined, options);

        // Events for this day
        const dayEventsArr = events
            .filter(ev => new Date(ev.date).toDateString() === day.toDateString() &&
                (currentFilter === 'all' || ev.category === currentFilter))
            .sort((a, b) => a.time.localeCompare(b.time));

        dayViewEvents.innerHTML = '';
        if (dayEventsArr.length === 0) {
            dayViewEvents.innerHTML = '<div class="text-gray-400 text-sm p-4">No events for this day.</div>';
            return;
        }

        dayEventsArr.forEach(ev => {
            const evDiv = document.createElement('div');
            evDiv.className = 'flex items-center gap-2 px-4 py-3';
            evDiv.innerHTML = `
                            <span class="event-dot ${getCategoryDotClass(ev.category)}"></span>
                            <div class="flex-1">
                                <div class="font-medium">${ev.title}</div>
                                <div class="text-xs text-gray-400">${ev.time} &middot; ${ev.category.charAt(0).toUpperCase() + ev.category.slice(1)}</div>
                                <div class="text-xs text-gray-500 mt-1">${ev.description || ''}</div>
                            </div>
                            <button class="ml-2 text-gray-400 hover:text-indigo-600 edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="ml-1 text-gray-400 hover:text-red-600 delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                        `;
            // Edit event
            evDiv.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openEventModal(ev);
            });
            // Delete event
            evDiv.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openConfirmModal(ev);
            });
            dayViewEvents.appendChild(evDiv);
        });
    }

    function deleteEvent(id) {
        events = events.filter(ev => ev.id !== id);
        localStorage.setItem('scheduleEvents', JSON.stringify(events));
        renderWeeklyCalendar();
        renderUpcomingEvents();
        dayView.classList.add('hidden');
    }
});
