import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// 1. CREATE USER
export const createUser = async (req, res) => {
  try {
    const { FullName, email, PhoneNumber, password, role, Profile } = req.body;

    // Required fields validation
    if (!FullName || !email || !PhoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "FullName, email, PhoneNumber and password are required",
      });
    }

    // Validate role
    const userRole = role || "student";

    if (!["student", "recruiter"].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student or recruiter",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      FullName,
      email: email.trim().toLowerCase(),
      PhoneNumber,
      password: hashedPassword,
      role: userRole,
      Profile: Profile || {},
    });

    // Never send password in response
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or another unique field already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. GET SINGLE USER BY ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// 4. UPDATE USER
// ===================================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { FullName, email, PhoneNumber, password, role, Profile } = req.body;

    // Update basic fields only when provided
    if (FullName !== undefined) {
      user.FullName = FullName;
    }

    if (PhoneNumber !== undefined) {
      user.PhoneNumber = PhoneNumber;
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      user.email = normalizedEmail;
    }

    // Validate and update role
    if (role !== undefined) {
      if (!["student", "recruiter"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be student or recruiter",
        });
      }

      user.role = role;
    }

    // Hash new password if supplied
    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }

      user.password = await bcrypt.hash(password, 12);
    }

    // Update nested Profile fields
    if (Profile !== undefined) {
      if (!Profile || typeof Profile !== "object" || Array.isArray(Profile)) {
        return res.status(400).json({
          success: false,
          message: "Profile must be an object",
        });
      }

      const allowedProfileFields = [
        "bio",
        "skill",
        "resume",
        "ResumeOriginalName",
        "componay",
        "ProfilePhoto",
      ];

      for (const field of allowedProfileFields) {
        if (Object.prototype.hasOwnProperty.call(Profile, field)) {
          user.set(`Profile.${field}`, Profile[field]);
        }
      }
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or another unique field already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===================================
// 5. DELETE USER
// ===================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Optional role check
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "You cannot login with this role",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
