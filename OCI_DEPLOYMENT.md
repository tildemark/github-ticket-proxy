# ☁️ Deploying Issue-Bridge on Oracle Cloud Infrastructure (OCI) Always Free

This guide provides instructions to run **Issue-Bridge** on an **OCI Always Free Compute Instance** (Ampere A1 ARM or AMD E2.1.Micro) with **OCI Email Delivery**.

---

## 1. OCI Compute Instance Setup

1. **Create an Always Free Instance**:
   - Shape: **VM.Standard.A1.Flex** (4 OCPU, 24 GB RAM — Always Free) or **VM.Standard.E2.1.Micro** (1 OCPU, 1 GB RAM).
   - Image: **Ubuntu 24.04 LTS** or **Oracle Linux 9**.
   - Assign a Public IP.

2. **Open VCN Ingress Rules (OCI Console)**:
   - Go to: *Networking &rarr; Virtual Cloud Networks &rarr; Your VCN &rarr; Security Lists &rarr; Default Security List*.
   - Add Ingress Rules:
     - **Port 80 (HTTP)**: Source `0.0.0.0/0`, Protocol `TCP`, Destination Port `80`.
     - **Port 443 (HTTPS)**: Source `0.0.0.0/0`, Protocol `TCP`, Destination Port `443`.
     - **Port 22 (SSH)**: Source `0.0.0.0/0`, Protocol `TCP`, Destination Port `22`.

3. **Open Ubuntu / Oracle Linux Firewall (iptables / firewalld)**:
   ```bash
   # On Ubuntu instances (OCI requires opening OS iptables as well as VCN)
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

---

## 2. Docker & Environment Setup

1. **Install Docker & Docker Compose**:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose git
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/tildemark/github-ticket-proxy.git
   cd github-ticket-proxy
   ```

3. **Create Production `.env` File**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Configure your environment variables:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/issue_bridge?schema=public"
   AUTH_SECRET="your-generated-random-32-char-secret"
   NEXTAUTH_URL="https://your-domain.com"
   GITHUB_TOKEN="github_pat_..."
   GITHUB_REPO_OWNER="tildemark"
   GITHUB_REPO_NAME="trace"
   ```

---

## 3. OCI Email Delivery Service Setup

OCI Email Delivery provides 3,000 free emails per month on Always Free.

### Step A: Configure an Approved Sender
1. In the OCI Console: *Developer Services &rarr; Application Integration &rarr; Email Delivery &rarr; Approved Senders*.
2. Click **Create Approved Sender**.
3. Input your email: e.g. `support@yourdomain.com`.
4. Add the provided **SPF record** and **DKIM keys** to your domain DNS settings (Cloudflare, Namecheap, Route53, etc.).

### Step B: Generate SMTP Credentials
1. In the OCI Console: *Identity & Security &rarr; Users &rarr; User Details*.
2. On the left under *Resources*, click **SMTP Credentials**.
3. Click **Generate SMTP Credentials**:
   - **Username**: Will be an OCID (e.g. `ocid1.user.oc1..aaaaaa...`).
   - **Password**: Copy the generated key immediately (shown only once).

### Step C: Enter Credentials in Issue-Bridge
1. Log into your Issue-Bridge Admin Console &rarr; click **Backend Setup** (`/admin/setup`).
2. Select **Oracle Cloud Infrastructure (OCI Email Delivery)**.
3. Fill in:
   - **SMTP Hostname**: `smtp.email.{region}.oci.oraclecloud.com` (e.g. `smtp.email.us-ashburn-1.oci.oraclecloud.com`).
   - **SMTP Port**: `587`.
   - **SMTP Username**: Your User OCID.
   - **SMTP Password**: Your generated SMTP Key.
   - **Sender Approved From Address**: The Approved Sender email from Step A.
4. Click **Save System Settings** and test the connection.

---

## 4. Production Deployment with Docker Compose

A ready-to-run `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:secure_db_pass@db:5432/issue_bridge?schema=public
      - AUTH_SECRET=${AUTH_SECRET}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - GITHUB_REPO_OWNER=${GITHUB_REPO_OWNER}
      - GITHUB_REPO_NAME=${GITHUB_REPO_NAME}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_db_pass
      POSTGRES_DB: issue_bridge
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run in the background:
```bash
docker-compose -f docker-compose.prod.yml up -d
```
