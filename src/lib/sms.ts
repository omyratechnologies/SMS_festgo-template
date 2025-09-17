// lib/sms.ts
import axios from "axios";

const SMS_API_URL = process.env.SMS_API_URL || "https://smslogin.co/v3/api.php";
const SMS_USERNAME = process.env.SMS_USERNAME;
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_SENDER = process.env.SMS_SENDER;
const SMS_TEMPLATE_ID = process.env.SMS_TEMPLATE_ID;

if (!SMS_USERNAME || !SMS_API_KEY || !SMS_SENDER || !SMS_TEMPLATE_ID) {
  console.warn("⚠️ Missing SMS env vars (check .env.local)");
}

export function normalizePhoneNumber(raw: string): string {
  if (!raw) return raw;
  const s = raw.replace(/\s+/g, "").trim();
  if (s.startsWith("+91")) return s.slice(1);
  if (/^\d{10}$/.test(s)) return `91${s}`;
  if (/^91\d{10}$/.test(s)) return s;
  return s;
}

export type SendSMSResult = {
  ok: boolean;
  providerResponse?: unknown;
  error?: string;
  campid?: string; // Add campid for reference
};

export async function sendSMS(
  toRaw: string,
  message: string
): Promise<SendSMSResult> {
  try {
    const to = normalizePhoneNumber(toRaw);

    const params = new URLSearchParams({
      username: SMS_USERNAME || "",
      apikey: SMS_API_KEY || "",
      senderid: SMS_SENDER || "",
      mobile: to,
      message, // MUST match DLT template exactly
      templateid: SMS_TEMPLATE_ID || "",
    });

    const url = `${SMS_API_URL}?${params.toString()}`;

    const resp = await axios.get(url, { timeout: 10000 });
    const data = resp.data;

    console.log("📨 SMS API response:", data); // <-- log response for debugging

    let success = false;
    let campid: string | undefined;

    if (typeof data === "string") {
      // Check for various success indicators in string responses
      success =
        data.includes("MessageId") ||
        data.includes("success") ||
        data.includes("campid") ||
        data.includes("{'campid':");

      // Try to parse if it looks like a JSON string
      if (data.includes("{'campid':") || data.includes('{"campid":')) {
        try {
          // Handle Python-style single quotes by converting to double quotes
          const jsonStr = data.replace(/'/g, '"');
          const parsed = JSON.parse(jsonStr);
          if (parsed.campid) {
            success = true;
            campid = parsed.campid;
          }
        } catch (e) {
          // If parsing fails, fall back to string check
          success = data.includes("campid");
          // Try to extract campid with regex as fallback
          const campidMatch = data.match(/campid['"]:['"]([^'"]+)['"]/);
          if (campidMatch) {
            campid = campidMatch[1];
          }
        }
      }
    } else if (typeof data === "object" && data !== null) {
      // JSON style response
      success =
        data.ErrorCode === "000" ||
        data.ErrorMessage?.toLowerCase().includes("success") ||
        data.campid !== undefined; // Check for campid in object responses

      if (data.campid) {
        campid = data.campid;
      }
    }

    const result: SendSMSResult = {
      ok: success,
      providerResponse: data,
    };

    if (campid) {
      result.campid = campid;
    }

    return result;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
