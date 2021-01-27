const {admin, db} = require('../util/admin')

const productController = {}

//Get all products of database 
productController.getAllProducts = (req, res) => {

    if(!req.client.admin){
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized to create a product'
        })
    }

    db.collection("products")
        .orderBy("name", "asc")
        .get()
        .then((data) => {
            let products = []
            data.forEach((doc) => {
                products.push({
                    name: doc.data().name,
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

//Get Product By code
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

//Get All Product Actives in database
productController.getActives = (req, res) => {

    db.collection('products')
        .where('active', '==', true)
        .get()
        .then((data) => {
            let products = []
            data.forEach((doc) => {
                products.push({
                    name: doc.data().name,
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

//Get all inactives only if the user is admin
productController.getInactives = (req, res) => {

    if(!req.client.admin){
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized to create a product'
        })
    }

    db.collection('products')
        .where('active', '==', false)
        .get()
        .then((data) => {
            let products = []
            data.forEach((doc) => {
                products.push({
                    name: doc.data().name,
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

//Create a new product in database, only if user is admin
productController.CreateProduct = (req, res) => {
    
    if(!req.client.admin){
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized to create a product'
        })
    }

    if(req.body.code === null || req.body.code === undefined 
            || req.body.desc === null || req.body.desc === undefined
            || req.body.size === null || req.body.size === undefined
            || req.body.weight === null || req.body.weight === undefined 
            || req.body.price === null || req.body.price === undefined 
            || req.body.discount === null || req.body.discount === undefined
            || req.body.on_sale === null || req.body.on_sale === undefined 
            || req.body.active === null || req.body.active === undefined 
            || req.body.stock === null || req.body.stock === undefined 
            || req.body.name === null || req.body.name === undefined
        // !req.body.images
        ){
            return res.status(500).json({
                success: false, 
                message: 'Some data is missing'
            })
        }

    const newProduct = {
        name: req.body.name,
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
            if(doc.exists){
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

function booleanValue(value1, value2){
    if(value1 === null || value1 === undefined){
        return value2
    }

    return value1
}

//Edit an Existent product, only if is has an admin
productController.editProduct = (req, res) => {
    
    if(!req.client.admin){
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized to create a product'
        })
    }

    const document = db.doc(`/products/${req.params.code}`)

        document.get()
        .then((doc) => {
            if(!doc.exists){
                return res.status(404).json({
                    success: false, 
                    message: 'Product not found'
                })
            }

            const product = {
                name: req.body.name ? req.body.name : doc.data().name,
                desc: req.body.desc ? req.body.desc : doc.data().desc,
                size: req.body.size ? req.body.size : doc.data().size,
                weight: req.body.weight ? req.body.weight : doc.data().weight,
                price: req.body.price ? req.body.price : doc.data().price,
                discount: req.body.discount ? req.body.discount : doc.data().discount,
                on_sale: booleanValue(req.body.on_sale, doc.data().on_sale),
                active: booleanValue(req.body.active, doc.data().active),
                stock: req.body.stock ? req.body.stock : doc.data().stock,
                // images: req.body.images
            };

            return document.update(product)

        })
        .then(() => {
            return res.status(201).json({
                success: true, 
                message: 'You edit this product'
            })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false, 
                message: 'Something went wrong'
            })
        })
}

//Delete a product by Code, only if the user is admin 
productController.deleteProduct = (req, res) => {

    const document = db.doc(`/products/${req.params.code}`)

    if(!req.client.admin){
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized to create a product'
        })
    }

    document
        .get()
        .then((doc) => {
            if(!doc.exists){
                return res.status(404).json({
                    success: false, 
                    message: 'Product not found'
                })
            }

            return document.delete()
        })
        .then(() => {
            return res.status(200).json({
                success: true, 
                message: 'product successfully deleted'
            })
        })
}

//Toggle the product active data in database
productController.ToggleProduct = (req, res) => {
    
    const document = db.doc(`/products/${req.params.code}`)

    if(!req.client.admin){
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized to create a product'
        })
    }

    document.get()
        .then((doc) => {
            
            if(!doc.exists){
                return res.status(404).json({
                    success: false, 
                    message: 'Product not found'
                })
            }

            
            const toggle = {
                active: !doc.data().active
            }

            return document.update(toggle)

        })
        .then(() => {
            return res.status(201).json({
                success: true, 
                message: 'You edit this product', 
            })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false, 
                message: 'Something went wrong'
            })
        })

}

module.exports = productController