/**
 * send-order-kafka.js
 *
 * Đọc file CSV (amaze_order_id, status), gọi GET để lấy message kafka,
 * rồi POST lên topic "rsync-order-status".
 *
 * Yêu cầu: Node.js >= 18 (built-in fetch) hoặc tự cài node-fetch v2
 *
 * Cách chạy:
 *   node scripts/send-order-kafka.js                         # dùng file CSV mặc định
 *   node scripts/send-order-kafka.js scripts/orders_input.csv
 *
 * Biến môi trường:
 *   AMAZE_TOKEN=<Bearer token>  (nếu không set thì dùng token hardcode bên dưới)
 */

import fs   from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL   = 'https://api-seller.amaze.shop'
const GET_PATH   = '/order/api/v2/order/get-order-msg-kafka/'
const POST_PATH  = '/order/api/v2/order-kafka/produce'
const TOPIC      = 'rsync-order-status'

/** Ưu tiên biến môi trường AMAZE_TOKEN, fallback token cứng */
const BEARER_TOKEN = process.env.AMAZE_TOKEN ||
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQSGxQSXZJa1ZKNjVCemlnUDZLMnJTZGRZY0dHdmRveW5IME9PX2hadXh3In0.eyJleHAiOjE3NjY1NzI1MTEsImlhdCI6MTc2NjQ4NjExMSwianRpIjoiYjI0NzM3YWYtMTY3ZS00NWMxLWFiODktZTMyMGRjYjdmNWI3IiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5hcGktc2VsbGVyLmFtYXplLnNob3AvcmVhbG1zL2FtYXplLXNlbGxlciIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJkYzlmZDBmNS1kZTJiLTQ3ZTAtODkyYS1lMWY4YWEyMjQ5NDciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzZWxsZXItY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6ImNmYTIzY2QwLTJjNDItNDMzNC1iNTBiLTkxM2JiNmE0Y2VjYSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYW1hemUtc2VsbGVyIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgb2ZmbGluZV9hY2Nlc3MiLCJzaWQiOiJjZmEyM2NkMC0yYzQyLTQzMzQtYjUwYi05MTNiYjZhNGNlY2EiLCJjb21wYW55X3RheF9pZCI6IjExNjExOSIsInNob3BfaWQiOiI0MDZhNmJmMS02MTI1LTRiZWQtOTc0Yi02NGQ4YmEwYzVjOTUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJkZmV5ZGZ3bXg3NjlrNzMgYXc2ODhycHR1NzBlaHZmIiwicGhvbmVfbnVtYmVyIjoiMDgxOTY1OTE2NCIsInByZWZlcnJlZF91c2VybmFtZSI6InB2dF9pbmdpbmdzaG9wIiwiZ2l2ZW5fbmFtZSI6ImRmZXlkZndteDc2OWs3MyIsImZhbWlseV9uYW1lIjoiYXc2ODhycHR1NzBlaHZmIiwic2hvcF9hbWF6ZV9pZCI6IjExNiIsImVtYWlsIjoiaGlydXNzMis5MzMxQGdtYWlsLmNvbSJ9.b52AyyUpb-WQycfm7uhTYj7OAnnFyGDobzqA5pRG4K8763rUKIVRbGEPsmujUWA8gs6pEDfCWxNhApgckcTY9ElU1GSeHsv6kuDKYT5cMxPoRzUYFbh0bZcdBjXyT-FaGR4Dx6o4FhwJTNUqCHnDOersKOwjvSTGYWkDDP9JTPHYoCQtrKF9eOZaH0XRpOn9uqg6oVhQgdYCmS0sF0Ca5BOc_NTHzfmerLON7L8ILno6qfUG6QfwYEjJ3OKCodhupZODdEviJm48gfmvnXTyK5LVO72E6PeaKReyFVf-bXJjFyRE4djoNfPN4WIjRHNx6FOLi1FC0vr0SdkFWWRKLg'

const CSV_FILE = process.argv[2] ?? path.resolve('scripts/orders_input.csv')

// ─── Helpers ─────────────────────────────────────────────────────────────────

const authHeaders = {
  'Authorization': `Bearer ${BEARER_TOKEN}`,
  'Content-Type': 'application/json',
}

/**
 * Đọc CSV đơn giản: dòng đầu là header, các cột cách nhau bằng dấu phẩy.
 * Trả về mảng object { [header]: value }.
 */
async function readCsv(filePath) {
  const rows = []
  const rl = readline.createInterface({
    input: fs.createReadStream(path.resolve(filePath)),
    crlfDelay: Infinity,
  })

  let headers = null
  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const cols = trimmed.split(',').map(c => c.trim())
    if (!headers) {
      headers = cols
    } else {
      const row = {}
      headers.forEach((h, i) => { row[h] = cols[i] ?? '' })
      rows.push(row)
    }
  }
  return rows
}

/**
 * Bước 1 – GET lấy kafka message cho một order.
 * @param {string} orderId
 * @param {string} status
 */
async function getOrderMsg(orderId, status) {
  const url = `${BASE_URL}${GET_PATH}?order_input=${encodeURIComponent(orderId)}&status=${encodeURIComponent(status)}`
  const res = await fetch(url, { headers: authHeaders })
  if (!res.ok) {
    throw new Error(`GET ${url} → HTTP ${res.status}`)
  }
  const body = await res.json()
  if (!body.data) {
    throw new Error(`GET response không có field "data" (order=${orderId})`)
  }
  return body.data
}

/**
 * Bước 2 – POST produce lên Kafka.
 * @param {*} dataObj  object trả về từ bước GET
 */
async function produceKafka(dataObj) {
  const url = `${BASE_URL}${POST_PATH}`
  const payload = { topic: TOPIC, data: dataObj }
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${url} → HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📄 Đọc CSV: ${CSV_FILE}`)
  const rows = await readCsv(CSV_FILE)

  if (rows.length === 0) {
    console.warn('⚠️  CSV không có dòng dữ liệu nào.')
    return
  }

  if (!rows[0].amaze_order_id || !rows[0].status) {
    throw new Error('CSV phải có cột "amaze_order_id" và "status"')
  }

  console.log(`✅ Tìm thấy ${rows.length} dòng\n`)

  let success = 0
  let failed  = 0

  for (const [i, row] of rows.entries()) {
    const { amaze_order_id, status } = row
    const label = `[${i + 1}/${rows.length}] order=${amaze_order_id} status=${status}`

    try {
      console.log(`⏳ ${label} – GET...`)
      const dataObj = await getOrderMsg(amaze_order_id, status)

      console.log(`⏳ ${label} – POST produce...`)
      const result = await produceKafka(dataObj)

      console.log(`✅ ${label} – OK`, JSON.stringify(result))
      success++
    } catch (err) {
      console.error(`❌ ${label} – FAILED: ${err.message}`)
      failed++
    }

    console.log('')
  }

  console.log(`\n─── Kết quả ───`)
  console.log(`  Thành công : ${success}`)
  console.log(`  Thất bại   : ${failed}`)
  console.log(`  Tổng cộng  : ${rows.length}`)
}

main().catch(err => {
  console.error('\n💥 Lỗi không xử lý được:', err)
  process.exit(1)
})
