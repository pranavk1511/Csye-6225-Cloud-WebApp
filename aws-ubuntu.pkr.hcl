

variable "profile" {
  type    = string
  default = "dev_cli"
}

variable "source_ami" {
  type    = string
  default = "ami-06db4d78cb1d3bbf9"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "vpc_id" {
  type    = string
  default = "vpc-055b7ed82be744193"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0edc53e23cb32476a"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable "ami_users" {
  type    = list(string)
  default = ["026310524371", "009251910612"]
}

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
  profile       = var.profile
  source_ami    = var.source_ami
  instance_type = var.instance_type
  vpc_id        = var.vpc_id
  subnet_id     = var.subnet_id
  region        = var.region
  ssh_username  = var.ssh_username
  ami_users     = var.ami_users
}

build {
  sources = ["source.amazon-ebs.debian"]

  provisioner "file" {
    source      = "webapp.zip" # Local path to the file you want to copy
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "nodeserver.service"
    destination = "/tmp/nodeserver.service"
  }
  provisioner "shell" {
    scripts = [
      "./setup.sh",
      "./autostart.sh",
    "./cloudwatch.sh"]
  }
  
  post-processor "manifest" {
        output = "manifest.json"
        strip_path = true
    }
}
