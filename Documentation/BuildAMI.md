# GitHub Actions Workflow: Build AMI and Deploy

This GitHub Actions workflow automates the process of building an Amazon Machine Image (AMI) and deploying a web application. The workflow is triggered on every push to the `main` branch.

## Workflow Structure

The workflow consists of the following jobs:

### 1. build-ami

This job runs on an Ubuntu-latest environment and includes the following steps:

- **Checkout code:** Fetches the latest code using the `actions/checkout` action.
- **Install dependencies:** Installs the required npm dependencies for the web application.
- **Display .env file:** Creates a `.env` file with secrets and displays its content.
- **Configure MySQL:** Updates and installs necessary packages, starts MySQL, and creates a database.
- **Run Tests:** Executes npm tests for the web application.
- **Create Zip Archive:** Zips the application files into `webapp.zip`.
- **Set up Packer:** Downloads and installs Packer, an open-source tool for creating identical machine images for multiple platforms.
- **Initialize Packer:** Initializes the Packer configuration file (`aws-ubuntu.pkr.hcl`).
- **Build AMI in dev account:** Uses Packer to build an AMI in the development AWS account. Sets the resulting AMI ID as an output variable.
- **Configure AWS CLI for Demo Account:** Configures AWS CLI for the demo account using secrets.
- **Instance Refresh Automation / Continuous Delivery:** Installs `jq` and performs an instance refresh for the Auto Scaling Group in the demo account. Monitors the progress until completion.

## Prerequisites

Before running this workflow, ensure the following:

1. **AWS Credentials:** Add AWS credentials for both the development and demo accounts as secrets in your GitHub repository.
2. **GitHub Repository Secrets:**
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `region`, `topicarn`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: Set these as repository secrets for secure access.
   - `MY_SQL_PASSWORD`: Set the MySQL password as a secret.
   - `AWS_ACCESS_KEY_ID_DEMO`, `AWS_SECRET_ACCESS_KEY_DEMO`, `AWS_REGION_DEMO`: Set these for the demo AWS account.

## Usage

1. Push changes to the `main` branch to trigger the workflow.
2. Monitor the workflow progress and check the logs for each step.
3. Upon successful completion, the web application will be deployed using the updated AMI in the demo account.

## License

This GitHub Actions workflow is licensed under the [MIT License](LICENSE).
