const express = require('express')
const router = express.Router()
const bodyparser = require('body-parser')

const clientController = require('../controllers/clientController')
const auth = require('../util/auth')

router.use(bodyparser.json())

//customer routes

router.post('/login', clientController.login)
router.post('/signup', clientController.signUp)
router.get('/user', auth, clientController.getMyClientData)
router.put('/edit/simple', auth, clientController.editClientSimpleData)
router.put('/edit/address', auth, clientController.editClientAdressData)
router.put('/edit/cards', auth, clientController.editClientPaymentCards)
router.put('/edit/phone', auth, clientController.editClientPhonesData)

module.exports = router

