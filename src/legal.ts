import './styles.css';

const isPrivacy = location.pathname.startsWith('/privacy');
const target = document.querySelector<HTMLDivElement>('#legal');
if (!target) throw new Error('Legal page could not start.');

target.innerHTML = isPrivacy ? `
  <main id="main" class="legal">
    <header><p class="kicker">The plain-language edition · Updated 28 August 2026</p><h1>Privacy</h1></header>
    <p><strong>Creative Cartridge does not collect child data.</strong> There are no accounts, ads, trackers, analytics, social features, or third-party runtime scripts.</p>
    <h2>What stays on this device</h2>
    <p>Drawings, activity pieces, the parent PIN hash, selected activities, sound preference, and purchase license are stored locally in this browser. Creative work uses IndexedDB; preferences and the license use localStorage. We cannot see or recover them.</p>
    <h2>What can leave the device</h2>
    <p>A parent can export a JSON file. It leaves only when the parent chooses where to save or share it. When a license is entered, the license token is sent to Sociobot’s billing API to check whether it is valid. The creative work and PIN are never sent.</p>
    <h2>Purchases</h2>
    <p>Sociobot/Dodo is the merchant of record and handles payment information on its hosted checkout. Creative Cartridge never receives card details. See the checkout provider’s notices before paying.</p>
    <h2>Your choices</h2>
    <p>The parent desk can export or permanently clear all saved pieces. Clearing browser site data also removes everything, including the locally stored license; keep the license token to restore it.</p>
    <h2>Contact</h2>
    <p>Questions can be sent to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p>
    <p><a href="/">Return to Creative Cartridge</a> · <a href="/terms/">Read the terms</a></p>
  </main>` : `
  <main id="main" class="legal">
    <header><p class="kicker">The plain-language edition · Updated 28 August 2026</p><h1>Terms</h1></header>
    <p>Creative Cartridge is a finite creative play space for family use. A parent or guardian should install and configure it for a child.</p>
    <h2>Parent PIN</h2>
    <p>The PIN is a convenience that separates child play from settings. It is not a security boundary and does not replace an operating-system child account, supervision, or browser controls.</p>
    <h2>Your work and backups</h2>
    <p>Creative pieces stay in this browser. Browser cleanup, device failure, or uninstalling may erase them. Use the parent export when you want a backup. You retain rights to the things you make.</p>
    <h2>Weekend Ink purchase</h2>
    <p>Weekend Ink is a $6 USD one-time purchase that unlocks extra prompts and paper stamps on one or more devices using a license token. Sociobot/Dodo is the merchant of record and handles checkout and refunds. A refund or charge reversal revokes the license. Core activities, export, safety, and accessibility remain free.</p>
    <h2>No warranty</h2>
    <p>The software is provided “as is” under the MIT License. Audio starts only after interaction, but caregivers should set a comfortable device volume. Do not rely on this app as internet filtering or device security.</p>
    <h2>Fair use</h2>
    <p>Do not attempt to disrupt the hosted licensing service or redistribute a purchased license. You may inspect, modify, and redistribute the open-source application under its license.</p>
    <p><a href="/">Return to Creative Cartridge</a> · <a href="/privacy/">Read privacy</a></p>
  </main>`;
