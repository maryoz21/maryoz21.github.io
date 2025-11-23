// Ship Database (Shared Source of Truth)
const shipsData = {
    "msc_fantasia": {
        name: "MSC Fantasia",
        image: "img/crucero1.jpg",
        description: "Una obra maestra de estilo italiano. Disfruta de la escalera de cristal Swarovski, la piscina con techo retráctil y el exclusivo MSC Yacht Club.",
        features: ["MSC Yacht Club", "Cine 4D", "Simulador F1", "Spa Aurea"]
    },
    "msc_euribia": {
        name: "MSC Euribia",
        image: "img/crucero2.jpg",
        description: "El barco más eficiente energéticamente de la flota. Arte, innovación y sostenibilidad se unen en este gigante de los mares.",
        features: ["Galleria Euribia", "5 Piscinas", "Parque Acuático", "Teatro Delphi"]
    },
    "msc_world_europa": {
        name: "MSC World Europa",
        image: "img/crucero3.jpg",
        description: "El futuro de los cruceros. Un diseño revolucionario propulsado por GNL, con una espectacular promenade al aire libre.",
        features: ["Promenade Exterior", "Tobogán Venom Drop", "Micro-Cervecería", "13 Jacuzzis"]
    },
    "msc_seascape": {
        name: "MSC Seascape",
        image: "img/crucero1.jpg",
        description: "Diseñado para conectar a los huéspedes con el mar. Espacios exteriores impresionantes y tecnología de vanguardia.",
        features: ["Puente de los Suspiros", "Robotron", "Infinity Pool", "Kids Club LEGO"]
    }
};

// Auth Logic
function checkAuth() {
    const isAuth = sessionStorage.getItem('isAdminAuth');
    const loginOverlay = document.getElementById('loginOverlay');

    if (isAuth === 'true') {
        loginOverlay.style.display = 'none';
        initAdmin();
    } else {
        loginOverlay.style.display = 'flex';
    }
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('password').value === 'admin123') {
        sessionStorage.setItem('isAdminAuth', 'true');
        document.getElementById('loginOverlay').style.display = 'none';
        initAdmin();
    } else {
        alert('Contraseña incorrecta');
    }
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('isAdminAuth');
    location.reload();
});

// Admin Initialization
function initAdmin() {
    populateShipSelect();
    loadOffersTable();
}

function populateShipSelect() {
    const select = document.getElementById('offerShipSelect');
    select.innerHTML = '<option value="">-- Elige un Barco --</option>';

    for (const [key, ship] of Object.entries(shipsData)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = ship.name;
        select.appendChild(option);
    }
}

// Data Helpers
function getOffers() {
    const stored = localStorage.getItem('cruceros24_offers');
    return stored ? JSON.parse(stored) : [];
}

function saveOffers(offers) {
    localStorage.setItem('cruceros24_offers', JSON.stringify(offers));
    loadOffersTable();
}

// Table Logic
function loadOffersTable() {
    const offers = getOffers();
    const tbody = document.getElementById('offersTableBody');
    tbody.innerHTML = '';

    offers.forEach(offer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${offer.image}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
            <td>${offer.title}</td>
            <td>${offer.ship}</td>
            <td>${offer.price}€</td>
            <td>
                <button class="action-btn btn-edit" onclick="editOffer(${offer.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn btn-delete" onclick="deleteOffer(${offer.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Modal Logic
const modal = document.getElementById('offerModal');
const form = document.getElementById('offerForm');

document.getElementById('addOfferBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').innerText = 'Nueva Oferta';
    form.reset();
    document.getElementById('offerId').value = '';
    // Uncheck all services
    document.querySelectorAll('.service-toggle').forEach(cb => cb.checked = false);
    modal.style.display = 'flex';
});

document.getElementById('closeOfferModal').addEventListener('click', () => {
    modal.style.display = 'none';
});

// Save Logic (Smart Creation)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('offerId').value;
    const shipKey = document.getElementById('offerShipSelect').value;
    const shipInfo = shipsData[shipKey];

    // Get Selected Services
    const selectedServices = [];
    document.querySelectorAll('.service-toggle:checked').forEach(cb => {
        selectedServices.push(cb.value);
    });

    // Smart Description: Use custom if provided, else use ship's description
    const customDesc = document.getElementById('offerDescription').value;
    const finalDesc = customDesc.trim() ? customDesc : shipInfo.description;

    const newOffer = {
        id: id ? parseInt(id) : Date.now(),
        title: document.getElementById('offerTitle').value,
        ship: shipInfo.name, // Display name
        shipKey: shipKey,    // Internal key for lookup
        days: document.getElementById('offerDays').value,
        price: document.getElementById('offerPrice').value,
        image: shipInfo.image, // Auto-image from ship
        badge: document.getElementById('offerBadge').value,
        badgeClass: document.getElementById('offerBadge').value ? 'discount' : '',
        description: finalDesc,
        services: selectedServices // Store tags
    };

    const offers = getOffers();
    if (id) {
        const index = offers.findIndex(o => o.id == id);
        if (index !== -1) offers[index] = newOffer;
    } else {
        offers.push(newOffer);
    }

    saveOffers(offers);
    modal.style.display = 'none';
    alert('Oferta guardada con éxito');
});

// Delete
window.deleteOffer = function (id) {
    if (confirm('¿Eliminar oferta?')) {
        const offers = getOffers();
        saveOffers(offers.filter(o => o.id != id));
    }
};

// Edit
window.editOffer = function (id) {
    const offers = getOffers();
    const offer = offers.find(o => o.id == id);

    if (offer) {
        document.getElementById('offerId').value = offer.id;
        document.getElementById('offerTitle').value = offer.title;
        document.getElementById('offerShipSelect').value = offer.shipKey || ''; // Handle legacy offers?
        document.getElementById('offerDays').value = offer.days;
        document.getElementById('offerPrice').value = offer.price;
        document.getElementById('offerBadge').value = offer.badge;
        document.getElementById('offerDescription').value = offer.description;

        // Restore Services
        document.querySelectorAll('.service-toggle').forEach(cb => cb.checked = false);
        if (offer.services) {
            offer.services.forEach(srv => {
                const cb = document.querySelector(`.service-toggle[value="${srv}"]`);
                if (cb) cb.checked = true;
            });
        }

        document.getElementById('modalTitle').innerText = 'Editar Oferta';
        modal.style.display = 'flex';
    }
};

checkAuth();
