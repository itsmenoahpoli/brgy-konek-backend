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
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name is required and must be between 1 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("mobile_number")
    .optional()
    .matches(/^(\+63|0)9\d{9}$/)
    .withMessage("Please provide a valid Philippine mobile number"),
  body("user_type")
    .optional()
    .isIn(["resident", "staff", "admin"])
    .withMessage("User type must be either resident, staff, or admin"),
  body("address")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Address must be between 1 and 200 characters"),
  body("birthdate")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid birthdate"),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];
