/**
 * METRO EXODUS - SURVIVAL & TACTICAL METEO SCANNER (OPENWEATHERMAP API)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Nixie Oxygen Stopwatch ---
  const stopwatchDisplay = document.getElementById('seconds');
  const startBtn = document.getElementById('start');
  const stopBtn = document.getElementById('stop');
  const resetBtn = document.getElementById('reset');

  let elapsedSeconds = 0;
  let stopwatchInterval = null;

  if (startBtn && stopBtn && resetBtn && stopwatchDisplay) {
    startBtn.addEventListener('click', () => {
      if (!stopwatchInterval) {
        if (window.audio) window.audio.click();
        stopwatchInterval = setInterval(() => {
          elapsedSeconds++;
          stopwatchDisplay.textContent = elapsedSeconds;
        }, 1000);
      }
    });

    stopBtn.addEventListener('click', () => {
      if (window.audio) window.audio.click();
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
    });

    resetBtn.addEventListener('click', () => {
      if (window.audio) window.audio.click();
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
      elapsedSeconds = 0;
      stopwatchDisplay.textContent = '0';
    });
  }

  // --- 2. Tactical Weather Scanner (OpenWeatherMap API) ---
  const API_KEY = '291aa3950880603684e43c6cc36aed88';
  const weatherForm = document.getElementById('weather-form');
  const weatherInput = document.getElementById('weather-city-input');
  const weatherDisplay = document.getElementById('weather-result-display');
  const weatherChips = document.querySelectorAll('.weather-chip');

  const cityNameEl = document.getElementById('weather-city-name');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const iconEl = document.getElementById('weather-icon');
  const feelsLikeEl = document.getElementById('weather-feels-like');
  const windEl = document.getElementById('weather-wind');
  const humidityEl = document.getElementById('weather-humidity');
  const pressureEl = document.getElementById('weather-pressure');

  async function fetchWeather(cityName) {
    if (!cityName || !cityName.trim()) return;
    const query = cityName.trim();

    try {
      if (weatherDisplay) {
        weatherDisplay.style.opacity = '0.4';
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&lang=ru&appid=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Город «${query}» не обнаружен в радиоэфире.`);
        }
        throw new Error(`Ошибка связи с метеосервером: ${response.status}`);
      }

      const data = await response.json();
      renderWeather(data);
      if (window.audio) window.audio.click();
    } catch (error) {
      console.error('Ошибка метеосканера:', error);
      showWeatherError(error.message);
    } finally {
      if (weatherDisplay) {
        weatherDisplay.style.opacity = '1';
      }
    }
  }

  function renderWeather(data) {
    if (!data || !data.main) return;

    const tempVal = Math.round(data.main.temp);
    const tempFormatted = (tempVal > 0 ? '+' : '') + tempVal + '°C';

    const feelsLikeVal = Math.round(data.main.feels_like);
    const feelsFormatted = (feelsLikeVal > 0 ? '+' : '') + feelsLikeVal + '°C';

    const windSpeed = (data.wind && data.wind.speed !== undefined) ? data.wind.speed + ' м/с' : '—';
    const humidity = data.main.humidity !== undefined ? data.main.humidity + '%' : '—';
    
    // Convert hPa to mm Hg (1 hPa = 0.750062 mm Hg)
    const pressureMm = data.main.pressure ? Math.round(data.main.pressure * 0.750062) + ' мм рт. ст.' : '—';

    const description = (data.weather && data.weather[0] && data.weather[0].description) ? data.weather[0].description : 'Показания получены';
    const iconCode = (data.weather && data.weather[0] && data.weather[0].icon) ? data.weather[0].icon : '01d';

    if (cityNameEl) cityNameEl.textContent = `${data.name}, ${data.sys ? data.sys.country : ''}`;
    if (tempEl) tempEl.textContent = tempFormatted;
    if (descEl) descEl.textContent = description;
    if (iconEl) iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    if (feelsLikeEl) feelsLikeEl.textContent = feelsFormatted;
    if (windEl) windEl.textContent = windSpeed;
    if (humidityEl) humidityEl.textContent = humidity;
    if (pressureEl) pressureEl.textContent = pressureMm;
  }

  function showWeatherError(message) {
    if (descEl) descEl.textContent = message;
    if (tempEl) tempEl.textContent = '—';
    if (cityNameEl) cityNameEl.textContent = 'ОШИБКА СКАНИРОВАНИЯ';
    if (feelsLikeEl) feelsLikeEl.textContent = '—';
    if (windEl) windEl.textContent = '—';
    if (humidityEl) humidityEl.textContent = '—';
    if (pressureEl) pressureEl.textContent = '—';
    if (iconEl) iconEl.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚠️</text></svg>';
  }

  if (weatherForm) {
    weatherForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (weatherInput && weatherInput.value) {
        fetchWeather(weatherInput.value);
      }
    });
  }

  weatherChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.getAttribute('data-city') || chip.textContent;
      if (weatherInput) weatherInput.value = city;
      fetchWeather(city);
    });
  });

  // Initial scan on page load
  fetchWeather('Москва');
});
