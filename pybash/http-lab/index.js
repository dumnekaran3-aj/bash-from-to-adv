
require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = 8000;

// Validate environment configuration
if (!process.env.JWT_SECRET) {
    console.error("[ERROR] JWT_SECRET is missing in .env");
    process.exit(1);
}

// Global middleware
app.use(express.json());

// Health API
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "online",
        server: "HTTP Security Lab",
        platform: "Android Termux"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Start server
app.listen(PORT, "127.0.0.1", () => {

    console.log("\n================================");
    console.log("       HTTP SECURITY LAB");
    console.log("================================");

    console.log(`[SERVER] http://127.0.0.1:${PORT}`);

    console.log("\n[PUBLIC APIs]");
    console.log("GET  /health");
    console.log("POST /api/auth/signup");
    console.log("POST /api/auth/signin");

    console.log("\n[PROTECTED APIs]");
    console.log("GET  /api/auth/me");

    console.log("\n[SECURITY]");
    console.log("Authentication: JWT Bearer");
    console.log("Password Hashing: bcryptjs");
    console.log("Storage: JSON File");

    console.log("\n[SUMMARY]");
    console.log("Total APIs: 4");
    console.log("GET: 2");
    console.log("POST: 2");
    console.log("Protected: 1");
    console.log("Public: 3");

    console.log("\n[PLATFORM] Android Termux");
    console.log("================================\n");

});
