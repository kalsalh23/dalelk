// نداء دوال RPC على مشروعَي المنصة والعيادة
// بعض دوال المنصة تطلب معامل السرّ (p_secret) وبعضها لا، لذا يُعاد النداء تلقائياً بالسرّ
// عند رفض PostgRest للتوقيع (PGRST202) — حتى لا يتعطل الحجز بسبب اختلاف إصدار القاعدة
import { SUPABASE_URL, SUPABASE_ANON, CLINIC_URL, CLINIC_ANON } from './_push.js'

const BRIDGE_SECRET = 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5'

async function callRpc(base, key, name, payload) {
  try {
    const res = await fetch(`${base}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => null)
    return { ok: res.ok, status: res.status, data, code: data?.code ?? null }
  } catch {
    return { ok: false, status: 0, data: null, code: null }
  }
}

/** نداء دالة على مشروع المنصة مع تكيّف تلقائي مع توقيعها */
export async function platformRpc(name, params = {}) {
  const first = await callRpc(SUPABASE_URL, SUPABASE_ANON, name, params)
  if (!first.ok && first.code === 'PGRST202' && !('p_secret' in params)) {
    return callRpc(SUPABASE_URL, SUPABASE_ANON, name, { ...params, p_secret: BRIDGE_SECRET })
  }
  return first
}

/** نداء دالة محمية على نظام إدارة العيادة (دائماً تتطلب السرّ) */
export async function clinicRpc(name, params = {}) {
  return callRpc(CLINIC_URL, CLINIC_ANON, name, { ...params, p_secret: BRIDGE_SECRET })
}

export { BRIDGE_SECRET }
