const router = require("express").Router();

const {
  addUser,
  signin,
  logout,
  refreshToken,
  getModProfile,
  getUser,
  updateInfo,
} = require("../controllers/user.controller");

const {
  getPublicUsers,
  followUser,
  getPublicUser,
  unfollowUser,
  getFollowingUsers,
} = require("../controllers/profile.controller");




router.get("/public-users/:id", getPublicUser);
router.get("/public-users", getPublicUsers);
router.get("/moderator", getModProfile);
router.get("/following", getFollowingUsers);
router.get("/:id", getUser);


const avatarUpload = require ("../middlewares/avatarUpload")
router.post(
  "/signup",
  avatarUpload,
  addUser
);
router.post("/refresh-token", refreshToken);
router.post(
  "/signin",
  signin
);
router.post("/logout", logout);

router.put("/:id", updateInfo);


router.patch("/:id/follow", followUser);
router.patch("/:id/unfollow", unfollowUser);

module.exports = router;