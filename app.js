const express = require('express')
const app = express()
const {ObjectId} = require('mongodb')
const dbHandler = require("./databaseHandler")
const bcrypt = require("bcrypt")
const session = require('express-session')
app.use(session({ secret: '124447yd@@$%%#', cookie: { maxAge: 60000 }, saveUninitialized: false, resave: false }))

const {insertObject,getUser, FindAllDocumentsByName, FindDocumentsById, getAllDocumentsFromCollection, deleteDocumentById, updateCollection, getDocumentById} = require('./databaseHandler')

//su dung HBS: =>res.render('....')
app.set('view engine', 'hbs')
//lay du lieu tu cac Form: textbox, combobox...
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// app.get('/adminHome',(req,res)=>{
//     res.render('adminHome',{userInfo:req.session.User})
// })

// app.get('/controllers/staff/staffHome',(req,res)=> {
//     res.render('staffHome', {userInfo:req.session.user})
// })

const adminController = require('./controllers/admin')
//tat ca cac dia chi co chua admin: localhost:5000/admin/... => goi controller admin
app.use('/admin', adminController)

const customerController = require('./controllers/customer')
const res = require('express/lib/response')
const async = require('hbs/lib/async')
app.use('/customer', customerController)

const staffController = require('./controllers/staff')
app.use('/staff', staffController)

// const staffController = require('./controllers/staff')
// app.use('/staff', staffController)

app.get('/', async(req,res)=>{
    customer = req.session.user
    const searchInputH = req.query.txtSearchHome
    const collectionName = "Products"
    const results = await getAllDocumentsFromCollection(collectionName)
    const resultSearch = await FindAllDocumentsByName(searchInputH)
    //res.render('home', {products:results, userInfo:customer})
    //2.hien thu du lieu qua HBS
    if(searchInputH == null) {         
        res.render('home', {products: results, userInfo:customer})       
    } else {   
        if (resultSearch.length != 0) {
            res.render('home', {products: resultSearch, userInfo:customer})
        } else {
            const messageSH = "Can not find your book"
            res.render('home', {products: results, messSH : messageSH, userInfo:customer})
        }
    }
})

function requiresLoginCustomer(req,res,next){
    if(req.session.user){
        return next()
    }else{
        res.redirect('/login')
    }
}

app.get("/logout", (req, res) => {
    req.session.user = null
    res.redirect("/")
})

app.get("/login", (req, res)=>{
    res.render('login')
})

app.post("/login", async(req, res) => {
    const userName = req.body.txtName;
    const pass = req.body.txtPassword;
    const user = await dbHandler.checkUserLogin(userName)
    if (user == -1) {
    res.render("login", { errorMsg: "Not found UserName!!" })
    } else {
    const validPass = await bcrypt.compare(pass, user.password)
    if (validPass) {
        const role = await dbHandler.checkUserRole(userName)
        if (role == -1) {
        res.render("login", { errorMsg: "Login failed!" })
        } else { 
            if (req.body.Role == role) {
                req.session.user = {
                    userName: userName,
                    role: role
                }
                console.log("Login with: ")
                console.log(req.session.user)
                req.session["cart"] = null
                if (role == "Customer") {
                    res.redirect('/')
                } else if (role == "Staff") {
                    res.redirect('/staff/staffHome')
                } else {
                    res.redirect('/admin/adminHome')
                }
            } else {
                res.render("login", { errorMsg: "Not auth!!!" })
            }
        }
    } else {
        res.render("login", { errorMsg: "Incorrect password!!!" })
    }
    }
})

app.get('/register', (req, res)=>{
    res.render('register')
})

app.post("/register", async (req, res) => {
    const userName = req.body.txtName
    const mail = req.body.txtGmail
    const phone = req.body.txtPhone
    const pass = req.body.txtPassword
    const rePass = req.body.txtRePass
    const role = req.body.Role
    const fullName = req.body.txtFullName
    const address = req.body.txtAddress
    const hashPass = await bcrypt.hash(pass, 10);
    const existedUser = await dbHandler.checkUserLogin(userName);
    if (existedUser == -1) {
        const validPass = await bcrypt.compare(rePass, hashPass);
        if (validPass) {
            const newUser = {
            userName: userName,
            Gmail: mail,
            fullName: fullName,
            Phone: phone,
            role: role,
            Address: address,
            password: hashPass,
            }
            await dbHandler.insertObject("Users", newUser);
            res.render("login");
        } else {
            res.render("register", { errorMsg: "Password is not match" });
        }
    } else {
    res.render("register", { errorMsg: "Username already used" });
    }
})

app.post('/buy',requiresLoginCustomer, async (req,res)=>{
    const id = req.body.txtId
    customer = req.session.user
    name = req.session.products
    price = req.session.price
    quantity = req.session.quantity
    const results = await FindDocumentsById("Products", id)
    let cart = req.session["cart"]
    //chua co gio hang trong session, day se la sp dau tien
    if(!cart){
        let dict = {
            user: customer.name,
            // id: customer._id,
            cart:[]
        }
            results.qty = 1;
            results.subtotal = results.price * results.qty;
            dict.cart.push(results);
            req.session["cart"] = dict;
            console.log(dict)
    }else{
        dict = req.session["cart"]
        //kiem tra book co trong dict k
        // Phương thức findIndex() trả về chỉ số của phần tử đầu tiên trong mảng đáp ứng chức năng kiểm tra được cung cấp. Nếu không, -1 được trả về.
        var oldBook = dict.cart.findIndex((book) => book._id == results._id);
        if (oldBook == -1) {
            results.qty = 1;
            results.subtotal = results.price * results.qty;
            dict.cart.push(results);
        } else {
            const oBook = dict.cart[oldBook];
            oBook.qty += 1;
            oBook.subtotal = oBook.price * oBook.qty;
        }
        req.session["cart"] = dict
        console.log(dict)
    }
    res.redirect('/')
})

app.get('/remove', async (req,res)=>{
    dict = req.session["cart"]
    const id = req.body.txtId
    for(var i = 0; i < dict.cart.length; i++){
        if(dict.cart._id == id){
            console.log(dict.cart._id)
            dict.cart.splice(i,1)
            return res.redirect('myCart')
        }
    }    
})

app.get('/myCart', async (req,res)=>{
    let quantity = 0;
    let ship = 0;
    let total = 0;
    let totalC = 0;
    const dict = req.session["cart"]
    for(var i = 0; i < dict.cart.length; i++){
        quantity += dict.cart[i].qty
        total += dict.cart[i].subtotal
    }
    if(quantity == 0)
    {
        ship = 0
    }else if(quantity < 10){
        ship = 10
    }else{
        ship = 5
    }
    totalC = total + ship
    res.render('myCart',{cart: dict, quantity: quantity, ship: ship, total: total, totalC: totalC})
})

app.post('/order', requiresLoginCustomer,async (req, res) => {
    const cart = req.session["cart"]
    const name = req.session.products
    const price = req.session.price
    const user = await dbHandler.getUser(req.session.user.userName)
    const results = await getAllDocumentsFromCollection("Products", name, price)
    // var today = new Date();
    // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()+ " -- "+ today.getDay()+"/"+ today.getMonth()+"/"+today.getFullYear();
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    console.log(dateTime)
    const newO = {cart: cart, customer:user.userName, time: dateTime, status:"Waiting for the goods", name: results.name, price: results.price}
    insertObject("Order",newO)
    req.session["cart"] = null;
    res.redirect('/')
})

app.get('/infoProduct', async (req,res)=>{
    const id = req.query.id
    const results = await FindDocumentsById("Products", id)
    res.render('infoProduct', {products : results})
})

const PORT = process.env.PORT || 5555
app.listen(PORT)
console.log('Sever is running!!! ' + PORT)