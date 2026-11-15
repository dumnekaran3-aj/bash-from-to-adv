
const express = require("express");
const router = express.Router();

const {
    signup,
    signin,
    getMe,
    getUserById
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", authMiddleware, getMe);
router.get("/user/:id", getUserById);


module.exports = router;
