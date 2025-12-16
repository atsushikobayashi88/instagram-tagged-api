export default async function handler(req, res) {
  const IG_USER_ID = process.env.IG_USER_ID;
  const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  if (!IG_USER_ID || !ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  const VERSION = "v24.0";
  const limit = Math.min(Number(req.query.limit || 6), 12);

  try {
    // Step A: tags では id だけ・件数も少なめ
    const tagsUrl =
      `https://graph.facebook.com/${VERSION}/${IG_USER_ID}/tags` +
      `?fields=id&limit=${limit}&access_token=${ACCESS_TOKEN}`;

    const tagsRes = await fetch(tagsUrl);
    const tagsData = await tagsRes.json();

    if (tagsData.error) {
      return res.status(500).json({ error: tagsData.error, step: "tags" });
    }

    const ids = (tagsData.data || []).map((x) => x.id).filter(Boolean);

    // Step B: 個別メディアの詳細を取得（必要最小限）
    const fields = [
      "id",
      "media_type",
      "media_url",
      "thumbnail_url",
      "permalink",
      "timestamp",
      "username"
      // caption は重いことがあるので、まずは外す（必要なら後で追加）
    ].join(",");

    const items = await Promise.all(
      ids.map(async (id) => {
        const mediaUrl =
          `https://graph.facebook.com/${VERSION}/${id}` +
          `?fields=${encodeURIComponent(fields)}&access_token=${ACCESS_TOKEN}`;
        const mediaRes = await fetch(mediaUrl);
        const mediaData = await mediaRes.json();
        return mediaData.error ? null : mediaData;
      })
    );

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ items: items.filter(Boolean) });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch Instagram data" });
  }
}
