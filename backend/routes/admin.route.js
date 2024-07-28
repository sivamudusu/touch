const router = require('express').Router();
const {
    retrieveLogInfo,
    deleteLogInfo,
    signin,
    updateServicePreference,
    retrieveServicePreference,
    getCommunities,
    getCommunity,
    addModerator,
    removeModerator,
    getModerators,
} = require("../controllers/admin.controller");




router.post("/signin", signin);
router.get("/community/:communityId", getCommunity);
router.get("/communities", getCommunities);
router.get("/moderators", getModerators);
router.patch("/add-moderators", addModerator);
router.patch("/remove-moderators", removeModerator);

router
  .route("/preferences")
  .get(retrieveServicePreference)
  .put(updateServicePreference);
router
  .route("/logs")
  .get(retrieveLogInfo)
  .delete(deleteLogInfo);

module.exports = router;