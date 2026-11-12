'use client';

import { useState, type FormEvent } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

type StatusKey = 'mail' | 'success';

/**
 * Enquiry form. Saves the request for the admin inbox, then shows a success message.
 */
export default function ContactForm() {
  const { t } = useLanguage();
  const f = t.form;
  const [status, setStatus] = useState<StatusKey | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setError('');
    setStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          projectType: data.get('type'),
          message: data.get('message'),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setError(result.error || f.required);
        return;
      }
      setStatus('success');
      form.reset();
    } catch {
      setError(f.required);
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="form" id="contact-form" onSubmit={(event) => void handleSubmit(event)}>
      <label>
        {f.name}
        <input name="name" required autoComplete="name" disabled={sending} />
      </label>
      <label>
        {f.email}
        <input type="email" name="email" required autoComplete="email" disabled={sending} />
      </label>
      <label>
        {f.phone}
        <input name="phone" autoComplete="tel" disabled={sending} />
      </label>
      <label>
        {f.type}
        <select name="type" defaultValue="" disabled={sending}>
          <option value="">{f.select}</option>
          {f.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        {f.message}
        <textarea name="message" required disabled={sending} />
      </label>
      <button className="btn dark" type="submit" disabled={sending}>
        {sending ? '…' : f.send}
        <span className="arrow">↗</span>
      </button>
      <div className="form-status" aria-live="polite">
        {error ? error : status ? f[status] : null}
      </div>
    </form>
  );
}
