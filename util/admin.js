const admin = require('firebase-admin')

const adminCred = require('../config/adminFirebase')

admin.initializeApp(adminCred)

const db = admin.firestore()

module.exports = {admin, db}