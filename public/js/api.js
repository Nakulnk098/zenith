const API = {
  _getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('zenith_token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  },
  async get(url) {
    const res = await fetch(url, { cache: 'no-store', headers: this._getHeaders() });
    if (res.status === 401) { Auth.logout(); return null; }
    return res.json();
  },
  async post(url, data) {
    const res = await fetch(url, { method: 'POST', headers: this._getHeaders(), body: JSON.stringify(data) });
    return res.json();
  },
  async put(url, data) {
    const res = await fetch(url, { method: 'PUT', headers: this._getHeaders(), body: JSON.stringify(data) });
    return res.json();
  },
  async del(url) {
    const res = await fetch(url, { method: 'DELETE', headers: this._getHeaders() });
    return res.json();
  }
};
