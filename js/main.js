/* Happy Heart Cakes - Main JavaScript
   Includes: Auth, Cart helpers, Toast, Back to Top, Dark Mode
*/

document.addEventListener('DOMContentLoaded', () => {

  // ========== CURRENT USER ==========
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('hhc_user') || 'null');
  } catch (e) {
    user = null;
  }

  const isLoggedIn = !!user;
  const isAdmin = user && user.role === 'admin';

  // ========== HELPERS ==========
  function getUsers() {
    return JSON.parse(localStorage.getItem('hhc_users') || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem('hhc_users', JSON.stringify(users));
  }

  function getCart() {
    return JSON.parse(localStorage.getItem('hhc_cart') || '[]');
  }

  function saveCart(cart) {
    localStorage.setItem('hhc_cart', JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const cart = getCart();
    const countEl = document.querySelector('.cart-count');
    if (countEl) {
      countEl.textContent = cart.length;
      countEl.style.display = cart.length > 0 ? 'inline-flex' : 'none';
    }
  }

  // ========== TOAST ==========
  window.showToast = function(message, type = 'success') {
    const old = document.querySelector('.toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 2500);
  };

  // ========== MOBILE NAV ==========
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });
  }

  // ========== ACTIVE NAV LINK ==========
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // ========== FAQ ACCORDION ==========
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      q.parentElement.classList.toggle('open');
    });
  });

  // ========== AUTH TABS ==========
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      const form = document.getElementById(target);
      if (form) form.classList.add('active');
    });
  });

  // ========== FILTERS ==========
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'flex' : 'none';
      });
    });
  });

  // ========== FILE UPLOAD PREVIEW ==========
  document.querySelectorAll('.upload-area').forEach(area => {
    const input = area.querySelector('input[type="file"]');
    let preview = area.querySelector('.upload-preview');

    if (!preview) {
      preview = document.createElement('img');
      preview.className = 'upload-preview';
      area.appendChild(preview);
    }

    area.addEventListener('click', () => input && input.click());

    area.addEventListener('dragover', e => {
      e.preventDefault();
      area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => area.classList.remove('dragover'));

    area.addEventListener('drop', e => {
      e.preventDefault();
      area.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        showPreview(e.dataTransfer.files[0], preview);
      }
    });

    if (input) {
      input.addEventListener('change', () => {
        if (input.files.length) showPreview(input.files[0], preview);
      });
    }
  });

  function showPreview(file, img) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target.result;
        img.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  // ========== STAR RATING ==========
  document.querySelectorAll('.star-rating').forEach(container => {
    const stars = container.querySelectorAll('.star');
    let selected = 0;

    stars.forEach((star, index) => {
      star.addEventListener('mouseover', () => {
        stars.forEach((s, i) => s.textContent = i <= index ? '★' : '☆');
      });
      star.addEventListener('mouseout', () => {
        stars.forEach((s, i) => s.textContent = i < selected ? '★' : '☆');
      });
      star.addEventListener('click', () => {
        selected = index + 1;
        container.dataset.rating = selected;
        stars.forEach((s, i) => s.textContent = i < selected ? '★' : '☆');
      });
    });
  });

  // ========== PAYMENT OPTION SELECTION ==========
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const method = opt.dataset.method;
      document.querySelectorAll('.payment-form').forEach(f => f.style.display = 'none');
      const form = document.getElementById(method + '-form');
      if (form) form.style.display = 'block';
    });
  });

   // ========== REGISTER ==========
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim().toLowerCase();
      const phone = document.getElementById('reg-phone').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;

      if (password !== confirm) {
        alert('Passwords do not match!');
        return;
      }

      if (password.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
      }

      try {
        const data = await apiRegister({ name, email, phone, password });

        localStorage.setItem('hhc_user', JSON.stringify({
          role: data.role,
          name: data.name,
          email: data.email,
          phone: data.phone,
          token: data.token,
          _id: data._id
        }));

        alert('Account created successfully!');
        window.location.href = 'user-dashboard.html';
      } catch (err) {
        alert(err.message || 'Registration failed');
      }
    });
  }

  // ========== CUSTOMER LOGIN ==========
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;

      try {
        const data = await apiLogin({ email, password });

        localStorage.setItem('hhc_user', JSON.stringify({
          role: data.role,
          name: data.name,
          email: data.email,
          phone: data.phone,
          token: data.token,
          _id: data._id
        }));

        if (data.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'user-dashboard.html';
        }
      } catch (err) {
        alert(err.message || 'Login failed');
      }
    });
  }

   // ========== ADMIN LOGIN ==========
  const adminForm = document.getElementById('admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('admin-email').value.trim().toLowerCase();
      const password = document.getElementById('admin-password').value;

      if (!email || !password) {
        alert('Please enter email and password.');
        return;
      }

      try {
        const data = await apiLogin({ email, password });

        if (data.role !== 'admin') {
          alert('This account is not an admin.');
          return;
        }

        localStorage.setItem('hhc_user', JSON.stringify({
          role: data.role,
          name: data.name,
          email: data.email,
          phone: data.phone,
          token: data.token,
          _id: data._id
        }));

        window.location.href = 'admin-dashboard.html';
      } catch (err) {
        alert(err.message || 'Invalid email or password.');
      }
    });
  }

  // ========== PROTECT DASHBOARDS ==========
  const currentUrl = window.location.href.toLowerCase();

  if (currentUrl.includes('admin-dashboard.html')) {
    if (!isAdmin) {
      localStorage.removeItem('hhc_user');
      window.location.href = 'login.html';
      return;
    }
  }

  if (currentUrl.includes('user-dashboard.html')) {
    if (!isLoggedIn || isAdmin) {
      window.location.href = 'login.html';
      return;
    }
  }

  // ========== UPDATE NAVBAR ==========
  function updateNavbar() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const oldLogout = navActions.querySelector('.js-logout');
    if (oldLogout) oldLogout.remove();

    let authBtn = navActions.querySelector('a.btn-outline, a.btn-secondary');
    const cartBtn = navActions.querySelector('a[href="cart.html"]');

    if (!authBtn) return;

    if (isLoggedIn) {
      authBtn.textContent = isAdmin ? 'Admin Panel' : 'My Account';
      authBtn.href = isAdmin ? 'admin-dashboard.html' : 'user-dashboard.html';
      authBtn.className = 'btn btn-secondary btn-sm';

      if (cartBtn) {
        cartBtn.style.display = isAdmin ? 'none' : 'inline-flex';
      }

      const logoutBtn = document.createElement('a');
      logoutBtn.href = '#';
      logoutBtn.className = 'btn btn-outline btn-sm js-logout';
      logoutBtn.textContent = 'Logout';
      logoutBtn.style.marginLeft = '8px';
      logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('hhc_user');
        window.location.href = 'index.html';
      });

      const mobileBtn = navActions.querySelector('.mobile-toggle');
      if (mobileBtn) {
        navActions.insertBefore(logoutBtn, mobileBtn);
      } else {
        navActions.appendChild(logoutBtn);
      }
    } else {
      authBtn.textContent = 'Login';
      authBtn.href = 'login.html';
      authBtn.className = 'btn btn-outline btn-sm';
      if (cartBtn) cartBtn.style.display = 'inline-flex';
    }
  }

  updateNavbar();

  // ========== BLOCK ACTIONS FOR ADMIN & GUESTS ==========
  document.querySelectorAll('.add-cake-btn, .add-normal-btn, .add-cookie-btn, .add-to-cart, .add-to-cart-kg, .add-home-btn').forEach(btn => {
    if (isAdmin) {
      btn.style.display = 'none';
    } else if (!isLoggedIn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        alert('Please login or create an account first.');
        window.location.href = 'login.html';
      }, true);
    }
  });

  // ========== BACK TO TOP BUTTON ==========
  const backToTop = document.createElement('button');
  backToTop.id = 'back-to-top';
  backToTop.innerHTML = '↑';
  backToTop.title = 'Back to top';
  backToTop.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 25px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: var(--orange);
    color: white;
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9998;
  `;
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 400 ? 'flex' : 'none';
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ========== DARK MODE ==========
  const darkToggle = document.getElementById('dark-mode-toggle');
  if (darkToggle) {
    if (localStorage.getItem('hhc_dark') === 'true') {
      document.body.classList.add('dark-mode');
    }
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('hhc_dark', document.body.classList.contains('dark-mode'));
    });
  }

  // ========== LOGOUT ==========
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('hhc_user');
      window.location.href = 'index.html';
    });
  });

  // ========== DEMO FORMS ==========
  document.querySelectorAll('form[data-demo]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert(form.dataset.success || 'Submitted successfully!');
      form.reset();
    });
  });

  // ========== CART COUNT ==========
  updateCartCount();

  // ========== WHATSAPP FLOATING BUTTON ==========
  function addWhatsAppButton() {
    if (document.getElementById('whatsapp-float')) return;

    const btn = document.createElement('a');
    btn.id = 'whatsapp-float';
    btn.href = 'https://wa.me/254713773913?text=Hello%20Happy%20Heart%20Cakes%2C%20I%20would%20like%20to%20enquire%20about%20a%20cake';
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.title = 'Chat with us on WhatsApp';
    btn.innerHTML = '💬';
    btn.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      width: 60px;
      height: 60px;
      background: #25D366;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      z-index: 9999;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });

    document.body.appendChild(btn);
  }

  addWhatsAppButton();

});