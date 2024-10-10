import { Router } from "express";
const router = Router();
import bcrypt from "bcrypt";
import User from "../models/user.js";
import passport from "passport";
import { Strategy } from "passport-local";
import Assignment from "../models/assignment.js";
import Admin from "../models/admin.js";
import GoogleStrategy from "passport-google-oauth2";
import env from "dotenv";
env.config();




router.get("/user", async(req, res) => { //  user home route 
    res.render("user/user.ejs");
})

router.get("/register", async(req, res) => { //user registration route
    res.render("user/user-register.ejs");
})

router.get("/loginUser", async(req, res) => { //user login route
    res.render("user/user-login.ejs");
})

router.get("/fetchadmins", async(req, res) => { // to fetch the admins of admin db
    try {
        const adminData = await Admin.find({});
        res.render("admin/admin-data.ejs", { data: adminData });
    } catch (error) {
        console.log(error);
    }
});

router.get("/user-dashboard", (req, res) => { // to render the dashboard of user

    res.render("user/user-dashboard.ejs");
});

router.get( //get route for authentication using google oauth2
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);




router.get( // if user is authenticated then we move to user-dashboard
    "/auth/google/user-dashboard",
    passport.authenticate("google", {
        successRedirect: "/user-dashboard",
        failureRedirect: "/loginUser",
    })
);


router.get("/logoutUser", (req, res) => { //for logging out the current user
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});


router.post( // to authenticate the logged in user using passport local strategy
    "/loginUser",
    passport.authenticate("localUser", {
        successRedirect: "/user-dashboard",
        failureRedirect: "/loginUser",
    })
);


// to register the user by first checking if he is old user or new and then registering him
router.post("/register", async(req, res) => {
    try {
        const username1 = req.body.username;
        const password1 = req.body.password;

        const result = await User.findOne({ username: username1 });

        console.log(result);
        if (result) {


            res.status(401).json({ message: "You are already registered" });
        } else {
            bcrypt.hash(password1, 10, async(err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                } else {

                    const result = await User.create({ username: username1, password: hash });

                    const user = result
                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/user-dashboard");
                    });
                }
            });

        }
    } catch (error) {
        console.log(error);
    }

})


router.post("/user-assignment", async(req, res) => { // to post the assignment of the current user along with its name too
    if (req.isAuthenticated()) {
        const username1 = req.body.UserName;
        const task1 = req.body.Task;
        const adminname1 = req.body.AdminName;
        const assignment = await Assignment.create({ username: username1, task: task1, adminname: adminname1 });

        res.status(201).json({ message: "uploaded   assignment" });

    } else {
        res.redirect("/loginUser");
    }
})


passport.use( // passport local strategy to authenticate the logged in user
    "localUser",
    new Strategy(async function verify(username, password, cb) {

        try {
            const result = await User.find({ username: username })
                //if user is in db then compare the password with hash
            if (result) {
                const user = result[0];
                const storedHashedPassword = user.password;
                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        console.error("Error comparing passwords:", err);
                        return cb(err);
                    } else { //return logged in user
                        if (valid) {
                            return cb(null, user);
                        } else {
                            return cb(null, false);
                        }
                    }
                });
            } else {
                return cb("User not found");
            }
        } catch (err) {
            console.log(err);
        }
    })
);

passport.use( // use to authenticate user using oauth2
    "google",
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3001/auth/google/user-dashboard",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        async(accessToken, refreshToken, profile, cb) => {

            try {
                const result = await User.find({ username: profile.email });


                if (result.length === 0) //check if user is registered or not

                {

                    const Newuser = await User.create({ username: profile.email, password: "google" });

                    cb(null, Newuser)
                } else {
                    //already existing user 
                    cb(null, result)
                }

            } catch (error) {
                console.log(error);
                cb(error)
            }
        }
    )
);



passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});



export default router;