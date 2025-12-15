function heartbeatHandler(req, res) {
  res.json({ status: 'ok', ts: new Date().toISOString() });
}

module.exports = { heartbeatHandler };
