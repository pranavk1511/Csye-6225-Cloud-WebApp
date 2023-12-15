# Assignment Management System 📚

This Node.js application is an Assignment Management System that allows users to create, update, and delete assignments. It also supports assignment submissions with validation checks, such as the maximum number of attempts and submission deadlines. The system includes user authentication using basic HTTP authentication with email and password.

## Technologies Used 🚀

- **Node.js**: The application is built using Node.js for server-side JavaScript programming.
- **Express**: Express is used as the web application framework for handling HTTP requests and responses.
- **Sequelize**: Sequelize is used as the ORM (Object-Relational Mapping) for interacting with the database.
- **bcrypt**: bcrypt is employed for password hashing and verification for user authentication.
- **AWS SDK**: The AWS SDK is used to interact with Amazon Simple Notification Service (SNS) for publishing messages.
- **Winston**: Winston is used for logging, providing both console and file-based logging.
- **CSV Parser**: The application can process CSV files for creating or updating user accounts.
- **StatsD**: StatsD is used for collecting custom application metrics.

## Database 🗃️

The application uses Sequelize as the ORM to interact with the underlying relational database. The database schema includes tables for assignments, users, and submissions.

## API Endpoints 🌐

### Health Check

- `/healthz`: Performs a health check, verifying the connection to the database.

### Assignment Endpoints

- `GET /v1/assignments`: Retrieve a list of all assignments.
- `GET /v1/assignments/:id`: Retrieve details of a specific assignment by ID.
- `POST /v1/assignments`: Create a new assignment with various validations:
  - Name must be a non-empty string.
  - Points must be a number between 1 and 10.
  - Number of attempts must be a positive integer.
  - Deadline must be a valid date.
- `PUT /v1/assignments/:id`: Update an assignment (restricted to the owner) with similar validations as the creation.
- `DELETE /v1/assignments/:id`: Delete an assignment (restricted to the owner).

### Assignment Submission

- `POST /v1/assignments/:id/submission`: Submit an assignment with a submission URL and the following validations:
  - Submission URL must be a non-empty string.
  - Submission URL must be a valid URL ending with '.zip'.
  - Users cannot submit more times than the specified number of attempts.
  - Submissions after the deadline are not allowed.

## Authentication 🔐

User authentication is implemented using basic HTTP authentication. Users are required to include an Authorization header with their email and password encoded in base64.

## Assignment Submission and SNS Integration 📤

Users can submit assignments, and upon submission, a message is published to an AWS SNS topic. This can be used for notification purposes or integration with other services.

## Logging 📝

The application utilizes Winston for logging. Logs are output to both the console and a file (`app.log`).

## CSV Processing 📊
The application includes a function (`processCSVFile`) to read and process a CSV file, creating or updating user accounts based on the data.

## Configuration ⚙️

Configuration settings, such as database connection details and AWS credentials, are managed using environment variables.

```env
DB_HOST=127.0.0.1
DB_USER=**your-user**
DB_PASSWORD=**your-password**
DB_NAME=**your-dbname**
PORT=3000
CSVPATH= "path-to-your-csv"
accessKeyId=**your-aws-acess-key-id**
secretAccessKey=**your-secretAccessKey**
region=us-east-1
topicarn=**your-topic arn**
```
## Running the Application 🚀
1. Install dependencies: `npm install`
2. Set environment variables in a `.env` file.
3. Run the application: `npm start`

The server will run on port 3000 by default.

## Testing 🧪

The application includes basic Integration tests. You can run tests using: `npm test`

## Deployment 

The application can be deployed to a hosting service or cloud provider. Ensure that the necessary environment variables are configured for production use.

## Contributing

Contributions are welcome. Fork the repository, make changes, and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

