function toggleSection(id) {
    const section = document.getElementById(id);
    section.classList.toggle("visible");
}


document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menu-btn");
    const menu = document.getElementById("menu");

    menuBtn.addEventListener("click", () => {
        // Cambiar entre mostrar y ocultar el menú
        if (menu.style.display === "block") {
            menu.style.display = "none";
        } else {
            menu.style.display = "block";
        }
    });
});
