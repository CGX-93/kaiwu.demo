/* 开物 · 失败修复库入口页 */

(function () {
  'use strict';

  function init() {
    const grid = document.getElementById('symptomGrid');
    const symptoms = RESCUE_DATA.getAllSymptoms();

    // 记录入口曝光
    if (window.KW_DL) KW_DL.logEvent('rescue.entry.viewed', { count: symptoms.length });

    // 渲染 8 卡
    symptoms.forEach(s => {
      const a = document.createElement('a');
      a.className = 'symptom-card';
      a.href = 'rescue-detail.html?id=' + encodeURIComponent(s.id);
      a.style.setProperty('--sc-from', s.gradFrom);
      a.style.setProperty('--sc-to',   s.gradTo);
      a.innerHTML =
        '<div class="sc-icon">' + s.icon + '</div>' +
        '<h3 class="sc-title">' + escapeHtml(s.title) + '</h3>' +
        '<p class="sc-summary">' + escapeHtml(s.summary) + '</p>' +
        '<div class="sc-stat"><span class="dot"></span>' + s.scenes.length + ' 个具体场景</div>';
      a.addEventListener('click', () => {
        // 点击 → 记一条 'viewed' 日志
        if (window.KW_DL) {
          KW_DL.logRescueUsage(s.id, null, 'viewed');
        }
      });
      grid.appendChild(a);
    });

    // 更新统计
    document.getElementById('statSymptoms').textContent = symptoms.length;
    document.getElementById('statScenarios').textContent =
      symptoms.reduce((acc, s) => acc + s.scenes.length, 0);

    // 解决率（基于 KW_DL.getRescueStats）
    if (window.KW_DL) {
      const stats = KW_DL.getRescueStats();
      const el = document.getElementById('statSolved');
      el.textContent = stats.solvedRate > 0
        ? Math.round(stats.solvedRate * 100) + '%'
        : '—';
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
