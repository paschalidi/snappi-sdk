# Create Spaces bucket
resource "digitalocean_spaces_bucket" "snappi_storage" {
  provider = digitalocean.spaces  # Add this line
  name   = "snappi-images"
  region = var.region
  acl    = "private"

  # Enable versioning for safety
  versioning {
    enabled = true
  }
}

# Create Spaces access keys
resource "digitalocean_spaces_bucket_object" "readme" {
  provider = digitalocean.spaces  # Add this line too
  region  = digitalocean_spaces_bucket.snappi_storage.region
  bucket  = digitalocean_spaces_bucket.snappi_storage.name
  key     = "README.md"
  content = "Snappi Image Storage"
  acl     = "private"

  content_type = "text/markdown"
}

# Output the bucket details
output "spaces_bucket_name" {
  value = digitalocean_spaces_bucket.snappi_storage.name
}

output "spaces_bucket_endpoint" {
  value = digitalocean_spaces_bucket.snappi_storage.bucket_domain_name
}
