// Create fetch wrapper with base URL
const baseURL = import.meta.env.VITE_API_URL || 'https://filemanagementsystem.lookli.nyc.mn/api';

const api = {
  async request(method, url, data = null) {
    // Request interceptor
    let headers = (data instanceof FormData) ? {} : {
      'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const config = {
      method: method.toUpperCase(),
      headers,
      credentials: "include",
    };

    
    if (data) {
      config.body = (data instanceof FormData) ? data : JSON.stringify(data);
    }
    
    try {
      const response = await fetch(`${baseURL}${url}`, config);
      
      // Response interceptor
      if (response.status === 401 || response.status === 403) {
        const current = window.location.href;
        window.location.href = 'https://zxkws.nyc.mn/login?redirect=' + current;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  get(url) {
    return this.request('GET', url);
  },
  
  post(url, data) {
    return this.request('POST', url, data);
  },
  
  put(url, data) {
    return this.request('PUT', url, data);
  },
  
  delete(url) {
    return this.request('DELETE', url);
  },
};

export default api;
