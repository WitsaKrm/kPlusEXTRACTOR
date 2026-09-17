import { google } from "googleapis";

// Simple in-memory cache to prevent hitting Gmail API rate limits during dev reloads
const emailCache: { [key: string]: { timestamp: number, data: { id: string, body: string }[] } | undefined } = {};
const fetchPromise: { [key: string]: Promise<{ id: string, body: string }[]> | undefined } = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchKPlusEmails(accessToken: string, forceRefresh: boolean = false): Promise<{ id: string, body: string }[]> {
  // Return cached data if available, fresh, and not forcing a refresh
  if (!forceRefresh && emailCache[accessToken] && Date.now() - emailCache[accessToken].timestamp < CACHE_TTL) {
    return emailCache[accessToken].data;
  }

  // Deduplicate concurrent requests (e.g. from React Strict Mode / HMR) unless forcing refresh
  const existingPromise = fetchPromise[accessToken];
  if (!forceRefresh && existingPromise !== undefined) {
    return existingPromise;
  }

  fetchPromise[accessToken] = (async () => {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const date = new Date();
      const firstDayOfThreeMonthsAgo = new Date(date.getFullYear(), date.getMonth() - 2, 1);
      const afterDate = Math.floor(firstDayOfThreeMonthsAgo.getTime() / 1000);

      const query = `from:KPLUS@kasikornbank.com after:${afterDate}`;

      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 500,
      });

      const messages = response.data.messages || [];
      const emails: { id: string, body: string }[] = [];

      // Process in chunks of 10 to speed up fetching and avoid 10s serverless timeout
      const chunkSize = 10;
      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        
        const chunkPromises = chunk.map(async (msg) => {
          if (!msg.id) return null;
          try {
            const messageDetail = await gmail.users.messages.get({
              userId: "me",
              id: msg.id,
            });

            const payload = messageDetail.data.payload;
            let bodyData = "";

            if (payload?.parts) {
              const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
              const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");

              if (textPart?.body?.data) {
                bodyData = Buffer.from(textPart.body.data, "base64").toString("utf8");
              } else if (htmlPart?.body?.data) {
                bodyData = Buffer.from(htmlPart.body.data, "base64").toString("utf8");
              }
            } else if (payload?.body?.data) {
              bodyData = Buffer.from(payload.body.data, "base64").toString("utf8");
            }

            return { id: msg.id, body: bodyData };
          } catch (err) {
            console.error("Error fetching message", msg.id, err);
            return null;
          }
        });

        const results = await Promise.all(chunkPromises);
        results.forEach(res => {
          if (res) emails.push(res);
        });

        // Small delay between chunks to avoid hitting Google's rate limits
        if (i + chunkSize < messages.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Save to cache
      emailCache[accessToken] = { timestamp: Date.now(), data: emails };
      return emails;
    } catch (error) {
      console.error("Error fetching Gmail:", error);
      return [];
    } finally {
      delete fetchPromise[accessToken];
    }
  })();

  return fetchPromise[accessToken] as Promise<{ id: string, body: string }[]>;
}
