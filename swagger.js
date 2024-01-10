/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerUserAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     BearerAdminAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User endpoints
 *   - name: Admin
 *     description: Admin endpoints
 */

/**
 * @swagger
 * /register:
 *   post:
 *     tags: [User]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               ICnumber:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phonenumber:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Registration successful
 *       '400':
 *         description: Bad request or user already registered
 *       '500':
 *         description: Internal Server Error - Error registering user
 */

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [User]
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userToken:
 *                   type: string
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /profile:
 *   patch:
 *     tags: [User]
 *     summary: Update user profile
 *     security:
 *       - BearerUserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phonenumber:
 *                 type: string
 *               password:
 *                 type: string
 *               ICnumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User profile updated successfully
 *       '401':
 *         description: Unauthorized (invalid or missing token)
 *       '500':
 *         description: Internal server error
 */
/**
 * @swagger
 * paths:
 *   /create-appointment:
 *     post:
 *       tags: [User]
 *       summary: Create a new appointment
 *       security:
 *         - BearerUserAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name of the person making the appointment
 *                 phonenumber:
 *                   type: string
 *                   description: Phone number of the person making the appointment
 *                 appointmentDate:
 *                   type: string
 *                   format: date-time
 *                   description: Date of the appointment in ISO 8601 format
 *                 time:
 *                   type: string
 *                   description: Time of the appointment
 *                 purpose:
 *                   type: string
 *                   description: Purpose or reason for the appointment
 *       responses:
 *         201:
 *           description: Appointment created successfully
 *         401:
 *           description: Unauthorized - Invalid or missing token
 *         500:
 *           description: Internal Server Error
 */
/**
 * @swagger
 * /appointment-history:
 *   get:
 *     tags: [User]
 *     summary: Get user's appointment history
 *     security:
 *       - BearerUserAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               - name: "John Doe"
 *                 phonenumber: "+1234567890"
 *                 appointmentDate: "2024-01-10T10:00:00Z"
 *                 time: "Morning"
 *                 purpose: "Regular Checkup"
 *               - name: "Jane Doe"
 *                 phonenumber: "+9876543210"
 *                 appointmentDate: "2024-01-15T14:30:00Z"
 *                 time: "Afternoon"
 *                 purpose: "Follow-up"
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       500:
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /delete-appointment/{appointmentDate}:
 *   delete:
 *     tags: [User]
 *     summary: Delete user's appointment by date
 *     security:
 *       - BearerUserAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentDate
 *         required: true
 *         description: Date of the appointment to be deleted 
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Appointment deleted successfully
 *       '404':
 *         description: Appointment not found
 *       '500':
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /admin-login:
 *   post:
 *     tags: [Admin]
 *     summary: Admin login using private key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             privateKey: "admin_private_key"
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             example:
 *               token: "admin_jwt_token"
 *               message: "Admin login successful"
 *       401:
 *         description: Unauthorized - Invalid private key
 *       500:
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /admin-view-data:
 *   get:
 *     summary: Get all user and appointment data (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAdminAuth: []
 *     responses:
 *       200:
 *         description: Successful response with user and appointment data
 *       401:
 *         description: Unauthorized. Admin token not provided.
 *       403:
 *         description: Forbidden. Provided token is not an admin token.
 *       500:
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /admin-edit-user/USERNAME:
 *   patch:
 *     summary: Edit user data (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAdminAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Username of the user to be edited
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phonenumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with updated user data
 *       401:
 *         description: Unauthorized. Admin token not provided.
 *       403:
 *         description: Forbidden. Provided token is not an admin token.
 *       500:
 *         description: Internal Server Error
 */
