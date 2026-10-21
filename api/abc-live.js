export default async function handler(req, res) {
  // Resolves the CURRENT ABC News Live broadcast's YouTube video ID.
  // The persistent embed form (youtube-nocookie.com/embed/live_stream?channel=...)
  // proved unreliable on the wall display ("This video is unavailable"),
  // while the broadcast itself is embeddable — so the wall page asks this
  // function for the live video ID and embeds by ID instead.
  const LIVE_PAGE = 'https://www.youtube.com/@ABCNews/live';
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

  function extractId(html) {
    // The /live page's canonical (and og:url) point at the watch URL of
    // the broadcast that is live right now. Fall back to the first
    // player "videoId" only if both link tags are missing.
    const patterns = [
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})"/,
      /property="og:url" content="https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})"/,
      /"videoId":"([A-Za-z0-9_-]{11})"/
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) return m[1];
    }
    return null;
  }

  try {
    const r = await fetch(LIVE_PAGE, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }
    });
    if (!r.ok) { res.status(502).json({ error: 'youtube fetch failed: ' + r.status }); return; }
    const html = await r.text();
    const videoId = extractId(html);
    if (!videoId) { res.status(502).json({ error: 'no live video id found' }); return; }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.status(200).json({ videoId: videoId });
  } catch (e) {
    res.status(502).json({ error: 'resolver failed' });
  }
}
