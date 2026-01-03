#!/usr/bin/env node
require('dotenv').config({ path: './backend/.env' });
const path = require('path');
process.chdir(path.join(__dirname, 'backend'));
require('./server.js');
