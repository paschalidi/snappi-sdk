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

# Create a PostgreSQL cluster for Snappi
resource "digitalocean_database_cluster" "snappi_postgres" {
  name       = "snappi-postgres"
  engine     = "pg"
  version    = "14"
  size = "db-s-1vcpu-1gb"  # Smallest size for dev
  region     = var.region
  node_count = 1  # Single node for dev
}

# Create Snappi database
resource "digitalocean_database_db" "snappi_database" {
  cluster_id = digitalocean_database_cluster.snappi_postgres.id
  name       = "snappi"
}

# Create Snappi database user
resource "digitalocean_database_user" "snappi_user" {
  cluster_id = digitalocean_database_cluster.snappi_postgres.id
  name       = "snappi_user"
}

# Add Snappi database outputs
output "snappi_database_host" {
  value = digitalocean_database_cluster.snappi_postgres.host
}

output "snappi_database_port" {
  value = digitalocean_database_cluster.snappi_postgres.port
}

output "snappi_database_user" {
  value = digitalocean_database_user.snappi_user.name
}

output "snappi_database_password" {
  value     = digitalocean_database_user.snappi_user.password
  sensitive = true
}

output "snappi_database_url" {
  value     = "postgres://${digitalocean_database_user.snappi_user.name}:${digitalocean_database_user.snappi_user.password}@${digitalocean_database_cluster.snappi_postgres.host}:${digitalocean_database_cluster.snappi_postgres.port}/snappi"
  sensitive = true
}

# Output the bucket details
output "spaces_bucket_name" {
  value = digitalocean_spaces_bucket.snappi_storage.name
}

output "spaces_bucket_endpoint" {
  value = digitalocean_spaces_bucket.snappi_storage.bucket_domain_name
}
