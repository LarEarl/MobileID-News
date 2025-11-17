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
    const API_KEY = process.env.NEWS_API_KEY || 'be48b1d18ccf43fd8b3e6b7f0f72cb3f';
    const { endpoint, ...params } = JSON.parse(event.body || '{}');
    
    const url = `https://newsapi.org/v2${endpoint}`;
    
    const response = await axios.get(url, {
      params: {
        ...params,
        apiKey: API_KEY,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data,
      }),
    };
  }
};
