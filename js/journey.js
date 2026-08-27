/**
 * METRO EXODUS — СТРАНИЦА МАРШРУТА
 * Локации, поезд Аврора и конвертер валют Метро.
 */

document.addEventListener('DOMContentLoaded', () => {
  const STOPS = {
    moscow: { name: 'Москва', km: '0 км', season: 'Ядерная зима', desc: 'Отправная точка. Метро остаётся позади: обледенелые эскалаторы, брошенные посты и город, который так и не научился умирать.' },
    volga: { name: 'Волга', km: '870 км', season: 'Ранняя весна', desc: 'Треснувший лёд, затопленные деревни и секта, объявившая электричество грехом. Первый глоток свободы — с привкусом мазута.' },
    yamantau: { name: 'Ямантау', km: '1 640 км', season: 'Бункер', desc: 'Правительственный бункер, где ждали спасителей. Внутри — тьма, аварийные лампы и те, кто перестал быть людьми.' },
    caspian: { name: 'Каспий', km: '2 300 км', season: 'Лето, песчаные бури', desc: 'Море ушло, оставив ржавые корабли на дне. Барон делит воду и бензин, а буря стирает горизонт вместе с дорогой.' },
    taiga: { name: 'Тайга', km: '3 950 км', season: 'Осень, ливни', desc: 'Лес забрал пионерский лагерь себе. Здесь выросло поколение, не знавшее ни ракет, ни метро — только дождь и костры.' },
    novosibirsk: { name: 'Новосибирск', km: '4 800 км', season: 'Зима, радиация', desc: 'Мёртвый город под зелёной дымкой. Фон зашкаливает, счётчик Гейгера трещит без остановки, а надежда лежит в двух кварталах отсюда.' }
  };

  const LOCATIONS = {
    moscow: { title: 'Москва', desc: 'Зимний перегон, заброшенные вокзалы', weather: 'snow', img: 'assets/images/loc-moscow.jpeg' },
    volga: { title: 'Волга', desc: 'Затопленные болота, обломки мостов', weather: 'rain', img: 'assets/images/loc-volga.png' },
    yamantau: { title: 'Ямантау', desc: 'Подземные штреки, коридоры смерти', weather: 'ash', img: 'assets/images/loc-yamantau.webp' },
    caspian: { title: 'Каспий', desc: 'Высохшее море, ржавые танкеры', weather: 'sandstorm', img: 'assets/images/loc-caspian.jpg' },
    taiga: { title: 'Тайга', desc: 'Заброшенные лагеря, сосновый бор', weather: 'rain', img: 'assets/images/loc-taiga.jpg' },
    novosibirsk: { title: 'Новосибирск', desc: 'Мертвый город, заваленные туннели', weather: 'snow', img: 'assets/images/loc-novosibirsk.webp' }
  };

  // Данные о каждой остановке поезда: название, км, сезон, описание.
  // Ключ совпадает с data-stop=«...» в HTML.
  const mapDots = document.querySelectorAll('.map-dot');
  const stopKm = document.getElementById('stop-km');
  const stopName = document.getElementById('stop-name');
  const stopSeason = document.getElementById('stop-season');
  const stopDesc = document.getElementById('stop-desc');

  mapDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      mapDots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      if (window.audio) window.audio.click();

      const stopKey = dot.getAttribute('data-stop');
      const data = STOPS[stopKey];
      if (data && stopKm) {
        stopKm.textContent = data.km.toUpperCase();
        stopName.textContent = data.name;
        stopSeason.textContent = data.season;
        stopDesc.textContent = data.desc;
      }
    });
  });

  // Карусель локаций: автоматически меняется каждые 3 секунды. По клику переключается сразу.
  const locNavItems = document.querySelectorAll('.loc-nav-item');
  const locImage = document.getElementById('loc-image');
  let currentLocIndex = 0;
  let locAutoTimer = null;

  const setActiveLocation = (index, playSound = false) => {
    if (!locNavItems.length || !locImage) return;

    currentLocIndex = (index + locNavItems.length) % locNavItems.length;
    const targetItem = locNavItems[currentLocIndex];

    locNavItems.forEach((i) => i.classList.remove('active'));
    targetItem.classList.add('active');

    if (playSound && window.audio) window.audio.click();

    const locKey = targetItem.getAttribute('data-loc');
    const data = LOCATIONS[locKey];
    if (data) {
      locImage.style.opacity = '0.3';
      setTimeout(() => {
        locImage.src = window.getAsset ? window.getAsset(data.img) : `../${data.img}`;
        locImage.style.opacity = '1';
      }, 200);
    }
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    locAutoTimer = setInterval(() => {
      setActiveLocation(currentLocIndex + 1, false);
    }, 3000);
  };

  const stopAutoSlide = () => {
    if (locAutoTimer) {
      clearInterval(locAutoTimer);
      locAutoTimer = null;
    }
  };

  locNavItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      setActiveLocation(index, true);
      startAutoSlide(); // Сбрасываем и перезапускаем таймер при клике
    });
  });

  if (locNavItems.length > 0) {
    startAutoSlide();
  }

  // Движение поезда вдоль рельсов: поезд едет слева направо, после выхода за границу — появляется снова слева.
  const parentPatrol = document.querySelector('.parent-patrol-block');
  const trainWagon = document.querySelector('.aurora-train-wagon');
  const speedDisplay = document.getElementById('aurora-speed');

  if (parentPatrol && trainWagon) {
    let posX = 0; // Starts immediately on screen
    const speed = 1.35;
    let tick = 0;

    const animateTrainMovement = () => {
      const parentWidth = parentPatrol.clientWidth || 500;
      const trainWidth = trainWagon.offsetWidth || 268;

      posX += speed;
      tick += 0.08;

      const bounce = Math.sin(tick) * 0.35;

      // Wrap around when exiting the right side completely
      if (posX > parentWidth + 60) {
        posX = -trainWidth - 180;
      }

      trainWagon.style.left = `${posX}px`;
      trainWagon.style.transform = `translateY(${bounce.toFixed(2)}px)`;

      requestAnimationFrame(animateTrainMovement);
    };

    requestAnimationFrame(animateTrainMovement);
  }

  // Счётчик скорости поезда — рандомно меняется каждые 1.5 секунды.
  if (speedDisplay) {
    setInterval(() => {
      if (Math.random() < 0.3) {
        speedDisplay.textContent = (65 + Math.floor(Math.random() * 6)).toString();
      }
    }, 1500);
  }
});

// Конвертер валют Метро: Сом, USD, EUR, Патроны.
// Курсы берутся из файла data/converter.json через fetch.
// Если открыто по file:// без сервера — используются запасные значения.
const initCurrencyConverter = () => {
  const somInput    = document.querySelector('#som');
  const usdInput    = document.querySelector('#usd');
  const eurInput    = document.querySelector('#eur');
  const bulletInput = document.querySelector('#bullet');

  // Если поля конвертера нет на странице — выходим
  if (!somInput || !usdInput || !eurInput || !bulletInput) return;

  // Переводит любое значение в Сомы (базовая единица для пересчёта)
  const toSom = (value, sourceId, rates) => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (sourceId === 'som')    return num;
    if (sourceId === 'usd')    return num * rates.usd;
    if (sourceId === 'eur')    return num * rates.eur;
    if (sourceId === 'bullet') return num * rates.bullet;
    return num;
  };

  // Вешает обработчик на поле: при вводе пересчитывает все остальные
  const bindInput = (rates, input, sourceId, targets) => {
    input.oninput = () => {
      if (input.value === '') {
        targets.forEach((t) => (t.value = ''));
        return;
      }
      const som = toSom(input.value, sourceId, rates);
      if (som === null) return;
      targets.forEach((t) => {
        if (t === somInput)    t.value = som.toFixed(2);
        if (t === usdInput)    t.value = (som / rates.usd).toFixed(2);
        if (t === eurInput)    t.value = (som / rates.eur).toFixed(2);
        if (t === bulletInput) t.value = (som / rates.bullet).toFixed(2);
      });
    };
  };

  // Запускает конвертер с полученными курсами
  const startConverter = (rates) => {
    bindInput(rates, somInput,    'som',    [usdInput, eurInput, bulletInput]);
    bindInput(rates, usdInput,    'usd',    [somInput, eurInput, bulletInput]);
    bindInput(rates, eurInput,    'eur',    [somInput, usdInput, bulletInput]);
    bindInput(rates, bulletInput, 'bullet', [somInput, usdInput, eurInput]);
  };

  // Запасные курсы — используются если fetch не сработал (например при открытии по file://)
  const FALLBACK_RATES = { usd: 87.5, eur: 100.2, bullet: 300 };

  // Загружаем курсы из converter.json
  const jsonPath = window.isSubpage ? '../data/converter.json' : 'data/converter.json';

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((rates) => {
      startConverter(rates);
    })
    .catch(() => {
      // Не удалось загрузить JSON (file:// или сервер не запущен) — используем запасные значения
      startConverter(FALLBACK_RATES);
    });
};

initCurrencyConverter();

