import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Cloudinary configuration applied
cloudinary.config({
  cloud_name: process.env.CLD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// Storage configuration with random UUIDs for public_id
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "users_ecommerce",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
    public_id: (req, file) => `avatar_${crypto.randomUUID()}`,
  },
});

import { fileTypeFromBuffer } from "file-type";

const fileFilter = async (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error("Invalid file type. Only JPEG, PNG, and WEBP images are allowed.");
    error.status = 400;
    return cb(error, false);
  }

  cb(null, true);
};

// We will add a post-upload middleware for buffer validation since Multer's fileFilter 
// only has access to the stream metadata, not the full buffer if using Cloudinary directly.
// However, we can use a separate middleware after upload to verify.

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

export default upload;

// ── Logo-specific uploader for Site Settings ──────────────────
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "settings_logos",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    resource_type: "image",
    public_id: (req, file) => `logo_${crypto.randomUUID()}`,
    transformation: [{ width: 800, crop: "limit" }],
  },
});

export const logoUpload = multer({
  storage: logoStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max for logo
});
