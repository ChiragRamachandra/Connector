const express  = require ('express');
const router =  express.Router();
const bcrypt = require ('bcryptjs');
const gravatar = require ('gravatar');

const { check, validationResult } = require ('express-validator');

//Bringing the model
const User = require ('../../models/User') ;

// @route GET api/users
// @desc Test Route
// @access Public

router.post('/',[
	check ('name', 'Name is required').not().isEmpty(),
	check ('email', 'Email is not valid').isEmail(), 
	check ('password', 'psasword is not valid').isLength({min: 6})
	],

	async (req,res) => {

		const errors  = validationResult (req);
		if  (! errors.isEmpty()){
			return res.status (400).json({errors: errors.array()});
		}


		const {name, email, password} = req.body;

		try {

			//see if user exists
			let user = await User.findOne({email});

			if (user){
				return res.status(400).json({ errors: [{msg: 'User Already Exists'}] });
			}

			// Get user gravatar

			const avatar = gravatar.url(email,{
				s: '200',
				pg:'pg',
				d:'mm'
			})

			user = new User ({
				name,
				email,
				avatar,
				password
			});
			//Encrypt Password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();

			//Return  jsonwebtoken

			res.send ('User registered');
		}
		catch(err){

			console.error(err.message);
			res.status(500).send('Server Error');

		}



	});

module.exports = router;
