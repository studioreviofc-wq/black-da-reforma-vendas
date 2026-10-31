/* =========================================================
   BLACK DA REFORMA — Página de vendas
   ========================================================= */

/* ---------------------------------------------------------
   PONTO DE CONFIGURAÇÃO — preencha antes de publicar.
   Campos vazios mantêm os placeholders da copy na tela.
   --------------------------------------------------------- */
const CONFIG = {
  // Link do WhatsApp do time comercial. Ex.: 'https://wa.me/55DDDNUMERO?text=...'
  whatsappUrl: '',

  // Oferta de cada versão da página (definida em data-offer, na tag <html>).
  // checkoutUrl: link do checkout (Hotmart, Kiwify, Eduzz etc.). Vazio = os botões levam até a seção da oferta.
  // Valores: somente o número, ex.: '1.997,00'
  offers: {
    alunos: {
      checkoutUrl: '',
      full: '5.000,00',  // [VALOR CHEIO]
      installment: '',   // [PARCELA]
      cash: '1.097,00',  // [VALOR]
    },
    'nao-alunos': {
      checkoutUrl: '',
      full: '5.000,00',  // [VALOR CHEIO]
      installment: '',   // [PARCELA]
      cash: '1.497,00',  // [VALOR]
    },
  },
};

(function () {
  'use strict';

  const offer = CONFIG.offers[document.documentElement.dataset.offer];

  /* Preços */
  document.querySelectorAll('[data-price]').forEach((el) => {
    const v = offer[el.dataset.price];
    if (v) el.textContent = v;
  });

  /* Checkout: o botão da oferta vai direto ao checkout; os demais CTAs levam à oferta */
  if (offer.checkoutUrl) {
    document.querySelectorAll('[data-checkout]').forEach((a) => {
      const url = new URL(offer.checkoutUrl);
      // Repassa UTMs da página para o checkout
      new URLSearchParams(location.search).forEach((val, key) => {
        if (key.startsWith('utm_') || key === 'src' || key === 'sck') url.searchParams.set(key, val);
      });
      a.href = url.toString();
    });
  }

  /* WhatsApp */
  if (CONFIG.whatsappUrl) {
    document.querySelectorAll('[data-whatsapp]').forEach((a) => {
      a.href = CONFIG.whatsappUrl;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* Evita palavra sozinha na última linha: une as duas últimas palavras de cada texto */
  document.querySelectorAll('h1, h2, h3, p, li, blockquote, .choice, .ti, .btn__label, .faq-toggle > span:first-child, .module-title strong').forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (let i = nodes.length - 1; i >= 0; i--) {
      const text = nodes[i].textContent.replace(/\s+$/, '');
      const pos = text.search(/\s\S*$/);
      if (pos > 0 || (pos === 0 && i > 0)) {
        nodes[i].textContent = text.slice(0, pos) + '\u00A0' + text.slice(pos + 1);
        break;
      }
    }
  });

  /* Benefícios do hero: no mobile, o glass acompanha o scroll a partir do primeiro */
  const checks = [...document.querySelectorAll('.hero__checks li')];
  const pains = [...document.querySelectorAll('.pain')];
  const steps = [...document.querySelectorAll('.step')];
  const fits = [...document.querySelectorAll('.fit__item')];
  const segCards = [...document.querySelectorAll('.seg-card')];
  const mobileMq = window.matchMedia('(max-width: 860px)');
  let ticking = false;
  function updateChecks() {
    ticking = false;
    if (!mobileMq.matches) {
      checks.forEach((li) => li.classList.remove('is-active'));
      pains.forEach((card) => card.classList.remove('is-active'));
      steps.forEach((card) => card.classList.remove('is-active'));
      fits.forEach((card) => card.classList.remove('is-active'));
      segCards.forEach((card) => card.classList.remove('is-active'));
      return;
    }
    const line = window.innerHeight * 0.45;
    let active = 0;
    checks.forEach((li, i) => { if (li.getBoundingClientRect().top < line) active = i; });
    const hero = document.querySelector('.hero').getBoundingClientRect();
    const heroVisible = hero.bottom > 0;
    checks.forEach((li, i) => li.classList.toggle('is-active', heroVisible && i === active));

    // Cards de dor (3A): ativa o card mais próximo do centro da tela, a partir do primeiro
    const vh = window.innerHeight;
    const focus = vh * 0.5;
    let painActive = -1;
    let best = Infinity;
    pains.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      if (r.bottom < vh * 0.1 || r.top > vh * 0.85) return;
      const dist = Math.abs((r.top + r.bottom) / 2 - focus);
      if (dist < best) { best = dist; painActive = i; }
    });
    pains.forEach((card, i) => card.classList.toggle('is-active', i === painActive));
    activateClosest(steps);
    activateClosest(fits);
    activateClosest(segCards);
  }
  // Ativa o card mais próximo do centro da tela (mobile)
  function activateClosest(list) {
    const vh = window.innerHeight;
    let idx = -1, best = Infinity;
    list.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      if (r.bottom < vh * 0.1 || r.top > vh * 0.85) return;
      const dist = Math.abs((r.top + r.bottom) / 2 - vh * 0.5);
      if (dist < best) { best = dist; idx = i; }
    });
    list.forEach((card, i) => card.classList.toggle('is-active', i === idx));
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(updateChecks); }
  }
  if (checks.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (mobileMq.addEventListener) mobileMq.addEventListener('change', updateChecks);
    updateChecks();
  }

  /* Cards de dor: ponto de luz acompanha o mouse */
  document.querySelectorAll('.pain, .step, .seg-card, .tcard').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Seção 6: animações automáticas das capas (gráfico por setor e mini linha do tempo) */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chart = document.querySelector('.cov-chart');
  if (chart && !reduceMotion && 'IntersectionObserver' in window) {
    const cTag = chart.querySelector('.cov-tag');
    const cBars = [...chart.querySelectorAll('.cov-bars i')];
    const cStates = [
      { t: 'Comércio', h: [46, 72, 54, 90, 60], c: 3 },
      { t: 'Serviços', h: [82, 50, 88, 42, 66], c: 2 },
      { t: 'Indústria', h: [60, 90, 45, 72, 52], c: 1 },
      { t: 'Regimes', h: [70, 54, 82, 48, 92], c: 4 },
    ];
    let cIdx = 0, cTimer = null;
    const applyChart = (st) => {
      cTag.textContent = st.t;
      cBars.forEach((b, k) => { b.style.height = st.h[k] + '%'; b.classList.toggle('accent', k === st.c); });
    };
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        if (!cTimer) cTimer = setInterval(() => { cIdx = (cIdx + 1) % cStates.length; applyChart(cStates[cIdx]); }, 3400);
      } else if (cTimer) { clearInterval(cTimer); cTimer = null; }
    }), { threshold: 0.25 }).observe(chart);
  }
  const tlCard = document.querySelector('.cov-tl') && document.querySelector('.cov-tl').closest('.seg-card');
  if (tlCard && !reduceMotion && 'IntersectionObserver' in window) {
    let tlTimer = null, tlOn = false;
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        if (!tlTimer) {
          tlCard.classList.add('tl-play'); tlOn = true;
          tlTimer = setInterval(() => { tlOn = !tlOn; tlCard.classList.toggle('tl-play', tlOn); }, 3800);
        }
      } else if (tlTimer) { clearInterval(tlTimer); tlTimer = null; tlOn = false; tlCard.classList.remove('tl-play'); }
    }), { threshold: 0.35 }).observe(tlCard);
  }

  /* Grade completa: cada módulo abre/fecha de forma independente */
  document.querySelectorAll('.module-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.closest('.module').classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* FAQ: cada pergunta abre/fecha de forma independente */
  document.querySelectorAll('.faq-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.closest('.faq-item').classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* Linha do tempo: preenche a linha e os marcadores ao chegar na seção */
  const timeline = document.querySelector('[data-timeline]');
  if (timeline) {
    if ('IntersectionObserver' in window) {
      const tlo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => timeline.classList.add('is-playing'), 350);
            tlo.disconnect();
          }
        });
      }, { threshold: 0.45 });
      tlo.observe(timeline);
    } else {
      timeline.classList.add('is-playing');
    }
  }

  /* Linha do tempo no mobile/tablet: o preenchimento acompanha o scroll (desce e sobe) */
  if (timeline) {
    const tlMq = window.matchMedia('(max-width: 1024px)');
    const tlItems = [...timeline.querySelectorAll('.timeline__item')];
    let tlTick = false;
    function updateTimeline() {
      tlTick = false;
      if (!tlMq.matches) {
        timeline.style.removeProperty('--tl-p');
        tlItems.forEach((li) => li.classList.remove('is-reached'));
        return;
      }
      const r = timeline.getBoundingClientRect();
      const lineH = r.height - 16;
      const focus = window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (focus - (r.top + 8)) / lineH));
      timeline.style.setProperty('--tl-p', p.toFixed(4));
      const reach = p * lineH + 8;
      tlItems.forEach((li) => li.classList.toggle('is-reached', li.offsetTop + 10 <= reach));
    }
    const onTl = () => { if (!tlTick) { tlTick = true; requestAnimationFrame(updateTimeline); } };
    window.addEventListener('scroll', onTl, { passive: true });
    window.addEventListener('resize', onTl);
    updateTimeline();
  }

  /* Revelação suave ao rolar */
  const items = document.querySelectorAll('.reveal-on');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // Pequeno escalonamento entre irmãos do mesmo grid
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('reveal-on')) : [];
      const idx = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = Math.min(idx, 6) * 60 + 'ms';
      el.classList.add('is-in');
      setTimeout(() => { el.style.transitionDelay = ''; }, 1200);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
})();
