/* G&G Travel and Tours - Main JavaScript File
   Includes: Mobile Menu, Theme Toggle, Smooth Scroll, Form Handling, Dropdowns, SECRET ACCESS
*/

document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initThemeToggle();
    initSmoothScrolling();
    initFormHandling();
    initDropdowns();
    initHeaderScroll();
    initLazyLoading();
    initAccessibility();
    highlightActiveLink();
    initSecretAccess();
});

// 1. Highlight Active Link
function highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-column a');

    navLinks.forEach(link => {
        // Handle matching "ghana.html" with href="ghana.html"
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            link.style.color = 'var(--primary-green)';

            // Also highlight parent dropdown
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const trigger = parentDropdown.querySelector('.dropdown-trigger');
                if (trigger) trigger.classList.add('active');
            }
        }
    });
}

// 2. Mobile Menu Logic
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');

            const isExpanded = navMenu.classList.contains('active');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);

            const icon = mobileMenuBtn.querySelector('i');
            if (icon) icon.className = isExpanded ? 'fas fa-times' : 'fas fa-bars';
        });

        // Close when clicking outside
        document.addEventListener('click', function (event) {
            if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });

        // Close on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// 3. Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle?.querySelector('i');

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(themeIcon, savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(themeIcon, newTheme);
        });
    }
}

function updateThemeIcon(icon, theme) {
    if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// 4. Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            }
        });
    });
}

// 5. Form Handling
function initFormHandling() {
    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => handleFormSubmit(e, 'newsletter'));
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => handleFormSubmit(e, 'contact'));
    }
}

function handleFormSubmit(e, type) {
    // Check if this is a specialized form like addTourForm
    if (e.target.id === 'addTourForm' || e.target.id === 'loginForm') return;

    e.preventDefault();
    const form = e.target;
    // Use querySelector to find the submit button - simplistic check
    // The previous code used this.querySelector('button[type="submit"]')
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;

    const originalContent = btn.innerHTML;

    // Show Plane Spinner
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-plane plane-spinner"></i> Sending...';

    const data = {
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    let collectionName = '';

    if (type === 'newsletter') {
        collectionName = 'subscribers';
        data.email = form.querySelector('input[type="email"]').value;
    } else if (type === 'contact') {
        collectionName = 'messages';
        data.name = form.querySelector('#name').value;
        data.email = form.querySelector('#email').value;
        data.phone = form.querySelector('#phone').value || '';
        data.country = form.querySelector('#country').value;
        data.travelers = form.querySelector('#travelers').value;
        data.date = form.querySelector('#date').value;
        data.message = form.querySelector('#message').value;
    }

    // Basic validation check (optional, HTML5 required handles most)

    db.collection(collectionName).add(data)
        .then(() => {
            alert(type === 'newsletter' ? 'Subscribed successfully! ✈️' : 'Message sent successfully! ✈️');
            form.reset();
        })
        .catch((error) => {
            console.error("Error:", error);
            alert('Something went wrong. Please try again.');
        })
        .finally(() => {
            // Restore button
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalContent;
            }, 500);
        });
}

// 6. Dropdown Interactions
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');

    // Only verify trigger exists, rest is CSS hover for desktop
    // For mobile click toggling:
    if (window.innerWidth <= 768) {
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            if (trigger) {
                trigger.addEventListener('click', function (e) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                });
            }
        });
    }
}

// 7. Header Scroll Effect
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        else header.style.boxShadow = 'none';
        header.style.background = 'var(--white)';
    });
}

// 8. Lazy Loading
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// 9. Accessibility
function initAccessibility() {
    document.addEventListener('keyup', function (e) {
        if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
    });
    document.addEventListener('mousedown', function () {
        document.body.classList.remove('keyboard-nav');
    });
}

/* --- 10. SECRET ADMIN ACCESS (SHORTCUT) --- */
function initSecretAccess() {
    document.addEventListener('keydown', function (e) {
        // Ctrl + Shift + A
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            const confirmAccess = confirm("⚠️ Secure Access Detected\n\nDo you want to enter the Admin Portal?");
            if (confirmAccess) {
                window.location.href = 'admin.html';
            }
        }
    });
}