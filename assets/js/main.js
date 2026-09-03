/* ============================================================
   魔琴 MagicPiano 官网 · 交互脚本
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- 语言切换 ---------------- */
  var STORE_KEY = 'mp-lang';
  var ORIG_KEY  = 'origZh';
  var currentLang = 'zh-CN';

  function snapshotZhCN() {
    $$('[data-i18n]').forEach(function (el) {
      if (el.dataset[ORIG_KEY] === undefined) el.dataset[ORIG_KEY] = el.innerHTML;
    });
  }

  function t(lang, key) {
    var dict = window.MP_I18N && window.MP_I18N[lang];
    return (dict && dict[key] !== undefined) ? dict[key] : null;
  }

  function applyLang(lang) {
    var dict = window.MP_I18N && window.MP_I18N[lang];
    if (!dict) return;

    $$('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = (lang === 'zh-CN') ? el.dataset[ORIG_KEY] : t(lang, key);
      if (val !== null && val !== undefined) el.innerHTML = val;
    });

    // 标题与描述
    if (dict.doc) {
      if (dict.doc.title) document.title = dict.doc.title;
      else if (lang === 'zh-CN') document.title = '魔琴 MagicPiano — 把 MIDI 变成游戏里的琴键';
      var md = $('meta[name="description"]');
      if (md) {
        if (dict.doc.desc) md.setAttribute('content', dict.doc.desc);
        else if (lang === 'zh-CN') md.setAttribute('content', '魔琴 MagicPiano 是一款为游戏音乐演奏而生的 MIDI 自动演奏器。内置 17 种游戏按键模式、云端曲库、悬浮小窗、12 调号转调、Win + Android 双端，支持简繁英三语。');
      }
    }

    // html lang 属性
    var meta = (window.MP_LANGS || []).filter(function (l) { return l.code === lang; })[0];
    document.documentElement.setAttribute('lang', meta ? meta.htmlLang : lang);
    document.documentElement.setAttribute('data-lang', lang);

    // 按钮高亮
    $$('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang-btn') === lang);
    });

    currentLang = lang;
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}

    // 通知其他模块
    document.dispatchEvent(new CustomEvent('mplang:change', { detail: { lang: lang } }));
  }

  function initLang() {
    snapshotZhCN();
    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (!saved || !window.MP_I18N[saved]) {
      saved = (navigator.language || 'zh-CN').toLowerCase().indexOf('zh') === 0 ? 'zh-CN' : 'en';
    }
    applyLang(saved);

    $$('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-lang-btn'));
        closeMobileNav();
      });
    });
  }

  /* ---------------- 导航 ---------------- */
  var nav = $('#nav');
  var navLinks = $('#navLinks');
  var navToggle = $('#navToggle');

  /* 禁止浏览器恢复上次的滚动位置，保证每次进来都从首页开始 */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // 有 hash 锚点（如 /#download）就跳到锚点，否则强制回到顶部
  function ensureTop() {
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      var target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }
  window.addEventListener('load', ensureTop);
  ensureTop();

  function onScrollNav() {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  function closeMobileNav() {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', closeMobileNav); });

  // 当前区块高亮
  var sections = ['home', 'features', 'games', 'gallery', 'advanced', 'download', 'community', 'faq']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var linkMap = {};
  sections.forEach(function (sec) {
    var link = $('#navLinks a[href="#' + sec.id + '"]');
    if (link) linkMap[sec.id] = link;
  });

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove('active'); });
          if (linkMap[en.target.id]) linkMap[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-' + (66 + 40) + 'px 0px -70% 0px', threshold: 0 });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------- 滚动进场 ---------------- */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          var el = en.target;
          setTimeout(function () { el.classList.add('in'); }, i * 60);
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- 数字滚动 ---------------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = (String(target).indexOf('.') > -1) ? 1 : 0;
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); countObserver.unobserve(en.target); }
      });
    }, { threshold: .5 });
    $$('[data-count]').forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------------- FAQ 手风琴 ---------------- */
  $$('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var panel = $('.faq-a', item);
      var isOpen = item.classList.contains('open');

      $$('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          $('.faq-a', other).style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------------- 复制 ---------------- */
  var toast = $('#toast');
  var toastMsg = $('#toastMsg');
  var toastTimer;

  function showToast(text) {
    toastMsg.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { showToast(text); }, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast(text); } catch (e) { showToast(text); }
      document.body.removeChild(ta);
    }
  }

  var inviteBtn = $('#copyInvite');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', function () {
      copyText(inviteBtn.getAttribute('data-invite'));
    });
  }

  $$('[data-copy]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      copyText(a.getAttribute('data-copy'));
    });
  });

  /* ---------------- Hero 背景按键雨 ---------------- */
  var rain = $('#keysRain');
  if (rain) {
    var letters = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 26; i++) {
      var s = document.createElement('span');
      s.textContent = letters[Math.floor(Math.random() * letters.length)];
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (55 + Math.random() * 45) + '%';
      s.style.animationDuration = (7 + Math.random() * 7) + 's';
      s.style.animationDelay = (Math.random() * 6) + 's';
      s.style.fontSize = (11 + Math.random() * 8) + 'px';
      frag.appendChild(s);
    }
    rain.appendChild(frag);
  }

  /* ---------------- 模拟界面的琴键 ---------------- */
  var appKeys = $('#appKeys');
  if (appKeys) {
    ['Q', '2', 'W', '3', 'E', 'R', '5', 'T', '6', 'Y', '7', 'U'].forEach(function (k, i) {
      var b = document.createElement('b');
      b.textContent = k;
      b.style.animationDelay = (i * 0.16) + 's';
      appKeys.appendChild(b);
    });
  }

  /* ---------------- 轮播图（界面预览） ---------------- */
  var SLIDES = [
    { src: 'img/PC_cn.png',    cn: '简体中文 · 游戏按键',       tw: '簡體中文 · 遊戲按鍵',     en: 'Simplified Chinese · Game keys' },
    { src: 'img/PC_en.png',    cn: 'English · Main UI',         tw: 'English · Main UI',        en: 'English · Main UI' },
    { src: 'img/PC_tw.png',    cn: '繁體中文 · 主介面',         tw: '繁體中文 · 主介面',         en: 'Traditional Chinese · Main UI' },
    { src: 'img/PC_midi.png',  cn: '外设 MIDI 设备选择',       tw: '外設 MIDI 設備選擇',       en: 'External MIDI device picker' },
    { src: 'img/PC_si.png',    cn: '本地音乐 · 调号窗口',       tw: '本地音樂 · 調號視窗',       en: 'Local music · key signature' },
    { src: 'img/PC_sz.png',    cn: '练习曲 · 燕云/永劫解锁',    tw: '練習曲 · 燕雲/永劫解鎖',    en: 'Practice tracks · Where Winds Meet / Naraka' },
    { src: 'img/PC_edit.png',  cn: '本地音乐列表',              tw: '本地音樂列表',              en: 'Local music library' },
    { src: 'img/android1.png', cn: '安卓版 · 本地音乐',         tw: '安卓版 · 本地音樂',         en: 'Android · Local music' },
    { src: 'img/android2.png', cn: '安卓版 · 悬浮窗',           tw: '安卓版 · 懸浮窗',           en: 'Android · Floating window' }
  ];

  function initCarousel() {
    var root = $('#galleryCarousel');
    if (!root) return;
    var img    = $('#carImg', root);
    var frame  = $('#carFrame', root);
    var cap    = $('#carCap', root);
    var prev   = $('#carPrev', root);
    var next   = $('#carNext', root);
    var cur    = $('#carCur', root);
    var total  = $('#carTotal', root);
    var thumbs = $('#carThumbs', root);
    var dots   = $('#carDots', root);

    var idx = 0;
    var n = SLIDES.length;
    var autoplayDelay = parseInt(root.getAttribute('data-autoplay'), 10) || 4500;
    var timer = null;
    var paused = false;

    // 渲染缩略图
    var frag = document.createDocumentFragment();
    SLIDES.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'car-thumb';
      b.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
      b.dataset.idx = i;
      var im = document.createElement('img');
      im.src = s.src;
      im.alt = '';
      im.loading = 'lazy';
      im.decoding = 'async';
      b.appendChild(im);
      b.addEventListener('click', function () { go(i, true); });
      frag.appendChild(b);
    });
    thumbs.appendChild(frag);

    // 渲染圆点
    var dotsFrag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'car-dot';
      d.setAttribute('aria-label', '跳到第 ' + (i + 1) + ' 张');
      d.addEventListener('click', (function (j) {
        return function () { go(j, true); };
      })(i));
      dotsFrag.appendChild(d);
    }
    dots.appendChild(dotsFrag);

    function slideCap(i) {
      var s = SLIDES[i] || {};
      if (currentLang === 'en') return s.en || s.cn;
      if (currentLang === 'zh-TW') return s.tw || s.cn;
      return s.cn;
    }

    function apply() {
      var s = SLIDES[idx];
      // 切换图前先淡出再淡入
      img.classList.remove('loaded');
      var pre = new Image();
      pre.onload = function () {
        img.src = s.src;
        frame.setAttribute('href', s.src);
        img.alt = slideCap(idx);
        // 强制 reflow 再 fade-in
        void img.offsetWidth;
        img.classList.add('loaded');
      };
      pre.onerror = function () {
        img.src = s.src;
        frame.setAttribute('href', s.src);
        img.classList.add('loaded');
      };
      pre.src = s.src;

      cap.textContent = slideCap(idx);
      cur.textContent = idx + 1;
      total.textContent = n;

      var allThumbs = thumbs.children;
      for (var k = 0; k < allThumbs.length; k++) allThumbs[k].classList.toggle('active', k === idx);
      var allDots = dots.children;
      for (var k = 0; k < allDots.length; k++) allDots[k].classList.toggle('active', k === idx);

      // 缩略图自动滚动到可见区
      var active = allThumbs[idx];
      if (active && active.scrollIntoView) {
        try {
          active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } catch (e) {
          active.scrollIntoView();
        }
      }
    }

    function go(target, manual) {
      if (target < 0) target = n - 1;
      else if (target >= n) target = 0;
      idx = target;
      apply();
      if (manual) restart();
    }

    prev.addEventListener('click', function () { go(idx - 1, true); });
    next.addEventListener('click', function () { go(idx + 1, true); });

    // 键盘 ← / →
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(idx - 1, true); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(idx + 1, true); e.preventDefault(); }
    });
    root.tabIndex = 0;

    // 触屏 / 鼠标滑动
    var startX = 0, startY = 0, tracking = false;
    function onDown(e) {
      tracking = true;
      var p = e.touches ? e.touches[0] : e;
      startX = p.clientX; startY = p.clientY;
    }
    function onUp(e) {
      if (!tracking) return;
      tracking = false;
      var p = e.changedTouches ? e.changedTouches[0] : e;
      var dx = p.clientX - startX, dy = p.clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) go(idx + 1, true);
        else go(idx - 1, true);
      }
    }
    function onCancel() { tracking = false; }
    frame.addEventListener('touchstart', onDown, { passive: true });
    frame.addEventListener('touchend', onUp);
    frame.addEventListener('touchcancel', onCancel);
    frame.addEventListener('mousedown', onDown);
    frame.addEventListener('mouseup', onUp);
    frame.addEventListener('mouseleave', onCancel);
    // 防止拖拽产生图片拖动阴影
    frame.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // 自动播放
    function start() {
      stop();
      if (paused) return;
      timer = setInterval(function () { go(idx + 1, false); }, autoplayDelay);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { if (timer || !paused) start(); }

    root.addEventListener('mouseenter', function () { paused = true; stop(); });
    root.addEventListener('mouseleave', function () { paused = false; start(); });
    root.addEventListener('focusin', function () { paused = true; stop(); });
    root.addEventListener('focusout', function () { paused = false; start(); });

    // 进入视口才启动自动播放
    if ('IntersectionObserver' in window) {
      var playObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) start();
          else stop();
        });
      }, { threshold: .35 });
      playObs.observe(root);
    } else {
      start();
    }

    // 语言切换时刷新当前 caption
    document.addEventListener('mplang:change', function () { apply(); });

    // 初始
    apply();
  }

  /* ---------------- 年份 ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- 启动 ---------------- */
  initLang();
  initCarousel();
})();
