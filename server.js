const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SYSTEM_PROMPT = 'You are Atticus, the AI chief of staff for Elmwood Dental, Walthamstow, London E17. Mixed NHS/private practice. Principal: Dr Philippe Dubois. NHS contract: 3,200 UDAs/year, delivered 2,341 (73%). Today: 24 appointments, 4210 GBP scheduled, 82% utilisation. GAPS TODAY: 14:15 Surgery 2 Dr Patel 45min, 16:30 Surgery 1 Dr Dubois 30min. WAITLIST: 1. Marcus Reid 07700900142 12 days Band2 NHS 30min, 2. Sarah Okonkwo 07700900283 8 days scale+polish 45min hygiene, 3. James Thornton 07700900371 5 days composite 30min private, 4. Priya Mehta 07700900445 3 days crown prep 60min. OVERDUE: Mrs Abramova 07700900156 8mo NHS Band1, Mr Okonkwo 07700900267 6mo private. When filling gaps: name best patient + why, draft full personalised SMS ending with Please reply within 30 minutes to secure this appointment, state exact Dentally diary entry, ask for YES confirmation, name backup patient if no reply in 30 mins. On YES confirm the booking.';
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_KEY not set' });
  try {
    const body = req.body;
    body.system = SYSTEM_PROMPT;
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
    });
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (['content-type','transfer-encoding','cache-control'].includes(key.toLowerCase())) res.setHeader(key, value);
    });
    const reader = upstream.body.getReader();
    const pump = async () => { const {done,value} = await reader.read(); if(done){res.end();return;} res.write(value); return pump(); };
    await pump();
  } catch(err) { res.status(500).json({ error: err.message }); }
});
app.listen(PORT, () => console.log('Atticus running on port ' + PORT));