import type { IncomingMessage, ServerResponse } from 'http';
// @ts-ignore
import server from '../dist/server/server.js';

export const config = {
  // Use Vercel's standard Node.js serverless environment (100% compatible with all libraries)
  runtime: 'nodejs',
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // 1. Construct the full Web URL from the Node HTTP request details
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'http';
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost';
    const url = new URL(req.url || '', `${protocol}://${host}`);

    // 2. Extract and format request headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    }

    // 3. Buffer the incoming Node.js stream body if this is a mutation request (POST/PUT/PATCH/DELETE)
    let body: Buffer | null = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      body = Buffer.concat(chunks);
    }

    // 4. Formulate the Web standard Request object
    const webRequest = new Request(url.toString(), {
      method: req.method || 'GET',
      headers,
      body: body ? (body as any) : undefined,
    });

    // 5. Execute the compiled TanStack Start fetch handler
    const webResponse = await server.fetch(webRequest, process.env, {});

    // 6. Write status and status text back to Node response
    res.statusCode = webResponse.status;
    res.statusMessage = webResponse.statusText;

    // 7. Extract and write response headers (safeguarding multi-value set-cookie headers)
    webResponse.headers.forEach((value: string, key: string) => {
      if (key.toLowerCase() === 'set-cookie') {
        const cookies = (webResponse.headers as any).getSetCookie?.() || [value];
        res.setHeader('set-cookie', cookies);
      } else {
        res.setHeader(key, value);
      }
    });

    // 8. Stream the Web standard Response body into Node's response output
    if (webResponse.body) {
      const arrayBuffer = await webResponse.arrayBuffer();
      res.end(Buffer.from(arrayBuffer));
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Vercel SSR Bridge Exception:', error);
    res.statusCode = 500;
    res.end('Internal Server Error - SSR Rendering Exception');
  }
}
