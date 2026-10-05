/* ==========================================
   NxtWave AI Workshop — Interactive Engine
   ========================================== */

// ============ CONFIGURATION ============
const CONFIG = {
    workshopDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalSpots: 500,
    baseUrl: window.location.href.split('?')[0],
    colleges: [
        'JNTU Hyderabad', 'VIT Vellore', 'SRM Chennai', 'CBIT Hyderabad',
        'NIT Warangal', 'BITS Pilani', 'Amity University', 'LPU Jalandhar',
        'Manipal University', 'Christ University', 'KL University', 'GITAM',
        'Sharda University', 'Bennett University', 'SVNIT Surat', 'NIT Surathkal',
        'DTU Delhi', 'NSUT Delhi', 'IIIT Hyderabad', 'Chandigarh University'
    ],
    names: [
        'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Shreya', 'Karthik',
        'Divya', 'Arjun', 'Meera', 'Rahul', 'Neha', 'Siddharth', 'Kavya',
        'Aditya', 'Pooja', 'Harish', 'Sneha', 'Manish', 'Lakshmi', 'Ravi',
        'Swathi', 'Deepak', 'Nandini', 'Suresh', 'Bhavana', 'Pranav', 'Anjali'
    ],
    branches: ['CSE', 'IT', 'ECE', 'AI/ML', 'DS', 'EEE']
};

// ============ STATE MANAGEMENT ============
class AppState {
    constructor() {
        this.registrations = this.load('nw_registrations') || [];
        this.referralData = this.load('nw_referral_data') || {};
        this.spotsLeft = CONFIG.totalSpots - (this.registrations.length || Math.floor(Math.random() * 80) + 300);
    }

    save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage not available');
        }
    }

    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    addRegistration(data) {
        this.registrations.push(data);
        this.save('nw_registrations', this.registrations);
        this.spotsLeft = Math.max(0, this.spotsLeft - 1);
    }

    generateReferralCode(name) {
        const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `NW-${clean}-${random}`;
    }
}

const state = new AppState();

// ============ PARTICLE SYSTEM ============
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(80, Math.floor(window.innerWidth / 20));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.particles = [];
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            // Move
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x -= dx * force * 0.02;
                    p.y -= dy * force * 0.02;
                }
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - dist / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ============ COUNTDOWN TIMER ============
class CountdownTimer {
    constructor(targetDate) {
        this.targetDate = targetDate;
        this.elements = {
            days: document.getElementById('countdown-days'),
            hours: document.getElementById('countdown-hours'),
            mins: document.getElementById('countdown-mins'),
            secs: document.getElementById('countdown-secs')
        };
        this.update();
        setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date();
        const diff = this.targetDate - now;

        if (diff <= 0) {
            Object.values(this.elements).forEach(el => {
                if (el) el.textContent = '00';
            });
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        if (this.elements.days) this.elements.days.textContent = String(days).padStart(2, '0');
        if (this.elements.hours) this.elements.hours.textContent = String(hours).padStart(2, '0');
        if (this.elements.mins) this.elements.mins.textContent = String(mins).padStart(2, '0');
        if (this.elements.secs) this.elements.secs.textContent = String(secs).padStart(2, '0');
    }
}

// ============ NUMBER COUNTER ANIMATION ============
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const duration = 2000;
        const start = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            counter.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(step);
            else counter.textContent = target;
        }
        requestAnimationFrame(step);
    });
}

// ============ SOCIAL PROOF TOASTS ============
class SocialProofEngine {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.interval = null;
        this.start();
    }

    start() {
        // First toast after 5 seconds
        setTimeout(() => this.showToast(), 5000);
        // Then every 15-30 seconds
        this.interval = setInterval(() => {
            this.showToast();
        }, Math.random() * 15000 + 15000);
    }

    showToast() {
        if (!this.container) return;
        
        const name = CONFIG.names[Math.floor(Math.random() * CONFIG.names.length)];
        const college = CONFIG.colleges[Math.floor(Math.random() * CONFIG.colleges.length)];
        const branch = CONFIG.branches[Math.floor(Math.random() * CONFIG.branches.length)];
        const timeAgo = Math.floor(Math.random() * 10) + 1;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <img src="avatar.jpg" class="toast-avatar" alt="">
            <div class="toast-text">
                <strong>${name} from ${college}</strong>
                <span>${branch} student registered ${timeAgo} min ago</span>
            </div>
        `;

        this.container.appendChild(toast);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        }, 5000);

        // Keep max 2 toasts
        const toasts = this.container.querySelectorAll('.toast:not(.hide)');
        if (toasts.length > 2) {
            toasts[0].classList.add('hide');
            setTimeout(() => toasts[0].remove(), 400);
        }
    }
}

// ============ SCROLL ANIMATIONS ============
class ScrollAnimator {
    constructor() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        // Observe elements
        document.querySelectorAll('.problem-card, .timeline-item, .benefit-card, .testimonial-card').forEach(el => {
            this.observer.observe(el);
        });
    }
}

// ============ NAVBAR BEHAVIOR ============
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });
}

// ============ STICKY CTA ============
function initStickyCta() {
    const stickyCta = document.getElementById('stickyCta');
    const registerSection = document.getElementById('register');

    window.addEventListener('scroll', () => {
        const heroBottom = window.innerHeight;
        const registerTop = registerSection ? registerSection.getBoundingClientRect().top : Infinity;

        if (window.scrollY > heroBottom && registerTop > window.innerHeight) {
            stickyCta.classList.add('visible');
        } else {
            stickyCta.classList.remove('visible');
        }
    });
}

// ============ FAQ ACCORDION ============
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
            });

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ============ LIVE VIEWER COUNTER ============
function initLiveCounter() {
    const liveViewers = document.getElementById('liveViewers');
    if (!liveViewers) return;

    let count = Math.floor(Math.random() * 30) + 35;
    liveViewers.textContent = count;

    setInterval(() => {
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        count = Math.max(20, Math.min(80, count + change));
        liveViewers.textContent = count;
    }, 4000);
}

// ============ SPOTS COUNTER ============
function initSpotsCounter() {
    const spotsEl = document.getElementById('spotsLeft');
    const stickySpotsEl = document.getElementById('stickySpots');
    let spots = state.spotsLeft;

    function updateSpots() {
        if (spotsEl) spotsEl.textContent = spots;
        if (stickySpotsEl) stickySpotsEl.textContent = spots;
    }

    updateSpots();

    // Slowly decrease spots
    setInterval(() => {
        if (Math.random() > 0.6 && spots > 50) {
            spots--;
            updateSpots();
        }
    }, 30000);
}

// ============ REFERRAL SYSTEM ============
function checkReferralCode() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
        const referredByInput = document.getElementById('referredBy');
        if (referredByInput) {
            referredByInput.value = ref;
        }
        // Track referral
        const refData = state.load('nw_referral_data') || {};
        if (!refData[ref]) refData[ref] = { count: 0 };
        // We'll increment on actual registration
    }
}

function generateReferralLink(code) {
    return `${CONFIG.baseUrl}?ref=${code}`;
}

function copyReferralLink() {
    const input = document.getElementById('referralLink');
    const copyText = document.getElementById('copyText');

    if (input) {
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
            copyText.textContent = '✅ Copied!';
            setTimeout(() => {
                copyText.textContent = '📋 Copy';
            }, 2000);
        }).catch(() => {
            // Fallback
            document.execCommand('copy');
            copyText.textContent = '✅ Copied!';
            setTimeout(() => {
                copyText.textContent = '📋 Copy';
            }, 2000);
        });
    }
}

function shareWhatsApp() {
    const link = document.getElementById('referralLink')?.value || '';
    const text = encodeURIComponent(
        `🚀 Hey! I just registered for a FREE AI Workshop by NxtWave!\n\n` +
        `🧠 "Build Your First AI Project in 60 Minutes"\n\n` +
        `✅ It's FREE\n✅ You get a certificate\n✅ You walk out with a real AI project\n\n` +
        `Only 500 spots available. Register before it fills up:\n${link}\n\n` +
        `Trust me, this is legit! 💯`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareTelegram() {
    const link = document.getElementById('referralLink')?.value || '';
    const text = encodeURIComponent(
        `🚀 FREE AI Workshop: Build Your First AI Project in 60 Minutes!\n` +
        `Certificate included. Only 500 spots. Register now:`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`, '_blank');
}

function shareLinkedIn() {
    const link = document.getElementById('referralLink')?.value || '';
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank');
}

// ============ FORM HANDLING ============
function initForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');

        // Validate
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        if (!data.fullName || !data.email || !data.phone || !data.college || !data.branch || !data.year) {
            shakeElement(submitBtn);
            return;
        }

        // Show loading
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        submitBtn.disabled = true;

        // Simulate API call
        await delay(1800);

        // Generate referral code
        const referralCode = state.generateReferralCode(data.fullName);
        const referralLink = generateReferralLink(referralCode);

        // Save registration
        state.addRegistration({
            ...data,
            referralCode,
            registeredAt: new Date().toISOString()
        });

        // Track the referral if there was one
        if (data.referredBy) {
            const refData = state.load('nw_referral_data') || {};
            if (!refData[data.referredBy]) refData[data.referredBy] = { count: 0 };
            refData[data.referredBy].count++;
            state.save('nw_referral_data', refData);
        }

        // Show success
        const formContainer = document.getElementById('formContainer');
        const registerForm = document.getElementById('registerForm');
        const successState = document.getElementById('successState');
        const successName = document.getElementById('successName');
        const referralLinkInput = document.getElementById('referralLink');

        registerForm.style.display = 'none';
        successState.style.display = 'block';
        successName.textContent = data.fullName.split(' ')[0];
        referralLinkInput.value = referralLink;

        // Smooth scroll to success
        successState.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Confetti effect
        createConfetti();
    });
}

function shakeElement(el) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 600);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ CONFETTI ============
function createConfetti() {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    const container = document.body;

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: -10px;
            left: ${Math.random() * 100}vw;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            z-index: 99999;
            pointer-events: none;
            animation: confetti-fall ${Math.random() * 2 + 2}s ease forwards;
            animation-delay: ${Math.random() * 0.5}s;
        `;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }

    // Add confetti keyframes if not exists
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confetti-fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(${Math.random() * 720}deg); opacity: 0; }
            }
            .shake {
                animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes shake {
                10%, 90% { transform: translateX(-1px); }
                20%, 80% { transform: translateX(2px); }
                30%, 50%, 70% { transform: translateX(-4px); }
                40%, 60% { transform: translateX(4px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============ SMOOTH SCROLL ============
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', () => {
    // Core systems
    new ParticleSystem(document.getElementById('particleCanvas'));
    new CountdownTimer(CONFIG.workshopDate);
    new ScrollAnimator();
    new SocialProofEngine();

    // UI interactions
    initNavbar();
    initStickyCta();
    initFAQ();
    initLiveCounter();
    initSpotsCounter();
    initForm();
    initSmoothScroll();
    checkReferralCode();

    // Counter animation (trigger on first view)
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                heroObserver.unobserve(entry.target);
            }
        });
    });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) heroObserver.observe(heroStats);
});

// Make share functions global
window.copyReferralLink = copyReferralLink;
window.shareWhatsApp = shareWhatsApp;
window.shareTelegram = shareTelegram;
window.shareLinkedIn = shareLinkedIn;
