export default async function handler(req, res) {
  const IG_USER_ID = process.env.IG_USER_ID;
  const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  if (!IG_USER_ID || !ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  // Meta公式: /<IG_USER_ID>/tags は graph.facebook.com を使用
  // バージョンは入れるのが推奨（例: v24.0 など）
  const VERSION = "v24.0";
  const url =
    `https://graph.facebook.com/${VERSION}/${IG_USER_ID}/tags` +
    `?fields=media_url,permalink,caption,username,timestamp,media_type,thumbnail_url` +
    `&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Graph APIはエラーでも200で返すことがあるので明示的に判定
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ items: data.data || [] });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch Instagram data" });
  }
}

