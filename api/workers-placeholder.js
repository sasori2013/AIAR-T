// Cloudflare Workers Placeholder Logic
export default {
  async fetch(request, env, ctx) {
    return new Response(JSON.stringify({ text: 'Lab Initialized via Cloudflare Workers!' }), {
      headers: { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  },
};