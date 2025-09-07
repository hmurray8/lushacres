// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initSmoothScrolling();
    initFormValidation();
    initScrollAnimations();
    initParallax();
    initAcresGallery();
    initMap();
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
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Please enter a valid name (letters and spaces only)'
        },
        email: {
            required: true,
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: true,
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
        if (isValid) {
            field.classList.remove('error');
        } else {
            field.classList.add('error');
        }
    }

    // Add event listeners for real-time validation
    nameInput.addEventListener('blur', () => validateField(nameInput, validators.name));
    emailInput.addEventListener('blur', () => validateField(emailInput, validators.email));
    phoneInput.addEventListener('blur', () => validateField(phoneInput, validators.phone));

    // Remove error on input
    [nameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                this.classList.remove('error');
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get error message element
        const errorMessage = document.querySelector('.form-error-message');
        
        // Validate all fields
        const nameValid = validateField(nameInput, validators.name);
        const emailValid = validateField(emailInput, validators.email);
        const phoneValid = validateField(phoneInput, validators.phone);
        
        const isFormValid = nameValid && emailValid && phoneValid;
        
        console.log('Form validation:', { nameValid, emailValid, phoneValid, isFormValid });
        
        if (isFormValid) {
            // Hide error message and submit
            errorMessage.style.display = 'none';
            submitForm();
        } else {
            // Show error message
            errorMessage.style.display = 'block';
            
            // Scroll to first error
            const firstError = form.querySelector('.error');
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
            
            // Log form data for debugging
            console.log('Form data being submitted:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Submit to FormSubmit.co
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('FormSubmit.co response:', result);
                
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
                const errorText = await response.text();
                console.error('FormSubmit.co error response:', errorText);
                throw new Error(`Form submission failed: ${response.status} - ${errorText}`);
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            console.error('Error details:', error.message);
            console.error('Response status:', error.status);
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // More specific error message
            if (error.message.includes('Failed to fetch')) {
                alert('Network error: Please check your internet connection and try again.');
            } else {
                alert('Sorry, there was an error submitting the form. Please try again. Check console for details.');
            }
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
    
    // Acre data with multiple images
    const acreData = {
        1: {
            title: 'Acre 1 - Hilltop Paradise',
            description: 'Premium position at the very top of the hill with breathtaking panoramic views',
            features: ['Panoramic Views', '1.2 Acres', 'North Facing', 'Best Views'],
            images: ['lot_1_1.jpg', 'lot_1_2.jpg']
        },
        2: {
            title: 'Acre 2 - Upper Slope',
            description: 'Elevated position with excellent views and gentle slope perfect for building',
            features: ['Elevated Views', '1.1 Acres', 'East Facing', 'Gentle Slope'],
            images: [/*'lot_2_1.jpg',*/ 'lot_2_2.jpg']
        },
        3: {
            title: 'Acre 3 - Mid-Hill Haven',
            description: 'Central location on the hillside with balanced views and accessibility',
            features: ['Valley Views', '1.15 Acres', 'Protected Position', 'Easy Access'],
            images: ['lot_3_1.jpg', 'lot_3_2.jpg']
        },
        4: {
            title: 'Acre 4 - Central Grounds',
            description: 'Perfect middle ground position with great potential for landscaping',
            features: ['Central Location', '1.3 Acres', 'Level Building Site', 'Mature Trees'],
            images: ['lot_4_1.jpg', 'lot_4_2.jpg']
        },
        5: {
            title: 'Acre 5 - Lower Gardens',
            description: 'Spacious lower position ideal for gardens and outdoor living',
            features: ['Garden Paradise', '1.25 Acres', 'Rich Soil', 'Water Access'],
            images: ['lot_5_1.jpg', 'lot_5_2.jpg']
        },
        6: {
            title: 'Acre 6 - Valley View',
            description: 'Lower hillside position with charming valley views and easy access',
            features: ['Valley Views', '1.2 Acres', 'Level Access', 'Close to Road'],
            images: ['lot_6_1.jpg', 'lot_6_2.jpg']
        },
        7: {
            title: 'Acre 7 - Bottom Meadow',
            description: 'Peaceful bottom position with level ground and meadow-like setting',
            features: ['Level Ground', '1.35 Acres', 'Meadow Setting', 'Easy Development'],
            images: ['lot_7_1.jpg', 'lot_7_2.jpg']
        },
        8: {
            title: 'Acre 8 - Eastern Terrace',
            description: 'Generous eastern position with terraced landscape and morning sun',
            features: ['Eastern Aspect', '1.4 Acres', 'Terraced Land', 'Morning Sun'],
            images: ['lot_8_1.jpg', 'lot_8_2.jpg', 'lot_8_3.jpg']
        },
        9: {
            title: 'Acre 9 - Southern Vista',
            description: 'Southern position with expansive views and natural privacy',
            features: ['Private Location', '1.3 Acres', 'Southern Views', 'Natural Buffer'],
            images: ['lot_9_1.jpg', 'lot_9_2.jpg']
        },
        10: {
            title: 'Acre 10 - Western Heights',
            description: 'Western position capturing stunning sunset views',
            features: ['Sunset Views', '1.25 Acres', 'Western Aspect', 'Elevated Site'],
            images: ['lot_10_1.jpg', 'lot_10_2.jpg']
        },
        11: {
            title: 'Acre 11 - Northern Outlook',
            description: 'Northern facing lot with year-round sun and scenic outlook',
            features: ['North Facing', '1.35 Acres', 'All Day Sun', 'Scenic Outlook'],
            images: ['lot_11_1.jpg', 'lot_11_2.jpg']
        },
        12: {
            title: 'Acre 12 - Corner Haven',
            description: 'Corner position offering dual access and flexible building options',
            features: ['Corner Block', '1.45 Acres', 'Dual Access', 'Flexible Layout'],
            images: ['lot_12_1.jpg', 'lot_12_2.jpg']
        },
        13: {
            title: 'Acre 13 - Corner Haven',
            description: 'Corner position offering dual access and flexible building options',
            features: ['Corner Block', '1.45 Acres', 'Dual Access', 'Flexible Layout'],
            images: ['lot_13_1.jpg']//, 'lot_12_2.jpg']
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
    
    // Track current image index for each acre
    const currentImageIndex = {};
    
    function displayAcre(acreNumber) {
        const acre = acreData[acreNumber];
        
        if (!acre) {
            acreDisplay.innerHTML = '<div class="error-message">Lot information not available</div>';
            return;
        }
        
        // Initialize image index for this acre if not set
        if (currentImageIndex[acreNumber] === undefined) {
            currentImageIndex[acreNumber] = 0;
        }
        
        // Clear current display
        acreDisplay.innerHTML = '';
        
        // Create carousel container
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'acre-carousel';
        
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'acre-image-container';
        
        // Create and load image
        const img = document.createElement('img');
        img.src = acre.images[currentImageIndex[acreNumber]];
        img.alt = acre.title;
        img.style.opacity = '0';
        
        // Add loading state
        acreDisplay.innerHTML = '<div class="loading-spinner">Loading...</div>';
        
        img.onload = function() {
            acreDisplay.innerHTML = '';
            imageContainer.appendChild(img);
            carouselContainer.appendChild(imageContainer);
            
            // Add navigation controls if there are multiple images
            if (acre.images.length > 1) {
                // Previous button
                const prevBtn = document.createElement('button');
                prevBtn.className = 'carousel-btn carousel-prev';
                prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
                prevBtn.onclick = () => navigateImage(acreNumber, -1);
                carouselContainer.appendChild(prevBtn);
                
                // Next button
                const nextBtn = document.createElement('button');
                nextBtn.className = 'carousel-btn carousel-next';
                nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
                nextBtn.onclick = () => navigateImage(acreNumber, 1);
                carouselContainer.appendChild(nextBtn);
                
                // Image indicators
                const indicators = document.createElement('div');
                indicators.className = 'carousel-indicators';
                
                acre.images.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.className = 'carousel-indicator';
                    if (index === currentImageIndex[acreNumber]) {
                        dot.classList.add('active');
                    }
                    dot.onclick = () => goToImage(acreNumber, index);
                    indicators.appendChild(dot);
                });
                
                carouselContainer.appendChild(indicators);
            }
            
            acreDisplay.appendChild(carouselContainer);
            
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
    
    function navigateImage(acreNumber, direction) {
        const acre = acreData[acreNumber];
        const currentIndex = currentImageIndex[acreNumber];
        let newIndex = currentIndex + direction;
        
        // Wrap around if necessary
        if (newIndex < 0) {
            newIndex = acre.images.length - 1;
        } else if (newIndex >= acre.images.length) {
            newIndex = 0;
        }
        
        currentImageIndex[acreNumber] = newIndex;
        displayAcre(acreNumber);
    }
    
    function goToImage(acreNumber, index) {
        currentImageIndex[acreNumber] = index;
        displayAcre(acreNumber);
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

// Leaflet Map initialization
function initMap() {
    // Property location coordinates
    const propertyLocation = [-23.11346, 150.71287]; // Yeppoon coordinates
    
    // Create map
    const map = L.map('map').setView(propertyLocation, 16);
    
    // Add satellite layer as default
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    }).addTo(map);
    
    // Add street map as option
    const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    });
    
    // Layer control
    const baseMaps = {
        "Satellite": satellite,
        "Street Map": streetMap
    };
    
    L.control.layers(baseMaps).addTo(map);
    
    // Custom marker icon with Lush Acres branding
    const customIcon = L.divIcon({
        html: `<div style="
            background: linear-gradient(135deg, #4caf50, #2e7d32);
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
        "><div style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 16px;
        ">🏡</div></div>`,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });
    
    // Add marker
    const marker = L.marker(propertyLocation, { icon: customIcon }).addTo(map);
    
    // Add popup with styling consistent with site design
    marker.bindPopup(`
        <div style="padding: 15px; min-width: 220px; font-family: 'Inter', sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #2d6e3e; font-family: 'Playfair Display', serif; font-size: 18px;">Lush Acres</h3>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 14px; line-height: 1.4;">Premium rural land blocks</p>
            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.4;">5 minutes from Yeppoon town center</p>
            <div style="margin-top: 10px; padding: 8px; background: linear-gradient(135deg, #f0f7f0, #e8f5e8); border-radius: 6px; font-size: 12px; color: #2d6e3e;">
                📍 Vaughans Road, Adelaide Park
            </div>
        </div>
    `);
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
} else {
    initPerformanceOptimizations();
}