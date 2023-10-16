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
  source_ami    = "ami-06db4d78cb1d3bbf9"
  instance_type = "t2.micro"
  vpc_id        = "vpc-055b7ed82be744193"
  subnet_id     = "subnet-0edc53e23cb32476a"
  region        = "us-east-1"
  ssh_username  = "admin"
  ami_users = [
    "026310524371",
    "009251910612"
  ]

}
build {
  sources = [
    "source.amazon-ebs.debian"
  ]
  provisioner "file" {
    source      = "webapp.zip" # Local path to the file you want to copy
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
      "sudo unzip WebAppRenamed -d WebApp",
      "sudo mysql",
      "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root' ",
      "FLUSH PRIVILEGES;",
      "CREATE DATABASE Assignment3;",
      "EXIT;",
    "echo foo"]
  }
}
