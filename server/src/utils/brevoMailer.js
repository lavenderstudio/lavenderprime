// server/src/utils/brevoMailer.js
// ----------------------------------------------------
// Send transactional emails via Brevo HTTP API
// Works on Render (HTTPS, no SMTP)
// ----------------------------------------------------

import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Safely extract the bare email address from FROM_EMAIL.
 * Supports both:
 *   "Golden Art Frames <hello@goldenartframes.com>"  → hello@goldenartframes.com
 *   "hello@goldenartframes.com"                      → hello@goldenartframes.com
 */
function getSenderEmail() {
  const raw = process.env.FROM_EMAIL || "";
  const match = raw.match(/<([^>]+)>/);
  const email = match ? match[1] : raw.trim();
  if (!email) throw new Error("FROM_EMAIL env var is not set");
  return email;
}


/**
 * Send order confirmation email to the customer
 */
export async function sendOrderConfirmation(order) {
  const toEmail = order?.customer?.email;
  if (!toEmail) throw new Error("Order has no customer email");

  const orderNum = String(order.orderNumber ?? "").padStart(6, "0");
  const senderEmail = getSenderEmail();

  const itemsHtml = order.items
    .map(
      (it) => `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px 6px;font-weight:600;color:#1e293b;">
          ${it.productSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </td>
        <td style="padding:10px 6px;color:#64748b;">${it.variantSku || "—"}</td>
        <td style="padding:10px 6px;color:#64748b;">×${it.config?.quantity || 1}</td>
        <td style="padding:10px 6px;font-weight:700;color:#FF633F;text-align:right;">
          ${it.price?.total ?? ""} ${it.price?.currency ?? ""}
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <div style="background:#0f172a;padding:32px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#FF633F;">
          Order Confirmed ✓
        </p>
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;">
          Thank you, ${order.customer.fullName.split(" ")[0]}!
        </h1>
        <p style="margin:0;font-size:14px;color:#94a3b8;">
          Your order <strong style="color:#fff;">&#35;${orderNum}</strong> has been received and your payment confirmed.
          We're getting started on it right away.
        </p>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">

        <!-- Items -->
        <h3 style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">
          Your Items
        </h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 6px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Product</th>
              <th style="padding:8px 6px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">SKU</th>
              <th style="padding:8px 6px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Qty</th>
              <th style="padding:8px 6px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <!-- Totals -->
        <div style="background:#0f172a;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:3px 0;font-size:13px;color:#94a3b8;">Subtotal</td>
              <td style="padding:3px 0;font-size:13px;color:#94a3b8;text-align:right;">${order.totals.subtotal} ${order.totals.currency}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;font-size:13px;color:#94a3b8;">Shipping</td>
              <td style="padding:3px 0;font-size:13px;color:#94a3b8;text-align:right;">${order.totals.shipping} ${order.totals.currency}</td>
            </tr>
            <tr style="border-top:1px solid #1e293b;">
              <td style="padding:10px 0 0;font-size:16px;font-weight:800;color:#fff;">Total</td>
              <td style="padding:10px 0 0;font-size:20px;font-weight:800;color:#FF633F;text-align:right;">
                ${order.totals.grandTotal} ${order.totals.currency}
              </td>
            </tr>
          </table>
        </div>

        <!-- Shipping Address -->
        <h3 style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">
          Shipping Address
        </h3>
        <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:24px;color:#475569;font-size:14px;line-height:1.7;">
          ${order.shippingAddress?.line1 || ""}<br/>
          ${order.shippingAddress?.line2 ? order.shippingAddress.line2 + "<br/>" : ""}
          ${order.shippingAddress?.city || ""} ${order.shippingAddress?.postcode || ""}<br/>
          ${order.shippingAddress?.country || ""}
        </div>

        <!-- CTA -->
        <p style="margin:0 0 8px;font-size:14px;color:#475569;">
          We'll send you another email once your order is on its way. In the meantime, feel free to reach out.
        </p>
        <a href="https://goldenartframe.com/contact"
           style="display:inline-block;margin-top:12px;background:#FF633F;color:#fff;text-decoration:none;
                  padding:14px 28px;border-radius:8px;font-weight:700;font-size:14px;">
          Contact Support
        </a>

      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #f1f5f9;padding:20px 32px;background:#f8fafc;">
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
          © Golden Art Frames · UAE · <a href="https://goldenartframe.com" style="color:#FF633F;text-decoration:none;">goldenartframes.com</a>
        </p>
      </div>
    </div>
  `;

  await axios.post(
    BREVO_API_URL,
    {
      sender: { name: "Golden Art Frames", email: senderEmail },
      to: [{ email: toEmail }],
      subject: `Order Confirmed — #${orderNum} | Golden Art Frames`,
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
}



/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(toEmail, resetLink) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;">
      <h2 style="color:#FF633F;margin-bottom:8px;">Reset your password</h2>
      <p style="color:#444;margin-bottom:24px;">
        We received a request to reset the password for your Golden Art Frames account.
        Click the button below to choose a new password. This link expires in <b>1 hour</b>.
      </p>
      <a href="${resetLink}"
         style="display:inline-block;background:#FF633F;color:#fff;text-decoration:none;
                padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;">
        Reset Password
      </a>
      <p style="color:#888;margin-top:24px;font-size:13px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
      <p style="color:#bbb;font-size:12px;margin-top:40px;">
        © Golden Art Frames
      </p>
    </div>
  `;

  await axios.post(
    BREVO_API_URL,
    {
      sender: {
        name: "Golden Art Frames",
        email: getSenderEmail(),
      },
      to: [{ email: toEmail }],
      subject: "Reset your Golden Art Frames password",
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Notify the store owner that a new order has been placed.
 * Reads the recipient from process.env.OWNER_EMAIL.
 */
export async function sendOwnerOrderAlert(order) {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn("[brevoMailer] OWNER_EMAIL not set — skipping owner alert");
    return;
  }

  const orderNum = String(order.orderNumber ?? "").padStart(6, "0");
  const senderEmail = getSenderEmail();

  const itemsHtml = order.items
    .map(
      (it) => `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:8px 4px;font-weight:600;color:#1e293b;">${it.productSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td>
        <td style="padding:8px 4px;color:#64748b;">${it.variantSku || "—"}</td>
        <td style="padding:8px 4px;color:#64748b;">×${it.config?.quantity || 1}</td>
        <td style="padding:8px 4px;font-weight:600;color:#FF633F;">${it.price?.total ?? ""} ${it.price?.currency ?? ""}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      
      <!-- Header -->
      <div style="background:#0f172a;padding:28px 32px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:28px;">🛍️</span>
        <div>
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#FF633F;">New Order</p>
          <h1 style="margin:4px 0 0;font-size:22px;color:#fff;font-weight:800;">Order #${orderNum}</h1>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;">

        <!-- Customer -->
        <table style="width:100%;margin-bottom:24px;background:#f8fafc;border-radius:8px;padding:16px;border-collapse:collapse;">
          <tr><td style="padding:4px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;width:130px;">Customer</td><td style="padding:4px 8px;font-weight:600;color:#1e293b;">${order.customer?.fullName || "—"}</td></tr>
          <tr><td style="padding:4px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Email</td><td style="padding:4px 8px;color:#1e293b;">${order.customer?.email || "—"}</td></tr>
          <tr><td style="padding:4px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Phone</td><td style="padding:4px 8px;color:#1e293b;">${order.customer?.phone || "—"}</td></tr>
          <tr><td style="padding:4px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Shipping</td><td style="padding:4px 8px;color:#1e293b;">
            ${order.shippingAddress?.line1 || ""}
            ${order.shippingAddress?.line2 ? ", " + order.shippingAddress.line2 : ""},
            ${order.shippingAddress?.city || ""} ${order.shippingAddress?.postcode || ""},
            ${order.shippingAddress?.country || ""}
          </td></tr>
        </table>

        <!-- Items -->
        <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Items</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:8px 4px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Product</th>
              <th style="padding:8px 4px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">SKU</th>
              <th style="padding:8px 4px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Qty</th>
              <th style="padding:8px 4px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <!-- Totals -->
        <div style="background:#0f172a;border-radius:8px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:13px;font-weight:600;color:#94a3b8;">Subtotal ${order.totals?.subtotal} · Shipping ${order.totals?.shipping} · Tax ${order.totals?.tax}</span>
          <span style="font-size:22px;font-weight:800;color:#FF633F;">${order.totals?.grandTotal} ${order.totals?.currency}</span>
        </div>

      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #f1f5f9;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">Golden Art Frames — Admin Notification</p>
      </div>
    </div>
  `;

  await axios.post(
    BREVO_API_URL,
    {
      sender: { name: "Golden Art Frames Orders", email: senderEmail },
      to: [{ email: ownerEmail }],
      subject: `🛍️ New Order #${orderNum} — ${order.customer?.fullName} (${order.totals?.grandTotal} ${order.totals?.currency})`,
      htmlContent: html,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
}

