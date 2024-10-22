import { Router } from "express";
const router = Router(); // Create an Express Router instance
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import User from "../models/user.js"; // Import User model (used elsewhere, but not in this file)
import Admin from "../models/admin.js"; // Import Admin model
import jwt from "jsonwebtoken"; // Import jsonwebtoken for creating JWT tokens
import Social from "../models/soci-img.js"; // Import Social model (used to manage social media images)

/* Routes related to the admin functionalities */

// Route to render the admin home page
router.get("/admin", async(req, res) => {
    res.render("admin/admin.ejs"); // Renders the admin home page
});

// Route to render the admin registration page
router.get("/registerA", async(req, res) => {
    res.render("admin/admin-register.ejs"); // Renders the admin registration page
});

// Route to render the admin login page
router.get("/loginAdmin", async(req, res) => {
    res.render("admin/admin-login.ejs"); // Renders the admin login page
});

// Route to render the admin dashboard
router.get("/admin-dashboard", async(req, res) => {
    res.render("admin/admin-dashboard.ejs"); // Renders the admin dashboard after login
});

// Route to fetch and display all users' data (Social media posts/images)
router.get("/users-data", async(req, res) => {
    console.log("inside all users data block");
    const result_array = await Social.find({}); // Fetches all social data from the database
    res.render("admin/user-list.ejs", {
        UserslistEJS: result_array // Passes the data to the 'user-list.ejs' template
    });
});

// Route to display the details of a single user by ID
router.get("/user/:id", async(req, res) => {
    const ID = req.params.id;
    console.log("inside all single user data block");
    const result_array = await Social.findById(ID); // Fetches data for a single user by ID
    console.log(result_array);

    res.render("admin/users-data.ejs", {
        UserlistEJS: result_array // Passes the data to 'users-data.ejs' template to display
    });
});

// Admin logout route
router.get("/logoutAdmin", (req, res) => {
    req.logout(function(err) { // Logs out the admin
        if (err) {
            return next(err);
        }
        res.redirect("/"); // Redirects to the home page after logout
    });
});

/* Routes related to admin login and registration */

// Route to handle admin login
router.post("/loginAdminMain", async(req, res) => {
    try {
        const username1 = req.body.adminname;
        const password = req.body.password;
        console.log(username1 + "  AND  " + password);

        // Find the admin by email
        const user = await Admin.findOne({ adminemail: username1 });

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" }); // Admin not found
        }

        // Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials" }); // Incorrect password
        }

        // Store userId in session
        req.session.userId = user._id;

        // Create a JWT token for the authenticated admin
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        // Set the JWT as an HTTP-only cookie
        res.cookie('token', token, { httpOnly: true });
        res.redirect("/admin-dashboard"); // Redirects to the admin dashboard
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" }); // Error handling
    }
});

// Route to handle admin registration
router.post("/registerA", async(req, res) => {
    try {
        const adminemail1 = req.body.adminemail;
        const password1 = req.body.password;
        const adminname1 = req.body.adminname;
        console.log(adminname1 + "    " + password1);

        // Check if the admin already exists
        const result = await Admin.findOne({ adminemail: adminemail1 });

        if (result) { // Admin already exists
            res.status(401).json({ message: "You are already registered" });
        } else {
            // Hash the password before saving the admin
            bcrypt.hash(password1, 10, async(err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                } else {
                    // Create a new admin entry
                    const result = await Admin.create({ adminemail: adminemail1, password: hash, adminname: adminname1 });

                    const user = result;

                    // Log the new admin in after registration
                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/admin-dashboard"); // Redirect to dashboard after registration
                    });
                }
            });
        }
    } catch (error) {
        console.log(error); // Handle any errors during registration
    }
});

export default router;