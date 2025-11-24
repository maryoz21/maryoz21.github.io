/**
 * Bus Management Portal - Main Application Logic
 */

// --- Constants & Config ---
const STORAGE_KEY_BUSES = 'bus_data_v2';
const STORAGE_KEY_USER = 'current_user';

// Mock Initial Data
const INITIAL_DATA = [
    {
        id: 1,
        date: '2026-06-20',
        ship: 'MSC Seaview',
        route: 'La Zenia - Valencia',
        passengers: 56,
        capacity: 65,
        companies: ['Avanza', 'Alsa'],
        selectedCompany: 'Avanza',
        reqDate: '2025-03-08',
        status: 'confirmed',
        passengerList: []
    }
];

// --- State Management ---
const App = {
    data: [],
    currentUser: null,
    currentPassengerTripId: null,
    currentDate: new Date(), // For Calendar

    init() {
        this.loadUser();
        if (!this.currentUser && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }

        if (this.currentUser && window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
            return;
        }

        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('BUS%20HTML/')) {
            this.loadData();
            this.renderDashboard();
            this.setupEventListeners();
            this.renderCalendar(); // Init calendar
        }
    },

    // --- Authentication ---
    login(username, password) {
        if (username === 'admin' && password === 'admin') {
            this.currentUser = { name: 'Administrator', role: 'admin' };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
            return true;
        } else if (username === 'user' && password === 'user') {
            this.currentUser = { name: 'Employee', role: 'employee' };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem(STORAGE_KEY_USER);
        window.location.href = 'login.html';
    },

    loadUser() {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
            this.currentUser = JSON.parse(stored);
        }
    },

    // --- Data Logic ---
    loadData() {
        const stored = localStorage.getItem(STORAGE_KEY_BUSES);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = INITIAL_DATA;
            this.saveData();
        }
    },

    saveData() {
        localStorage.setItem(STORAGE_KEY_BUSES, JSON.stringify(this.data));
        this.renderTable();
        this.renderStats();
        this.renderCalendar(); // Refresh calendar on data change
        this.renderHistory(); // Refresh history
    },

    addBus(bus) {
        bus.id = Date.now();
        if (!bus.companies) bus.companies = [];
        if (!bus.passengerList) bus.passengerList = [];
        this.data.push(bus);
        this.saveData();
    },

    deleteBus(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
        this.data = this.data.filter(b => b.id !== id);
        this.saveData();
    },

    updateBus(updatedBus) {
        const index = this.data.findIndex(b => b.id === updatedBus.id);
        if (index !== -1) {
            if (!updatedBus.passengerList) {
                updatedBus.passengerList = this.data[index].passengerList || [];
            }
            this.data[index] = updatedBus;
            this.saveData();
        }
    },

    addPassenger(tripId, name, stop) {
        const trip = this.data.find(b => b.id === tripId);
        if (trip) {
            if (!trip.passengerList) trip.passengerList = [];
            trip.passengerList.push({ name, stop });
            this.saveData();
            this.renderPassengerList(tripId);
        }
    },

    removePassenger(tripId, index) {
        const trip = this.data.find(b => b.id === tripId);
        if (trip && trip.passengerList) {
            trip.passengerList.splice(index, 1);
            this.saveData();
            this.renderPassengerList(tripId);
        }
    },

    // --- View Management ---
    switchView(viewId) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        // Show selected
        document.getElementById(viewId).classList.add('active');

        // Update Nav
        document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
        const navId = 'nav-' + viewId.replace('view-', '');
        const navEl = document.getElementById(navId);
        if (navEl) navEl.classList.add('active');

        // Render specific view data
        if (viewId === 'view-history') this.renderHistory();
        if (viewId === 'view-calendar') this.renderCalendar();
    },

    // --- UI Rendering ---
    renderDashboard() {
        this.renderStats();
        this.renderTable();
        document.getElementById('user-name-display').textContent = this.currentUser.name;
    },

    renderStats() {
        const total = this.data.length;
        const confirmed = this.data.filter(b => b.status === 'confirmed').length;
        const pending = this.data.filter(b => b.status === 'pending').length;

        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-confirmed').textContent = confirmed;
        document.getElementById('stat-pending').textContent = pending;
    },

    renderTable() {
        const tbody = document.getElementById('bus-table-body');
        tbody.innerHTML = '';

        // Filter for future trips only (optional, or show all in dashboard)
        // For now showing all sorted by date
        const sortedData = [...this.data].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedData.forEach(bus => {
            const tr = document.createElement('tr');

            let companyDisplay = '';
            if (bus.status === 'confirmed' && bus.selectedCompany) {
                companyDisplay = `<strong>${bus.selectedCompany}</strong>`;
            } else if (bus.companies && bus.companies.length > 0) {
                companyDisplay = bus.companies.join(', ');
            } else {
                companyDisplay = '<span class="text-muted">Sin asignar</span>';
            }

            let actions = '';
            if (this.currentUser.role === 'admin') {
                actions += `
                    <button class="btn btn-sm btn-primary" onclick="App.openEditModal(${bus.id})" title="Editar">🖊</button>
                    <button class="btn btn-sm btn-danger" onclick="App.deleteBus(${bus.id})" title="Eliminar">🗑</button>
                `;
            }

            if (bus.status === 'confirmed') {
                actions = `
                    <button class="btn btn-sm btn-primary" style="background-color: #6c757d;" onclick="App.openPassengerModal(${bus.id})" title="Pasajeros">👥</button>
                    ${actions}
                `;
            }

            tr.innerHTML = `
                <td>${bus.date}</td>
                <td>${bus.ship || '-'}</td>
                <td>${bus.route}</td>
                <td>${bus.passengers}</td>
                <td>${bus.capacity}</td>
                <td>${companyDisplay}</td>
                <td>${bus.reqDate}</td>
                <td><span class="status-badge status-${bus.status}">${bus.status}</span></td>
                <td><div style="display:flex; gap:5px;">${actions}</div></td>
            `;
            tbody.appendChild(tr);
        });
    },

    renderHistory() {
        const tbody = document.getElementById('history-table-body');
        tbody.innerHTML = '';

        const today = new Date().toISOString().split('T')[0];
        const pastTrips = this.data.filter(b => b.date < today).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (pastTrips.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay viajes pasados.</td></tr>';
            return;
        }

        pastTrips.forEach(bus => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${bus.date}</td>
                <td>${bus.ship || '-'}</td>
                <td>${bus.route}</td>
                <td>${bus.selectedCompany || bus.companies.join(', ') || '-'}</td>
                <td><span class="status-badge status-${bus.status}">${bus.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    },

    // --- Calendar Logic ---
    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        const monthYear = document.getElementById('calendar-month-year');

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() || 7; // 1 (Mon) - 7 (Sun) adjustment if needed, usually 0 is Sun

        // Spanish Month Names
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        monthYear.textContent = `${monthNames[month]} ${year}`;

        grid.innerHTML = '';

        // Headers
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        days.forEach(d => {
            const div = document.createElement('div');
            div.className = 'calendar-day-header';
            div.textContent = d;
            grid.appendChild(div);
        });

        // Empty slots
        for (let i = 0; i < startingDay; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day empty';
            grid.appendChild(div);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const div = document.createElement('div');
            div.className = 'calendar-day';

            let content = `<div class="day-number">${i}</div>`;

            // Find events
            const events = this.data.filter(b => b.date === dateStr);
            events.forEach(ev => {
                content += `<div class="day-event event-${ev.status}" title="${ev.route}">${ev.route}</div>`;
            });

            div.innerHTML = content;
            grid.appendChild(div);
        }
    },

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    },

    // --- Modal Handling ---
    addCompanyInput(value = '') {
        const container = document.getElementById('companies-container');
        const div = document.createElement('div');
        div.className = 'company-row';
        div.innerHTML = `
            <input type="text" name="companies[]" value="${value}" placeholder="Nombre compañía" required>
            <button type="button" class="btn-icon" onclick="this.parentElement.remove()">❌</button>
        `;
        container.appendChild(div);
    },

    openModal() {
        document.getElementById('bus-modal').classList.add('active');
        document.getElementById('modal-title').textContent = 'Nuevo Autobús';
        document.getElementById('bus-form').reset();
        document.getElementById('bus-id').value = '';
        document.getElementById('companies-container').innerHTML = '';
        this.addCompanyInput();
        document.getElementById('final-company-group').style.display = 'none';
    },

    closeModal() {
        document.getElementById('bus-modal').classList.remove('active');
    },

    openEditModal(id) {
        const bus = this.data.find(b => b.id === id);
        if (!bus) return;

        this.openModal();
        document.getElementById('modal-title').textContent = 'Editar Autobús';
        document.getElementById('bus-id').value = bus.id;
        document.getElementById('date').value = bus.date;
        document.getElementById('ship').value = bus.ship || '';
        document.getElementById('route').value = bus.route;
        document.getElementById('passengers').value = bus.passengers;
        document.getElementById('capacity').value = bus.capacity;
        document.getElementById('reqDate').value = bus.reqDate;
        document.getElementById('status').value = bus.status;

        const container = document.getElementById('companies-container');
        container.innerHTML = '';
        if (bus.companies && bus.companies.length > 0) {
            bus.companies.forEach(c => this.addCompanyInput(c));
        } else {
            this.addCompanyInput();
        }

        this.updateFinalCompanySelect(bus);
    },

    updateFinalCompanySelect(bus) {
        const status = document.getElementById('status').value;
        const finalSelectGroup = document.getElementById('final-company-group');
        const finalSelect = document.getElementById('final-company');

        if (status === 'confirmed') {
            finalSelectGroup.style.display = 'block';
            finalSelect.innerHTML = '<option value="">Seleccionar...</option>';

            const inputs = document.querySelectorAll('input[name="companies[]"]');
            inputs.forEach(input => {
                if (input.value) {
                    const opt = document.createElement('option');
                    opt.value = input.value;
                    opt.textContent = input.value;
                    if (bus && bus.selectedCompany === input.value) opt.selected = true;
                    finalSelect.appendChild(opt);
                }
            });
        } else {
            finalSelectGroup.style.display = 'none';
        }
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const busData = Object.fromEntries(formData.entries());

        const companyInputs = document.querySelectorAll('input[name="companies[]"]');
        busData.companies = Array.from(companyInputs).map(input => input.value).filter(val => val.trim() !== '');

        if (busData.status === 'confirmed') {
            busData.selectedCompany = document.getElementById('final-company').value;
        } else {
            busData.selectedCompany = null;
        }

        busData.passengers = parseInt(busData.passengers);
        busData.capacity = parseInt(busData.capacity);

        const id = document.getElementById('bus-id').value;

        if (id) {
            busData.id = parseInt(id);
            this.updateBus(busData);
        } else {
            this.addBus(busData);
        }
        this.closeModal();
    },

    openPassengerModal(id) {
        this.currentPassengerTripId = id;
        const trip = this.data.find(b => b.id === id);

        document.getElementById('passenger-modal').classList.add('active');
        document.getElementById('passenger-trip-info').textContent = `${trip.route} (${trip.date})`;

        this.renderPassengerList(id);
    },

    closePassengerModal() {
        document.getElementById('passenger-modal').classList.remove('active');
        this.currentPassengerTripId = null;
    },

    renderPassengerList(id) {
        const trip = this.data.find(b => b.id === id);
        const container = document.getElementById('passenger-list-container');
        container.innerHTML = '';

        if (trip.passengerList && trip.passengerList.length > 0) {
            trip.passengerList.forEach((pax, index) => {
                const div = document.createElement('div');
                div.className = 'passenger-item';
                div.innerHTML = `
                    <div class="passenger-info">
                        <strong>${pax.name}</strong>
                        <span class="passenger-stop">📍 ${pax.stop}</span>
                    </div>
                    <button class="btn-icon" style="color:red;" onclick="App.removePassenger(${id}, ${index})">❌</button>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p style="padding:10px; text-align:center; color:#999;">No hay pasajeros registrados.</p>';
        }
    },

    handlePassengerSubmit(e) {
        e.preventDefault();
        if (!this.currentPassengerTripId) return;

        const name = document.getElementById('new-pax-name').value;
        const stop = document.getElementById('new-pax-stop').value;

        this.addPassenger(this.currentPassengerTripId, name, stop);

        document.getElementById('new-pax-name').value = '';
        document.getElementById('new-pax-stop').value = '';
        document.getElementById('new-pax-name').focus();
    },

    setupEventListeners() {
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Navigation
        document.getElementById('nav-dashboard').addEventListener('click', () => this.switchView('view-dashboard'));
        document.getElementById('nav-calendar').addEventListener('click', () => this.switchView('view-calendar'));
        document.getElementById('nav-history').addEventListener('click', () => this.switchView('view-history'));

        // Calendar Controls
        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));

        // Forms & Modals
        document.querySelectorAll('.btn-add-new-trigger').forEach(btn => {
            btn.addEventListener('click', () => this.openModal());
        });

        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('bus-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('btn-add-company').addEventListener('click', () => this.addCompanyInput());

        document.getElementById('status').addEventListener('change', () => {
            const id = document.getElementById('bus-id').value;
            const bus = id ? this.data.find(b => b.id == id) : null;
            this.updateFinalCompanySelect(bus);
        });

        document.getElementById('passenger-modal-close').addEventListener('click', () => this.closePassengerModal());
        document.getElementById('add-passenger-form').addEventListener('submit', (e) => this.handlePassengerSubmit(e));

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
                this.closePassengerModal();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
