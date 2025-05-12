import {serve} from 'https://deno.land/std/http/server.ts';

serve(async (req: Request) => {
  if (req.method === 'GET') {
    return new Response('OK', {status: 200});
  }

  return new Response('Method Not Allowed', {status: 405});
});

export default serve;
