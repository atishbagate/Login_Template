if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const app  = express()
//using static file css 
app.use('/assets',express.static('assets'))
//using flash
const flash = require('express-flash')
const session = require('express-session')

const override = require('method-override')

// use hashed password and compare hashed password
const bcrypt = require('bcrypt') 



const passport = require('passport')
//using passport for check
const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )
//using to store data/password
const users = []

app.set('view-engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(override('_method'))

app.get('/',checkAuthenticated,(req,res)=>{
    res.render('index.ejs',{name: req.user.name})
})

app.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs')
})
app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}))

app.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})

app.post('/register',checkNotAuthenticated,async (req,res)=>{
    try{
        const hash = await bcrypt.hash(req.body.password,10)

        users.push({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hash,
        })
        res.redirect('/login')
    }
    catch{
        res.redirect('./register')
    }
    console.log(users);
})

app.delete('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/login')
})



function checkAuthenticated(req,res,next) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('./login')
}
function checkNotAuthenticated(req,res,next) {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}
app.listen(process.env.PORT || 3000)
// to run use : npm run devStart    
//              nodemon server.js
//              node server.js