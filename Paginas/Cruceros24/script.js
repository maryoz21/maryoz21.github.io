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

// Service Icons Map
const serviceIcons = {
    "all_inclusive": { icon: "fas fa-glass-cheers", label: "Todo Incluido" },
    "bus": { icon: "fas fa-bus", label: "Bus Incluido" },
    "flights": { icon: "fas fa-plane", label: "Vuelos Incl." },
    "kids_free": { icon: "fas fa-child", label: "Niños Gratis" },
    "taxes": { icon: "fas fa-tag", label: "Tasas Incl." }
};

// Initial Data (Updated Structure)
const initialOffers = [
    {
        id: 1,
        title: "Mediterráneo 2025",
        days: 15,
        ship: "MSC Fantasia",
        shipKey: "msc_fantasia",
        price: 1799,
        image: "img/crucero1.jpg",
        description: "Recorre las costas de Italia, Francia y España en un viaje de lujo.",
        badge: "Más Popular",
        badgeClass: "",
        services: ["all_inclusive", "taxes"]
    },
    {
        id: 2,
        title: "Fiordos 2025",
        days: 8,
        ship: "MSC Euribia",
        shipKey: "msc_euribia",
        price: 1199,
        image: "img/crucero2.jpg",
        description: "Naturaleza en estado puro. Glaciares y paisajes impresionantes.",
        badge: "",
        badgeClass: "",
        services: ["flights", "taxes"]
    },
    {
        id: 3,
        title: "Islas Griegas 2025",
        days: 8,
        ship: "MSC World Europa",
        shipKey: "msc_world_europa",
        price: 899,
        image: "img/crucero3.jpg",
        description: "Historia y playas paradisíacas en el corazón del Egeo.",
        badge: "-15%",
        badgeClass: "discount",
        services: ["kids_free"]
    }
];

// Data Management
function getOffers() {
    const storedOffers = localStorage.getItem('cruceros24_offers');
    if (!storedOffers) {
        localStorage.setItem('cruceros24_offers', JSON.stringify(initialOffers));
        return initialOffers;
    }
    return JSON.parse(storedOffers);
}

// Render Offers (Grid)
function renderOffers(offersToRender) {
    const grid = document.querySelector('.grid-ofertas');
    if (!grid) return;

    grid.innerHTML = '';

    if (offersToRender.length === 0) {
        grid.innerHTML = '<p class="no-results">No se encontraron ofertas que coincidan con tu búsqueda.</p>';
        return;
    }

    offersToRender.forEach(offer => {
        const card = document.createElement('div');
        card.className = 'oferta-card animate-on-scroll';

        const badgeHtml = offer.badge ? `<span class="badge ${offer.badgeClass}">${offer.badge}</span>` : '';

        // Generate Service Icons for Card (Mini)
        let servicesHtml = '';
        if (offer.services && offer.services.length > 0) {
            servicesHtml = '<div class="card-services" style="margin-top: 10px; display: flex; gap: 8px; color: var(--accent-color);">';
            offer.services.slice(0, 3).forEach(srv => { // Show max 3
                if (serviceIcons[srv]) {
                    servicesHtml += `<i class="${serviceIcons[srv].icon}" title="${serviceIcons[srv].label}"></i>`;
                }
            });
            servicesHtml += '</div>';
        }

        card.innerHTML = `
            <div class="card-image">
                <a href="offer.html?id=${offer.id}">
                    <img src="${offer.image}" alt="${offer.title}" onerror="this.src='img/crucero1.jpg'" />
                </a>
                ${badgeHtml}
            </div>
            <div class="oferta-content">
                <a href="offer.html?id=${offer.id}">
                    <h3>${offer.title}</h3>
                </a>
                <div class="meta-info">
                    <span><i class="far fa-clock"></i> ${offer.days} días</span>
                    <span><i class="fas fa-ship"></i> ${offer.ship}</span>
                </div>
                ${servicesHtml}
                <p class="description">${offer.description}</p>
                <div class="price-action">
                    <div class="price">
                        <span class="from">desde</span>
                        <span class="amount">${offer.price}€</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <a href="offer.html?id=${offer.id}" class="btn btn-secondary" style="background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color); padding: 12px 15px;">Ver Detalles</a>
                        <button class="btn btn-secondary btn-reservar" data-title="${offer.title}">Reservar</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    attachReservationListeners();
    observeElements();
}

// Search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const allOffers = getOffers();

        const filtered = allOffers.filter(offer =>
            offer.title.toLowerCase().includes(term) ||
            offer.ship.toLowerCase().includes(term) ||
            offer.description.toLowerCase().includes(term)
        );

        renderOffers(filtered);
    });
}

// Modal
function attachReservationListeners() {
    const modal = document.getElementById('reservationModal');
    const reserveBtns = document.querySelectorAll('.btn-reservar');
    if (!modal) return;

    reserveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const cruiseTitle = btn.getAttribute('data-title');
            document.getElementById('cruise-name').value = cruiseTitle;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
}

function setupModal() {
    const modal = document.getElementById('reservationModal');
    const closeBtn = document.querySelector('.close-modal');
    const reservationForm = document.getElementById('reservationForm');
    if (!modal) return;

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = reservationForm.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Enviando...';
        btn.disabled = true;

        setTimeout(() => {
            alert(`¡Reserva Solicitada con Éxito!\n\nNos pondremos en contacto contigo pronto para confirmar tu viaje en el: ${document.getElementById('cruise-name').value}`);
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            reservationForm.reset();
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1500);
    });
}

// Scroll Animations
function observeElements() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Initialization & Offer Details Logic
document.addEventListener('DOMContentLoaded', () => {
    // Index Page
    if (document.querySelector('.grid-ofertas')) {
        const offers = getOffers();
        renderOffers(offers);
        setupSearch();
    }

    // Offer Details Page
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id && document.getElementById('offerHero')) {
        const offers = getOffers();
        const offer = offers.find(o => o.id == id);

        if (offer) {
            const shipInfo = shipsData[offer.shipKey] || {};

            document.title = `${offer.title} | Cruceros24`;
            document.getElementById('offerHero').style.backgroundImage = `url('${offer.image}')`;
            document.getElementById('offerTitle').innerText = offer.title;
            document.getElementById('offerShip').innerText = offer.ship;
            document.getElementById('offerDescription').innerText = offer.description;
            document.getElementById('offerPrice').innerText = `${offer.price}€`;
            document.getElementById('offerDays').innerText = offer.days;
            document.getElementById('offerShipSidebar').innerText = offer.ship;

            // Render Services
            const servicesContainer = document.querySelector('.services-grid');
            if (servicesContainer && offer.services) {
                servicesContainer.innerHTML = ''; // Clear defaults
                if (offer.services.length === 0) {
                    servicesContainer.innerHTML = '<p>Consulta los servicios incluidos.</p>';
                } else {
                    offer.services.forEach(srv => {
                        if (serviceIcons[srv]) {
                            const item = document.createElement('div');
                            item.className = 'service-item';
                            item.style.cssText = 'text-align: center; padding: 15px; background: white; box-shadow: var(--shadow-sm); border-radius: 8px;';
                            item.innerHTML = `
                                <i class="${serviceIcons[srv].icon}" style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 10px;"></i>
                                <p>${serviceIcons[srv].label}</p>
                            `;
                            servicesContainer.appendChild(item);
                        }
                    });
                }
            }

            // Render Ship Features (Rich Content)
            if (shipInfo.features) {
                const detailsContent = document.querySelector('.details-content');
                const featuresHtml = `
                    <h3 style="color: var(--primary-color); margin: 30px 0 15px;">Descubre el ${offer.ship}</h3>
                    <p style="margin-bottom: 20px; color: var(--text-light);">${shipInfo.description}</p>
                    <div class="ship-features" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        ${shipInfo.features.map(f => `
                            <div style="background: var(--bg-light); padding: 10px; border-radius: 5px; display: flex; align-items: center;">
                                <i class="fas fa-check-circle" style="color: var(--accent-color); margin-right: 10px;"></i>
                                <span>${f}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                // Insert before Itinerary
                const itineraryHeader = document.querySelector('h3'); // First h3 is Itinerary
                if (itineraryHeader) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = featuresHtml;
                    itineraryHeader.parentNode.insertBefore(tempDiv, itineraryHeader);
                }
            }

            // Pre-fill modal
            document.getElementById('reserveBtn').addEventListener('click', () => {
                document.getElementById('cruise-name').value = offer.title;
                document.getElementById('reservationModal').style.display = 'flex';
            });
        }
    }

    setupModal();
    observeElements();
});
