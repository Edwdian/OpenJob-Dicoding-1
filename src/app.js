require('dotenv').config();
const express = require('express');

const usersHandler = require('./handlers/usersHandler');
const authenticationsHandler = require('./handlers/authenticationsHandler');
const companiesHandler = require('./handlers/companiesHandler');
const categoriesHandler = require('./handlers/categoriesHandler');
const jobsHandler = require('./handlers/jobsHandler');
const applicationsHandler = require('./handlers/applicationsHandler');
const bookmarksHandler = require('./handlers/bookmarksHandler');
const documentsHandler = require('./handlers/documentsHandler');
const profileHandler = require('./handlers/profileHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', usersHandler);
app.use('/authentications', authenticationsHandler);
app.use('/companies', companiesHandler);
app.use('/categories', categoriesHandler);
app.use('/jobs', jobsHandler);
app.use('/applications', applicationsHandler);
app.use('/bookmarks', bookmarksHandler);
app.use('/documents', documentsHandler);
app.use('/profile', profileHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  console.log(`OpenJob API running at http://${HOST}:${PORT}`);
});

module.exports = app;
