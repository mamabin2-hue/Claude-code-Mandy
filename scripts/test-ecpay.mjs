// 綠界金流自我測試：不需真實密鑰，用測試環境驗證整條流程。
// 執行：npm run test:ecpay
//
// 驗證重點：
//   1. 簽章 → 驗章能對上（合法通知會通過）
//   2. 任何欄位被竄改都會被擋下（防偽造，callback 安全核心）
//   3. create-order 產生的訂單參數帶有合法簽章、金額正確
//   4. callback 對合法通知回 "1|OK"、對竄改通知拒絕
//
// 註：與綠界「線上實際比對」的最終確認，仍需部署後在測試環境跑一筆真交易。

import { genCheckMacValue, verifyCheckMacValue } from '../api/ecpay/_lib.js'
import createOrder from '../api/ecpay/create-order.js'
import callback from '../api/ecpay/callback.js'

const TEST_KEY = 'pwFHCqoQZGmho4w6'
const TEST_IV = 'EkRm7iFT261dpevs'

let pass = 0
let fail = 0
const ok = (name, cond) => {
  if (cond) { pass++; console.log('  ✅', name) }
  else { fail++; console.log('  ❌', name) }
}

// 迷你版 res 物件，攔截 handler 的輸出
function mockRes() {
  const r = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) { this.statusCode = code; return this },
    json(obj) { this.body = obj; return this },
    send(str) { this.body = str; return this },
    writeHead(code, headers) { this.statusCode = code; Object.assign(this.headers, headers); return this },
    end() { return this },
  }
  return r
}

console.log('\n[1] 簽章 / 驗章一致性')
const notify = {
  MerchantID: '3002607', MerchantTradeNo: 'MANDY1700000000001',
  RtnCode: '1', RtnMsg: '交易成功', TradeNo: '2504091234567890',
  TradeAmt: '299', PaymentDate: '2026/09/07 12:00:00', PaymentType: 'Credit_CreditCard',
}
notify.CheckMacValue = genCheckMacValue(notify, TEST_KEY, TEST_IV)
ok('合法通知通過驗證', verifyCheckMacValue(notify, TEST_KEY, TEST_IV) === true)
ok('檢查碼為 64 位大寫十六進位', /^[0-9A-F]{64}$/.test(notify.CheckMacValue))

console.log('\n[2] 防竄改')
ok('金額被改 → 驗證失敗', verifyCheckMacValue({ ...notify, TradeAmt: '1' }, TEST_KEY, TEST_IV) === false)
ok('缺少檢查碼 → 驗證失敗', verifyCheckMacValue({ ...notify, CheckMacValue: '' }, TEST_KEY, TEST_IV) === false)

console.log('\n[3] create-order 端點')
const coRes = mockRes()
createOrder({ method: 'POST', headers: { host: 'test.local' }, body: {} }, coRes)
ok('回傳綠界付款網址', typeof coRes.body?.action === 'string' && coRes.body.action.includes('ecpay'))
ok('金額為 299', String(coRes.body?.params?.TotalAmount) === '299')
ok('訂單參數帶合法簽章', verifyCheckMacValue(coRes.body?.params || {}, TEST_KEY, TEST_IV) === true)
ok('GET 會被擋（405）', (() => { const r = mockRes(); createOrder({ method: 'GET', headers: {}, body: {} }, r); return r.statusCode === 405 })())

console.log('\n[4] callback 端點')
const cbRes = mockRes()
await callback({ method: 'POST', headers: { host: 'test.local' }, body: notify }, cbRes)
ok('合法通知回 "1|OK"', cbRes.body === '1|OK')
const cbBad = mockRes()
await callback({ method: 'POST', headers: { host: 'test.local' }, body: { ...notify, TradeAmt: '1' } }, cbBad)
ok('竄改通知被拒絕（非 1|OK）', cbBad.body !== '1|OK')

console.log(`\n結果：${pass} 通過 / ${fail} 失敗\n`)
process.exit(fail === 0 ? 0 : 1)
