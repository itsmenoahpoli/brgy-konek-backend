import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
    return;
  }
  next();
};

export const registerValidation = [
  body("first_name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "First name is required and must be between 1 and 50 characters"
    ),
  body("last_name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Last name is required and must be between 1 and 50 characters"
    ),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("mobile_number")
    .matches(/^(\+63|0)9\d{9}$/)
    .withMessage("Please provide a valid Philippine mobile number"),
  body("user_type")
    .isIn(["resident", "staff", "admin"])
    .withMessage("User type must be either resident, staff, or admin"),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];
