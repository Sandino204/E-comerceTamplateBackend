const {admin, db} = require('./admin')

module.exports = (req, res, next) => {
    let idToken     

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ){
        idToken = req.headers.authorization.split("Bearer ")[1]
    }else{
        res.status(403).json({
            success: false, 
            message: "You are not authorized"
        })
    }

    admin.auth()
        .verifyIdToken(idToken)
        .then((decodeToken) => {
            req.client = decodeToken
            return db.collection("clients")
                .where("clientId", "==", req.client.uid)
                .limit(1)
                .get()
        })
        .then((data) => {
            req.client.cpf = data.docs[0].data().CPFCNPJ
            req.client.admin = data.docs[0].data().admin
            return next()
        })
        .catch((err) => {
            console.log(err)
            return res.status(403).json({
                success: false, 
                message: 'Unauthorized Acount'
            })
        })
}