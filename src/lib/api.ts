const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  
  // Automatically use relative API URL on Vercel deployment to support rewrites proxy
  if (hostname.endsWith('vercel.app')) {
    return '/api/v1';
  }
  
  return `http://${hostname}:5000/api/v1`;
};

const API_URL = getApiUrl();

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body 
      ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) 
      : undefined,
  });

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (e) {
      data = { message: await response.text() };
    }
  } else {
    data = { message: await response.text() };
  }

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  if (!response.ok) {
    const errorMsg = data && typeof data.message === 'object' 
      ? JSON.stringify(data.message) 
      : (data?.message || 'Something went wrong');
    throw new Error(errorMsg);
  }

  return data;
}
