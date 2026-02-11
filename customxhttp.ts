export default {
  async fetch(req) {
    try {
      const TARGET_HOST = 'zz.sdbuild.me';
      const TARGET_URL = `https://${TARGET_HOST}`;

      const url = new URL(req.url);
      const targetUrl = TARGET_URL + url.pathname + url.search;

      const headers = new Headers(req.headers);
      headers.set('Host', TARGET_HOST);

      const headersToRemove = [
        'cf-connecting-ip',
        'cf-ipcountry',
        'cf-ray',
        'x-forwarded-for',
        'x-real-ip',
        'forwarded',
        'via'
      ];

      for (const header of headersToRemove) {
        headers.delete(header);
      }

      const options = {
        method: req.method,
        headers
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        options.body = req.body;
      }

      const response = await fetch(targetUrl, options);

      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete('content-encoding');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });

    } catch (err) {
      return new Response(
        JSON.stringify({
          error: 'Proxy error',
          message: err.message || 'Unknown error'
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
