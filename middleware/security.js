function sanitizeInput(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
      }
    }
  }
  next();
}

function preventParamPollution(req, _res, next) {
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key])) req.query[key] = req.query[key][0];
    }
  }
  next();
}

module.exports = { sanitizeInput, preventParamPollution };