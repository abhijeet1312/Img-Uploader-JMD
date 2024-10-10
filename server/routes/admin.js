import { Router } from "express";
const router = Router();
import bcrypt from "bcrypt";
import User from "../models/user.js";

import Assignment from "../models/assignment.js";
import Admin from "../models/admin.js";
import jwt from "jsonwebtoken";



router.get("/admin", async(req, res) => { //  admin home route 
    res.render("admin/admin.ejs");
})

router.get("/registerA", async(req, res) => { //admin registration route
    res.render("admin/admin-register.ejs");
});

router.get("/loginAdmin", async(req, res) => { //admin login route
    res.render("admin/admin-login.ejs");
})
router.get("/logoutAdmin", (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

router.get("/assignments", async(req, res) => { //assignments related to logged in admin is shown here 
    if (!req.session.userId) {
        return res.status(403).send('You need to log in');
    }

    try {
        const user = await Admin.findById(req.session.userId);

        if (user) {
            console.log(user.adminname); // Access adminname directly  
            const assignmentlist = await Assignment.find({ adminname: user.adminname });
            console.log(assignmentlist);
            res.render("assignment/assignments.ejs", { assignmentlistEJS: assignmentlist }); // Pass name to the view if using EJS  
        } else {
            res.status(404).send('User not found');
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get("/assignment/:id", (req, res) => { //this routes takes the particular assignment to different page for accepting or rejcting thr assignment
    res.render("assignment/assignment-review.ejs", { id: req.params.id });
    console.log("assignment id is " + req.params.id);
});
router.post("/assignment/:id/accept", async(req, res) => { // this route accept the assignment and returns the updated assignment with status updated to accepted

    // res.status(201).json({ message: "Accepted   assignment" });
    const assignmentId = req.params.id;
    try {
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            assignmentId, { status: 'accepted' }, { new: true } // Return the updated document  
        );

        if (!updatedAssignment) {
            return res.status(404).send({ message: 'Assignment not found.' });
        }
        res.send({ message: 'Assignment accepted.', assignment: updatedAssignment });
        console.log(updatedAssignment);
    } catch (error) {
        res.status(400).send(error);
    }
});
router.post("/assignment/:id/reject", async(req, res) => { //this route reject the assignment and returns the updated assignment with status updated to rejected
    const assignmentId = req.params.id;
    try {
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            assignmentId, { status: 'rejected' }, { new: true } // Return the updated document  
        );

        if (!updatedAssignment) {
            return res.status(404).send({ message: 'Assignment not found.' });
        }
        res.send({ message: 'Assignment rejected.', assignment: updatedAssignment });
        console.log(updatedAssignment);
    } catch (error) {
        res.status(400).send(error);
    }
    // res.status(201).json({ message: "Reject   assignment" });
});
router.get("/admin-dashboard", async(req, res) => { //renders the admin-dashboard page
    res.render("admin/admin-dashboard.ejs");
});


router.post("/loginAdminMain", async(req, res) => { // here registered admin is authenticated for logging in and then he logs in and does the admin related work
    try {
        const username1 = req.body.adminname;
        const password = req.body.password;
        console.log(username1 + "  AND  " + password);

        const user = await Admin.findOne({ adminemail: username1 }); // Use findOne to get a single user  

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); //compairing the hashed password
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Store userId in session  
        req.session.userId = user._id; // Set the session userId here  

        // Creates a JSON Web Token (JWT) for the authenticated user, containing the user's ID  
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        // Set the token as an HTTP-only cookie in the response for secure storage on the client  
        res.cookie('token', token, { httpOnly: true });
        res.redirect("/admin-dashboard");

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



router.post("/registerA", async(req, res) => { //registering the admin by checking he is new admin or old one

    try {

        const adminemail1 = req.body.adminemail;
        const password1 = req.body.password;
        const adminname1 = req.body.adminname;
        console.log(adminname1 + "    " + password1);
        const result = await Admin.findOne({ adminemail: adminemail1 });
        console.log(result);
        if (result) {
            res.status(401).json({ message: "You are already registered" });
        } else {
            bcrypt.hash(password1, 10, async(err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                } else {
                    const result = await Admin.create({ adminemail: adminemail1, password: hash, adminname: adminname1 });
                    console.log(result);
                    console.log("hasheddd password is" + hash);
                    const user = result
                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/admin-dashboard");
                    });
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
});
export default router;