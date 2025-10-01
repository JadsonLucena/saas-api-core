# Terraform Environment Variables

This project uses Terraform to provision resources on major clouds.

## Environment Variables

The variables that need to be defined are:

### 1. **Azure**

* **Azure Resource Group Name**: The name of the resource group in Azure.

  ```bash
  export TF_VAR_AZURE_RESOURCE_GROUP_NAME="your-resource-group-name"
  export TF_VAR_AZURE_TENANT_ID="your-tenant-id"
  export TF_VAR_AZURE_SUBSCRIPTION_ID="your-subscription-id"
  ```

### 2. **Google Cloud (GCP)**

* **GCP Project ID**: The ID of your GCP project.

  ```bash
  export TF_VAR_GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
  ```

---

> These variables must be set before running Terraform commands.

## How to Run the Project

Navigate to the cloud provider and module you want to apply, then run:

```bash
terraform init
terraform apply
```

---

## How to Destroy the Project

To tear down the created resources:

```bash
terraform destroy
```