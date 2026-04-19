// ════════════════════════════════════════════════════════════════════════════
// POSTMAN – Tab "Tests" của GET request
// ════════════════════════════════════════════════════════════════════════════
//
// Cách dùng:
//   1. Tạo file CSV với 2 cột:  amaze_order_id,status
//      Ví dụ:
//        amaze_order_id,status
//        1001,waiting_confirm_received
//        1002,confirmed
//
//   2. URL của GET request:
//        {{BASE_URL}}/order/api/v2/order/get-order-msg-kafka/?order_input={{amaze_order_id}}&status={{status}}
//      (Postman tự điền {{amaze_order_id}} và {{status}} từ CSV khi chạy Runner)
//
//   3. Paste toàn bộ đoạn script này vào tab Tests của GET request.
//
//   4. Vào Collection Runner → chọn CSV file → Run.
// ════════════════════════════════════════════════════════════════════════════


// ── Đọc iteration data từ CSV ────────────────────────────────────────────────
const orderId = pm.iterationData.get("amaze_order_id");
const status  = pm.iterationData.get("status");

console.log(`[Iteration] order=${orderId}  status=${status}`);

// ── 1. Parse response GET ────────────────────────────────────────────────────
const resp = pm.response.json();

pm.test(`GET order=${orderId} trả về field data`, () => {
    pm.expect(resp).to.have.property("data");
});

if (!resp.data) {
    console.error(`[SKIP] order=${orderId}: Response GET không có field data`);
    // Dừng script vòng lặp này, không POST
} else {
    const dataObj = resp.data;

    // ── 2. Chuẩn bị body POST ────────────────────────────────────────────────
    const postBody = {
        topic: "rsync-order-status",
        data: dataObj
    };

    // ── 3. Gửi POST produce lên Kafka ────────────────────────────────────────
    pm.sendRequest(
        {
            url: "https://api-seller.amaze.shop/order/api/v2/order-kafka/produce",
            method: "POST",
            header: {
                "Content-Type": "application/json",
                "Authorization": pm.request.headers.get("Authorization")
            },
            body: {
                mode: "raw",
                raw: JSON.stringify(postBody)
            }
        },
        (err, res) => {
            if (err) {
                console.error(`[POST ERROR] order=${orderId}:`, err);
            } else {
                console.log(`[POST OK] order=${orderId}  status=${status}  response:`, res.json());

                pm.test(`POST produce order=${orderId} thành công`, () => {
                    pm.expect(res).to.have.property("code", 200);
                });
            }
        }
    );
}
