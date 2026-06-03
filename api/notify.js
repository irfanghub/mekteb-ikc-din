const webpush = require('web-push');

const VAPID_PUBLIC  = 'BE8pYgYmR8WCJ5W3OX7LTjzOJv5F5Z4pYZ_kVjWVj6sW6Mitl8uOctts5S8Vk-1xnzsum178Er4k4PUImsTkcuc';
const VAPID_PRIVATE = 'vED-88oXyXVEoE2TORUQTVAiXH5WWRdBMWAQLQrit_A';
const SUPABASE_URL  = 'https://zoubpnicqnmgvnasvekt.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJwbmljcW5tZ3ZuYXN2ZWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTYwNDgsImV4cCI6MjA5MTU3MjA0OH0.41gzbB1MJhmuVX6z_xqY9AQs_hWQWXiN0Izx3ySlhCo';

webpush.setVapidDetails('mailto:admin@ikc-din.nl', VAPID_PUBLIC, VAPID_PRIVATE);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { kidId, title, body } = req.body;
  if (!kidId || !title) return res.status(400).json({ error: 'Missing kidId or title' });

  // Fetch subscriptions for this kid
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?kid_id=eq.${encodeURIComponent(kidId)}&select=subscription`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const subs = await r.json();
  if (!subs || !subs.length) return res.status(200).json({ sent: 0, msg: 'No subscribers' });

  const results = await Promise.allSettled(
    subs.map(s => webpush.sendNotification(
      s.subscription,
      JSON.stringify({ title, body, tag: `mekteb-${kidId}` })
    ))
  );

  // Clean up expired subscriptions (410 = gone)
  const expired = [];
  results.forEach((r, i) => {
    if (r.status === 'rejected' && r.reason?.statusCode === 410) {
      expired.push(JSON.stringify(subs[i].subscription));
    }
  });
  if (expired.length) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions?kid_id=eq.${encodeURIComponent(kidId)}`,
      { method: 'DELETE', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' } }
    );
  }

  res.status(200).json({
    sent: results.filter(r => r.status === 'fulfilled').length,
    total: subs.length
  });
};
