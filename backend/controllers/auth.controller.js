const { Context, User, SuspiciousLogin } = require("../models");
const UserPreference = require("../models/preference.model");
const geoip = require("geoip-lite");
const { saveLogInfo } = require("../middlewares/logger/logInfo");
const formatCreatedAt = require("../utils/timeConverter");

const types = {
  NO_CONTEXT_DATA: "no_context_data",
  MATCH: "match",
  BLOCKED: "blocked",
  SUSPICIOUS: "suspicious",
  ERROR: "error",
};

const getCurrentContextData = (req) => {
  const ip = req.clientIp || "unknown";
  const location = geoip.lookup(ip) || "unknown";
  const country = location.country ? location.country.toString() : "unknown";
  const city = location.city ? location.city.toString() : "unknown";
  const browser = req.useragent.browser
    ? `${req.useragent.browser} ${req.useragent.version}`
    : "unknown";
  const platform = req.useragent.platform
    ? req.useragent.platform.toString()
    : "unknown";
  const os = req.useragent.os ? req.useragent.os.toString() : "unknown";
  const device = req.useragent.device
    ? req.useragent.device.toString()
    : "unknown";

  const isMobile = req.useragent.isMobile || false;
  const isDesktop = req.useragent.isDesktop || false;
  const isTablet = req.useragent.isTablet || false;

  const deviceType = isMobile
    ? "Mobile"
    : isDesktop
    ? "Desktop"
    : isTablet
    ? "Tablet"
    : "unknown";

  return {
    ip,
    country,
    city,
    browser,
    platform,
    os,
    device,
    deviceType,
  };
};

const isTrustedDevice = (currentContextData, userContextData) =>
  Object.keys(userContextData).every(
    (key) => userContextData[key] === currentContextData[key]
  );

const isSuspiciousContextChanged = (oldContextData, newContextData) =>
  Object.keys(oldContextData).some(
    (key) => oldContextData[key] !== newContextData[key]
  );

const isOldDataMatched = (oldSuspiciousContextData, userContextData) =>
  Object.keys(oldSuspiciousContextData).every(
    (key) => oldSuspiciousContextData[key] === userContextData[key]
  );

const getOldSuspiciousContextData = (_id, currentContextData) =>
  SuspiciousLogin.findOne({
    where: {
      userId: _id,
      ip: currentContextData.ip,
      country: currentContextData.country,
      city: currentContextData.city,
      browser: currentContextData.browser,
      platform: currentContextData.platform,
      os: currentContextData.os,
      device: currentContextData.device,
      deviceType: currentContextData.deviceType,
    }
  });

const addNewSuspiciousLogin = async (_id, existingUser, currentContextData) => {
  const newSuspiciousLogin = await SuspiciousLogin.create({
    userId: _id,
    email: existingUser.email,
    ...currentContextData,
    isTrusted: false,
    isBlocked: false,
    unverifiedAttempts: 1
  });

  return newSuspiciousLogin;
};

const verifyContextData = async (req, existingUser) => {
  try {
    const { id } = existingUser;
    const userContextDataRes = await Context.findOne({ 
      where: { userId: id }  // Changed to use userId
    });

    if (!userContextDataRes) {
      return types.NO_CONTEXT_DATA;
    }

    const userContextData = {
      ip: userContextDataRes.ip,
      country: userContextDataRes.country,
      city: userContextDataRes.city,
      browser: userContextDataRes.browser,
      platform: userContextDataRes.platform,
      os: userContextDataRes.os,
      device: userContextDataRes.device,
      deviceType: userContextDataRes.deviceType,
    };

    const currentContextData = getCurrentContextData(req);
    console.log(currentContextData,userContextData);
    

    if (isTrustedDevice(currentContextData, userContextData)) {
      return types.MATCH;
    }

    const oldSuspiciousContextData = await getOldSuspiciousContextData(
      id,
      currentContextData
    );

    if (oldSuspiciousContextData) {
      if (oldSuspiciousContextData.isBlocked) return types.BLOCKED;
      if (oldSuspiciousContextData.isTrusted) return types.MATCH;
    }

    let newSuspiciousData = {};
    if (oldSuspiciousContextData && 
        isSuspiciousContextChanged(oldSuspiciousContextData, currentContextData)) {
      
      // If context changed, create new suspicious login
      const res = await addNewSuspiciousLogin(
        id,
        existingUser,
        currentContextData
      );

      newSuspiciousData = {
        time: formatCreatedAt(res.createdAt),
        ...currentContextData
      };
    } else if (oldSuspiciousContextData) {
      // Increment unverified attempts
      await oldSuspiciousContextData.increment('unverifiedAttempts');
      await oldSuspiciousContextData.reload();

      if (oldSuspiciousContextData.unverifiedAttempts >= 3) {
        await oldSuspiciousContextData.update({
          isBlocked: true,
          isTrusted: false
        });

        await saveLogInfo(
          req,
          "Device blocked due to too many unverified login attempts",
          "sign in",
          "warn"
        );

        return types.BLOCKED;
      }

      return types.SUSPICIOUS;
    } else {
      // Create first suspicious login entry
      const res = await addNewSuspiciousLogin(
        id,
        existingUser,
        currentContextData
      );

      newSuspiciousData = {
        time: formatCreatedAt(res.createdAt),
        id: res.id,
        ...currentContextData
      };
    }
    

    const mismatchedProps = [];

    if (userContextData.ip !== newSuspiciousData.ip) {
      mismatchedProps.push("ip");
    }
    if (userContextData.browser !== newSuspiciousData.browser) {
      mismatchedProps.push("browser");
    }
    if (userContextData.device !== newSuspiciousData.device) {
      mismatchedProps.push("device");
    }
    if (userContextData.deviceType !== newSuspiciousData.deviceType) {
      mismatchedProps.push("deviceType");
    }
    if (userContextData.country !== newSuspiciousData.country) {
      mismatchedProps.push("country");
    }
    if (userContextData.city !== newSuspiciousData.city) {
      mismatchedProps.push("city");
    }

    if (mismatchedProps.length > 0) {
      return {
        mismatchedProps: mismatchedProps,
        currentContextData: newSuspiciousData,
      };
    }

    return types.MATCH;
  } catch (error) {
    console.error('Context verification error:', error);
    return types.ERROR;
  }
};

const addContextData = async (req, res) => {
  const { userId, email } = req.body;
  const contextData = getCurrentContextData(req);

  try {
    await Context.create({
      userId,
      email,
      ...contextData,
      isTrusted: true
    });

    res.status(200).json({
      message: "Email verification process was successful",
    });
  } catch (error) {
    console.error('Error adding context:', error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route GET /auth/context-data/primary
 */
const getAuthContextData = async (req, res) => {
  try {
    const result = await Context.findOne({ where: { userId: req.userId } });

    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }

    const userContextData = {
      firstAdded: formatCreatedAt(result.createdAt),
      ip: result.ip,
      country: result.country,
      city: result.city,
      browser: result.browser,
      platform: result.platform,
      os: result.os,
      device: result.device,
      deviceType: result.deviceType,
    };

    res.status(200).json(userContextData);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route GET /auth/context-data/trusted
 */
const getTrustedAuthContextData = async (req, res) => {
  try {
    const result = await SuspiciousLogin.findAll({
      where: {
        userId: req.userId,
        isTrusted: true,
        isBlocked: false,
      }
    });

    const trustedAuthContextData = result.map((item) => {
      return {
        _id: item.id,
        time: formatCreatedAt(item.createdAt),
        ip: item.ip,
        country: item.country,
        city: item.city,
        browser: item.browser,
        platform: item.platform,
        os: item.os,
        device: item.device,
        deviceType: item.deviceType,
      };
    });

    res.status(200).json(trustedAuthContextData);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route GET /auth/context-data/blocked
 */
const getBlockedAuthContextData = async (req, res) => {
  try {
    const result = await SuspiciousLogin.findAll({
      where: {
        userId: req.userId,
        isBlocked: true,
        isTrusted: false,
      }
    });

    const blockedAuthContextData = result.map((item) => {
      return {
        _id: item.id,
        time: formatCreatedAt(item.createdAt),
        ip: item.ip,
        country: item.country,
        city: item.city,
        browser: item.browser,
        platform: item.platform,
        os: item.os,
        device: item.device,
        deviceType: item.deviceType,
      };
    });

    res.status(200).json(blockedAuthContextData);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route GET /auth/user-preferences
 */
const getUserPreferences = async (req, res) => {
  try {
    const userPreferences = await UserPreference.findOne({ where: { userId: req.userId } });

    if (!userPreferences) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(userPreferences);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route DELETE /auth/context-data/:contextId
 */
const deleteContextAuthData = async (req, res) => {
  try {
    const contextId = req.params.contextId;

    await SuspiciousLogin.destroy({ where: { id: contextId } });

    res.status(200).json({
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route PATCH /auth/context-data/block/:contextId
 */
const blockContextAuthData = async (req, res) => {
  try {
    const contextId = req.params.contextId;

    await SuspiciousLogin.update(
      { isBlocked: true, isTrusted: false },
      { where: { id: contextId } }
    );

    res.status(200).json({
      message: "Blocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route PATCH /auth/context-data/unblock/:contextId
 */
const unblockContextAuthData = async (req, res) => {
  try {
    const contextId = req.params.contextId;

    await SuspiciousLogin.update(
      { isBlocked: false, isTrusted: true },
      { where: { id: contextId } }
    );

    res.status(200).json({
      message: "Unblocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  verifyContextData,
  addContextData,
  getAuthContextData,
  getUserPreferences,
  getTrustedAuthContextData,
  getBlockedAuthContextData,
  deleteContextAuthData,
  blockContextAuthData,
  unblockContextAuthData,
  types,
};