const express = require('express');
const app = express();
const PORT = 3000;
const Assignment = require('./model/assignment_model');
const User = require('./model/user_model')
const sequelize = require('./model/database');
const fs = require('fs');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10

app.use(bodyParser.json());


// set headers as per req
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

// health check 
app.use('/healthz', (req, res, next) => {
  if (req.method !== 'GET') {
      return res.status(405).send();
  }
    if(Object.keys(req.body).length > 0){
      return res.status(400).send();
    }
  if (req.method === 'GET' && Object.keys(req.query).length > 0 ) {
      return res.status(400).send();
  }

  sequelize
      .authenticate()
      .then(() => {
          res.status(200).end();
      })
      .catch((error) => {
          console.error('Database connection error:', error);
          res.status(503).end();
      });
});



// Middleware to check authorization header
app.use('/v1/assignments', async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log(authHeader)
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  
  // Decode the base64 authorization header
  const authData = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
  const [email, password] = authData.split(':');

  // Check if email exists in your database
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the provided plaintext password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If the user is authenticated, proceed to the next middleware/route
    console.log("Authorized Paaji ")
    console.log(req.body)
    next();
  } catch (error) {
    console.error('Error checking authentication:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//All users can see all assignemts 
app.get('/v1/assignments', async (req, res) => {
  if(Object.keys(req.body).length > 0){
    return res.status(400).send("Body Not allowed");
  }
  if (req.method === 'GET' && Object.keys(req.query).length > 0 ) {
    return res.status(400).send("URL Parameters not allowed ");
  }
  try {
    // Retrieve all assignments from the database
    const assignments = await Assignment.findAll();

    // If there are no assignments found, return an empty array
    if (!assignments || assignments.length === 0) {
      return res.status(200).json([]);
    }

    // Return the list of assignments as JSON
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ...

//Get Assignemtn by ID 
app.get('/v1/assignments/:id', async (req, res) => {
  if(Object.keys(req.body).length > 0){
    return res.status(400).send("Body Not allowed");
  }
  if (req.method === 'GET' && Object.keys(req.query).length > 0 ) {
    return res.status(400).send("URL Parameters not allowed ");
  }
  try {
    const assignmentId = req.params.id; // Get the assignment ID from the URL parameter
    const authHeader = req.header('Authorization');
    const authData = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = authData.split(':');

    // Find the assignment by ID
    const assignment = await Assignment.findOne({ where: { id: assignmentId } });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// create an assignemnt
app.post('/v1/assignments', (req, res) => {
  
  try {
    const {
      name,
      points,
      num_of_attempts,
      deadline
    } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body cannot be empty' });
    }

    // Validate the request body fields (you can add more validation here)
    if (!name || typeof name !== 'string' || !points || isNaN(points)) {
      return res.status(400).json({ message: 'Invalid Name or Points' });
    }
    if(points<0 || points>10){
      return res.status(400).json({ message: 'Points must be between 1 & 10 ' });
    }
    if(num_of_attempts<1){
      return res.status(400).json({ message: 'There Should be atleast one attempt' });
    }
    if (!Number.isInteger(num_of_attempts)) {
      return res.status(400).json({ message: 'Number of attempts must be an integer' });
    }
    if (!deadline || isNaN(Date.parse(deadline))) {
      return res.status(400).json({ message: 'Invalid deadline format' });
    }
    if(Number.isInteger(deadline)){
      return res.status(400).json({ message: 'Invalid deadline format' });
    }
    const authHeader = req.header('Authorization');
    const authData = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = authData.split(':');
    var createdByUserId = email ;
    // Create a new assignment
    Assignment.create({
      name,
      points,
      num_of_attempts,
      deadline,
      createdByUserId,
    })
      .then((assignment) => {
        res.status(201).send();
      })
      .catch((error) => {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Internal server error' });
      });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update assignment generated by a particular user 
app.put('/v1/assignments/:id', async (req, res) => {
  if (Object.keys(req.query).length > 0 ) {
    return res.status(400).send("URL Parameters not allowed ");
  }
  try {
    const assignmentId = req.params.id; // Get the assignment ID from the URL parameter
    const {
      name,
      points,
      num_of_attempts,
      deadline,
    } = req.body;

    // Validate the request body fields (you can add more validation here)
    if (!name || typeof name !== 'string' || !points || isNaN(points)) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    // Find the assignment by ID
    const assignment = await Assignment.findOne({ where: { id: assignmentId } });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if the user making the request is the owner of the assignment
    const authHeader = req.header('Authorization');
    const authData = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = authData.split(':');
    
    if (assignment.createdByUserId !== email) {
      return res.status(403).json({ message: 'Permission denied. You are not the owner of this assignment.' });
    }

    // Update the assignment fields
    assignment.name = name;
    assignment.points = points;
    assignment.num_of_attempts = num_of_attempts;
    assignment.deadline = deadline;

    // Save the updated assignment
    await assignment.save();

    res.status(204).end(); // Return a 204 (No Content) response for success
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete  assignment generated by a particular user 
app.delete('/v1/assignments/:id', async (req, res) => {
  console.log(req.body)
  if(Object.keys(req.body).length > 0){
    return res.status(400).send("Body Not allowed");
  }
  if (Object.keys(req.query).length > 0 ) {
    return res.status(400).send("URL Parameters not allowed ");
  }
  try {
    const assignmentId = req.params.id; // Get the assignment ID from the URL parameter

    // Find the assignment by its ID
    const assignment = await Assignment.findOne({ where: { id: assignmentId } });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if the user making the request is the owner of the assignment
    const authHeader = req.header('Authorization');
    const authData = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = authData.split(':');

    if (assignment.createdByUserId !== email) {
      return res.status(403).json({ message: 'Permission denied. You are not the owner of this assignment.' });
    }

    // Delete the assignment
    await assignment.destroy();

    // Respond with a 204 No Content status
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Function to read and process the CSV file
function processCSVFile() {
  const filePath = './opt/users.csv'; // Replace with your file path
  fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
          // Hash the password using bcrypt
          const hashedPassword = await bcrypt.hash(row.password, saltRounds);

          // Create or update user accounts based on CSV data
          User.findOrCreate({
              where: { email: row.email },
              defaults: {
                  first_name: row.first_name,
                  last_name: row.last_name,
                  password: hashedPassword, // Store the hashed password
              },
          });
      })
      .on('end', () => {
          console.log('CSV file processing completed');
      });
}


//CI Check
// Sync the database and create tables
sequelize.sync().then(() => {
    console.log('Database synced successfully');
    processCSVFile();
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

  app.use('/',(req, res,) =>{   
    res.status(404).end()
  })
//print the port 
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

module.exports = app