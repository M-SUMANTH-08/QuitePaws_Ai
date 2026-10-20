export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    service: 'quietpaws-web',
    version: '4.0.0',
    inference: 'client-side',
    targetHardware: 'iQOO 15',
    developmentHardware: 'POCO X6 Pro',
    timestamp: new Date().toISOString(),
  });
}
