const express = require('express')
const router = express.Router()
const auth = require('..//../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const { check, validationResult } = require('express-validator')
const request = require('request')
const config = require('config')


router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({ msg: 'thers no prof for this user' })
        }
        res.json(profile)
    } catch (error) {
        return res.status(400).json({ msg: 'there is no profile for this user' })
    }
})

// post req api/profile(create or validate user profile)

router.post(
    '/', [auth, [
        check('status', 'status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty()
    ]], async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { company, website, bio, location, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body
        const profileFields = {}
        profileFields.user = req.user.id
        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubusername) profileFields.githubusername = githubusername
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }

        // build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube
        if (twitter) profileFields.social.twitter = twitter
        if (facebook) profileFields.social.facebook = facebook
        if (linkedin) profileFields.social.linkedin = linkedin
        if (instagram) profileFields.social.instagram = instagram

        try {
            let profile = await Profile.findOne({ user: req.user.id })

            if (profile) {    //if profile is found the update
                // update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                )
                return res.json(profile)
            }
            //    profile is not found then create
            // create
            profile = new Profile(profileFields)
            await profile.save()
            res.json(profile)
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error')

        }
    }
)

// get all profiles 
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profile)

    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

// get profile by user id
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if (!profile) res.send(400).json({ msg: 'there is no profile for this user' })
        res.json(profile)

    } catch (err) {
        console.log(err.message)
        if (err.kind == 'ObjectId') return status(400).json({ msg: 'there is no profile for this user' })
        res.status(500).send('Server Error')
    }
})

// delete profile ,user & posts

router.delete('/', auth, async (req, res) => {
    try {
        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id })
        // remove user
        await User.findOneAndRemove({ _id: req.user.id })

        res.json({ msg: 'user deleted' })
    } catch (err) {
        console.log(err.message)
        res.status(400).send('server error')
    }
})

// add profile experience

router.put('/experience', [auth, [check('title', 'title is required').not().isEmpty(), check('company', 'company is required').not().isEmpty(), check('from', 'from date is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty) {
            return res.status(400).json({ errors: errors.array() })
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id })
            profile.experience.unshift(newExp)
            await profile.save()
            res.json(profile)
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Server error')
        }
    }
)

// delete experience form profile
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        // get remove index
        const removeIndex = profile.experience.map(item => {
            item.id
        })
            .indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

// add profile education

router.put('/education', [auth,
    [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'from date is required').not().isEmpty()
    ]
],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty) {
            return res.status(400).json({ errors: errors.array() })
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id })
            profile.education.unshift(newEdu)
            await profile.save()
            res.json(profile)
        } catch (error) {
            console.log(error.message)
            res.status(500).send('Server error')
        }
    }
)

// delete education form profile
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        // get remove index
        const removeIndex = profile.education.map(item => {
            item.id
        })
            .indexOf(req.params.edu_id)

        profile.experience.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

// get user repos from github
router.get('/github/:username', (req,res)=>{
    try {
        const options = {
            uri : `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method : 'GET',
            headers:{'user-agent' : 'node.js'}
        }

        request(options,(error,response,body)=> {
            if(error) console.log(error)
            if(response.statusCode != 200) {
                return res.status(404).json({msg : 'no github profile found'})
            }
            res.json(JSON.parse(body))
        })
        
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})



module.exports = router