import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.interceptors.request.use(
  (config) => {
    console.log('🌐 [Request] Outgoing:', {
      method: config.method.toUpperCase(),
      url: config.url,
      headers: config.headers,
      hasData: !!config.data
    });

    const token = localStorage.getItem("token");
    if (token) {
      console.log('🔐 [Request] Token found in localStorage');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️  [Request] No token found in localStorage');
    }
    
    // For multipart/form-data, remove the Content-Type header
    // so axios can set it automatically with the boundary parameter
    if (config.data instanceof FormData) {
      console.log('📤 [Request] FormData detected - removing Content-Type header to allow auto-boundary');
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [Request] Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.log('✅ [Response] Success:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataSize: JSON.stringify(response.data).length + ' bytes'
    });
    return response;
  },
  (error) => {
    console.error('❌ [Response] Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.response?.config?.url,
      message: error.message,
      responseData: error.response?.data,
      errorDetails: error
    });
    return Promise.reject(error);
  }
);

export default instance;