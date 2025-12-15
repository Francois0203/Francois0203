async function sampleHandler(req, res) {
  res.json({ message: 'This is a sample controller response' });
}

module.exports = { sampleHandler };