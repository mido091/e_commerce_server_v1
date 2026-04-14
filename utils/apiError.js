export function sendError(res, status, code, message, extra = {}) {
  return res.status(status).json({
    success: false,
    code,
    message,
    ...extra,
  });
}

export function sendSuccess(res, status, payload = {}) {
  return res.status(status).json({
    success: true,
    ...payload,
  });
}
