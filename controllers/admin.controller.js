const express = require('express');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const PostalCircle = require("../models/PostalCircle.model");
require('dotenv').config(); // Ensure parentheses are here to load the .env file


