const DEFAULT_API_ORIGIN = 'https://api.yourdomain.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/actuator/')
    ) {
      const apiOrigin = (env.API_ORIGIN || DEFAULT_API_ORIGIN).replace(/\/$/, '');
      const targetUrl = `${apiOrigin}${url.pathname}${url.search}`;

      const headers = new Headers(request.headers);
      headers.set('X-Forwarded-Host', url.host);
      headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers,
        body:
          request.method === 'GET' || request.method === 'HEAD'
            ? undefined
            : request.body,
        redirect: 'manual',
      });

      return fetch(proxyRequest);
    }

    return env.ASSETS.fetch(request);
  },
};
