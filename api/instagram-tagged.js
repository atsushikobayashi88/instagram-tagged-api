export default async function handler(req, res) {
  const IG_USER_ID = process.env.IG_USER_ID;
  const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

  if (!IG_USER_ID || !ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  const VERSION = "v24.0";
  // まずは小さく（3〜6）で安定化
  const limit = Math.min(Number(req.query.limit || 6), 12);

  // CORS（Shopifyから呼ぶ想定）
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // Step1: tags は id だけ・limitも小さく
    const tagsUrl =
      `https://graph.facebook.com/${VERSION}/${IG_USER_ID}/tags` +
      `?fields=id&limit=${limit}&access_token=${ACCESS_TOKEN}`;

    const tagsRes = await fetch(tagsUrl);
    const tagsJson = await tagsRes.json();

    if (tagsJson.error) {
      return res.status(500).json({ error: tagsJson.error, step: "tags" });
    }

    const ids = (tagsJson.data || []).map(x => x.id).filter(Boolean);

    // Step2: 個別メディア詳細（必要最小限）
    const fields = [
      "id",
      "media_type",
      "media_url",
      "thumbnail_url",
      "permalink",
      "timestamp"
      // caption は重くなりやすいので、安定してから必要なら追加
    ].join(",");

    const items = [];
    for (const id of ids) {
      const mediaUrl =
        `https://graph.facebook.com/${VERSION}/${id}` +
        `?fields=${encodeURIComponent(fields)}&access_token=${ACCESS_TOKEN}`;

      const mediaRes = await fetch(mediaUrl);
      const mediaJson = await mediaRes.json();

      // 個別が落ちても全体は返す（運用上強い）
      if (!mediaJson.error) items.push(mediaJson);
    }

    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch tagged media" });
  }
}
