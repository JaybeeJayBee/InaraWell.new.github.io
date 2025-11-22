document.addEventListener('DOMContentLoaded', () => {
    
    // Function to load and inject components from external HTML files
    async function loadComponent(placeholderId, filePath) {
        try {
            const response = await fetch(filePath);
            const html = await response.text();
            document.getElementById(placeholderId).innerHTML = html;
        } catch (error) {
            console.error(`Error loading component from ${filePath}:`, error);
        }
    }

    // --- Component Injection ---
    loadComponent('nav-overlay-container', 'components/nav.html').then(() => {
        // Run Navigation setup after the nav.html content has been injected
        setupNavigation();
        setupSubmenuLogic();
        highlightCurrentPage(); // NEW: Active Page Glow
    });
    loadComponent('footer-container', 'components/footer.html').then(() => {
        // Run Footer script after injection
        setupFooterYear();
    });

    // --- Navigation and Floating Icon Logic ---
    function setupNavigation() {
        // UPDATED ID to match blueprint
        const trigger = document.getElementById('floating-nav-icon'); 
        const closeBtn = document.getElementById('nav-close');
        const overlay = document.getElementById('nav-overlay');

        if (!trigger || !overlay || !closeBtn) return;

        // Open Menu Function
        trigger.addEventListener('click', () => {
            overlay.classList.remove('hidden');
            overlay.classList.add('visible');
            trigger.style.display = 'none'; // Hide trigger when menu opens
        });

        // Close Menu Function
        closeBtn.addEventListener('click', () => {
            // AI Decision: Spin/Fade-Out Animation
            closeBtn.classList.add('animate-close');
            overlay.classList.remove('visible');
            overlay.classList.add('hidden');
            
            setTimeout(() => {
                closeBtn.classList.remove('animate-close');
                trigger.style.display = 'flex'; // Show trigger when menu closes
            }, 500); // Matches CSS transition time
            
            // Close any open submenus when the main menu closes
            document.querySelectorAll('.has-submenu .submenu').forEach(sub => {
                sub.classList.add('hidden');
                const arrow = sub.closest('.has-submenu').querySelector('.submenu-arrow');
                if (arrow) {
                    arrow.classList.remove('rotate');
                }
            });
        });

        // Floating Icon Visibility Control (Scroll Logic)
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const st = window.scrollY || document.documentElement.scrollTop;
            
            // Check if menu is closed AND we are scrolling down
            if (overlay.classList.contains('hidden')) {
                if (st > lastScrollTop) {
                    // Scrolling Down (Hide Icon)
                    trigger.classList.add('is-hidden');
                } else {
                    // Scrolling Up (Show Icon)
                    trigger.classList.remove('is-hidden');
                }
            }
            lastScrollTop = st <= 0 ? 0 : st; // For mobile browsers
        }, false);
    }
    
    // --- NEW: Active Page Glow Logic (Highlight Current Page) ---
    function highlightCurrentPage() {
        const currentPath = window.location.pathname.replace(/\/$/, ''); // Get clean path (/faq)
        
        document.querySelectorAll('.overlay-menu a').forEach(link => {
            const linkPath = link.getAttribute('href').replace(/\/$/, '');
            
            // Handle index.html (root) separately
            if (linkPath === '/' && (currentPath === '' || currentPath === '/index.html' || currentPath === '/index')) {
                 link.classList.add('active-page');
            }
            // Match based on clean URL path
            else if (currentPath.includes(linkPath) && linkPath !== '/') {
                link.classList.add('active-page');
            }
        });
    }
    
    // --- UPDATED: Submenu Dropdown Logic for Multiple Menus ---
    function setupSubmenuLogic() {
        // Select all elements that can trigger a dropdown (both <a> and <span> with class .submenu-toggle)
        document.querySelectorAll('.submenu-toggle').forEach(toggle => {
            
            const parentLi = toggle.closest('.has-submenu');
            const submenu = parentLi.querySelector('.submenu');
            const arrow = parentLi.querySelector('.submenu-arrow'); 

            if (!submenu) return;

            // This single click handler now manages both the 'click-to-toggle' (span) and 'click-to-navigate' (a)
            toggle.addEventListener('click', (e) => {
                
                // If it's a non-link span OR the submenu is closed, or it's an arrow click, we TOGGLE
                if (toggle.tagName === 'SPAN' || submenu.classList.contains('hidden') || e.target.classList.contains('submenu-arrow') || e.target.closest('.submenu-arrow')) {
                    
                    e.preventDefault(); 
                    
                    // Toggle visibility of the submenu
                    submenu.classList.toggle('hidden');
                    
                    // Toggle arrow rotation ONLY if the arrow exists
                    if (arrow) {
                        arrow.classList.toggle('rotate');
                    }

                    // Close other open submenus (ONE AT A TIME requirement)
                    document.querySelectorAll('.has-submenu').forEach(otherLi => {
                        if (otherLi !== parentLi) {
                            const otherSubmenu = otherLi.querySelector('.submenu');
                            if (otherSubmenu && !otherSubmenu.classList.contains('hidden')) {
                                otherSubmenu.classList.add('hidden');
                                const otherArrow = otherLi.querySelector('.submenu-arrow');
                                if (otherArrow) {
                                    otherArrow.classList.remove('rotate');
                                }
                            }
                        }
                    });
                }
                // If it's an <a> and the submenu is already visible, the default action (navigation) will proceed.
            });
            
            // Handle non-clickable sub-links (spans) inside the submenu
            submenu.querySelectorAll('li > span').forEach(subSpan => {
                subSpan.addEventListener('click', (e) => {
                    e.preventDefault(); // Explicitly prevent any default action on these static links
                });
            });

        });
    }

    // --- Footer Year Script ---
    function setupFooterYear() {
        const yearElement = document.getElementById("currentYear");
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    
    // --- FAQ Accordion Logic (Your Custom Script) ---
    function setupFAQAccordion() {
        document.querySelectorAll('.faq-question').forEach(item => {
            item.addEventListener('click', () => {
                const faqItem = item.parentElement;
                const answer = faqItem.querySelector('.faq-answer');

                // Toggle active class on the clicked item
                faqItem.classList.toggle('active');

                // Show or hide the answer with a smooth animation
                if (faqItem.classList.contains('active')) {
                    // Close other active items when a new one is opened (optional but clean)
                    document.querySelectorAll('.faq-item.active').forEach(otherItem => {
                        if (otherItem !== faqItem) {
                            otherItem.classList.remove('active');
                            otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                        }
                    });
                    
                    answer.style.maxHeight = answer.scrollHeight + 'px'; // Set height to scroll height
                } else {
                    answer.style.maxHeight = '0'; // Collapse
                }
            });
        });
    }

    // Run the FAQ setup if we are on a page with the FAQ content
    if (document.querySelector('.faq-container')) {
        setupFAQAccordion();
    }
});
