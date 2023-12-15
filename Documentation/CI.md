# GitHub Actions Workflow: Node.js CI

This GitHub Actions workflow is designed for continuous integration (CI) of a Node.js project. It is triggered on every pull request to the `main` branch.

## Workflow Structure

The workflow has a single job named `build` that runs on an Ubuntu-latest environment. Here are the key steps:

1. **Checkout code:** Fetches the latest code using the `actions/checkout` action.
2. **Setup Node.js:** Sets up the Node.js environment with version 14 using the `actions/setup-node` action.
3. **Install Dependencies:** Runs `npm install` to install project dependencies.
4. **Display .env file:** Creates a `.env` file with secrets and displays its content.
5. **Configure MySQL:** Updates and installs necessary packages, starts MySQL, and creates a database (`Assignment3`).
6. **Run Tests:** Executes npm tests for the Node.js project.

## Prerequisites

Before running this workflow, ensure the following:

1. **GitHub Repository Secrets:**
   - `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`: Set these as repository secrets for secure access.
   - `MY_SQL_PASSWORD`: Set the MySQL password as a secret.

## Usage

1. Open a pull request targeting the `main` branch.
2. Monitor the workflow progress and check the logs for each step.
3. The workflow will execute tests and MySQL configuration for the Node.js project.

## Additional Notes

- The workflow includes steps to configure the MySQL database, install dependencies, and run tests, providing a comprehensive CI process.
- Feel free to customize this workflow according to your project's specific requirements.

## License

This GitHub Actions workflow is licensed under the [MIT License](LICENSE).
