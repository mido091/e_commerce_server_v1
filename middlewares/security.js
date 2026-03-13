import rateLimit from "express-rate-limit";

// Generic rate limiter for API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Significantly increased to prevent Lighthouse throttling
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Stricter rate limiter for Auth routes (Login, Register)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Increased for development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after an hour",
  },
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Increased for development testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Upload limit reached, please try again after an hour",
  },
});
// Custom CSRF Protection layer: Verify a custom header exists for all write operations.
// This prevents cross-site requests as an attacker cannot set custom headers cross-origin via simple forms.
export const csrfCheck = (req, res, next) => {
  const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];
  
  // Skip GET/OPTIONS or if request is from mobile/curl (no origin)
  if (!writeMethods.includes(req.method)) return next();
  
  // We check for X-Requested-With which is standard for preventing CSRF on APIs
  if (!req.headers["x-requested-with"]) {
    return res.status(403).json({
      success: false,
      message: "Security violation: Missing standard request header (CSRF protection)",
    });
  }
  
  next();
};
