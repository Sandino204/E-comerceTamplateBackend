const {admin, db} = require('../util/admin')

const config = require('../config/firebase')

const firebase = require('firebase')

firebase.initializeApp(config)

const productController = {}

productController.getAllProducts = (req, res) => {
    db.collection("products")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            let products = []
            data.forEach((doc) => {
                products.push({
                    code: doc.data().code, 
                    desc: doc.data().desc, 
                    size: doc.data().size, 
                    weight: doc.data().weight, 
                    price: doc.data().price, 
                    discount: doc.data().discount, 
                    on_sale: doc.data().on_sale, 
                    active: doc.data().active, 
                    stock: doc.data().stock, 
                    // images: doc.data().images
                })
            })
            return res.status(200).json({
                success: true, 
                data: products
            })
        })
        .catch((err) => {
            res.status(500).json({
                success: false, 
                message: "Something went wrong"
            })
        })
}

productController.getOneProduct = (req, res) => {
    
    let productData = {}

    db.doc(`/products/${req.params.code}`)
        .get()
        .then((doc) => {
            if(!doc.exists){
                return res.status(404).json({
                    success: false, 
                    message: 'Product Dont Found'
                })
            }

            productData = doc.data()

            return res.status(200).json({
                success: true, 
                data: productData
            })

        })
        .catch((err) => {
            res.status(500).json({
                success: false, 
                message: "Something Went Wrong"
            })
        })
}

productController.CreateProduct = (req, res) => {
    
    if(!req.client.admin){
        res.status(401).json({
            success: false, 
            message: 'Unauthorized to create a product'
        })
    }

    if(!req.body.code || !req.body.desc || !req.body.size || !req.body.weight ||
        !req.body.price || !req.body.discount || !req.body.on_sale || !req.body.active ||
        !req.body.stock 
        // !req.body.images
        ){
            return res.status(500).json({
                success: false, 
                message: 'Some data is missing'
            })
        }

    const newProduct = {
        code: req.body.code,
        desc: req.body.desc,
        size: req.body.size,
        weight: req.body.weight,
        price: req.body.price,
        discount: req.body.discount,
        on_sale: req.body.on_sale,
        active: req.body.active,
        stock: req.body.stock,
        // images: req.body.images
    }

    db.doc(`/products/${req.body.code}`)
        .get()
        .then((doc) => {
            if(!doc.exists){
                return res.status(500).json({
                    success: false, 
                    message: 'product has already been registered, try another code'
                })
            }

            return db.doc(`/products/${req.body.code}`).set(newProduct)
        })
        .then(() => {
            return res.status(201).json({
                success: true, 
                data: newProduct
            })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false, 
                message: 'Something went wrong'
            })
        })

}

productController.editProduct = (req, res) => {
    
    const Product = {
        code: req.body.code,
        desc: req.body.desc,
        size: req.body.size,
        weight: req.body.weight,
        price: req.body.price,
        discount: req.body.discount,
        on_sale: req.body.on_sale,
        active: req.body.active,
        stock: req.body.stock,
        // images: req.body.images
    }

    

}