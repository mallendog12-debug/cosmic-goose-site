export default async function handler(req, res) {
  const target = new URL(req.url, 'https://thecosmicgoose.com').searchParams.get('url');
  if (!target) { res.status(400).send('missing url'); return; }
  let u;
  try { u = new URL(target); } catch (e) { res.status(400).send('bad url'); return; }
  const ALLOWED = ['news.google.com', 'rocklandreport.com', 'routeoutlook.com', 'www.routeoutlook.com'];
  if (!ALLOWED.includes(u.hostname)) { res.status(403).send('host not allowed'); return; }
  try {
    const r = await fetch(u.toString(), { headers: { 'User-Agent': 'Mozilla/5.0 (Allen Newsroom wall display)' } });
    const text = await r.text();
    const upstreamType = r.headers.get('content-type');
    res.setHeader('Content-Type', upstreamType || 'application/rss+xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).send(text);
  } catch (e) {
    res.status(502).send('upstream fetch failed');
  }
}
