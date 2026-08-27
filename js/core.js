/**
 * METRO EXODUS — ЯДРО САЙТА
 * Этот файл подключается на всех страницах и отвечает за:
 * — звуки, — навигацию, — модальные окна, — пасхалки, — защиту изображений
 */

// Определяем, находимся ли мы на подстранице (pages/...) или на главной.
// Это нужно чтобы правильно строить пути к файлам.
window.isSubpage = window.location.pathname.includes('/pages/');
window.getAsset = (path) => (window.isSubpage ? '../' + path : path);

// Звуковой движок — управляет всеми звуками сайта через Web Audio API.
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.buffers = {};
    this.musicSource = null;
    this.musicPlaying = false;
    this.volume = parseFloat(localStorage.getItem('metro_volume')) || 0.55;
    this.inZone = false;
  }

  ensure() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  async loadSound(name, url) {
    if (this.buffers[name]) return this.buffers[name];
    try {
      const res = await fetch(url);
      const arrayBuf = await res.arrayBuffer();
      const ctx = this.ensure();
      if (!ctx) return null;
      const decoded = await ctx.decodeAudioData(arrayBuf);
      this.buffers[name] = decoded;
      return decoded;
    } catch (err) {
      return null;
    }
  }

  async play(name, loop = false, gainVal = 1.0) {
    this.ensure();
    const filename = `${name}.mp3`;
    const url = window.getAsset(`public/sounds/${filename}`);
    let buf = this.buffers[name];
    if (!buf) {
      buf = await this.loadSound(name, url);
    }
    if (!buf || !this.ctx) return null;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;

    const g = this.ctx.createGain();
    g.gain.value = gainVal;
    src.connect(g);
    g.connect(this.master);

    src.start(0);
    return src;
  }

  // Синтез звука выстрела из белого шума и осциллятора (без аудиофайла)
  synthShot(weaponType = 'bulldog') {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = weaponType === 'ashot' ? 'lowpass' : 'bandpass';
    filter.frequency.value = weaponType === 'ashot' ? 900 : 1800;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + (weaponType === 'ashot' ? 0.25 : 0.12));

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.master);
    whiteNoise.start(now);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(weaponType === 'ashot' ? 140 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);

    oscGain.gain.setValueAtTime(1.0, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(oscGain);
    oscGain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Синтез короткого щелчка (отмычка)
  synthPinClick(freq = 1200) {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  async startMusic() {
    if (this.musicPlaying) return;
    this.ensure();
    this.musicSource = await this.play('music', true, 0.4);
    if (this.musicSource) this.musicPlaying = true;
  }

  stopMusic() {
    if (this.musicSource) {
      try { this.musicSource.stop(); } catch (e) { }
      this.musicSource = null;
    }
    this.musicPlaying = false;
  }

  toggleMusic() {
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  setVolume(val) {
    this.volume = val;
    localStorage.setItem('metro_volume', val);
    if (this.master) {
      this.master.gain.value = val;
    }
  }

  click() { this.play('click', false, 0.4); }
  horn() { this.play('horn', false, 0.6); }
  growl() { this.play('growl', false, 0.7); }
  breath() { this.play('breath', false, 0.6); }
  rumble() { this.play('rumble', false, 0.5); }
  achievement() { this.play('achievement', false, 0.8); }

  geiger() {
    if (!this.inZone) return;
    this.play('geiger', false, 0.15);
    const nextDelay = 80 + Math.random() * 250;
    setTimeout(() => {
      if (this.inZone) this.geiger();
    }, nextDelay);
  }
}

window.audio = new SoundEngine();

const isTypingInFormField = () => {
  const activeElement = document.activeElement;
  return activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName);
};

const lockPageScroll = () => {
  document.body.style.overflow = 'hidden';
};

const unlockPageScroll = () => {
  document.body.style.overflow = '';
};

const playClickSound = () => {
  if (window.audio) window.audio.click();
};

const createChiptuneOverlay = () => {
  const overlay = document.createElement('div');
  overlay.className = 'egg-overlay';
  overlay.id = 'egg-overlay';
  overlay.innerHTML = `
    <div class="modal_content metal-panel" style="text-align: center; max-width: 480px; width: 90%;">
      <div class="egg-close" id="egg-close">&#10006;</div>
      <div style="font-size: 3rem;">📻</div>
      <div style="margin-top: 1.5rem; font-size: 1.25rem; letter-spacing: 0.2em; font-weight: 700;" class="text-glow font-heading">DEVELOPER CHIPTUNE ROOM</div>
      <div style="font-size: 0.85rem; color: var(--foreground-muted); margin-top: 0.5rem;" class="font-mono">Пасхалка активирована. Наслаждайтесь путешествием на «Авроре»!</div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
};

const getChiptuneOverlay = () => {
  return document.getElementById('egg-overlay') || createChiptuneOverlay();
};

const createMetro2033Overlay = () => {
  const overlay = document.createElement('div');
  overlay.className = 'egg-overlay';
  overlay.id = 'egg-2033-overlay';
  overlay.innerHTML = `
    <div class="egg-2033-panel">
      <button class="egg-close" id="egg-2033-close" aria-label="Закрыть">&#10006;</button>

      <div class="egg-2033-year">2033</div>

      <div class="egg-2033-icon" aria-hidden="true">☢</div>

      <h2 class="egg-2033-title">METRO 2033</h2>
      <p class="egg-2033-subtitle font-mono">// Начало. Московское метро. Станция ВДНХ.</p>

      <blockquote class="egg-2033-quote">
        «Если ты читаешь это, значит, ты всё ещё жив. А значит, надежда ещё есть.»
        <cite>— дневник выжившего</cite>
      </blockquote>

      <div class="egg-2033-stats">
        <div class="egg-2033-stat">
          <span class="egg-2033-stat-value">2033</span>
          <span class="egg-2033-stat-label">ГОД ДЕЙСТВИЯ</span>
        </div>
        <div class="egg-2033-stat">
          <span class="egg-2033-stat-value">12</span>
          <span class="egg-2033-stat-label">СТАНЦИЙ МОСКВЫ</span>
        </div>
        <div class="egg-2033-stat">
          <span class="egg-2033-stat-value">10 ЛЕТ</span>
          <span class="egg-2033-stat-label">ПОСЛЕ ВОЙНЫ</span>
        </div>
      </div>

      <p class="egg-2033-footer font-mono">
        Код «<span style="color: var(--rad);">2033</span>» разблокирован — активирован режим радиации
      </p>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
};

const getMetro2033Overlay = () => {
  return document.getElementById('egg-2033-overlay') || createMetro2033Overlay();
};

// Всплывающие уведомления (Toast) — появляются в углу экрана на 5 секунд.
window.showToast = function (title, msg) {
  const container = document.getElementById('toasts-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg class="size-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;color:var(--primary);flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
    <div>
      <div class="font-bold font-mono text-primary" style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">${title}</div>
      <div style="font-size:13px;font-weight:600;margin-top:2px;">${msg}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
};

// Всё ниже запускается после того, как страница полностью загрузилась.
document.addEventListener('DOMContentLoaded', () => {
  // 1. Анимации при прокрутке — элементы с классом .reveal появляются когда попадают в экран.
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.08 });

    window.RevealObserver = revealObserver;
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Если браузер не поддерживает IntersectionObserver — просто показываем всё сразу
    revealElements.forEach((el) => el.classList.add('active'));
  }


  // 2. Подсвечиваем активную ссылку в навигации (текущая страница).
  const currentPath = window.location.pathname;
  document.querySelectorAll('nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === 'index.html' || href === './' || href === '../index.html') {
      if (currentPath.endsWith('/') || currentPath.endsWith('index.html')) {
        link.classList.add('active');
      }
    } else if (currentPath.includes(href.replace('../', '').replace('./', ''))) {
      link.classList.add('active');
    }
  });

  // 3. Кнопки в шапке: фонарик (F), маска, музыка, громкость.
  const hudFlash = document.getElementById('hud-flashlight');
  const hudMask = document.getElementById('hud-mask');
  const hudMusic = document.getElementById('hud-music');
  const hudVol = document.getElementById('hud-volume');

  let flashActive = false;
  const toggleFlashlight = () => {
    flashActive = !flashActive;
    document.body.classList.toggle('flashlight-active', flashActive);
    if (hudFlash) hudFlash.classList.toggle('active', flashActive);
    playClickSound();
  };

  if (hudFlash) hudFlash.addEventListener('click', toggleFlashlight);

  const flashlightBeam = document.getElementById('flashlight-beam');
  window.addEventListener('mousemove', (e) => {
    if (flashlightBeam && flashActive) {
      flashlightBeam.style.background = `radial-gradient(circle 260px at ${e.clientX}px ${e.clientY}px, transparent 0%, rgba(0,0,0,0.96) 100%)`;
    }
  });

  let maskActive = false;
  const toggleMask = () => {
    maskActive = !maskActive;
    document.body.classList.toggle('mask-active', maskActive);
    if (hudMask) hudMask.classList.toggle('active', maskActive);
    if (maskActive) window.audio.breath();
    else playClickSound();
  };

  if (hudMask) hudMask.addEventListener('click', toggleMask);

  if (hudMusic) {
    hudMusic.addEventListener('click', () => {
      const playing = window.audio.toggleMusic();
      hudMusic.classList.toggle('active', playing);
    });
  }

  if (hudVol) {
    hudVol.value = window.audio.volume;
    hudVol.addEventListener('input', (e) => {
      window.audio.setVolume(parseFloat(e.target.value));
    });
  }

  // 4. Горячие клавиши и пасхалки:
  //    F          — фонарик
  //    «2033»     — пасхалка Metro 2033
  //    «metro»    — пасхалка Chiptune Room
  //    «aurora»   — пасхалка Chiptune Room
  let typedBuffer = '';
  document.addEventListener('keydown', (e) => {
    if (isTypingInFormField()) return;
    const key = e.key;
    if (key && key.toLowerCase() === 'f') toggleFlashlight();

    if (key && key.length === 1) {
      typedBuffer = (typedBuffer + key).slice(-10);
      if (typedBuffer.endsWith('2033')) {
        // Включаем режим радиации (зелёный цвет интерфейса)
        document.documentElement.classList.add('rad-mode');
        // Открываем оверлей-пасхалку Metro 2033
        const overlay2033 = getMetro2033Overlay();
        if (overlay2033) {
          overlay2033.classList.add('active');
          lockPageScroll();
        }
        // Звук: достижение
        window.audio.achievement();
      }
      if (typedBuffer.toLowerCase().endsWith('metro') || typedBuffer.toLowerCase().endsWith('aurora')) {
        const eggOverlay = getChiptuneOverlay();
        if (eggOverlay) {
          eggOverlay.classList.add('active');
          window.audio.achievement();
          window.audio.rumble();
        }
      }
    }
  });

  // Закрытие пасхалки metro/aurora
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('#egg-close');
    if (!closeBtn) return;

    const eggOverlay = document.getElementById('egg-overlay');
    if (eggOverlay) eggOverlay.classList.remove('active');
  });

  // Закрытие пасхалки 2033
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('#egg-2033-close');
    if (!closeBtn) return;

    const overlay2033 = document.getElementById('egg-2033-overlay');
    if (overlay2033) overlay2033.classList.remove('active');
    unlockPageScroll();
    // Выключаем rad-mode
    document.documentElement.classList.remove('rad-mode');
  });

  // 5. Модальное окно подписки на новости.
  const orderModal = document.getElementById('order-modal');
  const orderCloseBtn = document.getElementById('order-close');
  const subscribeForm = document.getElementById('subscribe-form');
  const subscribeFormView = document.getElementById('subscribe-form-view');
  const subscribeSuccessView = document.getElementById('subscribe-success-view');
  const subscribeCloseSuccessBtn = document.getElementById('subscribe-close-success-btn');
  const subResName = document.getElementById('sub-res-name');
  const subResEmail = document.getElementById('sub-res-email');

  const openOrderModal = () => {
    if (orderModal) {
      if (subscribeFormView) subscribeFormView.style.display = 'block';
      if (subscribeSuccessView) subscribeSuccessView.style.display = 'none';
      orderModal.style.display = 'flex';
      lockPageScroll();
      playClickSound();
    }
  };

  const closeOrderModal = () => {
    if (orderModal) {
      orderModal.style.display = 'none';
      unlockPageScroll();
    }
  };

  const orderModalBtns = document.querySelectorAll('#order-btn, #btn-get, .btn-recruit, [data-order-modal]');
  orderModalBtns.forEach((btn) => {
    btn.addEventListener('click', openOrderModal);
  });

  if (orderCloseBtn) orderCloseBtn.addEventListener('click', closeOrderModal);
  if (subscribeCloseSuccessBtn) subscribeCloseSuccessBtn.addEventListener('click', closeOrderModal);

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('sub-name');
      const emailInput = document.getElementById('sub-email');
      const emailErr = document.getElementById('sub-email-error');

      const nameVal = (nameInput && nameInput.value.trim()) || 'Подписчик';
      const emailVal = (emailInput && emailInput.value.trim()) || '';

      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!isEmailValid) {
        if (emailErr) emailErr.style.display = 'block';
        return;
      }
      if (emailErr) emailErr.style.display = 'none';

      if (subResName) subResName.textContent = nameVal;
      if (subResEmail) subResEmail.textContent = emailVal;

      if (subscribeFormView) subscribeFormView.style.display = 'none';
      if (subscribeSuccessView) subscribeSuccessView.style.display = 'block';

      if (window.audio) {
        window.audio.achievement();
      }
      window.showToast('УСПЕШНО!', `Вы успешно подписались на новости Метро (${emailVal})`);
    });
  }

  // 6. Модальное окно с YouTube-трейлером.
  const trailerModal = document.getElementById('trailer-modal');
  const trailerCloseBtn = document.getElementById('trailer-close');
  const trailerIframe = document.getElementById('trailer-iframe');
  const trailerBtns = document.querySelectorAll('#btn-watch-trailer, .btn-hero-trailer, [data-trailer-modal]');

  const openTrailerModal = (e) => {
    if (e) e.preventDefault();
    if (trailerModal) {
      if (trailerIframe) {
        const src = trailerIframe.getAttribute('data-src') || 'https://www.youtube-nocookie.com/embed/fbbqlvuovQ0?autoplay=1&rel=0&modestbranding=1';
        trailerIframe.src = src;
      }
      trailerModal.style.display = 'flex';
      lockPageScroll();
      playClickSound();
    }
  };

  const closeTrailerModal = () => {
    if (trailerModal) {
      if (trailerIframe) {
        trailerIframe.src = '';
      }
      trailerModal.style.display = 'none';
      unlockPageScroll();
    }
  };

  trailerBtns.forEach((btn) => {
    btn.addEventListener('click', openTrailerModal);
  });

  if (trailerCloseBtn) trailerCloseBtn.addEventListener('click', closeTrailerModal);

  if (trailerModal) {
    trailerModal.addEventListener('click', (e) => {
      if (e.target === trailerModal) closeTrailerModal();
    });
  }

  // 7. Просмотр скриншотов во весь экран (лайтбокс со стрелками и клавишами ←→).
  const mediaSliderModal = document.getElementById('media-slider-modal');
  const mediaSliderImg = document.getElementById('media-slider-img');
  const mediaSliderClose = document.getElementById('media-slider-close');
  const mediaSliderPrev = document.getElementById('media-slider-prev');
  const mediaSliderNext = document.getElementById('media-slider-next');
  const mediaSliderCounter = document.getElementById('media-slider-counter');
  const mediaGridItems = document.querySelectorAll('.media-grid-item');
  
  let currentMediaIndex = 0;
  const mediaSources = [];

  mediaGridItems.forEach((item, index) => {
    const full = item.getAttribute('data-full');
    const imgEl = item.querySelector('img');
    const src = full || (imgEl ? imgEl.src : '');
    mediaSources.push(src);

    item.addEventListener('click', () => {
      openMediaSlider(index);
    });
  });

  const updateMediaSlide = (index) => {
    if (!mediaSources.length || !mediaSliderImg) return;
    currentMediaIndex = (index + mediaSources.length) % mediaSources.length;
    mediaSliderImg.style.opacity = '0';
    setTimeout(() => {
      mediaSliderImg.src = mediaSources[currentMediaIndex];
      mediaSliderImg.style.opacity = '1';
    }, 120);
    if (mediaSliderCounter) {
      mediaSliderCounter.textContent = `${currentMediaIndex + 1} / ${mediaSources.length}`;
    }
  };

  const openMediaSlider = (index) => {
    if (!mediaSliderModal || !mediaSources.length) return;
    updateMediaSlide(index);
    mediaSliderModal.style.display = 'flex';
    lockPageScroll();
    playClickSound();
  };

  const closeMediaSlider = () => {
    if (!mediaSliderModal) return;
    mediaSliderModal.style.display = 'none';
    unlockPageScroll();
  };

  if (mediaSliderPrev) {
    mediaSliderPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      updateMediaSlide(currentMediaIndex - 1);
      playClickSound();
    });
  }

  if (mediaSliderNext) {
    mediaSliderNext.addEventListener('click', (e) => {
      e.stopPropagation();
      updateMediaSlide(currentMediaIndex + 1);
      playClickSound();
    });
  }

  if (mediaSliderClose) {
    mediaSliderClose.addEventListener('click', closeMediaSlider);
  }

  if (mediaSliderModal) {
    mediaSliderModal.addEventListener('click', (e) => {
      if (e.target === mediaSliderModal) closeMediaSlider();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOrderModal();
      closeTrailerModal();
      closeMediaSlider();
    }
    if (mediaSliderModal && mediaSliderModal.style.display === 'flex') {
      if (e.key === 'ArrowLeft') {
        updateMediaSlide(currentMediaIndex - 1);
        playClickSound();
      } else if (e.key === 'ArrowRight') {
        updateMediaSlide(currentMediaIndex + 1);
        playClickSound();
      }
    }
  });

  // При доскролле до конца страницы — показываем модалку подписки (один раз).
  let scrollTriggered = false;
  window.addEventListener('scroll', () => {
    if (scrollTriggered) return;
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 60) {
      scrollTriggered = true;
      openOrderModal();
    }
  });



  // 8. Защита изображений: запрещаем перетаскивание и правую кнопку мыши.
  document.querySelectorAll('img').forEach((img) => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  window.addEventListener('contextmenu', (e) => {
    if (e.target && e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
});
