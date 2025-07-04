// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initSmoothScrolling();
    initFormValidation();
    initScrollAnimations();
    initParallax();
    initAcresGallery();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const allNavLinks = document.querySelectorAll('.nav-links a');
    
    let lastScrollY = window.scrollY;
    let ticking = false;

    // Static navbar with color fade transition
    function handleScroll() {
        const currentScrollY = window.scrollY;
        const scrolledDistance = currentScrollY;
        
        // Transition to transparent after 100px scroll
        if (scrolledDistance > 100) {
            navbar.classList.add('transparent');
        } else {
            navbar.classList.remove('transparent');
        }
        
        lastScrollY = currentScrollY;
    }

    // Mobile menu toggle
    function toggleMobileMenu() {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }

    // Close mobile menu when clicking a link
    function closeMobileMenu() {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event listeners
    window.addEventListener('scroll', throttle(handleScroll, 16));
    
    mobileToggle.addEventListener('click', toggleMobileMenu);
    
    allNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });


    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form validation and submission
function initFormValidation() {
    const form = document.getElementById('waitlistForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const formSuccess = document.querySelector('.form-success');

    // Validation rules
    const validators = {
        name: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Please enter a valid name (letters and spaces only)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: false,
            pattern: /^[\+]?[0-9\s\-\(\)]+$/,
            message: 'Please enter a valid phone number'
        }
    };

    // Real-time validation
    function validateField(field, rules) {
        const value = field.value.trim();
        const formGroup = field.closest('.form-group');
        
        let isValid = true;
        let message = '';

        // Required field check
        if (rules.required && !value) {
            isValid = false;
            message = 'This field is required';
        }
        // Pattern validation
        else if (value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            message = rules.message;
        }
        // Minimum length check
        else if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            message = `Minimum ${rules.minLength} characters required`;
        }

        // Update UI
        updateFieldValidation(formGroup, field, isValid, message);
        return isValid;
    }

    function updateFieldValidation(formGroup, field, isValid, message) {
        const errorMessage = formGroup.querySelector('.error-message');
        
        if (isValid) {
            formGroup.classList.remove('has-error');
            field.classList.remove('error');
            if (errorMessage) errorMessage.textContent = '';
        } else {
            formGroup.classList.add('has-error');
            field.classList.add('error');
            if (errorMessage) errorMessage.textContent = message;
        }
    }

    // Add event listeners for real-time validation
    nameInput.addEventListener('blur', () => validateField(nameInput, validators.name));
    emailInput.addEventListener('blur', () => validateField(emailInput, validators.email));
    phoneInput.addEventListener('blur', () => validateField(phoneInput, validators.phone));

    // Remove error on input
    [nameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener('input', function() {
            const formGroup = this.closest('.form-group');
            if (formGroup.classList.contains('has-error')) {
                formGroup.classList.remove('has-error');
                this.classList.remove('error');
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const nameValid = validateField(nameInput, validators.name);
        const emailValid = validateField(emailInput, validators.email);
        const phoneValid = phoneInput.value.trim() ? validateField(phoneInput, validators.phone) : true;
        
        const isFormValid = nameValid && emailValid && phoneValid;
        
        if (isFormValid) {
            submitForm();
        } else {
            // Scroll to first error
            const firstError = form.querySelector('.has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    async function submitForm() {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = 'Submitting...';
        submitButton.disabled = true;
        
        try {
            // Collect form data
            const formData = new FormData(form);
            
            // Submit to Formspree
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Hide form, show success message
                form.style.display = 'none';
                formSuccess.style.display = 'block';
                
                // Animate success message
                formSuccess.style.opacity = '0';
                formSuccess.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    formSuccess.style.transition = 'all 0.5s ease';
                    formSuccess.style.opacity = '1';
                    formSuccess.style.transform = 'translateY(0)';
                }, 100);
                
                // Track conversion (if analytics are set up)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL'
                    });
                }
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            submitButton.innerHTML = 'Try Again';
            submitButton.disabled = false;
            alert('Sorry, there was an error submitting the form. Please try again.');
        }
    }
}

// Scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkScroll() {
        animatedElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('visible');
            }
        });
    }
    
    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        return (
            rect.top >= 0 &&
            rect.top <= windowHeight * 0.8
        ) || (
            rect.bottom >= windowHeight * 0.2 &&
            rect.bottom <= windowHeight
        );
    }
    
    // Check on load and scroll
    checkScroll();
    window.addEventListener('scroll', throttle(checkScroll, 16));
}

// Parallax effect for hero section
function initParallax() {
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background img');
    
    if (!hero || !heroBackground) return;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        if (scrolled < heroHeight) {
            const yPos = scrolled * 0.5;
            heroBackground.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
    }
    
    window.addEventListener('scroll', throttle(updateParallax, 16));
}

// Utility functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Lazy loading for images (if needed)
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Initialize performance optimizations
function initPerformanceOptimizations() {
    // Preload critical resources
    const criticalResources = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = 'style';
        document.head.appendChild(link);
    });
    
    // Service Worker registration (if available)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // You could send this to an error tracking service
});

// Page visibility API for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause expensive operations
        console.log('Page hidden');
    } else {
        // Page is visible, resume operations
        console.log('Page visible');
    }
});

// Acres Gallery functionality
function initAcresGallery() {
    const acreMarkers = document.querySelectorAll('.acre-marker');
    const acreDisplay = document.getElementById('acreDisplay');
    
    if (!acreDisplay) {
        console.log('Acre display not found');
        return;
    }
    
    // Acre data
    const acreData = {
        1: {
            title: 'Acre 1 - Hilltop Paradise',
            description: 'Premium position at the very top of the hill with breathtaking panoramic views',
            features: ['Panoramic Views', '1.2 Acres', 'North Facing', 'Best Views'],
            image: 'acres1.jpg'
        },
        2: {
            title: 'Acre 2 - Upper Slope',
            description: 'Elevated position with excellent views and gentle slope perfect for building',
            features: ['Elevated Views', '1.1 Acres', 'East Facing', 'Gentle Slope'],
            image: 'acres2.jpg'
        },
        3: {
            title: 'Acre 3 - Mid-Hill Haven',
            description: 'Central location on the hillside with balanced views and accessibility',
            features: ['Valley Views', '1.15 Acres', 'Protected Position', 'Easy Access'],
            image: 'acres3.jpg'
        },
        4: {
            title: 'Acre 4 - Central Grounds',
            description: 'Perfect middle ground position with great potential for landscaping',
            features: ['Central Location', '1.3 Acres', 'Level Building Site', 'Mature Trees'],
            image: 'acres4.jpg'
        },
        5: {
            title: 'Acre 5 - Lower Gardens',
            description: 'Spacious lower position ideal for gardens and outdoor living',
            features: ['Garden Paradise', '1.25 Acres', 'Rich Soil', 'Water Access'],
            image: 'acres5.jpg'
        },
        6: {
            title: 'Acre 6 - Valley View',
            description: 'Lower hillside position with charming valley views and easy access',
            features: ['Valley Views', '1.2 Acres', 'Level Access', 'Close to Road'],
            image: 'acres6.jpg'
        },
        7: {
            title: 'Acre 7 - Bottom Meadow',
            description: 'Peaceful bottom position with level ground and meadow-like setting',
            features: ['Level Ground', '1.35 Acres', 'Meadow Setting', 'Easy Development'],
            image: 'acres7.jpg'
        }
    };
    
    // Handle acre marker clicks
    acreMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const acreNumber = parseInt(this.dataset.acre);
            
            // Remove active class from all markers
            acreMarkers.forEach(m => m.classList.remove('active'));
            
            // Add active class to clicked marker
            this.classList.add('active');
            
            // Update display
            displayAcre(acreNumber);
        });
        
        // Hover effects are handled by CSS now
    });
    
    function displayAcre(acreNumber) {
        const acre = acreData[acreNumber];
        
        // Clear current display
        acreDisplay.innerHTML = '';
        
        // Create and load image
        const img = document.createElement('img');
        img.src = acre.image;
        img.alt = acre.title;
        img.style.opacity = '0';
        
        // Add loading state
        acreDisplay.innerHTML = '<div class="loading-spinner">Loading...</div>';
        
        img.onload = function() {
            acreDisplay.innerHTML = '';
            acreDisplay.appendChild(img);
            
            // Animate image in
            setTimeout(() => {
                img.style.transition = 'opacity 0.5s ease';
                img.style.opacity = '1';
            }, 100);
        };
        
        img.onerror = function() {
            acreDisplay.innerHTML = '<div class="error-message">Image could not be loaded</div>';
        };
    }
    
    // Auto-select first acre on load
    if (acreMarkers.length > 0) {
        // Use requestAnimationFrame to ensure DOM is ready
        window.requestAnimationFrame(() => {
            setTimeout(() => {
                // Directly call displayAcre instead of simulating click
                displayAcre(1);
                // Also mark the first marker as active
                acreMarkers[0].classList.add('active');
            }, 100);
        });
    }
}

// Google Maps initialization
function initMap() {
    // Replace these coordinates with your actual property location
    const propertyLocation = { lat: -23.11346, lng: 150.71287 }; // Example: Melbourne coordinates
    
    // Create map with satellite view
    const map = new google.maps.Map(document.getElementById('map'), {
        center: propertyLocation,
        zoom: 16,
        mapTypeId: 'satellite',
        tilt: 0,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: ['satellite', 'hybrid', 'terrain']
        }
    });
    
    // Add marker
    const marker = new google.maps.Marker({
        position: propertyLocation,
        map: map,
        title: 'Lush Acres',
        animation: google.maps.Animation.DROP
    });
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0; color: #2d6e3e;">Lush Acres</h3>
                <p style="margin: 0; color: #666;">Premium rural land blocks</p>
                <p style="margin: 5px 0 0 0; color: #666;">5 minutes from town center</p>
            </div>
        `
    });
    
    // Show info window on click
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

// Make initMap globally accessible for Google Maps callback
window.initMap = initMap;

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
} else {
    initPerformanceOptimizations();
}