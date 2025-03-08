const bcrypt = require("bcrypt");
const { User, Post, Community,Token } = require('../models');
const jwt = require("jsonwebtoken");
const UserPreference = require("../models/preference.model");
const formatCreatedAt = require("../utils/timeConverter");
const { verifyContextData, types } = require("./auth.controller");
const { saveLogInfo } = require("../middlewares/logger/logInfo");
const duration = require("dayjs/plugin/duration");
const dayjs = require("dayjs");
const Admin = require("../models/admin.model");
dayjs.extend(duration);

const LOG_TYPE = {
  SIGN_IN: "sign in",
  LOGOUT: "logout",
};

const LEVEL = {
  INFO: "info",
  ERROR: "error",
  WARN: "warn",
};

const MESSAGE = {
  SIGN_IN_ATTEMPT: "User attempting to sign in",
  SIGN_IN_ERROR: "Error occurred while signing in user: ",
  INCORRECT_EMAIL: "Incorrect email",
  INCORRECT_PASSWORD: "Incorrect password",
  DEVICE_BLOCKED: "Sign in attempt from blocked device",
  CONTEXT_DATA_VERIFY_ERROR: "Context data verification failed",
  MULTIPLE_ATTEMPT_WITHOUT_VERIFY:
    "Multiple sign in attempts detected without verifying identity.",
  LOGOUT_SUCCESS: "User has logged out successfully",
};

const signin = async (req, res, next) => {
  
  await saveLogInfo(
    req,
    "User attempting to sign in",
    LOG_TYPE.SIGN_IN,
    LEVEL.INFO
  );

  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({where : {email}});
    
    
    if (!existingUser) {
      await saveLogInfo(
        req,
        MESSAGE.INCORRECT_EMAIL,
        LOG_TYPE.SIGN_IN,
        LEVEL.ERROR
      );

      return res.status(404).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    

    if (!isPasswordCorrect) {
      await saveLogInfo(
        req,
        MESSAGE.INCORRECT_PASSWORD,
        LOG_TYPE.SIGN_IN,
        LEVEL.ERROR
      );

      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isContextAuthEnabled = true;
    

    if (isContextAuthEnabled) {
      const contextDataResult = await verifyContextData(req, existingUser);
      console.log(contextDataResult);
      

      if (contextDataResult === types.BLOCKED) {
        await saveLogInfo(
          req,
          MESSAGE.DEVICE_BLOCKED,
          LOG_TYPE.SIGN_IN,
          LEVEL.WARN
        );

        return res.status(401).json({
          message:
            "You've been blocked due to suspicious login activity. Please contact support for assistance.",
        });
      }

      if (
        contextDataResult === types.NO_CONTEXT_DATA ||
        contextDataResult === types.ERROR
      ) {
        await saveLogInfo(
          req,
          MESSAGE.CONTEXT_DATA_VERIFY_ERROR,
          LOG_TYPE.SIGN_IN,
          LEVEL.ERROR
        );

        return res.status(500).json({
          message: "Error occurred while verifying context data",
        });
      }

      if (contextDataResult === types.SUSPICIOUS) {
        await saveLogInfo(
          req,
          MESSAGE.MULTIPLE_ATTEMPT_WITHOUT_VERIFY,
          LOG_TYPE.SIGN_IN,
          LEVEL.WARN
        );

        return res.status(401).json({
          message: `You've temporarily been blocked due to suspicious login activity. We have already sent a verification email to your registered email address. 
          Please follow the instructions in the email to verify your identity and gain access to your account.

          Please note that repeated attempts to log in without verifying your identity will result in this device being permanently blocked from accessing your account.
          
          Thank you for your cooperation`,
        });
      }

      if (contextDataResult.mismatchedProps) {
        const mismatchedProps = contextDataResult.mismatchedProps;
        const currentContextData = contextDataResult.currentContextData;
        if (
          mismatchedProps.some((prop) =>
            [
              "ip",
              "country", 
              "city",
              "device",
              "deviceType",
              "os",
              "platform", 
              "browser"
            ].includes(prop)
          )
        ) {
          req.mismatchedProps = mismatchedProps;
          req.currentContextData = currentContextData;
          req.user = existingUser;
          return next();
        }
      }
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };       


    const accessToken = jwt.sign(payload, process.env.SECRET, {
      expiresIn: "6h",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
      expiresIn: "7d",
    });
    

    await Token.create({
      userId: existingUser.id,
      refreshToken,
      accessToken,
    });
    

    res.status(200).json({
      accessToken,
      refreshToken,
      accessTokenUpdatedAt: new Date().toLocaleString(),
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        avatar: existingUser.avatar,
      },
    });
  } catch (err) {
    await saveLogInfo(
      req,
      MESSAGE.SIGN_IN_ERROR + err.message,
      LOG_TYPE.SIGN_IN,
      LEVEL.ERROR
    );

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/**
 * Retrieves a user's profile information, including their total number of posts,
 * the number of communities they are in, the number of communities they have posted in,
 * and their duration on the platform.

 * @param req - Express request object
 * @param res - Express response object
 * @param {Function} next - Express next function
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Community,
          as: 'membersOf',
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalPosts = await Post.count({
      where: { userId: req.params.id }
    });

    const totalCommunities = await Community.count({
      include: [{
        model: User,
        as: 'members',
        where: { id: req.params.id },
        through: { attributes: [] }
      }]
    });

    const postCommunities = await Post.findAll({
      where: { userId: req.params.id },
      attributes: ['communityId'],
      group: ['communityId']
    });

    const createdAt = dayjs(user.createdAt);
    const now = dayjs();
    const durationObj = dayjs.duration(now.diff(createdAt));
    const duration = formatDuration(durationObj);

    res.status(200).json({
      ...user.toJSON(),
      totalPosts,
      totalCommunities,
      totalPostCommunities: postCommunities.length,
      duration
    });
  } catch (err) {
    console.error('Error in getUser:', err);
    next(err);
  }
};

// Helper function to format duration
const formatDuration = (durationObj) => {
  const durationMinutes = durationObj.asMinutes();
  const durationHours = durationObj.asHours();
  const durationDays = durationObj.asDays();

  if (durationMinutes < 60) {
    return `${Math.floor(durationMinutes)} minutes`;
  } else if (durationHours < 24) {
    return `${Math.floor(durationHours)} hours`;
  } else if (durationDays < 365) {
    return `${Math.floor(durationDays)} days`;
  } else {
    const durationYears = Math.floor(durationDays / 365);
    return `${durationYears} years`;
  }
};

/**
 * Adds a new user to the database with the given name, email, password, and avatar.
 *
 * @description If the email domain of the user's email is "mod.socialecho.com", the user will be
 * assigned the role of "moderator" by default, but not necessarily as a moderator of any community.
 * Otherwise, the user will be assigned the role of "general" user.
 *
 * @param {Object} req.files - The files attached to the request object (for avatar).
 * @param {string} req.body.isConsentGiven - Indicates whether the user has given consent to enable context based auth.
 * @param {Function} next - The next middleware function to call if consent is given by the user to enable context based auth.
 */
const addUser = async (req, res, next) => {
  
  try {
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    /**
     * @type {boolean} isConsentGiven
     */
    const isConsentGiven = req.body.isConsentGiven;
  
    const defaultAvatar =
      "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg";
    const fileUrl = req.files?.[0]?.filename
      ? `http://localhost:8080/userAvatars/${
          req.files[0].filename
        }`
      : defaultAvatar;
  
    const emailDomain = req.body.email.split("@")[1];
    const role = emailDomain === "mod.touch.com" ? "moderator" : "general";
  
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: role,
      avatar: fileUrl,
    }, {
      req: req  // Pass request in options for the afterCreate hook
    });
  
    // If moderator, create admin account
    if (role === "moderator") {
      const newAdmin = new Admin({
        username: req.body.name,
        password: hashedPassword,
        id: newUser.id,
      });
      await newAdmin.save();
    }

    if (isConsentGiven === false) {
      res.status(201).json({
        message: "User added successfully",
      });
    } else {
      res.status(201).json({
        message: "User added successfully",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "Failed to add user",
    });
  }
};

const logout = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1] ?? null; 
    if (accessToken) {
      const token = await Token.findOne({ where: { accessToken } });

      const user = await User.findOne({where : {id : token?.userId}});
      req.body.email = user?.email;
      await Token.destroy({ 
        where: { accessToken } 
      });
      
      await saveLogInfo(
        req,
        MESSAGE.LOGOUT_SUCCESS,
        LOG_TYPE.LOGOUT,
        LEVEL.INFO
      );
    }
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    console.error('Logout error:', err);
    await saveLogInfo(
      req,
      err.message,
      LOG_TYPE.LOGOUT,
      LEVEL.ERROR
    );
    res.status(500).json({
      message: "Internal server error. Please try again later.",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const existingToken = await Token.findOne({
      refreshToken: { $eq: refreshToken },
    });
    if (!existingToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }
    const existingUser = await User.findById(existingToken.user);
    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const refreshTokenExpiresAt =
      jwt.decode(existingToken.refreshToken).exp * 1000;
    if (Date.now() >= refreshTokenExpiresAt) {
      await existingToken.deleteOne();
      return res.status(401).json({
        message: "Expired refresh token",
      });
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
    };

    const accessToken = jwt.sign(payload, process.env.SECRET, {
      expiresIn: "6h",
    });

    res.status(200).json({
      accessToken,
      refreshToken: existingToken.refreshToken,
      accessTokenUpdatedAt: new Date().toLocaleString(),
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route GET /users/moderator
 */
const getModProfile = async (req, res) => {
  try {
    const moderator = await User.findById(req.userId);
    if (!moderator) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const moderatorInfo = {
      ...moderator._doc,
    };
    delete moderatorInfo.password;
    moderatorInfo.createdAt = moderatorInfo.createdAt.toLocaleString();

    res.status(200).json({
      moderatorInfo,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route PUT /users/:id
 */
const updateInfo = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await User.findOne({where :{id}});
    console.log(user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { location, interests, bio } = req.body;

    user.location = location;
    user.interests = interests;
    user.bio = bio;

    await user.save();

    res.status(200).json({
      message: "User info updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating user info",
    });
  }
};

module.exports = {
  addUser,
  signin,
  logout,
  refreshToken,
  getModProfile,
  getUser,
  updateInfo,
};