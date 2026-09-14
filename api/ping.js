// فحص جاهزية دوال الإشعارات (تشخيصي)
const { configured, json, missingEnv } = require('./_push')

module.exports = async (req, res) => {
  return json(res, 200, { configured: configured(), missing: configured() ? [] : missingEnv() })
}
