const express = require('express');
const router = express.Router();
const dbHandler = require('../databaseHandler');
const { ObjectId } = require('mongodb')
const {
    getHistory,
    getOder,
    insertObject,
    USER_TABLE_NAME,
    getAllDocumentsFromCollection,
    deleteDocumentById,
    updateCollection,
    getDocumentById,   
    getCustomer
} = require('../databaseHandler')


// Middleware
function requiresLoginCustomer(req,res,next){
    if(req.session.user){
        return next()
    }else{
        res.redirect('/login')
    }
}

router.get('/purchasehistory', async (req, res) => {
    const collectionName = "Order"
    const name = req.session.user.userName
    const results = await getHistory(collectionName, name)
    res.render('purchasehistory', {orders: results, userInfo: req.session.user})
})

// router.get("/purchasehistory", async (req, res) => {
//     const user = await dbHandler.getUser(req.session.user.userName);
//     res.render("purchasehistory", { userInfo: req.session.user });
// });

router.get('/deletemyorder', async (req, res) => {
    const id = req.query.id
    //ham xoa user dua tren id
    const collectionName = "Order"
    await deleteDocumentById(collectionName, id)
    res.redirect('purchasehistory')// return viewprofile page
})

router.get('/cancelmyorder',async (req,res) =>{
    console.log("2")
    const statusInput =  "Cancel"
    //ham update
    console.log("3")
    console.log(statusInput)
    const id = req.query.id
    console.log(id)
    const myquery = { _id: ObjectId(id) }
    const newvalues = {$set: {
        status: statusInput,
        }
    }
    console.log(statusInput)
    console.log(newvalues)
    console.log(id)
    const collectionName = "Order"
    await updateCollection(collectionName, myquery, newvalues, )
    res.redirect('purchasehistory')
})

module.exports = router;
