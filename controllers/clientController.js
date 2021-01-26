const {admin, db} = require('../util/admin')

const config = require('../config/firebase')

const firebase = require('firebase')

firebase.initializeApp(config)

const clientController = {}

//customer sign up

clientController.signUp = (req, res) => {
    
    //Data of SignUp
    const newClient = {
        firstname: req.body.firstname, 
        surname: req.body.surname,
        CPFCNPJ: req.body.cpf, 
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
    }

    const errors = []

    if(!newClient.firstname || !newClient.surname || !newClient.CPFCNPJ || !newClient.email ||
            !newClient.password || !newClient.password2){
        errors.push('Some data is missing')
    }

    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if(!newClient.email.match(emailRegEx)){
        errors.push('email not valid')
    }

    if(newClient.password !== newClient.password2){
        errors.push('The passwords not match')
    }

    if(errors.length !== 0){
        return res.status(500).json({
            success: false,
            messages: errors
        })
    }

    let token 
    let clientId 
    
    db.doc(`/clients/${newClient.cpf}`)
        .get()
        .then((doc) => {
            if(doc.exists){
                return res.status(400).json({
                    success: false, 
                    message: 'Cpf already taken'
                })
            }

            return firebase.auth()
                .createUserWithEmailAndPassword(newClient.email, newClient.password)
        })
        .then((data) => {
            clientId = data.user.uid
            return data.user.getIdToken
        })
        .then((idToken) => {
            token = idToken
            const userCredentials = {
                email: newClient.email, 
                clientId: clientId, 
                firstname: newClient.firstname, 
                surname: newClient.surname, 
                CPFCNPJ: newClient.CPFCNPJ, 
                createdAt: new Date().toISOString()
            }

            return db.doc(`/clients/${newClient.CPFCNPJ}`).set(userCredentials)
        })
        .then(() => {
            return res.status(201).json({
                success: true, 
                token: token
            })
        })
        .catch((err) => {
            if(err.code  === 'auth/email-already-in-use'){
                res.status(400).json({
                    success: false, 
                    message: 'Email already in use'
                })
            }else{
                res.status(500).json({
                    success: false, 
                    message: 'Something went wrong'
                })
            }
        })
}

const isEmpty = (string) => {
    if(string.trim() === ""){
        return true
    }else{
        return false
    }
}

//customer login
clientController.login = (req, res) => {
    
    let errors = []

    const user = {
        email: req.body.email, 
        password: req.body.password
    }

    if(isEmpty(user.email)){
        errors.push('The email Field is empty')
    }

    
    if(isEmpty(user.password)){
        errors.push('The password Field is empty')
    }

    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if(!user.email.match(emailRegEx)){
        errors.push('email not valid')
    }

    if(errors.length !== 0){
        return res.status(500).json({
            success: false,
            messages: errors
        })
    }else{
        firebase
            .auth()
            .signInWithEmailAndPassword(user.email, user.password)
            .then((data) => {
                return data.user.getIdToken()
            })
            .then((token) => {
                return res.status(200).json({
                    success: true,
                    token: token
                })
            })
            .catch((err) => {
                return res.status(403).json({
                    success: false, 
                    message: "Invalid credential, please try again"
                })
            })
    }
}

//obtain customer data that passed authentication with the bearer token

clientController.getMyClientData = (req, res) => {
    const clientData = {}
    db.doc(`/clients/${req.client.cpf}`)
        .get()
        .then((doc) => {
            if(!doc.exists){
                return res.status(500).json({
                    success: false, 
                    message: 'User not found'
                })
            }

            clientData.userCredentials = doc.data()
            
            res.status(200).json({
                success: true, 
                data: clientData
            })
            
        })
        .catch((err) => {
            return res.status(500).json({
                success: false, 
                message: 'Something wrong with database'
            })
        })
}

//editing simple customer data
clientController.editClientSimpleData = (req, res) => {
    let document = db.collection("clients").doc(req.client.cpf)

    const simpleData = {
        surname: req.body.surname, 
        firstname: req.body.firstname   
    }
    
    document.update(simpleData)
    .then(() => {
        res.status(200).json({
            success: true,
            message: 'Update Simple Data Successfully'
        })
    })
    .catch((err) => {
        return res.status(500).json({
            success: false, 
            message: "Cant update the value"
        })
    })
}

//control of customer address editing
clientController.editClientAdressData = (req, res) => {
    
    const address = {
        address: {
            numberHouse: req.body.numberHouse,
            street: req.body.street,
            city: req.body.city,
            neighborhood: req.body.neighborhood,
            cep: req.body.cep
        }
    }
    
    const document = db.collection("clients").doc(req.client.cpf)

    document.update(address)
        .then(() => {
            res.status(200).json({
                success: true, 
                message: 'Update address successfully'
            })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false, 
                message: "Cant update the value"
            })
        })
}

//editing control of phone data
clientController.editClientPhonesData = (req, res) => {

    const phones = {
        phones: {
            phone: req.body.phone ? req.body.phone : null,
            DDD: req.body.ddd ? req.body.ddd : null,
            country: req.body.country ? req.body.country : null, 
            phone2: req.body.phone2 ? req.body.phone2 : null, 
            DDD2: req.body.ddd2 ? req.body.ddd2 : null, 
            country2: req.body.country2 ? req.body.country2 : null
        }
    }

    const document = db.collection("clients").doc(req.client.cpf)


    document.update(phones)
        .then(() => {
            res.status(200).json({
                success: true, 
                message: 'Update Phones successfully'
            })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false, 
                message: "Cant update the value"
            })
        })

}

//payment card edition control
clientController.editClientPaymentCards = (req, res) => {
    
    const paymentCards = {

        paymentCards: {
            
            cardName: req.body.cardName ? req.body.cardName : null,
            cardNumber: req.body.cardNumber ? req.body.cardNumber : null, 
            expiryDate: req.body.expiryDate ? req.body.expiryDate : null,
            
            cardName2: req.body.cardName2 ? req.body.cardName2 : null,
            cardNumber2: req.body.cardNumber2 ? req.body.cardNumber2 : null, 
            expiryDate2: req.body.expiryDate2 ? req.body.expiryDate2 : null, 
            
            cardName3: req.body.cardName3 ? req.body.cardName3 : null,
            cardNumber3: req.body.cardNumber3 ? req.body.cardNumber3 : null, 
            expiryDate3: req.body.expiryDate3 ? req.body.expiryDate3 : null, 
        
            cardName4: req.body.cardName4 ? req.body.cardName4 : null,
            cardNumber4: req.body.cardNumber4 ? req.body.cardNumber4 : null, 
            expiryDate4: req.body.expiryDate4 ? req.body.expiryDate4 : null, 
        
            cardName5: req.body.cardName5 ? req.body.cardName5 : null,
            cardNumber5: req.body.cardNumber5 ? req.body.cardNumber5 : null, 
            expiryDate5: req.body.expiryDate5 ? req.body.expiryDate5 : null, 

        }
    }

    const document = db.collection("clients").doc(req.client.cpf)

    document.update(paymentCards)
        .then(() => {
            res.status(200).json({
                success: true, 
                message: 'Update payment Cards successfully'
            })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false, 
                message: "Cant update the value"
            })
        })
}


module.exports = clientController
