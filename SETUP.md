# TripShare Setup Guide

Follow these steps to run the project on a new machine (e.g., a friend's computer).

## 1. Prerequisites
Install these two programs on the new machine:
1.  **Git**: [Download Git](https://git-scm.com/downloads)
2.  **Docker Desktop**: [Download Docker](https://www.docker.com/products/docker-desktop/)
    *   *Note: After installing Docker, start it and wait for the engine to initialize.*

## 2. Get the Code
Open a terminal (Command Prompt or PowerShell) and run:

```bash
git clone <YOUR_REPOSITORY_URL>
cd tripshare
```

## 3. Configure Secrets (Crucial!)
The database credentials are **not** in the code (for security). You must manually create the environment file.

1.  Go to the `backend` folder.
2.  Create a new file named `.env`.
3.  **Copy the content** from your original machine's `backend/.env` and paste it into this new file.
    *   *It should contain your Aiven DB credentials.*

## 4. Run the Project
In the root folder (`tripshare`), run this single command:

```bash
docker-compose up --build
```

## 5. Access the App
Once the logs stop scrolling and you see "Server running...", open the browser:
*   **Frontend**: [http://localhost:5173](http://localhost:5173)
*   **Backend**: [http://localhost:3000](http://localhost:3000)

---
**To Stop the App:** Press `Ctrl + C` in the terminal.
