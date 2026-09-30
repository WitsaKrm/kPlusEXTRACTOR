import { google } from "googleapis";

// Simple in-memory cache to prevent hitting Gmail API rate limits during dev reloads
const emailCache: { [key: string]: { timestamp: number, data: { id: string, body: string }[] } | undefined } = {};
const fetchPromise: { [key: string]: Promise<{ id: string, body: string }[]> | undefined } = {};
const fetchAttempts: { [key: string]: number } = {};
const GMAIL_TIMEOUT_MS = 20000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  return new Promise<T>((resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

export async function fetchKPlusEmails(accessToken: string, forceRefresh: boolean = false): Promise<{ id: string, body: string }[]> {
  if (!accessToken) {
    throw new Error("Missing Gmail access token. Please sign in again.");
  }

  // Return cached data unless user explicitly requested a refresh
  if (!forceRefresh && emailCache[accessToken]) {
    return emailCache[accessToken].data;
  }

  const attemptCount = (fetchAttempts[accessToken] ?? 0) + 1;
  fetchAttempts[accessToken] = attemptCount;
  console.log(`[Gmail] fetch attempt ${attemptCount} for access token`, accessToken.slice(-8));

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

      const response = await withTimeout(
        gmail.users.messages.list({
          userId: "me",
          q: query,
          maxResults: 100, // 3 months of KPLUS notifications, ~20/month max
        }),
        GMAIL_TIMEOUT_MS,
        "Gmail list request"
      );

      const messages = response.data.messages || [];
      const emails: { id: string, body: string }[] = [];
      const seenMessageIds = new Set<string>();

      // Sequential fetching (1 at a time) to avoid Gmail quota limits
      for (const msg of messages) {
        if (!msg.id || seenMessageIds.has(msg.id)) continue;
        seenMessageIds.add(msg.id);

        try {
          const messageDetail = await withTimeout(
            gmail.users.messages.get({
              userId: "me",
              id: msg.id,
            }),
            GMAIL_TIMEOUT_MS,
            `Gmail message ${msg.id}`
          );

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

          emails.push({ id: msg.id, body: bodyData });
        } catch (error) {
          console.error("Error fetching message", msg.id, error);
        }
        // 100ms between each request for faster loading while staying under Gmail quota limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const dedupedEmails = Array.from(new Map(emails.map((email) => [email.id, email])).values());
      console.log(`[Gmail] fetched ${dedupedEmails.length} unique emails`);

      // Save to cache
      emailCache[accessToken] = { timestamp: Date.now(), data: dedupedEmails };
      return dedupedEmails;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Gmail fetch error";
      console.error("Error fetching Gmail:", message);
      emailCache[accessToken] = { timestamp: Date.now(), data: [] };
      throw error;
    } finally {
      delete fetchPromise[accessToken];
    }
  })();

  return fetchPromise[accessToken] as Promise<{ id: string, body: string }[]>;
}
