// routes/pdaRoutes.js
const express = require('express');
const {
  getPDAs,
  createPDA,
  getPDAById,
  updatePDA,
  deletePDA,
  getUserPDAccounts,
  userPdaDetails,
  getPDAbyuserID
} = require('../controllers/pda.controller');
const isAdmin = require('../middlewares/isAdmin');
const authMiddleware = require('../middlewares/authenticateuser');


const router = express.Router();
//postcircle wise PDA
router.get('/',authMiddleware , isAdmin, getPDAs); // all pda account in website access only by admin so not require for authMiddleware
router.get('/pda-accounts', authMiddleware, userPdaDetails); // it show in logged user profile i.e Person A how much PDA that show on his/her Profile
router.get('/user/:userId/accounts', authMiddleware, getUserPDAccounts); // specific user mate  (account_number postal_circle status balance)
router.get('/pdaitems', authMiddleware, getPDAbyuserID); // user ni items for pda update mate get karva
router.post('/',authMiddleware, createPDA); // Creation of PDA by user
router.get('/:id', getPDAById); // pda id 
router.put('/:id', updatePDA);
router.delete('/:id', deletePDA);

  

module.exports = router;
