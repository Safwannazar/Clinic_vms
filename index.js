const express = require('express')
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 3050;
//const port = 3050
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const uri = "mongodb+srv://safwannazar:33S7L1KP91jTek0x@clinicvms.vhqe7g1.mongodb.net/";
const dbName = "ClinicVMS";
const usersCollectionDB = "users";
const appointmentCollectionDB = "appointments";

const client = new MongoClient(uri,{ 
  serverApi:{ 
    version: "1", 
    strict: true, 
    deprecationErrors:true, 
  } 
});

app.use(cors());
app.use(express.json());


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClinicVMS API',
      version: '1.0.0',
    },
  },
  // Path to the API documentation
  apis: ['./swagger.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Middleware for authentication
function authenticateToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    console.error('No token provided');
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(token.split(' ')[1], 'secret_key', (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).send('Forbidden');
    }
    req.user = user;
    next();
  });
}

// Register user
app.post('/register', async (req, res) => {
  try {
    const { username, password, ICnumber, name, email, phonenumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      username,
      password: hashedPassword,
      ICnumber,
      name,
      email,
      phonenumber
    };

    await client.db(dbName).collection(usersCollectionDB).insertOne(user);

    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});


    



// Login user
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await client.db(dbName).collection(usersCollectionDB).findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ username }, 'secret_key');
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});




// Edit user profile
app.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phonenumber, password, ICnumber } = req.body;
    const loggedInUsername = req.user.username;

    const updateFields = {};
    
    // Check if each field is provided and update the object accordingly
    if (name) updateFields.name = name;
    if (password) updateFields.password = password;
    if (ICnumber) updateFields.ICnumber = ICnumber;
    if (email) updateFields.email = email;
    if (phonenumber) updateFields.phonenumber = phonenumber;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send('No fields to update');
    }

    // Ensure that the user can only update their own data
    await client.db(dbName).collection(usersCollectionDB).updateOne(
      { username: loggedInUsername },
      { $set: updateFields }
    );

    res.status(200).send('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('Error updating user profile');
  }
});





// Create appointment
app.post('/create-appointment', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber, appointmentDate, time, purpose } = req.body;
    const username = req.user.username;

    const appointment = {
      username,
      name,
      phoneNumber,
      appointmentDate,
      time,
      purpose,
    };

    await client.db(dbName).collection(appointmentCollectionDB).insertOne(appointment);

    res.status(201).send('Appointment created successfully');
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).send('Error creating appointment');
  }
});


// View appointment history
app.get('/appointment-history', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const appointments = await client.db(dbName).collection(appointmentCollectionDB)
      .find({ username })
      .toArray();

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    res.status(500).send('Error fetching appointment history');
  }
});



// Admin login (using private key)
app.post('/admin-login', async (req, res) => {
  try {
    const { privateKey } = req.body;
    
    // Check if the provided private key is valid (In a real-world scenario, this should be more secure)
    if (privateKey === '123') {
      // Generate a token for the admin
      const token = jwt.sign({ username: 'admin' }, 'secret_key');
      
      // Send the token in the response
      res.status(200).json({ token, message: 'Admin login successful' });
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error logging in as admin:', error);
    res.status(500).send('Error logging in as admin');
  }
});


// Admin view all data
app.get('/admin-view-data', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;

    // Check if the user is an admin (you may have a separate field in the user document for admin status)
    if (username === 'admin') {
      const usersData = await client.db(dbName).collection(usersCollectionDB).find().toArray();
      const appointmentsData = await client.db(dbName).collection(appointmentCollectionDB).find().toArray();

      res.status(200).json({ users: usersData, appointments: appointmentsData });
    } else {
      res.status(403).send('Forbidden');
    }
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).send('Error fetching admin data');
  }
});



// Admin update user data
app.put('/admin-update-user/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { name, email, phonenumber } = req.body;

    // Check if the user is an admin (you may have a separate field in the user document for admin status)
    if (req.user.username === 'admin') {
      await client.db(dbName).collection(usersCollectionDB).updateOne(
        { username },
        { $set: { name, email, phonenumber } }
      );

      res.status(200).send('User data updated successfully');
    } else {
      res.status(403).send('Forbidden');
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).send('Error updating user data');
  }
});



// Define routes using the functions
// app.post('/register', registerUser);
// app.post('/login', loginUser);
// app.patch('/profile', authenticateToken, updateUserProfile);
// app.post('/create-appointment', authenticateToken, createAppointment);
// app.get('/appointment-history', authenticateToken, viewAppointmentHistory);
// app.post('/admin-login', adminLogin);
// app.get('/admin-view-data', authenticateToken, adminViewData);
// app.put('/admin-update-user/:username', authenticateToken, adminUpdateUserData);

// Start the server
connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
