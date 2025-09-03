import express from "express";
import { register, login, deleteUserDevice } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.delete("/delete-device", deleteUserDevice);

export default router;
