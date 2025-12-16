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
          <b>${it.productSlug}</b> (${it.variantSku})<br/>
          Qty: ${it.config?.quantity || 1}
          ${it.config?.frame ? ` • Frame: ${it.config.frame}` : ""}
          ${it.config?.mat ? ` • Mat: ${it.config.mat}` : ""}
        </li>
      `
    )
    .join("");

  const html = `
    <h2>Thanks for your order, ${order.customer.fullName}</h2>
    <p>Your payment has been confirmed.</p>

    <p><b>Order ID:</b> ${order._id}</p>

    <h3>Items</h3>
    <ul>${itemsHtml}</ul>

    <h3>Total</h3>
    <p><b>${order.totals.grandTotal} ${order.totals.currency}</b></p>

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
