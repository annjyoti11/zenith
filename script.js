(() => {
  'use strict';
  const PHONE = '918402933536';
  const DISPLAY_PHONE = '8402933536';

  const header = document.querySelector('.site-header');
  const menuBtn = document.querySelector('.menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }));
  }

  function track(eventName, details = {}) {
    const payload = { event: eventName, page: location.pathname, ...details };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent('zenith:track', { detail: payload }));
  }
  window.zenithTrack = track;

  function decodeWhatsAppText(href) {
    try {
      const u = new URL(href, location.href);
      return u.searchParams.get('text') || '';
    } catch (_) { return ''; }
  }

  function inferInterest(anchor, preset) {
    const text = `${anchor.textContent || ''} ${preset || ''}`.toLowerCase();
    const map = [
      ['12-month', 'Membership — 12 Months'], ['12 month', 'Membership — 12 Months'],
      ['6-month', 'Membership — 6 Months'], ['6 month', 'Membership — 6 Months'],
      ['3-month', 'Membership — 3 Months'], ['3 month', 'Membership — 3 Months'],
      ['1-month', 'Membership — 1 Month'], ['1 month', 'Membership — 1 Month'],
      ['personal training', 'Personal Training'], ['book pt', 'Personal Training'],
      ['30-day', '30-Day Transformation'], ['30 day', '30-Day Transformation'],
      ["women's transformation", "Women's Transformation"], ['women', "Women's Transformation"],
      ['body recomposition', 'Body Recomposition'], ['recomposition', 'Body Recomposition'],
      ['muscle gain', 'Muscle Gain'], ['fat loss', 'Fat Loss'],
      ['membership', 'Gym Membership'], ['join', 'Gym Membership'],
      ['visit', 'Gym Visit'], ['get started', 'General Enquiry'], ['goal', 'Goal Consultation']
    ];
    for (const [needle, label] of map) if (text.includes(needle)) return label;
    return anchor.dataset.interest || 'General Enquiry';
  }

  const modalHTML = `
  <div class="enquiry-modal" id="zenith-enquiry" hidden>
    <div class="enquiry-backdrop" data-close-enquiry></div>
    <section class="enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
      <button class="enquiry-close" type="button" aria-label="Close enquiry form" data-close-enquiry>×</button>
      <p class="kicker">QUICK ENQUIRY</p>
      <h2 id="enquiry-title">TELL US YOUR GOAL.</h2>
      <p class="enquiry-intro">Share a few details and we’ll open WhatsApp with a ready-to-send message for Zenith Fitness Hub.</p>
      <form class="enquiry-form" id="zenith-enquiry-form">
        <input type="hidden" name="interest" id="enquiry-interest" value="General Enquiry">
        <div class="enquiry-grid">
          <div class="enquiry-field"><label for="enquiry-name">Name *</label><input id="enquiry-name" name="name" autocomplete="name" required></div>
          <div class="enquiry-field"><label for="enquiry-phone">Phone / WhatsApp *</label><input id="enquiry-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required pattern="[0-9+() -]{7,18}"></div>
        </div>
        <div class="enquiry-grid">
          <div class="enquiry-field"><label for="enquiry-goal">Primary goal *</label><select id="enquiry-goal" name="goal" required><option value="">Choose a goal</option><option>Fat Loss</option><option>Muscle Gain</option><option>Body Recomposition</option><option>Strength & Fitness</option><option>Women's Transformation</option><option>Personal Training</option><option>Not sure — need guidance</option></select></div>
          <div class="enquiry-field"><label for="enquiry-time">Preferred workout time</label><select id="enquiry-time" name="time"><option value="">Flexible / Not sure</option><option>6:00–8:00 AM</option><option>8:00–10:00 AM</option><option>10:00 AM–12:00 PM</option><option>4:00–6:00 PM</option><option>6:00–8:00 PM</option><option>8:00–10:30 PM</option></select></div>
        </div>
        <div class="enquiry-field"><label for="enquiry-notes">Anything we should know?</label><textarea id="enquiry-notes" name="notes" placeholder="Training experience, preferred package, questions, etc."></textarea></div>
        <div class="enquiry-actions"><button class="enquiry-submit" type="submit">Continue on WhatsApp →</button><a class="enquiry-call" href="tel:+918402933536">Call ${DISPLAY_PHONE}</a></div>
        <p class="enquiry-note">Your details stay on your device until you choose to send the message in WhatsApp. This website does not store the form submission.</p>
      </form>
    </section>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('zenith-enquiry');
  const form = document.getElementById('zenith-enquiry-form');
  const interestInput = document.getElementById('enquiry-interest');
  const nameInput = document.getElementById('enquiry-name');
  let lastFocus = null;

  function openEnquiry(interest = 'General Enquiry') {
    lastFocus = document.activeElement;
    interestInput.value = interest;
    modal.hidden = false;
    document.body.classList.add('enquiry-open');
    setTimeout(() => nameInput.focus(), 0);
    track('enquiry_open', { interest });
  }
  function closeEnquiry() {
    modal.hidden = true;
    document.body.classList.remove('enquiry-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  window.openZenithEnquiry = openEnquiry;

  modal.querySelectorAll('[data-close-enquiry]').forEach(el => el.addEventListener('click', closeEnquiry));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeEnquiry(); });

  document.querySelectorAll('a[href*="wa.me/918402933536"]').forEach(anchor => {
    const preset = decodeWhatsAppText(anchor.href);
    if (!preset && !anchor.classList.contains('primary') && !anchor.classList.contains('desktop-join')) return;
    anchor.addEventListener('click', e => {
      e.preventDefault();
      openEnquiry(inferInterest(anchor, preset));
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const goal = String(fd.get('goal') || '').trim();
    const time = String(fd.get('time') || '').trim() || 'Flexible / Not sure';
    const notes = String(fd.get('notes') || '').trim();
    const interest = String(fd.get('interest') || 'General Enquiry').trim();
    const lines = [
      'Hi Zenith Fitness Hub,',
      '',
      `I’m ${name} and I’d like to enquire about: ${interest}.`,
      `My goal: ${goal}`,
      `Preferred workout time: ${time}`,
      `My phone/WhatsApp: ${phone}`
    ];
    if (notes) lines.push(`Additional details: ${notes}`);
    lines.push('', 'Please guide me with the best next step.');
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
    track('lead_submit_whatsapp', { interest, goal, preferred_time: time });
    window.open(url, '_blank', 'noopener');
    closeEnquiry();
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(a => a.addEventListener('click', () => track('click_call', { label: a.textContent.trim() })));
  document.querySelectorAll('a[href*="maps.app.goo.gl"]').forEach(a => a.addEventListener('click', () => track('click_directions', { label: a.textContent.trim() })));
  document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.addEventListener('click', () => track('click_instagram')));
  document.querySelectorAll('a[href*="facebook.com"]').forEach(a => a.addEventListener('click', () => track('click_facebook')));
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.addEventListener('click', () => track('click_email')));
})();
