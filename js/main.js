// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// Dropdown: hover en escritorio con delay al cerrar, click en móvil
document.querySelectorAll('.dropdown').forEach(dropdown => {
  let closeTimer = null;

  function openMenu() {
    clearTimeout(closeTimer);
    dropdown.classList.add('open');
  }

  function scheduleClose() {
    closeTimer = setTimeout(() => dropdown.classList.remove('open'), 200);
  }

  if (window.innerWidth > 700) {
    dropdown.addEventListener('mouseenter', openMenu);
    dropdown.addEventListener('mouseleave', scheduleClose);
  }

  dropdown.querySelector('.dropdown-toggle').addEventListener('click', function (e) {
    if (window.innerWidth <= 700) {
      e.preventDefault();
      dropdown.classList.toggle('open');
    }
  });
});

// Publication year filter
const filterBtns = document.querySelectorAll('.filter-btn');
const yearGroups = document.querySelectorAll('.pub-year-group');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const year = btn.dataset.year;
    yearGroups.forEach(group => {
      group.style.display = (year === 'all' || group.dataset.year === year) ? '' : 'none';
    });
  });
});

// Contact form
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '¡Mensaje enviado!';
    btn.disabled = true;
    btn.style.background = '#34d399';
    setTimeout(() => {
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}

// Active page highlighting
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
    const parentDropdown = link.closest('.dropdown');
    if (parentDropdown) {
      parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
    }
  }
});
