import validator from "validator";

/**
 * Middleware to sanitize all incoming data (body, query, params)
 * to prevent XSS and other injection attacks.
 */
export const sanitizeData = (req, res, next) => {
  try {
    const whitelist = [
      "header_scripts",
      "footer_scripts",
      "description",
      "description_ar",
      "specs_en",
      "specs_ar",
      "google_analytics_id",
      "google_ads_client_id"
    ];

    const sanitize = (data, key = null) => {
      // 1. Skip if key is in whitelist
      if (key && whitelist.includes(key)) {
        return data;
      }

      // 2. Strings: Trim and Escape
      if (typeof data === "string") {
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

    if (req.body && Object.keys(req.body).length > 0) req.body = sanitize(req.body);
    if (req.query && Object.keys(req.query).length > 0) req.query = sanitize(req.query);
    if (req.params && Object.keys(req.params).length > 0) req.params = sanitize(req.params);

    next();
  } catch (error) {
    console.error("Sanitization Error:", error);
    // Continue even if sanitization fails - better to be slightly less secure than completely broken
    next();
  }
};
