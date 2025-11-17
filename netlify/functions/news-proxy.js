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

  try {
    // Получаем API ключ из переменных окружения
    const API_KEY = process.env.NEWS_API_KEY;
    
    if (!API_KEY) {
      console.error('NEWS_API_KEY not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API key not configured',
          message: 'Please set NEWS_API_KEY in Netlify environment variables',
        }),
      };
    }

    // Парсим тело запроса
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
    
    console.log('Proxying request to:', url);
    console.log('With params:', params);
    
    const response = await axios.get(url, {
      params: {
        ...params,
        apiKey: API_KEY,
      },
      headers: {
        'User-Agent': 'NewsApp/1.0',
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Proxy error:', error.message);
    console.error('Error details:', error.response?.data);
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || error.toString(),
        statusCode: error.response?.status,
      }),
    };
  }
};
