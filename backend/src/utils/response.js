// Formato unico de respuesta para toda la API.
export const sendSuccess = (res, data = {}, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

export const sendError = (res, statusCode, message, details = null) => {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};
