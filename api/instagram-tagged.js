export default async function handler(req, res) {
  const IG_USER_ID = process.env.IG_USER_ID;
  const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  if (!IG_USER_ID || !ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  const url = `https://graph.instagram.com/${IG_USER_ID}/tags?fields=media_url,permalink,caption,username,timestamp&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      items: data.data || []
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch Instagram data" });
  }
}
