  try {
    const TARGET_HOST = 'ravi.ravikumar.live';
    const TARGET_URL = https://${TARGET_HOST};

    const url = new URL(req.url);
    // Construct the new URL
    const targetUrl = TARGET_URL + url.pathname + url.search;

    const headers = new Headers(req.headers);
    headers.set('Host', TARGET_HOST);

    // Note: 'cf-' headers are specific to Cloudflare. 
    // They won't exist on Deno, but keeping these lines doesn't hurt.
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ipcountry');
    headers.delete('cf-ray');
    // You might want to remove Deno/deployment specific headers if needed
    headers.delete('x-forwarded-for'); 

    const options = {
      method: req.method,
      headers,
      redirect: 'manual', // Keeps redirects manual so the client handles them
    };

    // Forward the body for non-GET/HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = req.body;
    }

    // Fetch from the target
    const response = await fetch(targetUrl, options);

    // Clean up response headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (err) {
    // Error handling
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
