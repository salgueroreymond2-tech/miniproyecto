// ═══════════════════════════════════════════════
// JobConnect — Landing Page Interactivity
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // ── 1. Menú móvil interactivo ──
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // ── 2. Acordeón interactivo de Preguntas Frecuentes (FAQ) ──
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');

            // Cierra los demás items abiertos
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Si no estaba activo, lo abre
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ── 3. Resaltado de navegación según el scroll ──
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.navbar-right a[href*="${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.style.color = '#fff';
                } else {
                    navLink.style.color = '';
                }
            }
        });
    });
});
