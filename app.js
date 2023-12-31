// node-dependecies
const express = require('express');
const validUrl = require('valid-url');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
bodyParser.json("strict")
const StatsD = require('node-statsd');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { createLogger, transports, format } = require('winston'); 
const appRoot = require('app-root-path');
const { Op } = require('sequelize');
const AWS = require('aws-sdk');



const app = express();
const PORT = 3000;

const Assignment = require('./model/assignment_model');
const User = require('./model/user_model')
const sequelize = require('./model/database');
const Submission = require('./model/submission');


// AWS.config.update({
//   accessKeyId: process.env.accessKeyId,
//   secretAccessKey: process.env.secretAccessKey,
//   region: process.env.region,
// });


const sns = new AWS.SNS({ region:process.env.region });
const topicArn = process.env.topicarn;



require('dotenv').config();

const saltRounds = 10

app.use(bodyParser.json());

const statsd = new StatsD({
  host: 'localhost', 
  port: 8125, 
});


app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.use((req, res, next) => {
  const apiPath = req.path; 
  statsd.increment(`api.${apiPath}.count`);
  next();
});


const logger = createLogger({
  level: 'info', // You can set the desired logging level
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: `${appRoot.path}/log/app.log` }) // Log to a file
  ]
});

// health check 
app.use('/healthz', (req, res, next) => {
  logger.info('Logger Started !! ')
  logger.info(`Received ${req.method} request to /healthz`);
  console.log("In Healthz")
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
          logger.error('Database connection error:', error);
          console.error('Database connection error:', error);
          res.status(503).end();
      });
});


const checkDbConnectionMiddleware = async (req, res, next) => {
  try {
    await sequelize.authenticate();
    next(); // Proceed to the next middleware or route if the database is connected
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({ message: 'Service Unavailable. Database connection is not established.' });
  }
};

// Apply the checkDbConnectionMiddleware to all routes
app.use(checkDbConnectionMiddleware);


// Middleware to check authorization header
app.use('/v1/assignments', async (req, res, next) => {

  logger.info(`Application Middle-Ware Accessed`);
  if (req.method === 'PATCH'){
      return res.status(405).send()
  }
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    logger.info(`No Auth Header`);
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  
  // Decode the base64 authorization header
  const authData = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
  const [email, password] = authData.split(':');

  // Check if email exists in your database
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.info(`Invaid Credentials`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the provided plaintext password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      logger.info(`Invaid Credentials`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    next();
  } catch (error) {
    console.error('Error checking authentication:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// app.get('/v1/assignments/', async (req, res, next) => {
//   return res.status(405).send()
// });

//All users can see all assignemts 
app.get('/v1/assignments', async (req, res) => {
  logger.info(`Received ${req.method} request to /v1/assignments`);
  console.log('Received GET request to /v1/assignments')
  if(Object.keys(req.body).length > 0){
    return res.status(400).send("Body Not allowed");
  }
  if (req.method === 'GET' && Object.keys(req.query).length > 0 ) {
    return res.status(400).send("URL Parameters not allowed ");
  }
  try {
    // Retrieve all assignments from the database
    const assignments = await Assignment.findAll();
    logger.info('Fetched assignments successfully');
    // If there are no assignments found, return an empty array
    if (!assignments || assignments.length === 0) {

      return res.status(200).json([]);
    }
    const responseAssignments = assignments.map((assignment) => {
      const {
        id,
        name,
        points,
        num_of_attempts,
        deadline,
        assignment_created,
        assignment_updated,
        // Add other fields you want to include in the response here
      } = assignment;
      return {
        id,
        name,
        points,
        num_of_attempts,
        deadline,
        assignment_created: assignment_created.toISOString(), // Convert to ISO string
        assignment_updated: assignment_updated.toISOString(), // Convert to ISO string
        // Add other fields you want to include in the response here
      };
    });


    // Return the list of assignments as JSON
    res.status(200).json(responseAssignments);
  } catch (error) {
    logger.error('Error fetching assignments:', error);
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
    const responseObject = {
      id: assignment.id,
      name: assignment.name,
      points: assignment.points,
      num_of_attempts: assignment.num_of_attempts,
      deadline: assignment.deadline,
      assignment_created: assignment.assignment_created,
      assignment_updated: assignment.assignment_updated,
      // Exclude 'createdByUserId' field
    };
    res.status(200).json(responseObject);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// create an assignemnt
app.post('/v1/assignments', (req, res) => {
  logger.info(`Received ${req.method} request to /v1/assignments`);
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
    if (Object.keys(req.body).length !== 4) {
      return res.status(400).json({ message: 'Bad Testing Error ' });
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
      assignment_created: new Date(), // Set the current date and time
      assignment_updated: new Date(),
    })
      .then((assignment) => {
        const responseAssignment = {
          id: assignment.id,
          name: assignment.name,
          points: assignment.points,
          num_of_attempts: assignment.num_of_attempts,
          deadline: assignment.deadline,
          assignment_created: assignment.assignment_created.toISOString(), // Convert to ISO string
          assignment_updated: assignment.assignment_updated.toISOString()
          // Add other fields you want to include in the response here
        };
        logger.info('Created assignment successfully');
        res.status(201).json(responseAssignment);
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
  if (Object.keys(req.body).length > 4) {
    return res.status(400).send("Invalid Body ");
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
    
    const submissionCount = await Submission.count({ where: { assignment_id: assignmentId } });

    if (submissionCount > 0) {
      return res.status(400).json({ message: 'Cannot update assignment with associated submissions.' });
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
  console.log(req.body);
  if (Object.keys(req.body).length > 0) {
    return res.status(400).send("Body Not allowed");
  }
  if (Object.keys(req.query).length > 0) {
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

    // Check if there are submissions associated with the assignment
    const submissionCount = await Submission.count({ where: { assignment_id: assignmentId } });

    if (submissionCount > 0) {
      return res.status(400).json({ message: 'Cannot delete assignment with associated submissions.' });
    }

    // Delete the assignment
    await assignment.destroy();

    // Respond with a 204 No Content status
    logger.info('Deleted assignment successfully');
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// Function to read and process the CSV file
function processCSVFile() {
  logger.info('Logger Started !! ')
  logger.info('Processing CSV file');
  const filePath = process.env.CSVPATH ; // Replace with your file path
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
        logger.info('CSV file processing completed');
          console.log('CSV file processing completed');
      });
}

// Add new endpoint for assignment submission
app.use('/v1/assignments/:id/submission', async (req, res) => {
  try {
    // Check if the request is a POST request
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const assignmentId = req.params.id; // Get the assignment ID from the URL parameter
    const { submission_url } = req.body;
    if (Object.keys(req.query).length > 0) {
      return res.status(400).json({ message: 'Query parameters are not allowed' });
    }
    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required in the URL' });
    }
    if (Object.keys(req.body).length !== 1) {
      return res.status(400).json({ message: 'Bad Testing Error  !!' });
    }

    // Validate the request body fields
    if (!submission_url || typeof submission_url !== 'string') {
      return res.status(400).json({ message: 'Invalid submission_url' });
    }
    if (!validUrl.isUri(submission_url) || !submission_url.endsWith('.zip')) {
      return res.status(400).json({ message: 'Invalid submission URL format' });
    }
    // Check if the assignment exists
    const assignment = await Assignment.findOne({ where: { id: assignmentId } });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    // Check if the user making the request is the owner of the assignment
    const authHeader = req.header('Authorization');
    const authData = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = authData.split(':');
    // Check if the user has exceeded the number of allowed attempts
    const existingSubmissions = await Submission.count({
      where: {
        assignment_id: assignmentId,
        created_by_user_email: email, // Use the email from the assignment
        submission_date: {
          [Op.lt]: new Date(), // Count only submissions before the current date
        },
      },
    });

    if (existingSubmissions >= assignment.num_of_attempts) {
      return res.status(400).json({ message: 'Maximum number of attempts reached for this assignment.' });
    }
    if (new Date() > new Date(assignment.deadline)) {
      return res.status(403).json({ message: 'Assignment submission after the deadline is forbidden.' });
    }
    // Create a submission record
    const submission = await Submission.create({
      assignment_id: assignmentId,
      submission_url,
      submission_date: new Date().toISOString(),
      submission_updated: new Date().toISOString(),
      created_by_user_email: email, // Use the email from the assignment
    });
    // Return the submission details in the response
    const responseSubmission = {
      id: submission.id,
      assignment_id: submission.assignment_id,
      submission_url: submission.submission_url,
      submission_date: submission.submission_date,
      submission_updated: submission.submission_updated
    };


    const snsParams = {
      Message: JSON.stringify({
        email,
        submission_url,
        assignmentId,
      }),
      TopicArn: topicArn,
    };

    logger.info("ARN Is ", topicArn);

    await sns.publish(snsParams).promise();
    logger.info(`Parameter Published ! `);
    res.status(201).json(responseSubmission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



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

//new comment to check credentials 