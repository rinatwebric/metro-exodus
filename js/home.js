/**
 * METRO EXODUS — ГЛАВНАЯ СТРАНИЦА
 * Снежинки на геро и выбор цвета текста кнопки КУПИТЬ.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Кнопки цвета в шапке — меняют цвет текста кнопки «КУПИТЬ СЕЙЧАС».
  const buttonsColor = document.querySelectorAll('.btn-color');

  // Генерация случайного HEX-цвета, например #A3F2C1
  const generateRandomColor = () => {
    const hexCodes = '0123456789ABCDEF';
    let color = '';
    for (let i = 0; i < 6; i++) {
      color += hexCodes[Math.floor(Math.random() * hexCodes.length)];
    }
    return '#' + color;
  };

  const applyTargetColor = (hex) => {
    const textEl = document.getElementById('hero-order-text');
    if (textEl) {
      textEl.style.color = hex;
      textEl.style.textShadow = `0 0 14px ${hex}88`;
    }
    localStorage.setItem('metro_order_button_text_color', hex);
  };

  const setRandomColors = () => {
    buttonsColor.forEach((btn) => {
      const hex = generateRandomColor();
      btn.style.background = hex;
      btn.title = `Сменить цвет текста кнопки на ${hex}`;
      btn.onclick = () => {
        applyTargetColor(hex);
        if (window.audio) window.audio.click();
      };
    });
  };

  // Пресетные цвета из HTML-атрибута data-color применяем по клику.
  buttonsColor.forEach((btn) => {
    const hex = btn.getAttribute('data-color');
    if (!hex) return;
    btn.onclick = () => {
      applyTargetColor(hex);
      if (window.audio) window.audio.click();
    };
  });

  // Если пользователь уже выбирал цвет раньше — восстанавливаем его из localStorage.
  const savedTargetColor = localStorage.getItem('metro_order_button_text_color');
  if (savedTargetColor) {
    applyTargetColor(savedTargetColor);
  }

  // Модалка подписки автоматически открывается через 10 секунд после первого входа (один раз за сессию).
  if (!sessionStorage.getItem('metro_modal_shown')) {
    setTimeout(() => {
      const modal = document.getElementById('order-modal');
      if (modal) {
        modal.classList.add('active');
        sessionStorage.setItem('metro_modal_shown', '1');
      }
    }, 10000);
  }

  // Пробел — меняет цвета кнопок на случайные.
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.code && e.code.toLowerCase() === 'space') {
      e.preventDefault();
      setRandomColors();
      if (window.audio) window.audio.click();
    }
  });

  // Снежинки на hero-canvas поверх главного экрана.
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let w = (heroCanvas.width = window.innerWidth);
    let h = (heroCanvas.height = window.innerHeight);

    const flakes = Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 1.2 + 0.4,
      drift: (Math.random() - 0.5) * 0.8
    }));

    function loopSnow() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      flakes.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > h) f.y = 0;
        if (f.x > w) f.x = 0;
        if (f.x < 0) f.x = w;
      });
      requestAnimationFrame(loopSnow);
    }
    loopSnow();

    window.addEventListener('resize', () => {
      w = heroCanvas.width = window.innerWidth;
      h = heroCanvas.height = window.innerHeight;
    });
  }

  // Аккордеон фракций: клик по карточке разворачивает её и сворачивает остальные.
  const factionCards = document.querySelectorAll('.faction-card');
  if (factionCards.length > 0) {
    factionCards.forEach((card) => {
      card.addEventListener('click', () => {
        if (card.classList.contains('active-faction')) return;
        factionCards.forEach((c) => c.classList.remove('active-faction'));
        card.classList.add('active-faction');
      });
    });
  }
});
