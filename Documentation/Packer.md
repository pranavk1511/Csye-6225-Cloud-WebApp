# Packer Configuration for Creating Amazon Machine Image (AMI)

This Packer configuration is designed to create an Amazon Machine Image (AMI) for a web application. The resulting AMI includes the necessary configurations, files, and scripts for deploying the web application on an EC2 instance.

## Packer Variables

### profile

- Type: `string`
- Default: `dev_cli`
- Description: The AWS CLI profile to be used for building the AMI.

### source_ami

- Type: `string`
- Default: `ami-06db4d78cb1d3bbf9`
- Description: The source Amazon Machine Image (AMI) ID that will be used as a base for creating the custom AMI.

### instance_type

- Type: `string`
- Default: `t2.micro`
- Description: The EC2 instance type to be used for building the AMI.

### vpc_id

- Type: `string`
- Default: `vpc-055b7ed82be744193`
- Description: The ID of the Virtual Private Cloud (VPC) where the EC2 instance will be launched.

### subnet_id

- Type: `string`
- Default: `subnet-0edc53e23cb32476a`
- Description: The ID of the subnet within the VPC where the EC2 instance will be launched.

### region

- Type: `string`
- Default: `us-east-1`
- Description: The AWS region in which the AMI will be created.

### ssh_username

- Type: `string`
- Default: `admin`
- Description: The SSH username for connecting to the EC2 instance.

### ami_users

- Type: `list(string)`
- Default: `["026310524371", "009251910612"]`
- Description: A list of AWS account IDs that will have launch permission for the custom AMI.

## Packer Build Process

1. **AMAZON Plugin Requirement**: Packer requires the `amazon` plugin with a version greater than or equal to 1.0.0. Ensure it is installed before running the Packer build.

    ```sh
    packer init
    ```

2. **AMAZON Source Block**: The Packer configuration includes an Amazon Machine Image (EBS-backed) source block named "debian." This block specifies the details for creating the custom AMI.

    - `ami_name`: The name of the resulting AMI, including a timestamp for uniqueness.
    - `profile`: The AWS CLI profile to be used.
    - `source_ami`: The source Amazon Machine Image (AMI) ID.
    - `instance_type`: The EC2 instance type.
    - `vpc_id`: The ID of the Virtual Private Cloud (VPC).
    - `subnet_id`: The ID of the subnet.
    - `region`: The AWS region.
    - `ssh_username`: The SSH username for connecting to the EC2 instance.
    - `ami_users`: List of AWS account IDs with launch permissions.

3. **Packer Build Block**: The `build` block defines the build process, including provisioning steps.

    - **File Provisioner**: Copies local files (`webapp.zip` and `nodeserver.service`) to the EC2 instance.
    - **Shell Provisioner**: Executes shell scripts (`setup.sh`, `autostart.sh`, and `cloudwatch.sh`) on the EC2 instance for configuration.
  
4. **Post-Processor**: The Packer configuration includes a post-processor that creates a `manifest.json` file, providing information about the created AMI.

## Building the AMI

To build the custom AMI, follow these steps:

1. Install Packer: [Packer Installation Guide](https://www.packer.io/docs/install)
2. Navigate to the directory containing the Packer configuration file.
3. Create a `.env` file with the required environment variables.
4. Run the following command:

    ```sh
    packer build packer-config.hcl
    ```

The resulting AMI will be available in your AWS account.

## License

This Packer configuration is licensed under the [MIT License](LICENSE).
