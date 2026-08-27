/**
 * METRO EXODUS - ARSENAL & WEAPON WORKBENCH SCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
  const WEAPONS_DATA = {
    tikhar: {
      name: 'Пневматическая винтовка «Тихарь»',
      desc: 'Самодельное бесшумное пневматическое оружие. Стреляет стальными шариками и зажигательными пулями. Требует ручной подкачки давления.',
      img: 'public/images/weapon-tikhar.jpg',
      serial: 'СЕРИЯ: SP-TK77 // ПНЕВМАТИКА',
      base: { damage: 75, accuracy: 85, stability: 70 }
    },
    bulldog: {
      name: 'Автомат «Бульдог»',
      desc: 'Компактная штурмовая булл-пап винтовка под патрон 5.45. Высокий темп огня и отличная маневренность в узких коридорах метро.',
      img: 'public/images/weapon-bulldog.jpg',
      serial: 'СЕРИЯ: BD-99 // АВТОМАТ',
      base: { damage: 65, accuracy: 70, stability: 80 }
    },
    ashot: {
      name: 'Одноствольный пистолет «Ашот»',
      desc: 'Грубый кустарный дробовик-пистолет 12-го калибра. Сокрушительная мощь на ближней дистанции, способная остановить любого мутанта.',
      img: 'public/images/weapon-ashot.jpeg',
      serial: 'СЕРИЯ: ASH-12 // ДРОБОВИК',
      base: { damage: 95, accuracy: 40, stability: 50 }
    },
    uboinik: {
      name: 'Автоматический дробовик «Убойник»',
      desc: 'Револьверный шестизарядный боевой дробовик. Обладает высочайшей скорострельностью в ближнем бою и сокрушительным останавливающим действием.',
      img: 'public/images/Uboinik.jpg',
      serial: 'СЕРИЯ: UB-6X // ДРОБОВИК',
      base: { damage: 90, accuracy: 45, stability: 60 }
    },
    flamethrower: {
      name: 'Тяжёлый «Огнемёт»',
      desc: 'Кустарное смертоносное оружие, выжигающее логова пауков, кикимор и слепых мутантов. Создает плотную стену всепожирающего пламени.',
      img: 'public/images/flame-thrower.jpg',
      serial: 'СЕРИЯ: FLM-44 // ОГНЕМЁТ',
      base: { damage: 100, accuracy: 35, stability: 65 }
    },
    helsing: {
      name: 'Пневматический арбалет «Хельсинг»',
      desc: 'Бесшумный многозарядный арбалет с барабанной подачей стрел. Идеален для бесшумного устранения часовых в лесах Тайги и возврата болтов.',
      img: 'public/images/helsing.jpg',
      serial: 'СЕРИЯ: HLS-08 // АРБАЛЕТ',
      base: { damage: 85, accuracy: 90, stability: 85 }
    },
    ventil: {
      name: 'Снайперская винтовка «Вентиль»',
      desc: 'Крупнокалиберная магазинная снайперская винтовка с ручным продольно-скользящим затвором. Абсолютная точность и убойная сила на предельных дистанциях.',
      img: 'public/images/ventil.jpg',
      serial: 'СЕРИЯ: VTL-762 // СНАЙПЕРСКАЯ',
      base: { damage: 98, accuracy: 95, stability: 55 }
    },
    ak103: {
      name: 'Штурмовой автомат «АК-103» / Калаш',
      desc: 'Легендарный автомат Калашникова под мощный патрон 7.62x39. Непревзойденная надежность в грязи, песке, радиоактивной пыли и сибирском морозе.',
      img: 'public/images/ak-103.webp',
      serial: 'СЕРИЯ: AK-103 // АВТОМАТ',
      base: { damage: 80, accuracy: 75, stability: 75 }
    },
    revolver: {
      name: 'Револьвер Ордена',
      desc: 'Надежный крупнокалиберный револьвер. Основа экипировки каждого спартанца: безотказная механика и возможность превращения в карабин.',
      img: 'public/images/revolver.jpeg',
      serial: 'СЕРИЯ: REV-44 // ПИСТОЛЕТ',
      base: { damage: 70, accuracy: 80, stability: 65 }
    }
  };

  // ==========================================
  // 1. WEAPONS SLIDER
  // ==========================================
  const weaponPills = document.querySelectorAll('#customizer .gun-select-pill');
  const gunPreviewImg = document.getElementById('gun-preview-img');
  const gunSerialStamp = document.getElementById('gun-serial-stamp');
  const gunDisplayName = document.getElementById('gun-display-name');
  const gunDisplayDesc = document.getElementById('gun-display-desc');
  const gunCounter = document.getElementById('gun-counter');
  const gunPrevBtn = document.getElementById('gun-prev-btn');
  const gunNextBtn = document.getElementById('gun-next-btn');

  const GUN_KEYS = Object.keys(WEAPONS_DATA);
  let currentGunIndex = 0;

  const setWeaponByIndex = (index, playSound = false) => {
    currentGunIndex = (index + GUN_KEYS.length) % GUN_KEYS.length;
    const weaponKey = GUN_KEYS[currentGunIndex];
    const wData = WEAPONS_DATA[weaponKey];

    weaponPills.forEach((p, idx) => {
      p.classList.toggle('active', idx === currentGunIndex);
    });

    if (gunCounter) {
      gunCounter.textContent = `${String(currentGunIndex + 1).padStart(2, '0')} / ${String(GUN_KEYS.length).padStart(2, '0')}`;
    }

    if (wData) {
      if (gunPreviewImg) {
        gunPreviewImg.style.opacity = '0.25';
        gunPreviewImg.style.transform = 'scale(0.96)';
        setTimeout(() => {
          gunPreviewImg.src = window.getAsset ? window.getAsset(wData.img) : `../${wData.img}`;
          gunPreviewImg.style.opacity = '1';
          gunPreviewImg.style.transform = 'scale(1)';
        }, 180);
      }
      if (gunDisplayName) gunDisplayName.textContent = wData.name;
      if (gunDisplayDesc) gunDisplayDesc.textContent = wData.desc;
      if (gunSerialStamp) gunSerialStamp.textContent = wData.serial;
      if (playSound && window.audio) window.audio.click();
    }
  };

  if (gunPrevBtn) {
    gunPrevBtn.addEventListener('click', () => setWeaponByIndex(currentGunIndex - 1, true));
  }
  if (gunNextBtn) {
    gunNextBtn.addEventListener('click', () => setWeaponByIndex(currentGunIndex + 1, true));
  }

  weaponPills.forEach((pill, idx) => {
    pill.addEventListener('click', () => setWeaponByIndex(idx, true));
  });

  // ==========================================
  // 2. THROWABLES SLIDER
  // ==========================================
  const throwPills = document.querySelectorAll('.throw-select-pill');
  const throwPreviewImg = document.getElementById('throw-preview-img');
  const throwSerialStamp = document.getElementById('throw-serial-stamp');
  const throwDisplayName = document.getElementById('throw-display-name');
  const throwDisplayDesc = document.getElementById('throw-display-desc');
  const throwCounter = document.getElementById('throw-counter');
  const throwPrevBtn = document.getElementById('throw-prev-btn');
  const throwNextBtn = document.getElementById('throw-next-btn');

  const THROWABLES_DATA = {
    knife: {
      name: 'Метательный армейский нож',
      desc: 'Тяжелый закаленный клинок для бесшумного мгновенного устранения противников. Брошенный нож можно подобрать с тела поверженного врага.',
      img: 'public/images/армейский-нож.webp',
      serial: 'СЕРИЯ: SP-KN01 // ХОЛОДНОЕ ОРУЖИЕ'
    },
    can: {
      name: 'Банка',
      desc: 'Жестяная банка, которая при броске создает шум, отвлекая противников или заставляя их покинуть укрытие.',
      img: 'public/images/banka.webp',
      serial: 'СЕРИЯ: DEC-00 // ДИВЕРСИЯ'
    },
    grenade: {
      name: 'Граната',
      desc: 'Самодельная фугасная граната со шрапнелью. Обладает большим радиусом поражения.',
      img: 'public/images/granata.webp',
      serial: 'СЕРИЯ: EXP-73 // ВЗРЫВЧАТКА'
    },
    molotov: {
      name: 'Коктейль Молотова',
      desc: 'Бутылка с зажигательной смесью. Создает очаг открытого огня, выжигая противников и мутантов в укрытиях.',
      img: 'public/images/molotov.webp',
      serial: 'СЕРИЯ: INC-99 // ЗАЖИГАТЕЛЬНОЕ'
    }
  };

  const THROW_KEYS = Object.keys(THROWABLES_DATA);
  let currentThrowIndex = 0;

  const setThrowableByIndex = (index, playSound = false) => {
    currentThrowIndex = (index + THROW_KEYS.length) % THROW_KEYS.length;
    const throwKey = THROW_KEYS[currentThrowIndex];
    const tData = THROWABLES_DATA[throwKey];

    throwPills.forEach((p, idx) => {
      p.classList.toggle('active', idx === currentThrowIndex);
    });

    if (throwCounter) {
      throwCounter.textContent = `${String(currentThrowIndex + 1).padStart(2, '0')} / ${String(THROW_KEYS.length).padStart(2, '0')}`;
    }

    if (tData) {
      if (throwPreviewImg) {
        throwPreviewImg.style.opacity = '0.25';
        throwPreviewImg.style.transform = 'scale(0.96)';
        setTimeout(() => {
          throwPreviewImg.src = window.getAsset ? window.getAsset(tData.img) : `../${tData.img}`;
          throwPreviewImg.style.opacity = '1';
          throwPreviewImg.style.transform = 'scale(1)';
        }, 180);
      }
      if (throwDisplayName) throwDisplayName.textContent = tData.name;
      if (throwDisplayDesc) throwDisplayDesc.textContent = tData.desc;
      if (throwSerialStamp) throwSerialStamp.textContent = tData.serial;
      if (playSound && window.audio) window.audio.click();
    }
  };

  if (throwPrevBtn) {
    throwPrevBtn.addEventListener('click', () => setThrowableByIndex(currentThrowIndex - 1, true));
  }
  if (throwNextBtn) {
    throwNextBtn.addEventListener('click', () => setThrowableByIndex(currentThrowIndex + 1, true));
  }

  throwPills.forEach((pill, idx) => {
    pill.addEventListener('click', () => setThrowableByIndex(idx, true));
  });
});
