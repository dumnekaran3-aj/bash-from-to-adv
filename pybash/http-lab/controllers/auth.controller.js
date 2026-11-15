const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const { readDB, writeDB } = require("../utils/jsonStore");

// SIGNUP CONTROLLER
async function signup(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Read database
        const db = await readDB();

        // Check existing email
        const existingUser = db.users.find(
            user => user.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        // Save user
        db.users.push(newUser);
        await writeDB(db);

        // Send response without password
        const { password: savedPassword, ...safeUser } = newUser;

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: safeUser
        });

    } catch (error) {
        console.error("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}



async function signin(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        // Read database
        const db = await readDB();

        // Find user
        const user = db.users.find(
            u => u.email === email.trim().toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // Remove password from response
        const { password: savedPassword, ...safeUser } = user;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: safeUser
        });

    } catch (error) {
        console.error("Signin Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}




// GET CURRENT USER PROFILE
async function getMe(req, res) {
    try {
        const db = await readDB();

        const user = db.users.find(
            u => u.id === req.user.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User no longer exists"
            });
        }

        const {
            password: savedPassword,
            ...safeUser
        } = user;

        return res.status(200).json({
            success: true,
            user: safeUser
        });

    } catch (error) {
        console.error("Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getUserById(req, res) {
    const db = await readDB();
    const user = db.users.find(u => u.id === req.params.id);
    
    if (!user) {
        return res.status(404).json({ success: false, message: "Not found" });
    }
    
    const { password, ...safeUser } = user;
    return res.status(200).json({ success: true, user: safeUser });
}

module.exports = {
    signup,signin,getMe,getUserById
};
