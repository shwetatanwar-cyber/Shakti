import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ConnectForm = () => {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('connect_requests').insert({
      name: name.trim(),
      contact_info: contactInfo.trim() || null,
      reason: reason.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Something went wrong. Try again.');
    } else {
      toast.success('Message sent into the ether.');
      setName('');
      setContactInfo('');
      setReason('');
    }
  };

  const inputClass =
    'w-full bg-transparent border-b border-muted-foreground/20 pb-3 pt-2 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors';

  return (
    <section className="relative z-10 px-4 md:px-8 py-16 max-w-2xl mx-auto">
      <p className="font-body text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
        Connect
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-light italic mb-8">
        Send a signal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={inputClass}
          maxLength={100}
          required
        />
        <input
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="How to reach you (email, IG, etc.)"
          className={inputClass}
          maxLength={255}
        />
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why are you reaching out?"
          className={`${inputClass} min-h-[80px] resize-none`}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={submitting}
          className="font-body text-xs tracking-[0.3em] uppercase text-accent hover:text-foreground transition-colors disabled:opacity-50"
        >
          {submitting ? 'Sending...' : 'Transmit →'}
        </button>
      </form>
    </section>
  );
};

export default ConnectForm;
