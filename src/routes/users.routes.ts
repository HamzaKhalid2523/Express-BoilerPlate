const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

import UserController from "../controllers/users.controllers";

router.post("/login", UserController.loginUser);
router.post("/logout", checkAuth, UserController.logout);
router.post("/register", checkAuth, UserController.createNewRecord);
router.put("/:_id/changePassword", checkAuth, UserController.changePassword);

router
  .route("/")
  .get(checkAuth, UserController.getAllRecords)
  .post(checkAuth, UserController.createNewRecord);

router
  .route("/:id")
  .get(checkAuth, UserController.getOneRecord)
  .put(checkAuth, UserController.updateRecord)
  .delete(checkAuth, UserController.deleteRecord);

module.exports = router;
