import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
} from "../controllers/user.controller.js";

const Router = express.Router();

Router.route("/createUser").post(createUser);
Router.route("/getAllUsers").post(getAllUsers);
Router.route("/getUserById/:id").post(getUserById);
Router.route("/updateUser/:id").post(updateUser);
Router.route("/deleteUser/:id").post(isAuthenticated, deleteUser);
Router.route("/login").post(login);

export default Router;
