import { Router } from "express";
import * as administratorController from "../controllers/administratorController";
import { authenticateToken, isAdmin } from "../middleware/auth";

const router = Router();

router.get(
  "/users",
  authenticateToken,
  isAdmin,
  administratorController.listUsers
);
router.get(
  "/users/:id",
  authenticateToken,
  isAdmin,
  administratorController.getUserById
);
router.put(
  "/users/:id",
  authenticateToken,
  isAdmin,
  administratorController.updateUserById
);
router.delete(
  "/users/:id",
  authenticateToken,
  isAdmin,
  administratorController.deleteUserById
);

export default router;
