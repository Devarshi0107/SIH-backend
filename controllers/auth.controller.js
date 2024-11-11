const bcrypt = require('bcrypt');
const User = require('../models/user.model'); 
const PostalCircle = require('../models/PostalCircle.model');
const jwt = require('jsonwebtoken');

exports.register = async (req,res) =>{
    try {
        console.log(req.body);
        const { email, password, name ,phone} = req.body;
        let UserRole = req.body.role;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists with this email' });
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create a new user with the default role as 'user'
        const newUser = new User({
          email,
          password: hashedPassword,
          name,
          phone,
          role: UserRole ? UserRole : "user" // Ensure default role is 'user' if UserRole is set i.e  he/she is admin 
        });
          
        // Save the user to the database
        await newUser.save();
    
        res.status(201).json({ message: 'User created successfully', user : newUser });
      } catch (error) {
        res.status(500).json({ message: 'Server error. Please try again later.' });
      }

}

exports.login = async (req, res) => {
   
   /* 
     Email and password -> User and Admin
     Unique Id and Password -> Postal Circle
   */
  
   const { email, password, unique_id } = req.body;
  
   console.log("Email :- " + email);
   console.log("password :- " + password);
   console.log("UID :- " + unique_id);
    try {
      let user;
  
      // Determine user type based on provided credentials
      if (email) {

        // Handle login for User or Admin
        user = await User.findOne({ email });

      } else if (unique_id) {

        // Handle login for Postal Circle
        user = await PostalCircle.findOne({ unique_id });

      } else {
        return res.status(400).json({ message: 'Email or unique ID is required for login' });
      }
  
      // If user not found, return error
      if (!user) {
        return res.status(404).json({ message: 'Invalid Credential' }); // User not found 
      }
  
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid Credential!' });
      }
  
      console.log("user: ",user);
      // Check user role to confirm login type
      if ((user.role === 'admin' && email) ||
          (user.role === 'postal_circle' && unique_id) ||
          (user.role === 'user' && email)) {
        
         // Generate a token with user information
  // const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });    

        res.status(200).json({ message: 'Login successful', role: user.role });
      } else {
        res.status(400).json({ message: 'Invalid login credentials for this role' });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
  

exports.logout = (req, res) => { 
}