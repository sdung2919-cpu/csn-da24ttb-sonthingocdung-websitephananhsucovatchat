const API = {
  async get(url) {
    const token = localStorage.getItem('token');
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    return await res.json();
  },
  async post(url, data, isFormData = false) {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    return await res.json();
  }
};