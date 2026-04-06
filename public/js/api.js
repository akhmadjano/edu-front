// ============================================================
// API CONFIG
// ============================================================
const API_BASE = 'http://edu-bg-production.up.railway.app';

// ============================================================
// TOKEN MANAGEMENT
// ============================================================
const Auth = {
  getToken() { return localStorage.getItem('accessToken'); },
  getRefresh() { return localStorage.getItem('refreshToken'); },
  getUser() {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  },
  save(data) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    // Premium holatini alohida saqlash (tezroq tekshirish uchun)
    if (data.user) {
      localStorage.setItem('isPremium', (data.user.isPremium || data.user.premium) ? '1' : '0');
    }
  },
  isPremium() {
    const user = this.getUser();
    return user?.isPremium === true || user?.isPremium === 1 || user?.premium === true || localStorage.getItem('isPremium') === '1';
  },
  // Premium holatini serverdan yangilash
  async refreshPremium() {
    try {
      const res = await Http.get('/api/auth/me');
      const user = this.getUser();
      if (user && res) {
        const updated = { ...user, isPremium: res.isPremium, role: res.role || user.role };
        localStorage.setItem('user', JSON.stringify(updated));
        localStorage.setItem('isPremium', updated.isPremium ? '1' : '0');
      }
      return res;
    } catch { return null; }
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin() { return this.getUser()?.role === 'ADMIN'; }
};

// ============================================================
// HTTP CLIENT
// ============================================================
const Http = {
  async request(method, path, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && Auth.getToken()) {
      headers['Authorization'] = `Bearer ${Auth.getToken()}`;
    }

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    let res = await fetch(`${API_BASE}${path}`, opts);

    // Token muddati tugagan bo'lsa — refresh qilamiz
    if (res.status === 401 && Auth.getRefresh()) {
      const refreshed = await Http.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${Auth.getToken()}`;
        res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
      } else {
        Auth.clear();
        window.location.href = '/login';
        return;
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { status: res.status, message: data.message || 'Xatolik yuz berdi' };
    return data;
  },

  async refreshToken() {
    try {
      const data = await Http.request('POST', '/api/auth/refresh',
        { refreshToken: Auth.getRefresh() }, false);
      Auth.save(data);
      return true;
    } catch {
      return false;
    }
  },

  get(path, auth = true) { return this.request('GET', path, null, auth); },
  post(path, body, auth = true) { return this.request('POST', path, body, auth); },
  put(path, body) { return this.request('PUT', path, body); },
  patch(path, body) { return this.request('PATCH', path, body); },
  delete(path) { return this.request('DELETE', path); },
};

// ============================================================
// LANGUAGE / I18N
// ============================================================
const I18N = {
  current: localStorage.getItem('lang') || 'uz',
  translations: {
    uz: {
      // Nav
      home: "Bosh sahifa",
      course: "Kurs",
      profile: "Profil",
      admin: "Admin",
      login: "Kirish",
      register: "Ro'yxatdan o'tish",
      logout: "Chiqish",
      // Auth
      email: "Telefon raqam",
      password: "Parol",
      fullName: "Ism familiya",
      loginTitle: "Tizimga kirish",
      registerTitle: "Ro'yxatdan o'tish",
      noAccount: "Hisobingiz yo'qmi?",
      haveAccount: "Hisobingiz bormi?",
      // Course
      courseTitle: "Kurs",
      locked: "Qulflangan",
      unlocked: "Ochiq",
      watchVideo: "Videoni ko'rish",
      takeTest: "Testni boshlash",
      passed: "O'tildi",
      failed: "O'tilmadi",
      score: "Ball",
      attempts: "Urinishlar",
      nextLesson: "Keyingi dars",
      finalTest: "Yakuniy test",
      sectionComplete: "Bo'lim yakunlandi",
      // Test
      submit: "Yuborish",
      result: "Natija",
      correct: "To'g'ri",
      wrong: "Noto'g'ri",
      tryAgain: "Qaytadan urinish",
      // Profile
      myProgress: "Mening progressim",
      lessonsCompleted: "Darslar bajarildi",
      testsCompleted: "Testlar o'tildi",
      // Admin
      adminPanel: "Admin panel",
      addCourse: "Kurs qo'shish",
      addSection: "Bo'lim qo'shish",
      addLesson: "Dars qo'shish",
      addQuestion: "Savol qo'shish",
      users: "Foydalanuvchilar",
      // Common
      save: "Saqlash",
      cancel: "Bekor qilish",
      delete: "O'chirish",
      edit: "Tahrirlash",
      loading: "Yuklanmoqda...",
      error: "Xatolik",
      success: "Muvaffaqiyat",
      back: "Orqaga",
      minutes: "daqiqa",
      questions: "savol",
      free: "Bepul",
      videoWatched: "Video ko'rildi ✓",
      watchFirst: "Avval videoni tomosha qiling",
      allLessonsRequired: "Barcha darslar testini toping",
      confirmDelete: "Rostdan ham o'chirmoqchimisiz?",
    },
    ru: {
      home: "Главная",
      course: "Курс",
      profile: "Профиль",
      admin: "Админ",
      login: "Войти",
      register: "Регистрация",
      logout: "Выйти",
      email: "Тел. номер",
      password: "Пароль",
      fullName: "Полное имя",
      loginTitle: "Вход в систему",
      registerTitle: "Регистрация",
      noAccount: "Нет аккаунта?",
      haveAccount: "Уже есть аккаунт?",
      courseTitle: "Курс",
      locked: "Заблокировано",
      unlocked: "Открыто",
      watchVideo: "Смотреть видео",
      takeTest: "Начать тест",
      passed: "Пройдено",
      failed: "Не пройдено",
      score: "Балл",
      attempts: "Попытки",
      nextLesson: "Следующий урок",
      finalTest: "Финальный тест",
      sectionComplete: "Раздел завершён",
      submit: "Отправить",
      result: "Результат",
      correct: "Правильно",
      wrong: "Неправильно",
      tryAgain: "Попробовать снова",
      myProgress: "Мой прогресс",
      lessonsCompleted: "Уроков выполнено",
      testsCompleted: "Тестов пройдено",
      adminPanel: "Панель администратора",
      addCourse: "Добавить курс",
      addSection: "Добавить раздел",
      addLesson: "Добавить урок",
      addQuestion: "Добавить вопрос",
      users: "Пользователи",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      edit: "Редактировать",
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успешно",
      back: "Назад",
      minutes: "мин",
      questions: "вопрос",
      free: "Бесплатно",
      videoWatched: "Видео просмотрено ✓",
      watchFirst: "Сначала посмотрите видео",
      allLessonsRequired: "Пройдите все тесты уроков",
      confirmDelete: "Вы уверены, что хотите удалить?",
    }
  },

  t(key) {
    return this.translations[this.current][key] || key;
  },

  set(lang) {
    this.current = lang;
    localStorage.setItem('lang', lang);
    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.dataset.lang;
      if (key) el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-lang-ph]').forEach(el => {
      el.placeholder = this.t(el.dataset.langPh);
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.l === lang);
    });
  }
};

// ============================================================
// TOAST
// ============================================================
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(msg, type = 'info', duration = 3500) {
    if (!this.container) this.init();
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    this.container.appendChild(t);
    setTimeout(() => {
      t.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => t.remove(), 300);
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); },
  warning(msg) { this.show(msg, 'warning'); },
};

// ============================================================
// NAV RENDER
// ============================================================
function renderNav() {
  const user = Auth.getUser();
  const isLogged = Auth.isLoggedIn();
  const isAdmin = Auth.isAdmin();
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const initials = user ? user.fullName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '';

  nav.innerHTML = `
    <a href="/" class="nav-logo">EduPlatform</a>
    <nav class="nav-links">
      <a href="/" class="nav-link" data-lang="home">Bosh sahifa</a>
      <a href="/course" class="nav-link" data-lang="course">Kurs</a>
      ${isLogged ? `<a href="/profile" class="nav-link" data-lang="profile">Profil</a>` : ''}
      ${isAdmin ? `<a href="/admin" class="nav-link" data-lang="admin">Admin</a>` : ''}
    </nav>
    <div class="nav-actions">
      <div class="lang-toggle">
        <button class="lang-btn ${I18N.current==='uz'?'active':''}" data-l="uz" onclick="I18N.set('uz')">UZ</button>
        <button class="lang-btn ${I18N.current==='ru'?'active':''}" data-l="ru" onclick="I18N.set('ru')">RU</button>
      </div>
      ${isLogged ? `
        <div class="nav-avatar" id="nav-avatar" title="${user?.fullName || ''}">${initials}</div>
      ` : `
        <a href="/login" class="btn btn-ghost btn-sm" data-lang="login">Kirish</a>
        <a href="/register" class="btn btn-primary btn-sm" data-lang="register">Ro'yxatdan o'tish</a>
      `}
    </div>
  `;

  // Active nav link
  const path = window.location.pathname;
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === path ||
      (path.startsWith('/lesson') && link.getAttribute('href') === '/course'));
  });

  // Avatar dropdown
  const avatar = document.getElementById('nav-avatar');
  if (avatar) {
    avatar.addEventListener('click', () => {
      const existing = document.getElementById('avatar-dropdown');
      if (existing) { existing.remove(); return; }
      const dd = document.createElement('div');
      dd.id = 'avatar-dropdown';
      dd.style.cssText = `
        position:fixed; top:${nav.offsetHeight + 4}px; right:20px;
        background:var(--bg-card2); border:1px solid var(--border);
        border-radius:var(--radius); padding:8px; min-width:180px;
        z-index:200; box-shadow:var(--shadow);
        animation:fadeIn .2s ease;
      `;
      dd.innerHTML = `
        <div style="padding:10px 12px; border-bottom:1px solid var(--border); margin-bottom:6px;">
          <div style="font-weight:700; font-family:var(--font-display)">${user?.fullName}</div>
          <div style="font-size:.8rem; color:var(--text-2)">${user?.phoneNumber}</div>
        </div>
        <a href="/profile" style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:8px;color:var(--text-1);transition:.15s" onmouseover="this.style.background='var(--bg-3)'" onmouseout="this.style.background=''">👤 <span data-lang="profile">Profil</span></a>
        ${isAdmin ? `<a href="/admin" style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:8px;color:var(--text-1);transition:.15s" onmouseover="this.style.background='var(--bg-3)'" onmouseout="this.style.background=''">⚙️ <span data-lang="admin">Admin</span></a>` : ''}
        <hr style="border:none;border-top:1px solid var(--border);margin:6px 0">
        <button onclick="handleLogout()" style="width:100%;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:8px;background:none;border:none;cursor:pointer;color:var(--danger);font-family:var(--font-body);font-size:.9rem;transition:.15s" onmouseover="this.style.background='var(--danger-dim)'" onmouseout="this.style.background=''">🚪 <span data-lang="logout">Chiqish</span></button>
      `;
      document.body.appendChild(dd);
      setTimeout(() => document.addEventListener('click', function h(e) {
        if (!dd.contains(e.target) && e.target !== avatar) { dd.remove(); document.removeEventListener('click', h); }
      }), 0);
    });
  }

  I18N.set(I18N.current);
}

function handleLogout() {
  Auth.clear();
  Toast.success('Tizimdan chiqildi');
  setTimeout(() => window.location.href = '/', 800);
}

// ============================================================
// UTILS
// ============================================================
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

function requireAuth(adminOnly = false) {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  if (adminOnly && !Auth.isAdmin()) {
    window.location.href = '/';
    return false;
  }
  return true;
}

function formatScore(score) {
  if (score === null || score === undefined) return '—';
  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return `<span style="color:${color};font-weight:700">${score}%</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  renderNav();
});
