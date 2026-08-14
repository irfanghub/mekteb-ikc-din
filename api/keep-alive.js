// Keep-alive: pingt de Supabase-database zodat de free tier niet auto-pauzeert.
// Wordt dagelijks aangeroepen door Vercel Cron (zie vercel.json).
// Doet een minimale, veilige read op de berichten-tabel met de publieke anon-key.

const SUPABASE_URL = 'https://zoubpnicqnmgvnasvekt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJwbmljcW5tZ3ZuYXN2ZWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTYwNDgsImV4cCI6MjA5MTU3MjA0OH0.41gzbB1MJhmuVX6z_xqY9AQs_hWQWXiN0Izx3ySlhCo';

module.exports = async function handler(req, res) {
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/berichten?select=id&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!r.ok) {
      return res.status(502).json({ ok: false, status: r.status, at: new Date().toISOString() });
    }
    return res.status(200).json({ ok: true, msg: 'Database wakker gehouden', at: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e), at: new Date().toISOString() });
  }
};
