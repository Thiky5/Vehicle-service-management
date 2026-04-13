/**
 * Invoice Print Utility
 * Opens a print window with a formatted invoice for a given vehicle & customer.
 */

export function printInvoice(vehicle, customerName) {
  const items = (vehicle.billableItems || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0;">${item.name}</td>
        <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; text-align:center;">${item.quantity || 1}</td>
        <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; text-align:right;">₹${item.price}</td>
        <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; text-align:right;">₹${(item.price * (item.quantity || 1))}</td>
      </tr>`
    )
    .join("");

  const total = vehicle.totalAmount || 0;
  const date = vehicle.serviceCompletedAt
    ? new Date(vehicle.serviceCompletedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice – ${vehicle.reg}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: #1e293b; background: #fff; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; }
        .brand { font-size: 26px; font-weight: 800; color: #0ea5e9; }
        .invoice-title { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
        .invoice-no { font-size: 20px; font-weight: 700; color: #1e293b; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 36px; }
        .meta-block h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px; }
        .meta-block p { font-size: 15px; font-weight: 600; color: #1e293b; line-height: 1.6; }
        .meta-block span { font-size: 13px; color: #64748b; font-weight: 400; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        thead { background: #f1f5f9; }
        thead th { padding: 12px 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
        thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
        thead th:nth-child(2) { text-align: center; }
        .total-row { display: flex; justify-content: flex-end; margin-top: 10px; }
        .total-box { background: #0ea5e9; color: #fff; padding: 16px 28px; border-radius: 12px; font-size: 20px; font-weight: 700; }
        .total-box span { font-size: 13px; font-weight: 400; display: block; opacity: 0.85; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Vehicle Service Management</div>
          <div style="font-size:13px; color:#64748b; margin-top:4px;">Professional Auto Care</div>
        </div>
        <div style="text-align:right;">
          <div class="invoice-title">Service Invoice</div>
          <div class="invoice-no">#INV-${vehicle.id}-${Date.now().toString().slice(-6)}</div>
          <div style="font-size:13px; color:#64748b; margin-top:4px;">${date}</div>
        </div>
      </div>

      <div class="meta">
        <div class="meta-block">
          <h4>Customer Details</h4>
          <p>${customerName}<br><span>${vehicle.customer}</span></p>
        </div>
        <div class="meta-block">
          <h4>Vehicle Details</h4>
          <p>${vehicle.reg}<br><span>${vehicle.model}</span></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Service Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items || '<tr><td colspan="4" style="padding:20px; text-align:center; color:#94a3b8;">No items found</td></tr>'}
        </tbody>
      </table>

      <div class="total-row">
        <div class="total-box">
          <span>Total Amount</span>
          ₹${total.toLocaleString("en-IN")}
        </div>
      </div>

      <div class="footer">
        <p>Thank you for choosing Vehicle Service Management. Drive safe!</p>
        <p style="margin-top:6px;">This is a system-generated invoice.</p>
      </div>
    </body>
    </html>
  `;

  const win = window.open("", "_blank", "width=800,height=900");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  }
}
