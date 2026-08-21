// Renderiza la carta completa a partir de menuData (menu-data.js)

(function () {
    // menuData y categoryTitles los define el archivo de datos cargado antes que este script
    // (menu-data.js, menu-data-en.js o menu-data-de.js)
    const nav = document.getElementById("categoryNav");
    const main = document.getElementById("menuContainer");

    function formatPrecio(precio) {
        return precio.toFixed(2).replace(".", ",") + "€";
    }

    function crearItem(item) {
        if (item.imagen) {
            const el = document.createElement("article");
            el.className = "card-big";
            let html = '<img src="' + item.imagen + '" alt="' + item.nombre + '">' +
                '<div class="big-info">' +
                    '<div class="big-header">' +
                        '<h3 class="big-title">' + item.nombre + "</h3>" +
                        '<span class="big-price">' + formatPrecio(item.precio) + "</span>" +
                    "</div>";
            if (item.descripcion) {
                html += '<div class="big-desc">' + item.descripcion + "</div>";
            }
            html += "</div>";
            el.innerHTML = html;
            return el;
        }

        const el = document.createElement("div");
        if (item.descripcion) {
            el.className = "row-item";
            el.innerHTML =
                '<div class="row-text">' +
                    '<div class="row-title">' + item.nombre + "</div>" +
                    '<div class="row-desc">' + item.descripcion + "</div>" +
                    '<span class="row-price">' + formatPrecio(item.precio) + "</span>" +
                "</div>";
        } else {
            el.className = "simple-item";
            el.innerHTML =
                '<span class="simple-name">' + item.nombre + "</span>" +
                '<span class="simple-price">' + formatPrecio(item.precio) + "</span>";
        }
        return el;
    }

    Object.keys(menuData).forEach(function (key, index) {
        const items = menuData[key];
        const titulo = categoryTitles[key] || key;
        const id = "cat-" + key;

        const tab = document.createElement("a");
        tab.href = "#" + id;
        tab.className = "nav-tab";
        tab.textContent = titulo;
        nav.appendChild(tab);

        const details = document.createElement("details");
        details.id = id;
        details.className = "menu-category";
        if (index === 0) details.open = true;

        const summary = document.createElement("summary");
        summary.textContent = titulo;
        details.appendChild(summary);

        const contentBox = document.createElement("div");
        const soloListaSimple = items.every(function (item) { return !item.descripcion && !item.imagen; });
        contentBox.className = soloListaSimple ? "content-box grid-list" : "content-box";

        const itemsOrdenados = items.slice().sort(function (a, b) {
            return (b.imagen ? 1 : 0) - (a.imagen ? 1 : 0);
        });
        itemsOrdenados.forEach(function (item) {
            contentBox.appendChild(crearItem(item));
        });

        details.appendChild(contentBox);
        main.appendChild(details);
    });

    // Ajusta la posición del nav sticky a la altura real del header
    function actualizarAlturaHeader() {
        const header = document.querySelector("header");
        document.documentElement.style.setProperty("--header-height", header.offsetHeight + "px");
    }
    actualizarAlturaHeader();
    window.addEventListener("resize", actualizarAlturaHeader);

    // Resalta la pestaña de la categoría visible al hacer scroll
    const tabs = nav.querySelectorAll(".nav-tab");
    const sections = main.querySelectorAll(".menu-category");

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                tabs.forEach(function (t) { t.classList.remove("active"); });
                const activeTab = nav.querySelector('a[href="#' + entry.target.id + '"]');
                if (activeTab) {
                    activeTab.classList.add("active");
                    activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }
            }
        });
    }, { rootMargin: "-20% 0px -70% 0px" });

    sections.forEach(function (s) { observer.observe(s); });

    // Al pulsar una pestaña, abre la categoría y hace scroll hasta ella
    tabs.forEach(function (tab) {
        tab.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.getElementById(tab.getAttribute("href").substring(1));
            if (target) {
                target.open = true;
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
})();
