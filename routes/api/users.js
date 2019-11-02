const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')  //refer express validator docs
const User = require('../../models/User')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

// registration route
router.post('/',[
    check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email','enter a valid email').isEmail(),
    check('password','minimum 6 characters required').isLength({min : 6})
],async(req,res)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }
    const {name ,email, password} = req.body
    try {
        let user = await User.findOne({email})  //checking if the user exists already
        if(user) {
            return res.status(400).json({ errors : [{ msg : 'user already exists'}]})
        }
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d:'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        const salt = await bcrypt.genSalt(10) //hash level 10 for the password
        user.password = await bcrypt.hash(password,salt)

        await user.save()        

        const payload = {  //for initiating the json web token
            user : {
                id : user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'),(err,token)=>{
            if(err) throw err;
            res.json({token})
        })
    } catch (error) {
        res.status(500).send('server error')
    }
   

})

module.exports = router   //  git push mern master 