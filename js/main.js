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

    // Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    
    // Kullanıcının tercihini kontrol et
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            // Tercihi kaydet
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
            
            // Canvas animasyonunu güncelle
            updateCanvasColors();
        });
    }
    
    function updateCanvasColors() {
        const isDark = body.classList.contains('dark-mode');
        // Canvas renkleri otomatik güncellenecek
    }

    // Matrix Code Rain Effect
    const canvas = document.createElement('canvas');
    const codeBackground = document.querySelector('.code-background');
    
    if (codeBackground) {
        codeBackground.innerHTML = '';
        codeBackground.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Gerçek kod parçaları - daha karışık
        const codeSnippets = [
            'const x =', 'function()', '{', '}', 'return', 'async', 'await', 
            'import {', 'export', 'class', 'if (', 'else {', 'for (let', 
            'while (', 'try {', 'catch (e)', 'useState(', 'useEffect(',
            'React.', 'Vue.', '.map(', '.filter(', '.reduce(', 'forEach(',
            'let data', 'var i', 'new Date', 'this.', 'super(', 'extends',
            'true', 'false', 'null', '=> {', '===', '!==', '&&', '||',
            '++', '--', '[]', '()', '<div>', '</div>', '${', '}',
            'console.log(', 'setTimeout(', 'Promise.', '.then(',
            'SELECT *', 'FROM', 'WHERE', 'JOIN', 'UPDATE', 'INSERT',
            'GET /', 'POST /', 'PUT /', 'DELETE', 'PATCH',
            '0x', '0b', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'app.', 'user.', 'auth.', 'token:', 'id:', 'name:',
            'error:', 'success', 'status:', 'code:', 'msg:',
            'fetch(', 'axios.', 'API.', 'JSON.', 'data:', 'res =>',
            'req.', 'res.', 'next()', 'router.', 'route(', 'app.use(',
            'module.', 'require(', '__dirname', 'process.', 'Buffer.',
            'Array.', 'Object.', 'String.', 'Number.', 'Boolean.',
            '.length', '.push(', '.pop()', '.shift(', '.slice(',
            'typeof', 'instanceof', 'delete', 'void', 'in', 'of'
        ];
        
        const fontSize = 14;
        const drops = [];
        const numDrops = 60; // Daha fazla damla
        
        for (let i = 0; i < numDrops; i++) {
            drops[i] = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * -1,
                speed: 1 + Math.random() * 2,
                opacity: 0.5 + Math.random() * 0.5
            };
        }
        
        function draw() {
            const isDark = document.body.classList.contains('dark-mode');
            
            // Arka plan temizleme - tema göre
            if (isDark) {
                ctx.fillStyle = 'rgba(15, 20, 25, 0.15)';
            } else {
                ctx.fillStyle = 'rgba(218, 225, 231, 0.15)';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = `bold ${fontSize}px "Courier New", monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
                const x = drops[i].x;
                const y = drops[i].y;
                
                // Tema göre renk
                if (isDark) {
                    ctx.fillStyle = `rgba(96, 165, 250, ${drops[i].opacity})`;
                } else {
                    ctx.fillStyle = `rgba(100, 116, 139, ${drops[i].opacity})`;
                }
                ctx.fillText(snippet, x, y);
                
                // Ekranın altına ulaştığında yeniden başlat
                if (y > canvas.height + 50) {
                    drops[i].x = Math.random() * canvas.width;
                    drops[i].y = -50 - Math.random() * 300;
                    drops[i].speed = 1 + Math.random() * 2;
                    drops[i].opacity = 0.5 + Math.random() * 0.5;
                }
                
                drops[i].y += drops[i].speed;
            }
        }
        
        setInterval(draw, 40);
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
});
