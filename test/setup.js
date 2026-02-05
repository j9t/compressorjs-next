// Test setup - expose globals
import * as chai from 'chai';
import Compressor from '../src/index.js';
import * as utilities from '../src/utilities.js';

// Expose chai for karma-chai adapter
window.chai = chai;

// Expose Compressor for tests
window.Compressor = Compressor;

// Expose utilities for tests
window.utilities = utilities;