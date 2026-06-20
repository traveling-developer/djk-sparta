// Zernio-API-Client: Bild hochladen (presign → PUT) und Instagram-Post anlegen.
// Doku: https://docs.zernio.com (Instagram: Bild ≤ 8 MB, Caption ≤ 2200 Zeichen)
import axios from "axios";
import { requireEnv } from "./config.ts";
import { withRetry } from "./retry.ts";

const BASE_URL = "https://zernio.com/api/v1";

function authHeaders() {
  return { Authorization: `Bearer ${requireEnv("ZERNIO_API_KEY")}` };
}

// Lädt das PNG über Zernios Presign-Flow hoch und liefert die öffentliche URL.
export async function uploadImage(
  png: Buffer,
  fileName: string,
): Promise<string> {
  const { data: presign } = await withRetry(() =>
    axios.post<{ uploadUrl: string; publicUrl: string }>(
      `${BASE_URL}/media/presign`,
      { filename: fileName, contentType: "image/png" },
      { headers: authHeaders() },
    ),
  );

  await withRetry(() =>
    axios.put(presign.uploadUrl, png, {
      headers: { "Content-Type": "image/png" },
      maxBodyLength: Infinity,
    }),
  );

  return presign.publicUrl;
}

// Legt das Bild auf Instagram an — als Feed-Post oder Story.
// - opts.story: platformSpecificData.contentType = "story" (9:16, Caption wird
//   nicht angezeigt). Siehe https://docs.zernio.com/platforms/instagram#story
// - opts.draft: speichert nur als Zernio-Entwurf (isDraft), statt zu posten.
// - opts.scheduledFor: ISO-Zeitpunkt, zu dem Zernio veröffentlicht (statt sofort).
// Priorität: draft > scheduledFor > sofort (publishNow).
export async function createPost(
  imageUrl: string,
  caption: string,
  opts: { story?: boolean; draft?: boolean; scheduledFor?: string } = {},
): Promise<string> {
  const publish = opts.draft
    ? { isDraft: true }
    : opts.scheduledFor
      ? { scheduledFor: opts.scheduledFor }
      : { publishNow: true };

  const { data } = await withRetry(() =>
    axios.post<{ post: { _id: string } }>(
      `${BASE_URL}/posts`,
      {
        content: caption.slice(0, 2200),
        mediaItems: [{ type: "image", url: imageUrl }],
        platforms: [
          {
            platform: "instagram",
            accountId: requireEnv("ZERNIO_INSTAGRAM_ACCOUNT_ID"),
            ...(opts.story
              ? { platformSpecificData: { contentType: "story" } }
              : {}),
          },
        ],
        ...publish,
      },
      { headers: authHeaders() },
    ),
  );
  return data.post._id;
}
