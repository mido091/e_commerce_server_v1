import validator from "validator";

/**
 * Middleware to sanitize all incoming data (body, query, params)
 * to prevent XSS and other injection attacks.
 */
export const sanitizeData = (req, res, next) => {
  try {
    // Fields in this list are skipped from HTML escaping (still trimmed if strings).
    const escapeWhitelist = [
      "header_scripts",
      "footer_scripts",
      "description",
      "description_ar",
      "specs_en",
      "specs_ar",
      "google_analytics_id",
      "google_ads_client_id"
    ];

    // Fields that should only be trimmed — NOT HTML-escaped (e.g. emails, URLs, image paths)
    const trimOnlyFields = [
      "email",
      "existingImage",
      "image",
      "logo",
      "favicon",
      "redirect_url",
      "url",
      "website",
    ];

    const sanitize = (data, key = null) => {
      // 1. Skip entirely if key is in the full-escape whitelist (raw HTML allowed)
      if (key && escapeWhitelist.includes(key)) {
        return data;
      }

      // 2. Strings
      if (typeof data === "string") {
        // Trim-only fields (emails, URLs, image paths) — do NOT HTML-escape
        if (key && trimOnlyFields.includes(key)) {
          return data.trim();
        }
        // Everything else: trim + HTML-escape to prevent XSS
        return validator.escape(data.trim());
      }

      // 3. Arrays: Recurse
      if (Array.isArray(data)) {
        return data.map((item) => sanitize(item));
      }

      // 4. Objects: Recurse (Plain objects only)
      if (typeof data === "object" && data !== null) {
        if (data.constructor && data.constructor.name !== "Object" && data.constructor.name !== "Array") {
          return data;
        }

        const sanitizedObj = {};
        for (const k in data) {
          if (Object.prototype.hasOwnProperty.call(data, k)) {
            sanitizedObj[k] = sanitize(data[k], k);
          }
        }
        return sanitizedObj;
      }

      return data;
    };

    if (req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = sanitize(req.body);
      Object.assign(req.body, sanitizedBody);
    }
    if (req.query && Object.keys(req.query).length > 0) {
      const sanitizedQuery = sanitize(req.query);
      // Note: Reassigning query is often forbidden on Vercel, Object.assign is safer
      Object.assign(req.query, sanitizedQuery);
    }
    if (req.params && Object.keys(req.params).length > 0) {
      const sanitizedParams = sanitize(req.params);
      Object.assign(req.params, sanitizedParams);
    }

    next();
  } catch (error) {
    console.error("Sanitization Error:", error);
    // Continue even if sanitization fails - better to be slightly less secure than completely broken
    next();
  }
};
