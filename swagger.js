/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided information.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: User's password
 *               ICnumber:
 *                 type: string
 *                 description: User's IC number
 *               name:
 *                 type: string
 *                 description: User's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               phonenumber:
 *                 type: string
 *                 description: User's phone number
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Registration success message
 *       '500':
 *         description: Internal Server Error - Error registering user
 *         schema:
 *           $ref: '#/definitions/Error'
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User Login
 *     description: Authenticate and log in a user with the provided credentials.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       '200':
 *         description: User login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Authentication token for the user
 *       '401':
 *         description: Unauthorized - Invalid credentials
 *       '500':
 *         description: Internal Server Error - Error logging in
 */

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update user profile
 *     description: Update the user profile for the authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *         bearerformat: JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name for the user profile
 *               password:
 *                 type: string
 *                 description: Updated password for the user profile
 *               ICnumber:
 *                 type: string
 *                 description: Updated IC number for the user profile
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email for the user profile
 *               phonenumber:
 *                 type: string
 *                 description: Updated phone number for the user profile
 *     responses:
 *       '200':
 *         description: User profile updated successfully
 *       '400':
 *         description: Bad Request - No fields to update
 *       '403':
 *         description: Forbidden - Invalid or expired token
 *       '500':
 *         description: Internal Server Error - Error updating user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /create-appointment:
 *   post:
 *     summary: Create a new appointment
 *     description: Create a new appointment with the provided information.
 *     tags:
 *       - User
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: User's JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the appointment
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number for the appointment
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *                 description: Date for the appointment
 *               time:
 *                 type: string
 *                 description: Time for the appointment
 *               purpose:
 *                 type: string
 *                 description: Purpose of the appointment
 *     responses:
 *       '201':
 *         description: Appointment created successfully
 *       '500':
 *         description: Error creating appointment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /appointment-history:
 *   get:
 *     summary: Get appointment history for the logged-in user
 *     description: Retrieve the appointment history for the authenticated user.
 *     tags:
 *       - User
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: User's JWT token
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: Username of the appointment owner
 *                   name:
 *                     type: string
 *                     description: Name for the appointment
 *                   phoneNumber:
 *                     type: string
 *                     description: Phone number for the appointment
 *                   appointmentDate:
 *                     type: string
 *                     format: date
 *                     description: Date for the appointment
 *                   time:
 *                     type: string
 *                     description: Time for the appointment
 *                   purpose:
 *                     type: string
 *                     description: Purpose of the appointment
 *       '500':
 *         description: Error fetching appointment history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /admin-login:
 *   post:
 *     summary: Log in as an admin and get an admin token
 *     description: Authenticate as an admin using a private key and obtain an admin token.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Private key for admin authentication
 *     responses:
 *       '200':
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Authentication token for the admin
 *                 message:
 *                   type: string
 *                   description: Success message
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Error logging in as admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /admin-view-data:
 *   get:
 *     tags:
 *       - Admin
 *     summary: View all data for admin users
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin's JWT token
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     # Define properties for user data
 *                 appointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     # Define properties for appointment data
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Error fetching admin data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */

/**
 * @swagger
 * /admin-update-user/{username}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update user data as an admin
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: Username of the user to update
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
 *       '200':
 *         description: User data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Error updating user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */