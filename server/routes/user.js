import { Router } from "express";
const router = Router(); // Create an Express Router instance
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import User from "../models/user.js"; // Import User model
import passport from "passport"; // Import Passport for authentication
import { Strategy } from "passport-local"; // Import Local Strategy for passport authentication
import Admin from "../models/admin.js"; // Import Admin model (not used here, but included)
import Social from "../models/soci-img.js"; // Import Social model for handling user uploads
import GoogleStrategy from "passport-google-oauth2"; // Import Google OAuth2 strategy (not used in this code)

import env from "dotenv"; // Import dotenv for environment variables (must be configured in a `.env` file)
import multer from "multer"; // Import multer for handling file uploads
import path from "path"; // Import path to handle file paths

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Specify the uploads folder to store files
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Name the file uniquely using timestamp
    }
});
const upload = multer({ storage: storage }); // Create the multer instance with storage settings

/* Routes related to user authentication and functionality */

// Route to render the user home page
router.get("/user", async(req, res) => {
    res.render("user/user.ejs"); // Renders the user home page
});

// Route to render the user registration page
router.get("/register", async(req, res) => {
    res.render("user/user-register.ejs"); // Renders the user registration page
});

// Route to render the user login page
router.get("/loginUser", async(req, res) => {
    res.render("user/user-login.ejs"); // Renders the user login page
});

// Route to render the user dashboard after login
router.get("/user-dashboard", (req, res) => {
    console.log("inside user dashboard");
    res.render("user/user-dashboard.ejs"); // Renders the user dashboard page
});

// Route to log out the current user
router.get("/logoutUser", (req, res) => {
    req.logout(function(err) { // Logs out the user
        if (err) {
            return next(err);
        }
        res.redirect("/"); // Redirect to the home page after logout
    });
});

// Authenticate the user with Passport using local strategy during login
router.post(
    "/loginUser",
    passport.authenticate("localUser", {
        successRedirect: "/user-dashboard", // Redirect to the dashboard on successful login
        failureRedirect: "/loginUser", // Redirect back to login page on failure
    })
);

// Route to register a new user (checks if the user exists, then registers them)
router.post("/register", async(req, res) => {
    try {
        const username1 = req.body.username;
        const password1 = req.body.password;

        const result = await User.findOne({ username: username1 }); // Check if user already exists
        if (result) {
            res.status(401).json({ message: "You are already registered" }); // If user exists, return an error
        } else {
            // Hash the password before saving the new user
            bcrypt.hash(password1, 10, async(err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err); // Log any error during password hashing
                } else {
                    // Create a new user with hashed password
                    const result = await User.create({ username: username1, password: hash });
                    const user = result;

                    // Log the user in after successful registration
                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/user-dashboard"); // Redirect to dashboard after successful registration
                    });
                }
            });
        }
    } catch (error) {
        console.log(error); // Log any errors during the process
    }
});

// Route to handle user image uploads (allows up to 10 images)
router.post("/user-upload", upload.array('images', 10), async(req, res) => {
    if (req.isAuthenticated()) { // Check if the user is authenticated
        console.log("Inside user upload block");

        // Log the request body and files for debugging
        console.log("Request body:", req.body);
        console.log("Uploaded files:", req.files);

        const username1 = req.body.UserName;
        const social_details = req.body.social_media_handle;

        // Check if required fields exist
        if (!username1 || !social_details) {
            console.log("Missing required fields");
            return res.status(400).json({ message: "Missing required fields" });
        }

        try {
            // Process the uploaded files
            const imagePaths = req.files.map(file => {
                return {
                    path: file.path, // Store file path where the image is saved
                    contentType: file.mimetype // Store the MIME type of the image
                };
            });

            // Create a new entry in the database for the user and their uploaded images
            const newEntry = await Social.create({
                userName: username1,
                social_media_handle: social_details,
                images: imagePaths // Save the uploaded images as an array
            });

            res.status(201).json({ message: "Uploaded images" }); // Respond with success message
        } catch (err) {
            console.error("Error creating entry:", err); // Log any errors during the database operation
            res.status(500).json({ message: "Server error" });
        }
    } else {
        res.redirect("/loginUser"); // If not authenticated, redirect to the login page
    }
});

/* Passport local strategy to authenticate the user */

// Define the local strategy for user authentication
passport.use(
    "localUser",
    new Strategy(async function verify(username, password, cb) {
        try {
            const result = await User.find({ username: username }); // Find the user in the database
            if (result) {
                const user = result[0];
                console.log(result + "------------------------------------------------------");
                console.log(result[0]);

                const storedHashedPassword = user.password;
                // Compare the input password with the hashed password stored in the database
                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        console.error("Error comparing passwords:", err); // Log error if password comparison fails
                        return cb(err);
                    } else {
                        if (valid) { // If passwords match, return the user
                            return cb(null, user);
                        } else {
                            return cb(null, false); // If passwords don't match, return false
                        }
                    }
                });
            } else {
                return cb("User not found"); // Return error if user is not found
            }
        } catch (err) {
            console.log(err); // Log any errors during the process
        }
    })
);

// Serialize user information into the session
passport.serializeUser((user, cb) => {
    cb(null, user); // Serialize the entire user object into the session
});

// Deserialize user information from the session
passport.deserializeUser((user, cb) => {
    cb(null, user); // Deserialize the user object from the session
});

export default router;