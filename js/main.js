document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    const navbar = document.querySelector('.navbar');

    // Mobil menü toggle
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            body.classList.toggle('nav-open');
        });
    }

    // Linklere tıklandığında mobil menüyü kapat
    const allNavLinks = document.querySelectorAll('.nav-links a');
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                body.classList.remove('nav-open');
            }
        });
    });

    // Scroll'da navbar rengini değiştirme
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll animasyonları için Intersection Observer
    const animatedItems = document.querySelectorAll('.animated-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedItems.forEach(item => {
        observer.observe(item);
    });

    // Logo slider için responsive kontrol
    function initLogoSlider() {
        const sliderTrack = document.querySelector('.slider-track');
        const partnerLogos = document.querySelectorAll('.partner-logo');
        
        if (sliderTrack && partnerLogos.length > 0) {
            // Slider hızını ekran boyutuna göre ayarla
            function updateSliderSpeed() {
                const isMobile = window.innerWidth <= 768;
                const animationDuration = isMobile ? '20s' : '30s';
                sliderTrack.style.animationDuration = animationDuration;
            }
            
            // İlk yüklemede ve pencere boyutu değiştiğinde çalıştır
            updateSliderSpeed();
            window.addEventListener('resize', updateSliderSpeed);
        }
    }

    // Logo slider'ı başlat
    initLogoSlider();
});
