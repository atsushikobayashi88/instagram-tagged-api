export default async function handler(req, res) {
  const IG_USER_ID = process.env.IG_USER_ID;
  const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  if (!IG_USER_ID || !ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  const VERSION = "v24.0";
  const limit = Math.min(Number(req.query.limit || 6), 25);
  const after = req.query.after ? `&after=${encodeURIComponent(req.query.after)}` : "";

  const fields = [
    "id",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp"
  ].join(",");

  // ★ /tags を叩く（タグ付けされた投稿）
  const url =
    `https://graph.facebook.com/${VERSION}/${IG_USER_ID}/tags` +
    `?fields=${encodeURIComponent(fields)}` +
    `&limit=${limit}` +
    `${after}` +
    `&access_token=${ACCESS_TOKEN}`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      items: data.data || [],
      paging: data.paging || null
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch Instagram tagged data" });
  }
}
