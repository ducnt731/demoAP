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
    AorD,
    FindDocumentsById,
    updateList
} = require('../databaseHandler')
const res = require('express/lib/response')

router.use(express.urlencoded({ extended: true }))
router.use(express.static('public'))

function requiresLoginCustomer(req,res,next){
    if(req.session.user){
        return next()
    }else{
        res.redirect('/login')
    }
}

// Ham manage category
router.get('/adminHome', async (req, res) => {
    // const id = req.query.id
    // const productToEdit = await getDocumentById("Request Category", id)
    const collectionName = "Request Category"
    const results = await getAllDocumentsFromCollection(collectionName)
    res.render('adminHome',{categories:results})
})

router.get('/SendCategory',requiresLoginCustomer, async (req, res) => {
    res.render('SendCategory')
})

router.get('/Reject', async(req, res)=> {
    const id = req.query.id
    const myquery = {_id: ObjectId(id)}
    const newvalues = {$set: {status: "Rejected"}}
    await updateCollection("Request Category", myquery, newvalues)
    res.redirect('adminHome')
})

// router.get('/Accepted', async (req, res) => {
//     const id = req.query.id
//     const myquery = {_id: ObjectId(id)}
//     const newvalues = {$set: {status: "Accepted"}}
//     const collectionName = "Request Category"
//     await updateCollection(collectionName, myquery, newvalues)
//     res.redirect('adminHome')
// })

router.get('/Accepted', async(req, res)=>{
    const id = req.body.id
    await deleteDocumentById("Request Category", id)
    res.redirect('adminHome')
})

router.post('/Accepted', async(req, res)=>{
    // const id = req.body.txtId
    const nameInput = req.session.name
    // const myquery = {_id: ObjectId(id)}
    // const newvalues = {$set: {status: "Accepted"}}
    // await updateList("Request Category", myquery, newvalues)
    // const results = await FindDocumentsById("Request Category", id)
    const newC = {name: nameInput, status: "Accepted"}
    const collectionName = "Category"
    await insertObject(collectionName, newC)
    // await deleteDocumentById("Request Category", id)
    res.redirect('adminHome')
})

// router.post('/AorD', async (req, res)=> {
//     const id = req.body.txtId
//     const nameInput = req.body.txtName
//     const statusInput = req.body.txtStatus
//     const results = await AorD(categoryI)
//     if (results == -1) {
//         const collectionName = "Request Category"
//         await deleteDocumentById(collectionName, id)
//     } else {
//         const newC = {name: nameInput, status: statusInput}
//         const collectionName = "Category"
//         await insertObject(collectionName, newC)
//         res.redirect('adminHome')
//     }
//     // const myquery = {_id: Object(id)}
//     // const newvalues = {$set:{status: statusInput}}
//     // console.log(statusInput)
//     // console.log(newvalues)
//     // console.log(id)
//     // const newC = {name: nameInput}
//     // const collectionName = "Category"
//     // await insertObject(collectionName, newC)
//     // res.redirect('category')
// })

// router.post('/SendCategory', async (req, res) => {
//     const nameInput = req.body.txtName
//     const check = await checkCategory(nameInput)
//     if (nameInput.length == 0){
//         const errorMessage = "Category must have name!!!";
//         res.render('SendCategory',{errorName:errorMessage})
//         console.log("1")
//         return;
//     } else if (check==1) {
//         const errorMessage = "This category have been listed!!!"
//         res.render('SendCategory',{errorDuplicate:errorMessage})
//         console.log("2")
//         return
//     } else {
//         const newC = {name:nameInput}
//         const collectionName = "Category"
//         await Send(collectionName,newC)   
//         res.redirect('category')
//     }
// })

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

// router.get('/adminHome', async(req,res)=>{
//     const collectionName = "Products"
//     const results = await getAllDocumentsFromCollection(collectionName)
//     res.render('adminHome',{products:results, userInfo:req.session.user})
// })

router.get('/viewCategory', async (req, res) => {
    const collectionName = "Category"
    const results = await getAllDocumentsFromCollection(collectionName)
    res.render('viewOrder', {categories:results})
})

module.exports = router;