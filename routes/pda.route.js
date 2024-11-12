// routes/pdaRoutes.js
const express = require('express');
const {
  getPDAs,
  createPDA,
  getPDAById,
  updatePDA,
  deletePDA,
  getUserPDAccounts
} = require('../controllers/pda.controller');
const isAdmin = require('../middlewares/isAdmin');
const authMiddleware = require('../middlewares/authenticateuser');


const router = express.Router();

router.get('/',isAdmin, getPDAs);
router.get('/user/:userId/accounts', authMiddleware, getUserPDAccounts);
router.post('/',authMiddleware, createPDA);
router.get('/:id', getPDAById);
router.put('/:id', updatePDA);
router.delete('/:id', deletePDA);

module.exports = router;
