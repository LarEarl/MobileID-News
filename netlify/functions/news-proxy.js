const axios = require('axios');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // DEBUG ENDPOINT - удалить после диагностики
  if (event.path && event.path.includes('debug')) {
    const API_KEY = process.env.NEWS_API_KEY;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: '🔍 Debug Info',
        hasApiKey: !!API_KEY,
        apiKeyLength: API_KEY ? API_KEY.length : 0,
        apiKeyPreview: API_KEY ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}` : 'NOT_FOUND',
        allEnvVars: Object.keys(process.env).filter(key => 
          !key.includes('SECRET') && 
          !key.includes('TOKEN') && 
          !key.includes('PASSWORD')
        ).sort(),
        envVarsCount: Object.keys(process.env).length,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  try {
    // Логирование для отладки
    console.log('=== News Proxy Function Called ===');
    console.log('HTTP Method:', event.httpMethod);
    console.log('Environment variables available:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
    
    // Получаем API ключ из переменных окружения
    const API_KEY = process.env.NEWS_API_KEY;
    
    console.log('API_KEY exists:', !!API_KEY);
    console.log('API_KEY length:', API_KEY ? API_KEY.length : 0);
    
    if (!API_KEY) {
      console.error('❌ NEWS_API_KEY not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).join(', '));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API key not configured',
          message: 'Please set NEWS_API_KEY in Netlify environment variables',
          debug: {
            envVarsCount: Object.keys(process.env).length,
            hasApiKey: !!process.env.NEWS_API_KEY,
          },
        }),
      };
    }

    // Парсим тело запроса
    console.log('Request body:', event.body);
    const { endpoint, ...params } = JSON.parse(event.body || '{}');
    
    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing endpoint parameter',
        }),
      };
    }

    const url = `https://newsapi.org/v2${endpoint}`;
    
    console.log('✅ Proxying request to:', url);
    console.log('📦 With params:', JSON.stringify(params));
    console.log('🔑 Using API key:', API_KEY.substring(0, 4) + '...' + API_KEY.substring(API_KEY.length - 4));
    
    const response = await axios.get(url, {
      params: {
        ...params,
        apiKey: API_KEY,
      },
      headers: {
        'User-Agent': 'NewsApp/1.0',
      },
      timeout: 10000, // 10 секунд таймаут
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('Error config:', error.config?.url, error.config?.params);
    
    // Специальная обработка ошибки парсинга JSON
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          message: error.message,
        }),
      };
    }
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || error.toString(),
        statusCode: error.response?.status,
        newsApiError: error.response?.data?.message || null,
      }),
    };
  }
};
