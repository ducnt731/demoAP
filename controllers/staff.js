const express = require('express')
const async = require('hbs/lib/async')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const router = express.Router()
const {
    insertObject,
    checkCategory,
    getAllDocumentsFromCollection, 
    deleteDocumentById, 
    updateCollection, 
    getDocumentById,
    getCustomer,
    getAllFeedback,
    updateDocument,
    searchObjectbyName,
    FindDocumentsById,
    getHistory,
    Send,
} = require('../databaseHandler')

router.use(express.urlencoded({ extended: true }))
router.use(express.static('public'))

function requiresLoginCustomer(req,res,next){
    if(req.session.user){
        return next()
    }else{
        res.redirect('/login')
    }
}

router.get('/staffHome', async(req,res)=>{
    const collectionName = "Products"
    const results = await getAllDocumentsFromCollection(collectionName)
    res.render('staffHome',{products:results, userInfo:req.session.user})
})

router.get('/product',async (req,res)=>{
    const collectionName = "Products"
    const results = await getAllDocumentsFromCollection(collectionName)
    res.render('product',{products:results})
})

router.get('/addProduct', (req,res)=>{
    res.render('addProduct')
})

router.post('/addProduct',async (req,res)=>{
    const nameInput = req.body.txtName
    const categoryInput = req.body.txtCategory
    const priceInput = req.body.txtPrice
    const picURLInput = req.body.txtPicURL
    const quantityInput = req.body.txtQuantity
    const authorInput = req.body.txtAuthor
    const descriptionInput = req.body.txtDescription
    const check = await checkCategory(categoryInput)
    if (nameInput.length == 0){
        const errorMessage = "Book must have name!!!";
        const oldValues = {category: categoryInput, price: priceInput, quantity: quantityInput, picURL: picURLInput, author: authorInput, description: descriptionInput}
        res.render('addProduct',{errorName:errorMessage,oldValues:oldValues})
        console.log("a")
        return;
    } else if (priceInput.length == 0){
        const errorMessage = "Book must have price!!!";
        const oldValues = {name: nameInput, category: categoryInput, quantity: quantityInput, picURL: picURLInput, author: authorInput, description: descriptionInput}
        res.render('addProduct',{errorPrice:errorMessage,oldValues:oldValues})
        console.log("b")
        return;
    } else if(isNaN(priceInput)== true){
        const errorMessage = "Price must be integer!!!"
        const oldValues = {name:nameInput, category: categoryInput, quantity: quantityInput, picURL: picURLInput, author: authorInput, description: descriptionInput}
        res.render('addProduct',{errorPriceNaN:errorMessage,oldValues:oldValues})
        console.log("c")
        return;
    } else if (picURLInput.length == 0 ) {
        const errorMessage = "book must have picture!!!"
        const oldValues = {name:nameInput,category: categoryInput,price:priceInput,quantity:quantityInput,picURL:picURLInput,author:authorInput,description:descriptionInput}
        res.render('addProduct',{errorLink:errorMessage,oldValues:oldValues})
        console.log("d")
        return;
    } else if (quantityInput.length == 0) {
        const errorMessage = "Book must have quantity!!!"
        const oldValues = {name:nameInput,category: categoryInput,price:priceInput,picURL:picURLInput,author:authorInput,description:descriptionInput}
        res.render('addProduct',{errorQuantity:errorMessage,oldValues:oldValues})
        console.log("e")
    } else if (isNaN(quantityInput)){
        const errorMessage = "Quantity must be integer!!!"
        const oldValues = {name:nameInput,category: categoryInput,price:priceInput,quantity:quantityInput,picURL:picURLInput,author:authorInput,description:descriptionInput}
        res.render('addProduct',{errorQuantityNaN:errorMessage,oldValues:oldValues})
        console.log("f")
        return;
    } else if (descriptionInput.length == 0){
        const errorMessage = "Book must have description!!!";
        const oldValues = {name:nameInput,category: categoryInput,price:priceInput,quantity:quantityInput,picURL:picURLInput,author:authorInput}
        res.render('addProduct',{errorDescription:errorMessage,oldValues:oldValues})
        console.log("g")
        return
    } else if (check==1){
        const errorMessage = "System dont have this book!!!";
        const oldValues = {name:nameInput,price:priceInput,quantity:quantityInput,picURL:picURLInput,author:authorInput,description:descriptionInput}
        res.render('addProduct',{errorCategory:errorMessage,oldValues:oldValues})
        console.log("h")
        return
    } else {
        const newP = {name:nameInput,category: categoryInput,price:Number.parseFloat(priceInput),quantity:Number.parseInt(quantityInput),picURL:picURLInput,author:authorInput,description:descriptionInput}
        const collectionName = "Products"
        await insertObject(collectionName,newP)   
        res.redirect('staffHome')
    }
})

router.get('/editProduct',async (req,res)=>{
    const id = req.query.id
    const collectionName = "Products"
    const productToEdit = await getDocumentById(collectionName, id)
    res.render('editProduct',{product:productToEdit})
})

router.post('/editProduct',async (req,res)=>{
    const nameInput = req.body.txtName
    const categoryInput = req.body.txtCategory
    const priceInput = req.body.txtPrice
    const picURLInput = req.body.txtPicURL
    const quantityInput = req.body.txtQuantity
    const authorInput = req.body.txtAuthor
    const descriptionInput = req.body.txtDescription
    const id = req.body.txtId
    const myquery = { _id: ObjectId(id) }
    const newvalues = { $set: {name: nameInput, category: categoryInput, price: priceInput, picURL: picURLInput, qunatity:quantityInput,picURL:picURLInput,author: authorInput,description: descriptionInput} }
    const collectionName = "Products"
    await updateCollection(collectionName, myquery, newvalues)
    res.redirect('staffHome')
})

router.get('/deleteProduct',async (req,res)=>{
    const id = req.query.id
    const collectionName = "Products"
    await deleteDocumentById(collectionName, id)
    res.redirect('staffHome')
})

router.get('/category', async (req, res) => {
    const collectionName = "Category"
    const results = await getAllDocumentsFromCollection(collectionName)
    res.render('category',{category:results})
})

router.get('/requestList', async(req, res) =>{
    const collectionName = "Request Category"
    const results = await getAllDocumentsFromCollection(collectionName)
    res.render('requestList', {list:results})
})

router.get('/SendCategory',requiresLoginCustomer, async (req, res) => {
    res.render('SendCategory')
})

router.post('/SendCategory', async (req, res) => {
    const nameInput = req.body.txtName
    const check = await checkCategory(nameInput)
    if (nameInput.length == 0){
        const errorMessage = "Category must have name!!!";
        res.render('SendCategory',{errorName:errorMessage})
        console.log("1")
        return;
    } else if (check==1) {
        const errorMessage = "This category have been listed!!!"
        res.render('SendCategory',{errorDuplicate:errorMessage})
        console.log("2")
        return
    } else {
        const newR = {name:nameInput, status:"Pending..."}
        const collectionName = "Request Category"
        await insertObject(collectionName,newR)   
        res.redirect('requestList')
    }
})

router.post('/editCategory', async (req, res) => {
    const nameInput = req.body.txtName
    const descriptionInput = req.body.txtDescription
    const id = req.body.txtId
    const myquery = { _id: ObjectId(id) }
    const newvalues = { $set: {name: nameInput,description: descriptionInput} }
    const collectionName = "Category"
    await updateCollection(collectionName, myquery, newvalues)
    res.redirect('category')
})

router.get('/editCategory', async (req, res) => {
    const id = req.query.id
    const collectionName = "Category"
    const categoryToEdit = await getDocumentById(collectionName, id)
    res.render('editCategory',{category:categoryToEdit})
})

router.get('/deleteCategory', async (req, res) => {
    const id = req.query.id
    const collectionName = "Category"
    await deleteDocumentById(collectionName, id)
    res.redirect('category')
})

//Ham manage Order
router.get('/viewOrder', async (req, res) => {
    const collectionName = "Order"
    const results = await getAllDocumentsFromCollection(collectionName)
    res.render('viewOrder', { orders: results })
})

router.get('/deleteOrder', async (req, res) => {
    const id = req.query.id
    //ham xoa user dua tren id
    const collectionName = "Order"
    await deleteDocumentById(collectionName, id)
    res.redirect('viewOrder')// return viewprofile page
})

router.get('/editOrder', async (req, res) => {
    const id = req.query.id
    //lay information old of ofer before edit
    const productToEdit = await getDocumentById("Order", id)
    //hien thi ra de sua
    res.render("editOrder", { orders: productToEdit,id:id })
})

router.post('/editOrder',async (req,res) =>{
    const statusInput = req.body.txtstatus
    //ham update
    const id = req.body.txtId
    const myquery = { _id: ObjectId(id) }
    const newvalues = {$set: {
        status: statusInput,
        }
    }
    console.log(statusInput)
    console.log(newvalues)
    console.log(id)
    const collectionName = "Order"
    await updateCollection(collectionName, myquery, newvalues)
    res.redirect('viewOrder')
})

router.get('/orderDetail', async (req, res) => {
    const id = req.query.id
    // const dbo = await getDocumentById();
    const collectionName = 'Order'
    const order = await FindDocumentsById(collectionName, id)
    const carts = order.cart
    var cart 
    for (var i = 0; i < carts.length; i++) {
        cart[i].name = cart.name;
        cart[i].status = cart.status
        cart[i].price = books[i].quantity * books[i].price
        cart[i].date = order.date
    }
    res.render("orderDetail", { carts: carts, totalBill: totalBill })
})

module.exports = router;