export default async function handler(req, res) {
  const IG_USER_ID = process.env.IG_USER_ID;
  const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  const VERSION = "v24.0";
  const limit = Math.min(Number(req.query.limit || 12), 25);

  const fields = [
    "id",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp"
  ].join(",");

  const url =
    `https://graph.facebook.com/${VERSION}/${IG_USER_ID}/tags` +
    `?fields=${encodeURIComponent(fields)}` +
    `&limit=${limit}` +
    `&access_token=${ACCESS_TOKEN}`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ items: data.data || [] });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch tagged media" });
  }
}
