const express = require('express');
const helmet = require('helmet');

const { applyMiddlewares } = require('./middleware');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(express.json());

applyMiddlewares(app);

app.use('/api', routes);

// basic health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Francois backend running' }));

// generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;