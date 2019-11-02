const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const {check, validationResult} = require('express-validator')
const config = require('config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// registering
router.get('/',auth,async(req,res)=> {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error  ')
    }
})

// logging in the existing user
router.post('/',[
    check('email','enter a valid email').isEmail(),
    check('password','Password is required').exists()
],async(req,res)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }
    const {email, password} = req.body
    try {
        let user = await User.findOne({email})  //checking if the user exists already
        if(!user) {
            return res.status(400).json({ errors : [{ msg : 'Invalid creds'}]})
        }

        const isMatch = await bcrypt.compare(user.password , password)
        if(!isMatch) {
            return res.status(400).json({errors : [{msg : 'invalid creds'}]})
        }
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d:'mm'
        })

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
 

module.exports = router