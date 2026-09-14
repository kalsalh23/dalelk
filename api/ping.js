// فحص جاهزية دوال الإشعارات (تشخيصي)
import { configured, json, missingEnv } from './_push.js'

export default async (req, res) => {
  return json(res, 200, { configured: configured(), missing: configured() ? [] : missingEnv() })
}
