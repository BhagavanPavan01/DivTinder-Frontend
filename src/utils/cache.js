class Cache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttl = 60000) {
    const expires = Date.now() + ttl;
    this.store.set(key, { value, expires });
    
    // Auto cleanup
    setTimeout(() => {
      if (this.store.has(key) && this.store.get(key).expires <= Date.now()) {
        this.store.delete(key);
      }
    }, ttl);
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expires <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  delete(key) {
    this.store.delete(key);
  }

  deletePattern(pattern) {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
  }
}

export const cache = new Cache();