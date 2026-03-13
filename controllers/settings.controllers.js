import db from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";

/**
 * GET /api/settings
 * Public — returns the single-row site settings record.
 */
const getSettings = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM site_settings LIMIT 1");
    const settings = rows[0] || {};
    res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    // Expose DB error details so we can diagnose the 500 without reading the terminal
    console.error("[getSettings] DB Error:", error.code, error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
    });
  }
};

/**
 * PUT /api/settings
 * Protected (owner only) — partial update with "keep old value" merge strategy.
 *
 * Flow:
 *  1. Fetch the current row so we always have a fallback for every field.
 *  2. Merge: use the incoming value when non-empty, otherwise keep the existing DB value.
 *  3. Logo: use the new Cloudinary URL when a file was uploaded, else keep old logo_url.
 *  4. Upsert: INSERT if the table is empty, UPDATE the existing row otherwise.
 *
 * This means the caller never needs to send every field — omitted / empty fields
 * simply retain their current database values and the endpoint never returns 400.
 */
const updateSettings = async (req, res, next) => {
  try {
    // ── DEBUG logging ────────────────────────────────────────────
    console.log(
      "[updateSettings] req.files keys:",
      req.files ? Object.keys(req.files) : "none"
    );
    console.log("[updateSettings] req.body keys:", Object.keys(req.body));

    // ── Step 1: fetch existing row ───────────────────────────────
    const [existingRows] = await db.query(
      "SELECT * FROM site_settings LIMIT 1",
    );
    const old = existingRows[0] || {};

    // ── Step 2: merge — incoming non-empty value wins, else keep DB value ──
    const merged = {
      site_name: req.body.site_name?.trim() || old.site_name || "",
      currency_code:
        req.body.currency_code?.trim() || old.currency_code || "USD",
      contact_email: req.body.contact_email?.trim() || old.contact_email || "",
      whatsapp_number:
        req.body.whatsapp_number?.trim() || old.whatsapp_number || "",
      google_analytics_id:
        req.body.google_analytics_id?.trim() || old.google_analytics_id || "",
      google_ads_client_id:
        req.body.google_ads_client_id?.trim() || old.google_ads_client_id || "",
      header_scripts: req.body.header_scripts ?? old.header_scripts ?? "",
      footer_scripts: req.body.footer_scripts ?? old.footer_scripts ?? "",
      social_facebook:
        req.body.social_facebook?.trim() || old.social_facebook || "",
      social_x: req.body.social_x?.trim() || old.social_x || "",
      social_whatsapp:
        req.body.social_whatsapp?.trim() || old.social_whatsapp || "",
      social_telegram:
        req.body.social_telegram?.trim() || old.social_telegram || "",
      social_gmail: req.body.social_gmail?.trim() || old.social_gmail || "",
      wallet_number: req.body.wallet_number?.trim() || old.wallet_number || "",
      instapay_handle: req.body.instapay_handle?.trim() || old.instapay_handle || "",
    };

    // ── Step 3: Brand Assets Resolution ──────────────────────────
    const resolveAsset = (fieldName, dbField, bodyField) => {
      if (req.files?.[fieldName]?.[0]?.path) {
        return req.files[fieldName][0].path;
      }
      if (req.body[bodyField]?.trim()) {
        return req.body[bodyField].trim();
      }
      return old[dbField] || "";
    };

    merged.logo_url = resolveAsset("logo", "logo_url", "logo_url");
    merged.favicon_url = resolveAsset("favicon", "favicon_url", "favicon_url");

    // ── Step 3.5: Cloudinary Cleanup ─────────────────────────────
    const cleanupCloudinary = async (newPath, oldUrl) => {
      if (newPath && oldUrl && oldUrl.includes("cloudinary.com")) {
        try {
          const parts = oldUrl.split("/");
          const filenameWithExt = parts.pop();
          const folder = parts.pop();
          const filename = filenameWithExt.split(".")[0];
          const public_id = `${folder}/${filename}`;

          console.log(`[updateSettings] Deleting old asset: ${public_id}`);
          await cloudinary.uploader.destroy(public_id);
        } catch (err) {
          console.warn("[updateSettings] Cleanup failed:", err.message);
        }
      }
    };

    await cleanupCloudinary(req.files?.logo?.[0]?.path, old.logo_url);
    await cleanupCloudinary(req.files?.favicon?.[0]?.path, old.favicon_url);

    // ── Step 4: upsert ───────────────────────────────────────────
    let dbResult;
    const cols = Object.keys(merged);
    const vals = Object.values(merged);

    if (!old.id) {
      // Empty table — INSERT
      console.log("[updateSettings] Table empty — running INSERT.");
      const colList = cols.join(", ");
      const placeholders = cols.map(() => "?").join(", ");
      [dbResult] = await db.query(
        `INSERT INTO site_settings (${colList}) VALUES (${placeholders})`,
        vals,
      );
    } else {
      // Row exists — UPDATE
      console.log("[updateSettings] Updating row id=%d.", old.id);
      const setClause = cols.map((c) => `${c} = ?`).join(", ");
      [dbResult] = await db.query(
        `UPDATE site_settings SET ${setClause} WHERE id = ?`,
        [...vals, old.id],
      );
    }

    console.log(
      "[updateSettings] DB result → affectedRows:",
      dbResult?.affectedRows,
    );

    // Return the freshly-saved row
    const [rows] = await db.query("SELECT * FROM site_settings LIMIT 1");
    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: rows[0] || {},
    });
  } catch (error) {
    next(error);
  }
};

export { getSettings, updateSettings };
