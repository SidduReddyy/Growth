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
    initProjectMatcher();
    initGrowthSandbox();
    initWhatsAppSimulator();
    initToolkitModal();

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

// ==========================================
// 1. INTERACTIVE AI PROJECT MATCHER
// ==========================================
const PROJECT_DATABASE = {
    CSE: {
        SWE: {
            title: "Smart Campus Placement Chatbot with RAG & Gemini 1.5",
            branchBadge: "CSE / IT",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Zero Prerequisites",
            input: "College Placement Papers / PDFs",
            model: "Gemini 1.5 Flash + FAISS Vector DB",
            framework: "Python + Streamlit Full-Stack",
            deploy: "Shareable Live Web App",
            bullet: "Engineered and deployed an interactive Generative AI query assistant using Python, Gemini 1.5 Flash, and Streamlit in under 60 minutes, enabling sub-200ms document question-answering with verifiable GitHub source code.",
            code: `# ⚡ CSE / IT Workshop Scaffold
import google.generativeai as genai
import streamlit as st

st.set_page_config(page_title="AI Placement Assistant", page_icon="🤖")
genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

user_input = st.text_input("Ask anything about placements or technical questions:")
if user_input:
    response = model.generate_content(user_input)
    st.write(response.text)`
        },
        DATA: {
            title: "Automated Code Vulnerability & Bug Diagnostic Agent",
            branchBadge: "CSE / Data",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Beginner Friendly",
            input: "Raw Code Snippets (Python/Java/C++)",
            model: "Gemini Code Assist + AST Parser",
            framework: "FastAPI + Streamlit GUI",
            deploy: "Automated Review Dashboard",
            bullet: "Built a real-time code vulnerability scanner utilizing Gemini LLM and Python AST parsers, automatically detecting security anti-patterns and generating unit test fixes in seconds.",
            code: `# Automated Code Diagnostic Agent
import google.generativeai as genai

def audit_code(snippet):
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"Analyze for security vulnerabilities and output fixes:\n{snippet}"
    return model.generate_content(prompt).text`
        },
        CORE: {
            title: "High-Throughput Semantic Cache Engine for LLMs",
            branchBadge: "CSE / Systems",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Intermediate",
            input: "User Prompt Stream",
            model: "SentenceTransformers + Cosine Similarity",
            framework: "Redis + Python In-Memory",
            deploy: "Low-Latency Cache Proxy",
            bullet: "Constructed an in-memory semantic cache using vector embeddings and Python, reducing duplicate LLM API costs by 68% and accelerating response latency to under 30ms.",
            code: `# Semantic LLM Cache
from sentence_transformers import SentenceTransformer
import numpy as np

encoder = SentenceTransformer('all-MiniLM-L6-v2')
cache = {}  # {embedding: response}`
        },
        PROD: {
            title: "AI Product Requirements Document (PRD) & Schema Generator",
            branchBadge: "CSE / Product",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Zero Prerequisites",
            input: "Rough Product Idea Voice/Text",
            model: "Gemini 1.5 Structured JSON Mode",
            framework: "Python + Mermaid Diagram Engine",
            deploy: "Exportable Markdown PRD",
            bullet: "Designed an automated PRD generation system translating natural language product ideas into architecture diagrams and database schemas with 100% structured JSON compliance.",
            code: `# PRD Generator Scaffold
import google.generativeai as genai
model = genai.GenerativeModel("gemini-1.5-flash")
res = model.generate_content("Generate ER diagram & DB schema in Mermaid for Food Delivery app")`
        }
    },
    ECE: {
        SWE: {
            title: "Edge-AI Audio Noise Suppressor & Speech Classifier",
            branchBadge: "ECE / Signals",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Hands-on",
            input: "Mic Audio Signal (WAV)",
            model: "Spectral FFT + Lightweight CNN",
            framework: "PyTorch Mobile + WebAssembly",
            deploy: "Browser Edge Audio Filter",
            bullet: "Implemented a real-time audio noise suppression model leveraging Fourier Transform features and lightweight CNNs, achieving 91% speech clarity enhancement on low-compute edge devices.",
            code: `# Audio Signal Processing Scaffold
import librosa
import numpy as np

def extract_features(audio_path):
    y, sr = librosa.load(audio_path)
    return np.mean(librosa.feature.mfcc(y=y, sr=sr).T, axis=0)`
        },
        DATA: {
            title: "RF Signal Anomaly & Modulation Classifier",
            branchBadge: "ECE / Comms",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Beginner Friendly",
            input: "I/Q Time-Series Signal Packets",
            model: "1D-ResNet + Scikit-Learn",
            framework: "Python + Matplotlib Live Plot",
            deploy: "RF Spectrum Visualizer",
            bullet: "Developed an RF modulation recognition model classifying QAM/PSK signal transmissions with 93% accuracy under variable signal-to-noise ratio (SNR) conditions.",
            code: `# RF Signal Anomaly Detector
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_rf_anomaly(iq_samples):
    clf = IsolationForest(contamination=0.05)
    return clf.fit_predict(iq_samples)`
        },
        CORE: {
            title: "Smart IoT Vision Anomaly Sorter for Embedded Boards",
            branchBadge: "ECE / Embedded",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Core Hardware",
            input: "ESP32-CAM Video Stream",
            model: "TinyML MobileNetV2 (Quantized INT8)",
            framework: "TensorFlow Lite + OpenCV",
            deploy: "Edge Controller Trigger",
            bullet: "Deployed an INT8-quantized TinyML object classifier on simulated embedded hardware, processing 15 FPS image classification at under 2W total power consumption.",
            code: `# TinyML TFLite Inference
import tflite_runtime.interpreter as tflite
interpreter = tflite.Interpreter(model_path="tinyml_model.tflite")
interpreter.allocate_tensors()`
        },
        PROD: {
            title: "Telecommunication Cell Tower Failure Forecaster",
            branchBadge: "ECE / Systems",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Beginner Friendly",
            input: "Telemetry Logs & Packet Loss",
            model: "XGBoost + Gemini Diagnostic Bot",
            framework: "Python Streamlit",
            deploy: "Ops Command Dashboard",
            bullet: "Engineered a predictive maintenance copilot for telecom cell towers, forecasting transmission degradation 6 hours prior to outage with automated recovery recommendations.",
            code: `# Telemetry Failure Predictor
import xgboost as xgb
# Predict tower outage probability from SNR & packet drops`
        }
    },
    EEE: {
        SWE: {
            title: "Smart Grid Renewable Load Demand Forecaster",
            branchBadge: "EEE / Energy",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Hands-on",
            input: "Solar/Wind Smart Meter Telemetry",
            model: "Temporal Fusion Transformer / LSTM",
            framework: "Python + Plotly",
            deploy: "Grid Load Simulator",
            bullet: "Built a deep learning solar energy production forecaster analyzing weather covariates to predict peak substation loads with <4.2% mean absolute percentage error.",
            code: `# Solar Demand Prediction
import pandas as pd
from sklearn.linear_model import Ridge
# Train regression model on solar irradiance & smart meter load`
        },
        DATA: {
            title: "Electric Vehicle (EV) Battery State-of-Health Predictor",
            branchBadge: "EEE / EV Tech",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Placement Ready",
            input: "Lithium-Ion Voltage & Thermal Cycles",
            model: "RandomForest Regressor + SHAP",
            framework: "Python + Dash",
            deploy: "BMS Battery Telemetry UI",
            bullet: "Created an EV battery State of Health (SoH) degradation predictor using cyclic voltammetry data, accurately estimating remaining useful life within a 50-cycle confidence interval.",
            code: `# Battery Health Estimator
import numpy as np
def predict_battery_soh(voltage, current, temp):
    return 100 - (0.05 * voltage + 0.1 * temp)`
        },
        CORE: {
            title: "Induction Motor Harmonic Distortion & Fault Detector",
            branchBadge: "EEE / Drives",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Core Electrical",
            input: "3-Phase Current Waveforms",
            model: "FFT Harmonic Analysis + Isolation Forest",
            framework: "Scipy + Streamlit",
            deploy: "Substation Monitoring Hub",
            bullet: "Engineered a 3-phase induction motor fault detector detecting rotor bar defects and Total Harmonic Distortion (THD) via real-time stator current analysis.",
            code: `# Stator Current FFT Analysis
from scipy.fft import fft
# Compute THD and detect stator current imbalance`
        },
        PROD: {
            title: "Industrial Microgrid Carbon & Energy Cost Optimizer",
            branchBadge: "EEE / Power",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Zero Prerequisites",
            input: "Real-Time Tariff & Generation Feeds",
            model: "Linear Optimization (PuLP) + Gemini Explainer",
            framework: "Python + Streamlit",
            deploy: "Energy Trading Copilot",
            bullet: "Formulated an energy dispatch optimizer for commercial microgrids, balancing solar storage versus grid draw to cut facility power costs by 18%.",
            code: `# Microgrid Cost Optimization Model
import pulp
# Optimize battery discharge vs grid buy tariff`
        }
    },
    ME: {
        SWE: {
            title: "CAD Model 3D Geometry Classifier & Feature Extractor",
            branchBadge: "Mechanical / CAD",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Cutting-Edge",
            input: "STL / OBJ 3D Meshes",
            model: "PointNet 3D Neural Architecture",
            framework: "Open3D + PyTorch",
            deploy: "3D Part Search Portal",
            bullet: "Developed a 3D CAD mesh retrieval engine using PointNet representations, enabling mechanical engineers to search inventory by 3D geometric similarity in under 1 second.",
            code: `# 3D Mesh Feature Extractor
import open3d as o3d
# Load STL part and extract point cloud coordinates`
        },
        DATA: {
            title: "CNC Tool Wear & Predictive Maintenance AI",
            branchBadge: "Mechanical / Manufacturing",
            duration: "⏱️ 60 Mins Live",
            level: "✅ High Placement Value",
            input: "Spindle Vibration & Acoustic Emission",
            model: "LightGBM + Statistical Features",
            framework: "Python + Altair",
            deploy: "Shopfloor Machine Monitor",
            bullet: "Implemented a CNC machine tool wear prognostic model analyzing accelerometer vibration data, alerting operators 45 minutes prior to tool fracture.",
            code: `# Tool Wear Predictive Model
import lightgbm as lgb
# Predict remaining tool life in machining minutes`
        },
        CORE: {
            title: "Robotic Arm Inverse Kinematics Path Planner with AI",
            branchBadge: "Mechanical / Robotics",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Robotics Core",
            input: "Target End-Effector 3D Coordinate",
            model: "Deep Q-Learning / Neural Inverse Kinematics",
            framework: "PyBullet + NumPy",
            deploy: "Real-Time Simulation Sandbox",
            bullet: "Created an autonomous 6-DOF robotic manipulator path planner avoiding dynamic obstacles using neural inverse kinematics with <2mm positioning error.",
            code: `# Robotic Arm Kinematics
import numpy as np
# Calculate joint angles for end-effector trajectory`
        },
        PROD: {
            title: "Smart Manufacturing Supply Chain Anomaly Copilot",
            branchBadge: "Mechanical / Operations",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Zero Prerequisites",
            input: "Vendor Lead Times & Bill of Materials (BOM)",
            model: "Gemini 1.5 + Heuristic Optimization",
            framework: "Python Streamlit",
            deploy: "Executive Assembly Dashboard",
            bullet: "Built an assembly line bottleneck forecaster that identifies critical part delivery risks across complex BOM hierarchies, saving 12+ hours of manual weekly audit.",
            code: `# Supply Chain Risk Analyzer
import google.generativeai as genai
# Analyze BOM delivery delays and suggest alternate suppliers`
        }
    },
    CE: {
        SWE: {
            title: "Drone Survey Concrete Crack & Pavement Defect Segmenter",
            branchBadge: "Civil / Infrastructure",
            duration: "⏱️ 60 Mins Live",
            level: "✅ High Impact",
            input: "High-Res Infrastructure Photos / Video",
            model: "YOLOv8 + Semantic Segmentation",
            framework: "Ultralytics + OpenCV",
            deploy: "Structural Audit Web Portal",
            bullet: "Engineered a computer vision crack detector for bridges and highways using YOLOv8, isolating concrete fissures down to 0.5mm with 89% precision.",
            code: `# Concrete Defect Detection
from ultralytics import YOLO
model = YOLO('yolov8n-seg.pt')
# Predict crack mask coordinates on concrete surface`
        },
        DATA: {
            title: "Concrete 28-Day Compressive Strength Predictor",
            branchBadge: "Civil / Materials",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Lab-Ready",
            input: "Cement, Water, Aggregate & Fly Ash Mix Ratios",
            model: "Gradient Boosting + Polynomial Regression",
            framework: "Scikit-Learn + Streamlit",
            deploy: "Mix Design Calculator",
            bullet: "Constructed an ML mix-design simulator predicting 28-day concrete compressive strength (MPa) with R² = 0.94, optimizing cement consumption and reducing testing delays.",
            code: `# Concrete Strength Predictor
from sklearn.ensemble import GradientBoostingRegressor
# Estimate MPa strength based on water-cement ratio`
        },
        CORE: {
            title: "Smart Urban Traffic Intersection Congestion Controller",
            branchBadge: "Civil / Transportation",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Smart City",
            input: "Intersection CCTV Camera Feeds",
            model: "Vehicle Density Tracker + Dynamic Timing Algorithm",
            framework: "OpenCV + Python",
            deploy: "Traffic Signal Automation Sim",
            bullet: "Designed an intelligent traffic light control system utilizing real-time vehicle density counts, reducing simulated junction wait times by 26%.",
            code: `# Traffic Flow Signal Optimization
import cv2
# Detect vehicle queue length and dynamically allocate green signal`
        },
        PROD: {
            title: "Earthquake Structural Resilience & Code Compliance Copilot",
            branchBadge: "Civil / Structural",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Zero Prerequisites",
            input: "Building Dimensions & Soil Seismic Zone",
            model: "Gemini 1.5 + IS 1893 Seismic Standards",
            framework: "Python + Markdown Report",
            deploy: "Safety Compliance Generator",
            bullet: "Built an automated structural code compliance auditor benchmarking building designs against Indian Seismic Standards (IS 1893) with instant mitigation recommendations.",
            code: `# Seismic Compliance Checker
# Validates base shear and lateral drift against IS 1893 code`
        }
    },
    "AI/ML": {
        SWE: {
            title: "Self-Hosted Autonomous Research & Coding Agent",
            branchBadge: "AI & Data Science",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Advanced",
            input: "Technical Research Topic or GitHub URL",
            model: "LangGraph + Gemini 1.5 Flash Tools",
            framework: "Python + FastAPI",
            deploy: "Autonomous Web Agent",
            bullet: "Architected a multi-step AI research agent with recursive web search and automated synthesis using LangGraph, producing citations and executable code scripts in under 45 seconds.",
            code: `# LangGraph Autonomous Agent
import google.generativeai as genai
# Multi-turn tool calling and code execution workflow`
        },
        DATA: {
            title: "AutoML Pipeline with Dynamic SHAP Explainability",
            branchBadge: "AI & Data Science",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Placement Gold",
            input: "Any CSV Dataset (Finance, Health, Tech)",
            model: "LightGBM + Optuna Hyperparameter Tuning",
            framework: "Streamlit + SHAP Visuals",
            deploy: "1-Click AutoML Web Platform",
            bullet: "Engineered an end-to-end automated machine learning pipeline with Bayesian hyperparameter tuning and SHAP feature attribution, reducing model delivery from days to minutes.",
            code: `# AutoML Explainability Engine
import shap
import lightgbm as lgb
# Auto-tune classification model and plot SHAP waterfall`
        },
        CORE: {
            title: "Quantized Local Small Language Model (SLM) on CPU",
            branchBadge: "AI & Systems",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Edge AI",
            input: "User Query (Offline)",
            model: "Llama-3.2 / Phi-3 (4-bit GGUF)",
            framework: "Llama-cpp-python",
            deploy: "Zero-Cloud Offline Desktop App",
            bullet: "Deployed a 4-bit quantized Small Language Model (SLM) executing 18 tokens/sec on standard laptop CPUs without GPU dependencies or cloud API costs.",
            code: `# Local 4-bit SLM Runner
from llama_cpp import Llama
llm = Llama(model_path="phi-3-mini-4k-instruct.Q4_K_M.gguf")
output = llm("Q: Explain gradient descent in 20 words. A:")`
        },
        PROD: {
            title: "Enterprise RAG Evaluation & Hallucination Guardrail",
            branchBadge: "AI / Governance",
            duration: "⏱️ 60 Mins Live",
            level: "✅ Industry Standard",
            input: "LLM Generated Response + Context Chunks",
            model: "Ragas Metric Scorer + Gemini Verifier",
            framework: "Python + Streamlit",
            deploy: "Production Trust & Safety Portal",
            bullet: "Formulated an automated RAG evaluation framework measuring factual precision and context recall, intercepting hallucinations with 96% accuracy before user delivery.",
            code: `# RAG Hallucination Guardrail
# Calculate faithfulness and answer relevancy metrics`
        }
    }
};

let selectedBranch = 'CSE';
let selectedRole = 'SWE';

function initProjectMatcher() {
    const branchPills = document.querySelectorAll('#branchPills .matcher-pill');
    const rolePills = document.querySelectorAll('#rolePills .matcher-pill');
    const generateBtn = document.getElementById('generateProjectBtn');
    const copyBulletBtn = document.getElementById('copyBulletBtn');
    const matchRegisterCta = document.getElementById('matchRegisterCta');

    branchPills.forEach(pill => {
        pill.addEventListener('click', () => {
            branchPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedBranch = pill.dataset.branch;
            updateProjectMatcherDisplay();
        });
    });

    rolePills.forEach(pill => {
        pill.addEventListener('click', () => {
            rolePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedRole = pill.dataset.role;
            updateProjectMatcherDisplay();
        });
    });

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            generateBtn.innerHTML = `<span>⚡ Matching Best Placement Project...</span>`;
            setTimeout(() => {
                updateProjectMatcherDisplay();
                generateBtn.innerHTML = `<span>✨ Project Blueprint Matched! Click Below to Build</span>`;
                const result = document.getElementById('matcherResult');
                if (result) result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 400);
        });
    }

    if (copyBulletBtn) {
        copyBulletBtn.addEventListener('click', () => {
            const bulletText = document.getElementById('resumeBulletText')?.textContent.trim() || '';
            navigator.clipboard.writeText(bulletText).then(() => {
                copyBulletBtn.textContent = '✅ Copied to Clipboard!';
                setTimeout(() => { copyBulletBtn.textContent = '📋 Copy Bullet'; }, 2000);
            });
        });
    }

    if (matchRegisterCta) {
        matchRegisterCta.addEventListener('click', () => {
            const branchSelect = document.getElementById('branch');
            if (branchSelect) {
                // Select branch in registration form
                branchSelect.value = selectedBranch;
            }
        });
    }

    updateProjectMatcherDisplay();
}

function updateProjectMatcherDisplay() {
    const branchData = PROJECT_DATABASE[selectedBranch] || PROJECT_DATABASE['CSE'];
    const project = branchData[selectedRole] || branchData['SWE'];

    const titleEl = document.getElementById('projectTitle');
    const branchBadge = document.getElementById('projectBranchBadge');
    const durationBadge = document.getElementById('projectDurationBadge');
    const levelBadge = document.getElementById('projectLevelBadge');
    const nodeInput = document.getElementById('nodeInput');
    const nodeModel = document.getElementById('nodeModel');
    const nodeFramework = document.getElementById('nodeFramework');
    const nodeDeploy = document.getElementById('nodeDeploy');
    const bulletText = document.getElementById('resumeBulletText');
    const codeSnippet = document.getElementById('codeSnippetContent');

    if (titleEl) titleEl.textContent = project.title;
    if (branchBadge) branchBadge.textContent = project.branchBadge;
    if (durationBadge) durationBadge.textContent = project.duration;
    if (levelBadge) levelBadge.textContent = project.level;
    if (nodeInput) nodeInput.textContent = project.input;
    if (nodeModel) nodeModel.textContent = project.model;
    if (nodeFramework) nodeFramework.textContent = project.framework;
    if (nodeDeploy) nodeDeploy.textContent = project.deploy;
    if (bulletText) bulletText.textContent = project.bullet;
    if (codeSnippet) codeSnippet.textContent = project.code;
}

// ==========================================
// 2. VIRAL GROWTH & REFERRAL SANDBOX
// ==========================================
let simReferralCount = 0;

function initGrowthSandbox() {
    const tabs = document.querySelectorAll('.sandbox-tab');
    const panels = document.querySelectorAll('.sandbox-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });

    const plusOne = document.getElementById('btnSimPlusOne');
    const plusTwo = document.getElementById('btnSimPlusTwo');
    const reset = document.getElementById('btnSimReset');

    if (plusOne) plusOne.addEventListener('click', () => simulateReferral(1));
    if (plusTwo) plusTwo.addEventListener('click', () => simulateReferral(2));
    if (reset) reset.addEventListener('click', resetReferralSimulation);

    updateReferralSimUI();
}

function simulateReferral(amount) {
    simReferralCount = Math.min(3, simReferralCount + amount);
    updateReferralSimUI();

    if (simReferralCount === 3) {
        createConfetti();
        setTimeout(() => {
            const modal = document.getElementById('toolkitModal');
            if (modal) modal.style.display = 'flex';
        }, 500);
    }
}

function resetReferralSimulation() {
    simReferralCount = 0;
    updateReferralSimUI();
}

function updateReferralSimUI() {
    const counterText = document.getElementById('simCounterText');
    const fill = document.getElementById('simProgressFill');
    const m1 = document.getElementById('simMilestone1');
    const m2 = document.getElementById('simMilestone2');
    const m3 = document.getElementById('simMilestone3');

    if (counterText) counterText.textContent = `${simReferralCount} / 3 Friends Registered`;
    const pct = (simReferralCount / 3) * 100;
    if (fill) fill.style.width = `${pct}%`;

    if (m1) {
        m1.style.color = simReferralCount >= 1 ? '#34d399' : 'var(--text-muted)';
        m1.querySelector('span').textContent = simReferralCount >= 1 ? '✅' : '🔓';
    }
    if (m2) {
        m2.style.color = simReferralCount >= 2 ? '#34d399' : 'var(--text-muted)';
        m2.querySelector('span').textContent = simReferralCount >= 2 ? '✅' : '🔓';
    }
    if (m3) {
        m3.style.color = simReferralCount >= 3 ? '#f59e0b' : 'var(--text-muted)';
        m3.querySelector('span').textContent = simReferralCount >= 3 ? '🎉' : '🎁';
    }
}

function copySimCode() {
    const input = document.getElementById('simReferralCode');
    const btn = document.getElementById('simCopyBtn');
    if (input) {
        navigator.clipboard.writeText(input.value).then(() => {
            if (btn) btn.textContent = '✅ Copied!';
            setTimeout(() => { if (btn) btn.textContent = '📋 Copy'; }, 2000);
        });
    }
}

// ==========================================
// 3. WHATSAPP DRIP & INVITE SIMULATOR
// ==========================================
const WA_MESSAGES = {
    1: [
        { type: 'received', text: `🎉 <strong>Registration Confirmed!</strong><br><br>Hey Siddu! You're booked for <em>"Build Your First AI Project in 60 Minutes"</em>.<br><br>📅 <strong>Date:</strong> This Saturday, 6:00 PM IST<br>🎟️ <strong>Ticket ID:</strong> #NW-AI-84920<br>🔗 <strong>Direct Room Link:</strong> nxtwave.co/live/ai-60<br><br>💡 <em>Save this contact for live reminder pings.</em>`, time: '10:14 AM' },
        { type: 'received', text: `🎁 <strong>Unlock Your AI Placement Kit:</strong><br>Share your private referral pass with 3 batchmates to unlock the 50+ AI Interview Questions Blueprint!<br><br>Your Link: nxtwave.co/r/NW-SIDDU-89`, time: '10:15 AM' }
    ],
    2: [
        { type: 'sent', text: `🚀 Guys! Just registered for NxtWave's FREE live workshop: <strong>"Build Your First AI Project in 60 Minutes"</strong>.<br><br>✅ We actually code & deploy an AI model live<br>✅ Verified certificate for LinkedIn & resume<br>✅ Completely free (usually ₹1,999)<br><br>Spots are capped at 500. Register with my link here:<br>👉 nxtwave.co/r/NW-SIDDU-89`, time: '11:30 AM' },
        { type: 'received', text: `💬 <em>(Forwarded across 8 college WhatsApp groups: JNTU CSE-A, Hostel Block 4, Placement Prep 2026...)</em>`, time: '11:32 AM' },
        { type: 'received', text: `🔥 <strong>+1 Referral Verified!</strong> Rahul Verma registered using your code! (1/3 unlocked)`, time: '11:45 AM' }
    ],
    3: [
        { type: 'received', text: `⏰ <strong>STARTING IN 1 HOUR!</strong><br><br>Hey Siddu, your workstation is ready! Zero installations required—everything runs right inside Google Colab.<br><br>💻 <strong>Click to Enter Live Workshop:</strong><br>👉 nxtwave.co/live/join-now<br><br>See you on screen! 🚀`, time: '5:00 PM' }
    ]
};

function initWhatsAppSimulator() {
    const stepBtns = document.querySelectorAll('.btn-wa-step');
    stepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            stepBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderWhatsAppStep(parseInt(btn.dataset.step, 10));
        });
    });
    renderWhatsAppStep(1);
}

function renderWhatsAppStep(step) {
    const chatBody = document.getElementById('waChatBody');
    if (!chatBody) return;

    const msgs = WA_MESSAGES[step] || WA_MESSAGES[1];
    chatBody.innerHTML = '';

    msgs.forEach((m, idx) => {
        const bubble = document.createElement('div');
        bubble.className = `wa-bubble ${m.type === 'sent' ? 'wa-sent' : 'wa-received'}`;
        bubble.innerHTML = `
            <div>${m.text}</div>
            <div class="wa-time">${m.time} ${m.type === 'sent' ? '✓✓' : ''}</div>
        `;
        chatBody.appendChild(bubble);
    });
}

// ==========================================
// 4. TOOLKIT MODAL
// ==========================================
function initToolkitModal() {
    const openBtn = document.getElementById('btnViewToolkit');
    const closeBtn = document.getElementById('closeToolkitModal');
    const modal = document.getElementById('toolkitModal');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
}

// Make functions global
window.copySimCode = copySimCode;
window.copyReferralLink = copyReferralLink;
window.shareWhatsApp = shareWhatsApp;
window.shareTelegram = shareTelegram;
window.shareLinkedIn = shareLinkedIn;

