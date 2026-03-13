/**
 * UploadController handles any logic that needs to happen after a successful file upload,
 * or provides standalone upload endpoints if they aren't tied to a specific resource.
 */

import { fileTypeFromBuffer } from "file-type";
import fs from "fs";

export const handleAvatarUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // NOTE: If using CloudinaryStorage from multer-storage-cloudinary, the file might 
  // not be available as a buffer if it's streamed directly. 
  // However, we can use a small trick by checking the file type if it was stored locally
  // but since it's Cloudinary, we trust the `allowed_formats` in the storage config for now,
  // OR we can fetch a small chunk of the file if we wanted to be extremely paranoid.
  // For this implementation, we will assume standard Multer buffer if available,
  // or rely on Cloudinary's built-in validation which we configured in upload.js.

  return res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    url: req.file.path,
    public_id: req.file.filename,
  });
};

export const handleBulkUpload = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const fileUrls = req.files.map(file => ({
    url: file.path,
    public_id: file.filename
  }));

  return res.status(200).json({
    success: true,
    message: "Files uploaded successfully",
    data: fileUrls
  });
};
