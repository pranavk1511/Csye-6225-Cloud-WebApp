# GitHub Actions Workflow: Packer Template Validation

This GitHub Actions workflow is designed to validate a Packer template on every pull request to the `main` branch.

## Workflow Structure

The workflow has a single job named `Validation` that runs on an Ubuntu-latest environment. Here are the key steps:

1. **Check out code:** Fetches the latest code using the `actions/checkout` action.
2. **Create Zip Archive:** Generates a zip archive of the project files.
3. **Set up Packer:** Downloads and installs Packer, ensuring it's available in the environment.
4. **Initialize Packer:** Runs `packer init` to initialize the Packer configuration.
5. **Validate Packer Template:** Checks the validity of the Packer template using `packer validate`.
6. **Check Formatting:** Ensures the Packer template follows proper formatting using `packer fmt`.

## Prerequisites

Before running this workflow, ensure the following:

1. **Packer Template:** Include the Packer template file (`aws-ubuntu.pkr.hcl`) in your repository.
2. **GitHub Repository Structure:** The repository should have a well-structured layout for Packer usage.

## Usage

1. Open a pull request targeting the `main` branch.
2. Monitor the workflow progress and check the logs for each step.
3. The workflow will validate the Packer template, ensuring it meets the required standards.

## Additional Notes

- This workflow is useful for maintaining the quality and correctness of your Packer templates.
- Make sure to address any validation or formatting issues reported by the workflow.
- Customize the workflow to include additional steps or checks as per your project's requirements.

## License

This GitHub Actions workflow is licensed under the [MIT License](LICENSE).
