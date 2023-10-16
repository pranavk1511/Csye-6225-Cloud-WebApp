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
  source_ami    = "ami-071175b60c818694f"
  instance_type = "t2.micro"
  vpc_id        = "vpc-055b7ed82be744193"
  subnet_id     = "subnet-0edc53e23cb32476a"
  region        = "us-west-1"
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
    scripts = [
      "./setup.sh",
    ]
  }
}
