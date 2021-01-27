const express = require('express')
const router = express.Router()
const bodyparser = require('body-parser')

const productController = require('../controllers/productController')
const auth = require('../util/auth')

router.use(bodyparser.json())

router.get('/', auth, productController.getAllProducts)
router.get('/active', productController.getActives)
router.get('/inactives', auth, productController.getInactives)
router.post('/', auth, productController.CreateProduct)
router.put('/:code', auth, productController.editProduct)
router.put('/:code/toggle', auth, productController.ToggleProduct)
router.delete('/:code', auth, productController.deleteProduct)

module.exports = router