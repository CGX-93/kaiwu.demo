/* 开物 · 本地存储 */

const KWStorage = {
  KEY_HISTORY: 'kaiwu_history',
  KEY_DRAFT: 'kaiwu_qa_draft',

  // 历史记录
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_HISTORY) || '[]');
    } catch (e) { return []; }
  },

  saveHistoryItem(item) {
    const list = this.getHistory();
    list.unshift(item);
    // 最多保留 50 条
    if (list.length > 50) list.length = 50;
    localStorage.setItem(this.KEY_HISTORY, JSON.stringify(list));
    return item;
  },

  getHistoryItem(id) {
    return this.getHistory().find(x => x.id === id);
  },

  updateHistoryItem(id, updated) {
    const list = this.getHistory();
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updated };
    localStorage.setItem(this.KEY_HISTORY, JSON.stringify(list));
    return true;
  },

  toggleFavorite(id) {
    const list = this.getHistory();
    const item = list.find(x => x.id === id);
    if (!item) return false;
    item.favorite = !item.favorite;
    localStorage.setItem(this.KEY_HISTORY, JSON.stringify(list));
    return item.favorite;
  },

  removeHistoryItem(id) {
    const list = this.getHistory().filter(x => x.id !== id);
    localStorage.setItem(this.KEY_HISTORY, JSON.stringify(list));
  },

  clearHistory() {
    localStorage.removeItem(this.KEY_HISTORY);
  },

  // 问答草稿
  saveDraft(data) {
    localStorage.setItem(this.KEY_DRAFT, JSON.stringify(data));
  },
  getDraft() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_DRAFT) || 'null');
    } catch (e) { return null; }
  },
  clearDraft() {
    localStorage.removeItem(this.KEY_DRAFT);
  },

  // 工单结果临时存储（跳转用）
  saveResult(result) {
    sessionStorage.setItem('kaiwu_current_result', JSON.stringify(result));
  },
  getCurrentResult() {
    try {
      return JSON.parse(sessionStorage.getItem('kaiwu_current_result') || 'null');
    } catch (e) { return null; }
  }
};
