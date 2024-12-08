// routes/philatelicItemRoutes.js
const express = require('express');
const { getPhilatelicItems, createPhilatelicItem,getPhilatelicItemsByPostCircle } = require('../controllers/philatelicItem.controller');
const authenticatePostalCircle = require('../middlewares/authenticatePostalCircle');
// const authMiddleware = require('../middlewares/authenticateuser');
const upload = require('../middlewares/uploads');

const router = express.Router();

router.get('/',getPhilatelicItems); // without login items can retrive so middleware is not  used
router.get('/postalcircle',authenticatePostalCircle,getPhilatelicItemsByPostCircle);
router.post('/', authenticatePostalCircle, createPhilatelicItem);


module.exports = router;
