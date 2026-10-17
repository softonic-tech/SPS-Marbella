'use client';

import { useState, type FormEvent } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { CONTACT_EMAIL } from '@/lib/site';

type StatusKey = 'mail' | 'success';

/**
 * Enquiry form. Mirrors the approved behaviour exactly: with no enquiry inbox
 * configured it shows the "connect a contact email" notice; once
 * `CONTACT_EMAIL` is set in lib/site.ts it opens the visitor's mail client with
 * the enquiry pre-filled.
 *
 * The status is held as a key rather than a string so the message follows the
 * language switcher, just as the original full re-render did.
 */
export default function ContactForm() {
  const { t } = useLanguage();
  const f = t.form;
  const [status, setStatus] = useState<StatusKey>('mail');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    if (!CONTACT_EMAIL) {
      setStatus('mail');
      return;
    }

    setStatus('success');
    const subject = encodeURIComponent('SPS Marbella project enquiry');
    const body = encodeURIComponent(
      `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\n` +
        `Project: ${data.get('type')}\n\n${data.get('message')}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="form" id="contact-form" onSubmit={handleSubmit}>
      <label>
        {f.name}
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        {f.email}
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label>
        {f.phone}
        <input name="phone" autoComplete="tel" />
      </label>
      <label>
        {f.type}
        <select name="type" defaultValue="">
          <option value="">{f.select}</option>
          {f.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        {f.message}
        <textarea name="message" required />
      </label>
      <button className="btn dark" type="submit">
        {f.send}
        <span className="arrow">↗</span>
      </button>
      <div className="form-status" aria-live="polite">
        {f[status]}
      </div>
    </form>
  );
}
