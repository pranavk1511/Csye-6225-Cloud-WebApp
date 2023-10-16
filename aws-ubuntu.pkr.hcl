packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "debian" {
  ami_name      = "Ami_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  profile       = "dev_cli"
  source_ami    = "ami-06db4d78cb1d3bbf9" # Replace with the correct Debian 12 AMI ID
  instance_type = "t2.micro"
  vpc_id        = "vpc-055b7ed82be744193"
  subnet_id     = "subnet-0edc53e23cb32476a"
  region        = "us-east-1"
  ssh_username  = "admin"
}
build {
  sources = [
    "source.amazon-ebs.debian"
  ]
  provisioner "file"{
   source      = "WebApp.zip"  # Local path to the file you want to copy
   destination = "~/WebAppRenamed"
  }
  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm",
      "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server mariadb-client",
      "sudo DEBIAN_FRONTEND=noninteractive node -v",
      "npm -v",
      "sudo DEBIAN_FRONTEND=noninteractive apt install -y unzip",
      # "sudo unzip WebAppRenamed -d ~/WebApp",
      # "cat <<EOF > ~/WebApp/.env",
      # "DB_HOST=127.0.0.1",
      # "DB_USER=root",
      # "DB_PASSWORD=root",
      # "PORT=3000",
      # "EOF",
    "echo foo"]
  }
  
}