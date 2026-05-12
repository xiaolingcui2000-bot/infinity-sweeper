/* Infinity Sweeper 攻略 · 公共脚本 */
(function () {
  'use strict';

  const setNavState = (toggle, nav, open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '收起导航' : '展开导航');
    nav.classList.toggle('is-open', open);
  };

  /* 1. 移动端汉堡导航 */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      setNavState(toggle, nav, !expanded);
    });

    nav.addEventListener('click', event => {
      if (event.target.closest('a')) setNavState(toggle, nav, false);
    });

    document.addEventListener('click', event => {
      if (!toggle.contains(event.target) && !nav.contains(event.target)) {
        setNavState(toggle, nav, false);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setNavState(toggle, nav, false);
        toggle.focus();
      }
    });
  }

  /* 2. 回到顶部按钮 */
  const topBtn = document.getElementById('back-to-top');
  if (topBtn) {
    const updateTopButton = () => {
      topBtn.classList.toggle('visible', window.scrollY > 400);
    };
    updateTopButton();
    window.addEventListener('scroll', updateTopButton, { passive: true });
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 3. 图片加载失败回退 */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
      if (this.dataset.fallback && this.src !== this.dataset.fallback) {
        this.src = this.dataset.fallback;
        return;
      }
      const placeholder = document.createElement('div');
      placeholder.className = 'img-placeholder';
      placeholder.setAttribute('role', 'img');
      placeholder.setAttribute('aria-label', this.alt || '图片暂时无法加载');
      placeholder.textContent = '⚠ 本地图片暂时无法加载，请检查 assets/images 文件夹';
      if (this.parentNode) this.parentNode.replaceChild(placeholder, this);
    }, { once: true });
  });

  /* 4. Toast 通知 */
  window.showToast = function (msg, duration = 2200) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), duration);
  };

  const copyText = text => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
      }
    });
  };

  /* 5. 总表搜索过滤（仅在 checklist 页存在时生效） */
  const searchInput = document.querySelector('.table-search');
  const tableBody = document.querySelector('.compendium-table tbody');
  const tableStatus = document.getElementById('table-status');
  if (searchInput && tableBody) {
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const updateFilter = () => {
      const q = searchInput.value.trim().toLowerCase();
      let visibleCount = 0;
      rows.forEach(row => {
        const match = !q || row.textContent.toLowerCase().includes(q);
        row.hidden = !match;
        if (match) visibleCount += 1;
      });
      if (tableStatus) {
        tableStatus.textContent = q ? `找到 ${visibleCount} 条匹配结果。` : `显示全部 ${rows.length} 条条目。`;
      }
    };
    updateFilter();
    searchInput.addEventListener('input', updateFilter);
  }

  /* 6. 复制按钮（总表行复制） */
  document.querySelectorAll('.copy-row-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      if (!row) return;
      const text = Array.from(row.querySelectorAll('td:not(.action-col)'))
        .map(td => td.textContent.trim().replace(/\s+/g, ' '))
        .filter(Boolean)
        .join(' | ');
      copyText(text)
        .then(() => window.showToast('已复制行内容 ✓'))
        .catch(() => window.showToast('复制失败，请手动选择'));
    });
  });


  /* 7. 资深手册路线选择器 */
  const routeData = {
    new: {
      title: '刚开荒：先买稳定，再谈花活',
      desc: '阅读顺序：规则 → 心法 → 构筑。商店优先保命、信息、经济；第一阶段不要为了爽感过早消耗关键牌。',
      items: ['先进规则页，确认数字、陷阱、生命的基本边界。', '再读心法页，把三条命看成可定价资源。', '第一批金币优先投向永久升级。']
    },
    boss: {
      title: '卡 Boss：把手速问题拆成资源问题',
      desc: 'Boss 战不是无脑快点，而是进场前已经准备好信息牌、生命预算与前三手锚点。',
      items: ['Boss 前一层开始停止挥霍解歧义牌。', '进场先找能打开最大信息量的锚点。', '倒计时逼近时，先交信息牌，再考虑生命买信息。']
    },
    score: {
      title: '冲高分：减少无效重算，比盲目提速更重要',
      desc: '普通关稳经济，Boss 关抢节奏。高分的核心是低损耗推进和高质量商店投资。',
      items: ['分区推进，减少视线乱跳和重复推导。', '商店优先复利、保命、信息，爆发只在成型后买。', '把每次误点都记录成可修正的动作。']
    },
    codex: {
      title: '补图鉴：先按功能族记录，再补正式译名',
      desc: '不要等完整数据库才开始维护。先把机制、永久、格子、消耗牌按功能分类，后续再补客户端正式名。',
      items: ['从图鉴首页进入机制格与消耗牌分类。', '用全条目总表搜索和复制行。', '每次新增只记录名称、触发条件、策略含义三项。']
    }
  };
  const routeButtons = Array.from(document.querySelectorAll('.route-btn[data-route]'));
  const routeResult = document.querySelector('.route-result');
  if (routeButtons.length && routeResult) {
    const routeTitle = routeResult.querySelector('[data-route-title]');
    const routeDesc = routeResult.querySelector('[data-route-desc]');
    const routeList = routeResult.querySelector('[data-route-list]');
    const setRoute = key => {
      const data = routeData[key] || routeData.new;
      routeButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.route === key));
      if (routeTitle) routeTitle.textContent = data.title;
      if (routeDesc) routeDesc.textContent = data.desc;
      if (routeList) routeList.innerHTML = data.items.map(item => `<li>${item}</li>`).join('');
    };
    routeButtons.forEach(btn => btn.addEventListener('click', () => setRoute(btn.dataset.route)));
  }
})();


function initCodexLightbox() {
  const targets = document.querySelectorAll('.item-media img, .compendium-thumb img');
  if (!targets.length) return;

  let lightbox = document.getElementById('codex-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'codex-lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="codex-lightbox-title">
        <div class="lightbox-head">
          <div class="lightbox-title" id="codex-lightbox-title">图鉴预览</div>
          <button class="lightbox-close" type="button" aria-label="关闭预览">✕</button>
        </div>
        <div class="lightbox-body">
          <img alt="" />
          <p class="lightbox-caption"></p>
        </div>
      </div>`;
    document.body.appendChild(lightbox);
  }

  const img = lightbox.querySelector('img');
  const caption = lightbox.querySelector('.lightbox-caption');
  const title = lightbox.querySelector('.lightbox-title');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  const close = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  targets.forEach((target) => {
    target.addEventListener('click', () => {
      const figure = target.closest('figure');
      const figcap = figure ? figure.querySelector('figcaption') : null;
      const cardTitle = target.closest('.item-card, .compendium-entry')?.querySelector('h3');
      img.src = target.currentSrc || target.src;
      img.alt = target.alt || '';
      caption.textContent = figcap ? figcap.textContent.trim() : '图鉴本地示意图';
      title.textContent = cardTitle ? cardTitle.textContent.trim() : '图鉴预览';
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
}

document.addEventListener('DOMContentLoaded', initCodexLightbox);


function initCodexDatabase() {
  const table = document.querySelector('.codex-db');
  if (!table) return;
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const search = document.getElementById('codex-search');
  const type = document.getElementById('codex-type');
  const use = document.getElementById('codex-use');
  const accuracy = document.getElementById('codex-accuracy');
  const reset = document.getElementById('codex-reset');
  const status = document.getElementById('codex-status');

  const apply = () => {
    const q = (search?.value || '').trim().toLowerCase();
    const t = type?.value || '';
    const u = use?.value || '';
    const a = accuracy?.value || '';
    let shown = 0;

    rows.forEach((row) => {
      const hay = (row.dataset.keywords || row.textContent || '').toLowerCase();
      const ok =
        (!q || hay.includes(q)) &&
        (!t || row.dataset.type === t) &&
        (!u || row.dataset.use === u) &&
        (!a || row.dataset.accuracy === a);
      row.hidden = !ok;
      if (ok) shown += 1;
    });

    if (status) status.textContent = `当前显示 ${shown} / ${rows.length} 个条目`;
  };

  [search, type, use, accuracy].forEach((el) => {
    if (el) el.addEventListener('input', apply);
    if (el) el.addEventListener('change', apply);
  });

  if (reset) {
    reset.addEventListener('click', () => {
      if (search) search.value = '';
      if (type) type.value = '';
      if (use) use.value = '';
      if (accuracy) accuracy.value = '';
      apply();
    });
  }

  apply();
}

function initCrashCoach() {
  const form = document.getElementById('crash-coach-form');
  const result = document.getElementById('crash-coach-result');
  if (!form || !result) return;

  const advice = {
    misclick: {
      title: '主要问题：操作节奏失控',
      items: ['下一局只处理一个边界区，不要视线乱跳。', '每次点击前先复述依据：这个格为什么安全？', '把标记当外置记忆，不要靠脑内缓存。']
    },
    boss: {
      title: '主要问题：Boss 前保险不足',
      items: ['Boss 前一层开始停止消耗揭示牌。', '进场先找最大信息量锚点，不要被倒计时逼着乱点。', '至少预留一张解歧义牌或一次生命买信息。']
    },
    shop: {
      title: '主要问题：商店转化率低',
      items: ['优先买永久、经济、情报、容错，不买情绪爽点。', '每次购买前问：这项能否降低后续所有局的失误成本？', '看不懂的组合先记名，别在关键局强行试。']
    },
    guess: {
      title: '主要问题：把伪死局当纯赌',
      items: ['先检查相邻数字是否形成共享约束。', '再检查是否能用牌或生命换更大信息量。', '只有收益明确大于风险时才接受 50/50。']
    },
    trap: {
      title: '主要问题：机制阅读不足',
      items: ['先去图鉴数据库筛选“风险”和“机制格”。', '每遇到新印记或陷阱，记录触发条件和策略含义。', '不要用经典扫雷直觉覆盖特殊格规则。']
    },
    greed: {
      title: '主要问题：收益与止损线不清',
      items: ['下一局提前设止损：低血、Boss 前、无保险时停止贪。', '经济流也要保留一张关键保险牌。', '高分局输在贪心时，复盘“哪一步该收手”。']
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = Array.from(form.querySelectorAll('input[name="cause"]:checked')).map((input) => input.value);
    if (!selected.length) {
      result.innerHTML = '<h3>先选择一个翻车原因</h3><p>复盘不是自责，而是把失败归因成下一局能执行的动作。</p>';
      return;
    }
    const first = advice[selected[0]];
    const extra = selected.slice(1).map((key) => `<li>${advice[key].title.replace('主要问题：', '附带问题：')}</li>`).join('');
    result.innerHTML = `<h3>${first.title}</h3><ul>${first.items.map((item) => `<li>${item}</li>`).join('')}${extra}</ul><p class="small">建议：下一局只优先修正第一项，不要同时改太多。</p>`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCodexDatabase();
  initCrashCoach();
});
