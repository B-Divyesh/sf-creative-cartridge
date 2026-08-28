const apiBase = process.env.SOCIOBOT_API_BASE ?? 'https://api.sociobot.in/api/v1';
const slug = 'creative-cartridge';

const checkout = await fetch(`${apiBase}/products/${slug}/checkout`, {
  method: 'GET',
  redirect: 'manual',
  headers: { Accept: 'text/html,application/xhtml+xml' },
});
const location = checkout.headers.get('location');
if (![302, 303, 307, 308].includes(checkout.status) || !location) {
  throw new Error(`Checkout is unavailable: expected a redirect, received HTTP ${checkout.status}.`);
}

const checkoutUrl = new URL(location);
if (checkoutUrl.protocol !== 'https:' || !/(^|\.)dodopayments\.com$/.test(checkoutUrl.hostname)) {
  throw new Error(`Checkout redirected to an unexpected host: ${checkoutUrl.hostname}.`);
}

const verification = await fetch(`${apiBase}/products/${slug}/verify?license=creative-cartridge-release-smoke-invalid`, {
  headers: { Accept: 'application/json' },
});
const verdict = await verification.json();
if (!verification.ok || verdict.valid !== false || verdict.reason !== 'invalid') {
  throw new Error(`Verifier contract failed: HTTP ${verification.status} ${JSON.stringify(verdict)}.`);
}

console.log(`Billing contract ready: checkout HTTP ${checkout.status} to ${checkoutUrl.hostname}; invalid-license verifier HTTP ${verification.status}.`);
