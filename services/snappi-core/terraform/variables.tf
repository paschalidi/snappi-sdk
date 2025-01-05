variable "do_token" {
  description = "Digital Ocean API Token"
  sensitive = true
}

variable "region" {
  description = "Digital Ocean region"
  default = "nyc3"
}

variable "spaces_access_id" {
  description = "Spaces Access Key"
  sensitive = true
}

variable "spaces_secret_key" {
  description = "Spaces Secret Key"
  sensitive = true
}