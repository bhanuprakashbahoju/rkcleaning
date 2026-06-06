
const navbar      = document.getElementById('navbar'); 
const stickyCta   = document.getElementById('stickyCta');
const waFloat     = document.getElementById('whatsappFloat');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  if (window.scrollY > 400) {
    stickyCta.classList.add('visible');
    waFloat.classList.add('visible');
  } else {
    stickyCta.classList.remove('visible');
    waFloat.classList.remove('visible');
  }
}, { passive: true });

// ── HAMBURGER MENU ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  }
});

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = parseFloat(entry.target.style.animationDelay || '0') * 1000;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── ANIMATED COUNTERS ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(Math.round(increment * step), target);
    el.textContent = current;
    if (step >= steps) clearInterval(timer);
  }, duration / steps);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// ── SMOOTH SCROLL FOR ANCHOR LINKS ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── FORM VALIDATION & SUBMISSION ──
const form = document.getElementById('enquiryForm');
const formSuccess = document.getElementById('formSuccess');

function validateField(field) {
  const value = field.value.trim();
  let valid = true;

  field.classList.remove('error');

  if (field.required && !value) {
    valid = false;
  } else if (field.type === 'email' && value) {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  } else if (field.type === 'tel' && value) {
    valid = /^[+\d\s\-()]{7,20}$/.test(value);
  }

  if (!valid) field.classList.add('error');
  return valid;
}

// Live validation
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let allValid = true;

  fields.forEach(field => {
    if (!validateField(field)) allValid = false;
  });

  const consent = form.querySelector('input[name="consent"]');
  if (!consent.checked) {
    allValid = false;
    consent.closest('.checkbox-label').style.color = '#EF4444';
  } else {
    consent.closest('.checkbox-label').style.color = '';
  }

  if (!allValid) {
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
    return;
  }

  const submitBtn = form.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="spin">
      <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2" stroke-dasharray="22" stroke-dashoffset="22" opacity="0.3"/>
      <path d="M9 2A7 7 0 0 1 16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    Sending…
  `;

  // Submit enquiry to Supabase
  const SUPABASE_URL = 'https://dihlpbjsvuggpzgpnlkp.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaGxwYmpzdnVnZ3B6Z3BubGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODk1ODksImV4cCI6MjA5NjI2NTU4OX0.ngR_j1iMBDjMYkDOVtC80HdkoVoBRYRnVmP--vTmjHA';
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const data = new FormData(form);
  supabaseClient.from('enquiries').insert({
    first_name: data.get('firstName'),
    last_name: data.get('lastName'),
    email: data.get('email'),
    phone: data.get('phone'),
    service: data.get('service'),
    property_type: data.get('propertyType'),
    postcode: data.get('postcode'),
    preferred_date: data.get('date') || null,
    message: data.get('message') || null,
  }).then(({ error }) => {
    if (error) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Try Again';
      console.error('Submission error:', error.message);
      return;
    }
    form.querySelectorAll('.form-row, .form-group, .form-footer').forEach(el => {
      el.style.display = 'none';
    });
    formSuccess.classList.add('visible');
  });
});

// ── ADD SPIN ANIMATION DYNAMICALLY ──
const style = document.createElement('style');
style.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; }
`;
document.head.appendChild(style);

// ── SERVICE CARD RIPPLE EFFECT ──
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', function (e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      width: 10px;
      height: 10px;
      background: rgba(8,145,178,0.2);
      transform: translate(-50%, -50%) scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
    `;
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes rippleAnim { to { transform: translate(-50%,-50%) scale(30); opacity:0; } }`;
document.head.appendChild(rippleStyle);

// ── PARALLAX HERO ──
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const scrolled = window.scrollY;
  const orb1 = hero.querySelector('.orb-1');
  const orb2 = hero.querySelector('.orb-2');
  if (orb1) orb1.style.transform = `translateY(${scrolled * 0.15}px)`;
  if (orb2) orb2.style.transform = `translateY(${scrolled * 0.1}px)`;
}, { passive: true });

// ── NAV ACTIVE LINK HIGHLIGHT ──
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.style.fontWeight = a.getAttribute('href') === `#${id}` ? '700' : '500';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

// ── DATE INPUT MIN DATE ──
const dateInput = document.getElementById('date');
if (dateInput) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}
