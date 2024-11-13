
const express = require('express');
const {
  getNews,
  createNews,
  getNewsById,
  updateNews,
  deleteNews
} = require('../controllers/news.controller');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');
const router = express.Router();

router.get('/', getNews);
router.post('/',authenticatePostalCircle,createNews);
router.get('/:id', getNewsById);
router.put('/:id',authenticatePostalCircle,updateNews);
router.delete('/:id',authenticatePostalCircle,deleteNews);

module.exports = router;
