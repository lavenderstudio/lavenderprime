// server/src/utils/mailer.js
// ----------------------------------------------------
// Nodemailer SMTP mailer
// - Reusable transporter
// - sendOrderConfirmation(order): sends customer email
// ----------------------------------------------------

import nodemailer from "nodemailer";

/**
 * Create a reusable SMTP transporter.
 * IMPORTANT: These values come from your email provider (Brevo/SendGrid/Mailgun/etc.)
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Build a simple HTML email.
 * Keep it short + clear. Avoid putting sensitive info.
 */
function buildOrderEmailHtml(order) {
  const itemsHtml = (order.items || [])
    .map((it) => {
      const qty = it.config?.quantity || 1;
      const frame = it.config?.frame ? ` • Frame: ${it.config.frame}` : "";
      const mat = it.config?.mat ? ` • Mat: ${it.config.mat}` : "";

      return `
        <li style="margin-bottom:8px;">
          <b>${it.productSlug}</b> (${it.variantSku}) — Qty ${qty}${frame}${mat}
        </li>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.4;">
      <h2>Thanks for your order, ${order.customer?.fullName || "Customer"}!</h2>

      <p>
        We’ve received your payment and your order is now confirmed.
      </p>

      <p><b>Order ID:</b> ${order._id}</p>

      <h3>Items</h3>
      <ul>
        ${itemsHtml}
      </ul>

      <h3>Total</h3>
      <p>
        <b>${order.totals?.grandTotal ?? order.totals?.subtotal} ${order.totals?.currency}</b>
      </p>

      <h3>Shipping Address</h3>
      <p>
        ${order.shippingAddress?.line1 || ""}<br/>
        ${order.shippingAddress?.line2 ? `${order.shippingAddress.line2}<br/>` : ""}
        ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.postcode || ""}<br/>
        ${order.shippingAddress?.country || ""}
      </p>

      <p style="margin-top:20px;color:#666;font-size:12px;">
        If you have any questions, reply to this email.
      </p>
    </div>
  `;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(order) {
  // Basic safety checks
  const to = order?.customer?.email;
  if (!to) throw new Error("Order has no customer email");

  const subject = `Order confirmed — ${order._id}`;

  const html = buildOrderEmailHtml(order);

  // ✅ Send
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
}
