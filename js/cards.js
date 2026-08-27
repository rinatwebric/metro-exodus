/**
 * METRO EXODUS - DYNAMIC CARDS ENGINE (JSONPLACEHOLDER POSTS API)
 * Fetches posts asynchronously using async/await and try/catch.
 */

document.addEventListener('DOMContentLoaded', () => {
  const cardsContainer = document.getElementById('cards-container');
  const cardsCount = document.getElementById('cards-count');

  // Array of atmospheric Metro Exodus images for rich visual presentation
  const cardImages = [
    '../assets/images/presentation-img.png',
    '../assets/images/metro-exodus-ss-1.webp',
    '../assets/images/metro-exodus-ss-2.webp',
    '../assets/images/metro-exodus-ss-3.webp',
    '../assets/images/metro-exodus-ss-4.webp',
    '../assets/images/metro-exodus-ss-5.webp',
    '../assets/images/metro-exodus-ss-6.webp',
    '../assets/images/metro-exodus-ss-7.webp',
    '../assets/images/metro-exodus-ss-8.webp',
    '../assets/images/metro-exodus-ss-9.webp',
    '../assets/images/hazard-survival.png',
    '../assets/images/loc-moscow.jpeg',
    '../assets/images/loc-volga.png',
    '../assets/images/loc-caspian.jpg'
  ];

  async function fetchCards() {
    try {
      if (cardsContainer) cardsContainer.innerHTML = '';

      const response = await fetch('https://jsonplaceholder.typicode.com/posts');

      if (!response.ok) {
        throw new Error(`Ошибка HTTP ${response.status}: не удалось получить данные`);
      }

      const posts = await response.json();
      renderCards(posts);
    } catch (error) {
      console.error('Ошибка загрузки карточек:', error);
      showError(error.message);
    }
  }

  function renderCards(posts) {
    if (!cardsContainer) return;

    if (cardsCount) {
      cardsCount.textContent = `ВСЕГО ЗАПИСЕЙ: ${posts.length}`;
    }

    const html = posts.map((post, index) => {
      const img = cardImages[index % cardImages.length];
      return `
        <article class="post-card metal-panel reveal" style="animation-delay: ${(index % 12) * 0.04}s;">
          <div class="post-card-media">
            <img src="${img}" alt="${escapeHtml(post.title)}" loading="lazy" class="post-card-img">
            <span class="post-card-badge font-mono">ЗАПИСЬ #${post.id}</span>
          </div>
          <div class="post-card-body">
            <h3 class="post-card-title font-heading">${escapeHtml(post.title)}</h3>
            <p class="post-card-desc">${escapeHtml(post.body)}</p>
          </div>
        </article>
      `;
    }).join('');

    cardsContainer.innerHTML = html;

    // Trigger reveal animations
    if (window.RevealObserver) {
      document.querySelectorAll('.post-card.reveal').forEach((el) => {
        window.RevealObserver.observe(el);
      });
    } else {
      document.querySelectorAll('.post-card.reveal').forEach((el) => {
        el.classList.add('active');
      });
    }
  }

  function showError(message) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = `
      <div class="cards-error-box metal-panel" style="grid-column: 1 / -1;">
        <div style="font-size: 2.8rem; margin-bottom: 1rem;">⚠️</div>
        <h3 class="font-heading" style="color: #e23b3b; font-size: 1.4rem; margin-bottom: 0.75rem;">СБОЙ ПРИЕМА ДАННЫХ</h3>
        <p style="color: var(--foreground-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">${escapeHtml(message)}</p>
        <button class="btn btn-solid shimmer-btn" onclick="location.reload()" style="padding: 0.6rem 1.5rem; font-size: 0.78rem;">ПОВТОРИТЬ ЗАПРОС</button>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Fetch Execution
  fetchCards();
});
