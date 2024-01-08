const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 3050;
const uri = "mongodb+srv://safwannazar:33S7L1KP91jTek0x@clinicvms.vhqe7g1.mongodb.net/";
const dbName = "ClinicVMS";
const usersCollectionDB = "users";
const appointmentCollectionDB = "appointments";
const client = new MongoClient(uri, {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  }
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'TESTSECRET',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true, // Enable this in a production environment with HTTPS
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour (adjust as needed)
  },
}));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClinicVMS API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Path to the API documentation
  apis: ['./swagger.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Middleware for registration input validation
const registrationValidation = [
  body('username').trim().isAlphanumeric().isLength({ min: 5 }),
  body('password').isLength({ min: 8 }),
  body('ICnumber').isLength({ min: 12, max: 12 }).isNumeric(),
  body('name').isString(),
  body('email').isEmail(),
  body('phonenumber').isMobilePhone('any', { strictMode: false }),
];

const appointmentValidation = [
  body('name').isString(),
  body('phonenumber').isMobilePhone('any', { strictMode: false }),
  body('appointmentDate').isISO8601(),
  body('time').isString(),
  body('purpose').isString(),
];


// Function to generate a JWT token for an user
function generateToken(user) {
  const payload = {
    username: user.username,
  };

  const token = jwt.sign(
    payload,
    'TESTSECRET', // Replace with your secret key
    { expiresIn: '1h' }
  );

  return token;
}


// Define the route for user registration
app.post('/register', registrationValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password, ICnumber, name, email, phonenumber } = req.body;

    // Check if the username already exists in MongoDB
    const existingUser = await client.db(dbName).collection(usersCollectionDB).findOne({ username });

    if (existingUser) {
      return res.status(400).send('Error! User already registered.');
    } else {
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a user object
      const user = {
        username,
        password: hashedPassword,
        ICnumber,
        name,
        email,
        phonenumber
      };

      // Insert the user object into MongoDB
      await client.db(dbName).collection(usersCollectionDB).insertOne(user);

      // Set the user data in the session
      req.session.user = { username, ICnumber, name, email, phonenumber };

      res.status(201).send({ message: 'Registration successful!', user });      
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Login user
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await client.db(dbName).collection(usersCollectionDB).findOne({ username });

    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    if (!(await bcrypt.compare(password, user.password || ''))) {
      return res.status(401).send('Invalid credentials');
    }

    // Generate a user token
    const userToken = generateToken(user);

    // Set the user token in the session
    req.session.userToken = userToken;

    res.status(200).json({ userToken });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});


// Profile Update
app.patch('/profile', async (req, res) => {
  try {
    const { name, email, phonenumber, password, ICnumber } = req.body;

    // Extract the user token from the request header
    const userToken = req.headers.authorization.split(' ')[1];
    
    // Verify the user token
    const decodedUser = jwt.verify(userToken, 'TESTSECRET'); // Replace with your secret key

    // Access user data from the decoded token
    const loggedInUsername = decodedUser.username;
    const updateFields = {};

    // You can update all fields without checking if they are provided
    updateFields.name = name;
    updateFields.email = email;
    updateFields.phonenumber = phonenumber;

    // Hash the password using bcrypt if provided
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    updateFields.ICnumber = ICnumber;

    // Ensure that the user can only update their own data
    await client
      .db(dbName)
      .collection(usersCollectionDB)
      .updateOne({ username: loggedInUsername }, { $set: updateFields });

    res.status(200).send('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Error updating user profile');
  }
});


// Create appointment
app.post('/create-appointment', appointmentValidation, async (req, res) => {
  try {
    const { name, phonenumber, appointmentDate, time, purpose } = req.body;

    // Extract the user token from the request header
    const userToken = req.headers.authorization.split(' ')[1];

    // Verify the user token
    const decodedUser = jwt.verify(userToken, 'TESTSECRET'); // Replace with your secret key

    // Access user data from the decoded token
    const username = decodedUser.username;

    const appointment = {
      username,
      name,
      phonenumber,
      appointmentDate,
      time,
      purpose,
    };

    await client
      .db(dbName)
      .collection(appointmentCollectionDB)
      .insertOne(appointment);

    res.status(201).send('Appointment created successfully');
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send('Error creating appointment');
  }
});


// View appointment history
app.get('/appointment-history', async (req, res) => {
  try {
    // Extract the user token from the request header
    const userToken = req.headers.authorization.split(' ')[1];

    // Verify the user token
    const decodedUser = jwt.verify(userToken, 'TESTSECRET'); // Replace with your secret key

    // Access user data from the decoded token
    const username = decodedUser.username;

    // Fetch the user's appointment history
    const appointments = await client
      .db(dbName)
      .collection(appointmentCollectionDB)
      .find({ username })
      .toArray();

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    res.status(500).send('Error fetching appointment history');
  }
});



// Function to generate a JWT token for an admin
function generateTokenAdmin() {
  const payload = {
    username: 'admin',
  };

  const token = jwt.sign(
    payload,
    '@dm!nk3y', // Replace with your admin secret key
    { expiresIn: '1h' }
  );

  return token;
}

app.post('/admin-login', async (req, res) => {
  try {
    const { privateKey } = req.body;

    // Check if the provided private key is valid (In a real-world scenario, this should be more secure)
    if (privateKey === 'wanWAN1234!@#$') {
      // Generate a token for the admin
      const adminToken = generateTokenAdmin();

      // Store the admin token in the session
      req.session.adminToken = adminToken;

      // Send the admin token in the response
      res.status(200).json({ adminToken, message: 'Admin login successful' });
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error logging in as admin:', error);
    res.status(500).send('Error logging in as admin');
  }
});



// Middleware to verify admin token
async function verifyAdminToken(req, res, next) {
  try {
    const adminToken = req.headers.authorization;

    if (!adminToken) {
      console.error('No admin token provided');
      return res.status(401).send('Unauthorized');
    }

    const decodedAdmin = jwt.verify(adminToken.split(' ')[1], '@dm!nk3y');

    if (decodedAdmin.username !== 'admin') {
      console.error('User is not an admin');
      return res.status(403).send('Forbidden');
    }

    req.admin = decodedAdmin;
    next();
  } catch (error) {
    console.error('Admin token verification error:', error);
    return res.status(403).send('Forbidden');
  }
}



// Admin view all data
app.get('/admin-view-data', verifyAdminToken, async (req, res) => {
  try {
    const usersData = await client
      .db(dbName)
      .collection(usersCollectionDB)
      .find()
      .toArray();

    const appointmentsData = await client
      .db(dbName)
      .collection(appointmentCollectionDB)
      .find()
      .toArray();

    res.status(200).json({ users: usersData, appointments: appointmentsData });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).send('Error fetching admin data');
  }
});



// Admin edit data user
app.patch('/admin-edit-user/:username', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, phonenumber, password, ICnumber } = req.body;
    const { username } = req.params;

    const updateFields = {};

    // You can update all fields without checking if they are provided
    updateFields.name = name;
    updateFields.email = email;
    updateFields.phonenumber = phonenumber;

    // Hash the password using bcrypt if provided
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    updateFields.ICnumber = ICnumber;

    // Update the user data in MongoDB
    await client
      .db(dbName)
      .collection(usersCollectionDB)
      .updateOne({ username }, { $set: updateFields });

    res.status(200).send('User data updated successfully by admin');
  } catch (error) {
    console.error('Error updating user data by admin:', error);
    res.status(500).send('Error updating user data by admin');
  }
});



// Connect to MongoDB and start the server
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
