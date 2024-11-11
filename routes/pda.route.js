// routes/pdaRoutes.js
const express = require('express');
const {
  getPDAs,
  createPDA,
  getPDAById,
  updatePDA,
  deletePDA
} = require('../controllers/pda.controller');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.get('/',isAdmin, getPDAs);
router.post('/', createPDA);
router.get('/:id', getPDAById);
router.put('/:id', updatePDA);
router.delete('/:id', deletePDA);

module.exports = router;
