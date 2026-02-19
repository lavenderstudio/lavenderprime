// server/src/utils/brevoMailer.js
// ----------------------------------------------------
// Send transactional emails via Brevo HTTP API
// Works on Render (HTTPS, no SMTP)
// ----------------------------------------------------

import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(order) {
  const toEmail = order?.customer?.email;
  if (!toEmail) throw new Error("Order has no customer email");

  const itemsHtml = order.items
    .map(
      (it) => `
        <li>
          <b>${it.productSlug.toUpperCase()}</b> (${it.variantSku})<br/>
          Qty: ${it.config?.quantity || 1}
          ${it.config?.frame ? ` • Frame: ${it.config.frame}` : ""}
          ${it.config?.mat ? ` • Mat: ${it.config.mat}` : ""}
          ${it.config?.material ? ` • Material: ${it.config.material}` : ""}
        </li>
      `
    )
    .join("");

  const html = `
    <h2>Thanks for your order, ${order.customer.fullName}</h2>
    <p>Your payment has been confirmed.</p>

    <p><b>Order ID:</b> ${order._id}</p>
    <p><b>Order Number:</b> ${String(order.orderNumber ?? "").padStart(6, "0")}</p>

    <h3>Items</h3>
    <ul>${itemsHtml}</ul>

    <h3>Total</h3>
    <p><b>${order.totals.grandTotal} ${order.totals.currency}</b></p>

    <h3>Shipping Address</h3>
		<p>
			${order.shippingAddress?.line1 || ""}<br/>
			${order.shippingAddress?.line2 ? `${order.shippingAddress.line2}<br/>` : ""}
			${order.shippingAddress?.city || ""}, ${order.shippingAddress?.postcode || ""}<br/>
			${order.shippingAddress?.country || ""}
		</p>

    <p>We’ll notify you once your order is fulfilled.</p>
  `;

  await axios.post(
    BREVO_API_URL,
    {
      sender: {
        name: "Golden Art Frames",
        email: process.env.FROM_EMAIL.match(/<(.*)>/)[1],
      },
      to: [{ email: toEmail }],
      subject: `Order confirmed — ${order._id}`,
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
        email: process.env.FROM_EMAIL.match(/<(.*)>/)[1],
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
