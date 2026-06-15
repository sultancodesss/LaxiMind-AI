require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { pool, initDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "laximind_default_secret";

// Middleware 
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://laxi-mind-a12iiuf1v-sultancodesss-projects.vercel.app"
    ];
    // Allow if origin is in the list, or if it's a Vercel preview domain, or if no origin (e.g. curl)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

//   File Upload
const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", upload.single("audio"), async (req, res) => {
  res.json({ transcript: "This is AI generated transcript" });
});

// Avatar Upload Config
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, req.user.id + "_" + Date.now() + ext);
  },
});
const avatarUpload = multer({ storage: avatarStorage });

//   Auth Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

// Register 
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  try {
    const [existingResult] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingResult.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into DB
    const [insertResult] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const userId = insertResult.insertId;

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { id: userId, name, email, avatar_url: null },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

//   Login 
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Find user by email
    const [result] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result[0];

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

//  Get Current User (Protected) 
app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({ user: result[0] });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// Profile Management Routes
app.put("/api/users/profile", verifyToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required." });

  try {
    await pool.query("UPDATE users SET name = ? WHERE id = ?", [name, req.user.id]);
    res.json({ message: "Profile updated successfully", name });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

app.post("/api/users/avatar", verifyToken, avatarUpload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const avatarUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarUrl, req.user.id]);
    res.json({ message: "Avatar uploaded successfully", avatar_url: avatarUrl });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

//  Start Server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database:", err.message);
    process.exit(1);
  });