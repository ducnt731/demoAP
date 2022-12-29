const async = require('hbs/lib/async');
const {MongoClient,ObjectId} = require('mongodb');
const URL = "mongodb+srv://admin123:5555@cluster0.3sqdn.mongodb.net/Bookstore-project?retryWrites=true&w=majority"
const DATABASE_NAME = "Book-store"

// MongoClient.connect(url, function(err, db){
//     if (err) throw err;
//     var dbo = db.db(DATABASE_NAME);
//     var mysort = { price: 1 };
//     dbo.collection("Products").find().sort(mysort).toArray(function(err, result) {
//         if (err) throw err
//         console.log(result)
//         db.close()
//     })
// })

async function getDB() {
    const client = await MongoClient.connect(URL);
    const dbo = client.db(DATABASE_NAME);
    return dbo;
}

async function insertObject(collectionName,objectToInsert){
    const dbo = await getDB();
    const newObject = await dbo.collection(collectionName).insertOne(objectToInsert);
    console.log("Gia tri id moi duoc insert la: ", newObject.insertedId.toHexString());
}

async function checkUserLogin(nameI) {
    const dbo = await getDB();
    const results = await dbo.collection("Users").findOne({userName: nameI})
    if (results) {
    return results;
    } else {
    return -1;
    }
}

async function AorD(categoryI, statusI){
    const dbo = await getDB()
    const result = await dbo.collection("Request Category").findOne({rCategoryName: categoryI, rStatus: statusI})
    if (result) {
        return -1
    } else {
        return result.status
    }
}

async function checkCategory(categoryI){
    const dbo = await getDB();
    const results = await dbo.collection("Category").findOne({CategoryName: categoryI})
    if (results) {
        return 1;
    } else {
        return -1;
    }
}

async function findOne(collectionName, findObject) {
    const dbo = await getDB();
    const result = await dbo.collection(collectionName).findOne(findObject, send);
    return result;
}

async function checkUserRole(nameI) {
    const dbo = await getDB();
    const user = await dbo.collection("Users").findOne({userName: nameI})
    if (user == null) {
    return -1;
    } else {
    return user.role;
    }
}

async function getUser(name) {
    const dbo = await getDB();
    const result = await dbo.collection("Users").findOne({ userName: name })
    return result;
}

async function getDocumentsFromCollection(collectionName, name) {
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).findOne({nameIn: name}).toArray()
    return results
}

async function getAllDocumentsFromCollection(collectionName) {
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).find({}).toArray()
    return results
}

async function deleteDocumentById(collectionName, id) {
    const dbo = await getDB()
    await dbo.collection(collectionName).deleteOne({ _id: ObjectId(id) })
}

async function updateCollection(collectionName, myquery, newvalues) {
    const dbo = await getDB()
    await dbo.collection(collectionName).updateOne(myquery, newvalues)
}

async function getDocumentById(collectionName, id) {
    const dbo = await getDB()
    const productToEdit = await dbo.collection(collectionName).findOne({ _id: ObjectId(id) })
    const results = await dbo.collection(collectionName).findOne({ _id: ObjectId(id) })
    return productToEdit, results
}

async function FindAllDocumentsByName(value) {
    const dbo = await getDB()  
    const results = await dbo.collection("Products").find({name: new RegExp(value)}).limit(10).toArray() 
    return results
}

async function FindDocumentsByGmail(value) {
    const dbo = await getDB()
    const results = await dbo.collection("Users").findOne({gmail: value})
    return results
}

async function getCustomer(collectionName) {
    const dbo = await getDB();
    const customers = await dbo.collection(collectionName).find({role: 'Customer'}).toArray()
    return customers
}

async function getCustomer(collectionName) {
    const dbo = await getDB();
    const customers = await dbo.collection(collectionName).find({role: 'Staff'}).toArray()
    return customers
}

async function FindDocumentsById(collectionName, id) {
    const dbo = await getDB()
    const results = await dbo.collection(collectionName).findOne({ _id: ObjectId(id)})
    return results
}

async function getAllFeedback(collectionName) {
    const dbo = await getDB();
    const result = await dbo.collection(collectionName).find({}).sort({ time: -1 }).toArray();
    return result
}

async function deleteOrderByName(collectionName, name) {
    const dbo = await getDB()
    await dbo.collection(collectionName).deleteOne({ customer: ObjectId(name) })
}

async function updateDocument(id, data, collectionName) {
    const dbo = await getDB()
    await dbo.collection(collectionName).updateOne({ _id: ObjectId(id)}, data)
}

async function updateList(id, data, collectionName){
    const dbo = await getDB()
    await dbo.collection(collectionName).updateOne({_id: ObjectId(id)}, data)
}

async function getDocumentByName(name) {
    const dbo = await getDB();
    const results = await dbo.collection("Products").findOne({ name: name })
    return results
}

async function searchObjectbyName(collectionName, name) {
    const dbo = await getDB();
    const result = await dbo
        .collection(collectionName)
        .find({ name: { $regex: name} })
        .toArray();
    return result;
}

async function getHistory(collectionName, name) {
    const dbo = await getDB();
    const customers = await dbo.collection(collectionName).find({customer:name}).toArray()
    return customers
}

const USER_TABLE_NAME = "Users"
module.exports = {
    checkCategory,
    getCustomer,
    insertObject,
    FindDocumentsByGmail, 
    FindAllDocumentsByName, 
    findOne,checkUserRole, 
    checkUserLogin, 
    getUser,
    USER_TABLE_NAME, 
    getAllDocumentsFromCollection, 
    deleteDocumentById, 
    updateCollection,
    FindDocumentsById,
    getAllFeedback,
    getDocumentById,
    deleteOrderByName,
    getDocumentByName,
    updateDocument,
    searchObjectbyName,
    getHistory,
    AorD,
    getDocumentsFromCollection,
    updateList
}
