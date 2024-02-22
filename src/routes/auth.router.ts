import express, { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import {
  checkOTPVerificationEmailValidationRules,
  googleSignValidationRules,
  signinValidationRules,
  signupValidationRules,
  validateRecaptchaValidationRules,
  validateRequest,
} from '../common';
import { sendOTPVerificationEmailValidationRules } from '../common';

const router: Router = express.Router();

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User Signup
 *     description: Registers a new user with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: The name of the user, at least 3 characters long.
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 description: The username of the user, at least 3 characters long.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^[0-9]+$'
 *                 description: The phone number of the user.
 *               password:
 *                 type: string
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$'
 *                 description: The password of the user, at least 8 characters including a special character.
 *               passwordConfirm:
 *                 type: string
 *                 description: Confirmation of the password.
 *               jobtitle:
 *                 type: string
 *                 description: The specialization of the user.
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: The date of birth of the user in the format YYYY-MM-DD.
 *               gender:
 *                 type: string
 *                 enum:
 *                   - "MALE"
 *                   - "FEMALE"
 *                 description: The gender of the user.
 *               gRecaptchaResponse:
 *                 type: string
 *                 description: The response to the reCAPTCHA challenge.
 *     responses:
 *       '201':
 *         description: OK. User signed up successfully.
 *       '400':
 *         description: Bad Request. Invalid input or missing required fields.
 *       '500':
 *         description: Internal Server Error. Failed to sign up user.
 */

router
  .route('/signup')
  .post(signupValidationRules, validateRequest, authController.signup);

/**
 * @swagger
 * /api/v1/auth/send-otpverification:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Send OTP verification email
 *     description: Sends an OTP verification email to the provided email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 description: The provider of verification [email or phone]
 *               input:
 *                 type: string
 *                 description: The email or phone address where OTP will be sent.
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *     responses:
 *       '200':
 *         description: OK. Email sent successfully.
 *       '400':
 *         description: Bad Request. Invalid email or missing name.
 *       '500':
 *         description: Internal Server Error. Failed to send email.
 */
router
  .route('/send-otpverification')
  .post(
    sendOTPVerificationEmailValidationRules,
    validateRequest,
    authController.sendConfirmationOtp
  );

/**
 * @swagger
 * /api/v1/auth/check-otpverification:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Check OTP verification email
 *     description: Checks the validity of the OTP verification email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 description: The provider of verification [email or phone]
 *               input:
 *                 type: string
 *                 description: The email or phone address where OTP was sent.
 *               otp:
 *                 type: string
 *                 description: The OTP code received via email.
 *     responses:
 *       '200':
 *         description: OK. OTP verification email is valid.
 *       '400':
 *         description: Bad Request. Invalid email or OTP.
 *       '500':
 *         description: Internal Server Error. Failed to validate OTP email.
 */
router
  .route('/check-otpverification')
  .post(
    checkOTPVerificationEmailValidationRules,
    validateRequest,
    authController.checkValidOtp
  );

/**
 * @swagger
 * /api/v1/auth/check-otpverification-send-resettoken:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Check OTP verification email then sign in
 *     description: Checks the validity of the OTP verification email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 description: The provider of verification [email or phone]
 *               input:
 *                 type: string
 *                 description: The email or phone address where OTP was sent.
 *               otp:
 *                 type: string
 *                 description: The OTP code received via email.
 *     responses:
 *       '200':
 *         description: OK. OTP verification email is valid.
 *       '400':
 *         description: Bad Request. Invalid email or OTP.
 *       '500':
 *         description: Internal Server Error. Failed to validate OTP email.
 */
router
  .route('/check-otpverification-send-resettoken')
  .post(
    checkOTPVerificationEmailValidationRules,
    validateRequest,
    authController.checkValidOtpAndAssignResetToken
  );

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Sign in
 *     description: Sign in with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *     responses:
 *       '200':
 *         description: OK. User successfully signed in.
 *       '400':
 *         description: Bad Request. Invalid email or password.
 *       '500':
 *         description: Internal Server Error. Failed to sign in.
 */

router
  .route('/signin')
  .post(signinValidationRules, validateRequest, authController.signin);

/**
 * @swagger
 * /api/v1/auth/validate-recaptcha:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Validate reCAPTCHA response
 *     description: Validates the response to the reCAPTCHA challenge.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gRecaptchaResponse:
 *                 type: string
 *                 description: The response to the reCAPTCHA challenge.
 *     responses:
 *       '200':
 *         description: OK. reCAPTCHA response is valid.
 *       '400':
 *         description: Bad Request. Invalid reCAPTCHA response.
 *       '500':
 *         description: Internal Server Error. Failed to validate reCAPTCHA response.
 */

router
  .route('/validate-recaptcha')
  .post(
    validateRecaptchaValidationRules,
    validateRequest,
    authController.validateRecaptcha
  );

/**
 * @swagger
 * /api/v1/auth/signout:
 *   get:
 *     summary: Sign out
 *     description: Signs out the currently authenticated user.
 *     security:
 *       - jwt: []
 *     tags:
 *       - Auth
 *     responses:
 *       '200':
 *         description: OK. User successfully signed out.
 *       '401':
 *         description: Unauthorized. User authentication failed.
 *       '500':
 *         description: Internal Server Error. Failed to sign out user.
 */

router.route('/signout').post(authController.signout);

/**
 * @swagger
 * /sign-with-google:
 *   post:
 *     summary: Sign in with Google
 *     description: Authenticate user using Google OAuth2 access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               googleAccessToken:
 *                 type: string
 *                 description: Access token obtained from Google OAuth2 authentication
 *     responses:
 *       '200':
 *         description: Successful authentication
 *       '400':
 *         description: Bad request (e.g., missing or invalid access token)
 *       '401':
 *         description: Unauthorized (e.g., access token invalid or expired)
 *       '500':
 *         description: Internal server error
 */

router
  .route('/sign-with-google')
  .post(googleSignValidationRules, authController.signWithGoogle);

export { router as authRouter };
