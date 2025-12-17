# Car Simulation System

This project is a distributed system that simulates vehicle telemetry and management using a Backend API, a Simulator, and a Dashboard CLI.

## Project Structure

- **CarSimulationSystem.Backend**: An ASP.NET Core Web API that acts as the central server. It hosts an embedded MQTT broker, manages vehicle data, and processes telemetry.
- **CarSimulationSystem.Simulator**: A Console Application that simulates vehicles moving on a map (centered on Paris). It connects to the backend to get the list of cars and sends telemetry via MQTT.
- **CarSimulationSystem.Dashboard**: A Console Application that serves as a management UI. It allows you to Add, Edi, Delete, and Monitor vehicles connecting to the Backend API.
- **CarSimulationSystem.Shared**: Shared library containing common data models.

## Prerequisites

- .NET 9.0 SDK or later

## How to Run

It is recommended to run the components in the following order:

### 1. Start the Backend Server

The backend must be running first as it hosts the MQTT broker and the API.

```bash
cd CarSimulationSystem.Backend
dotnet run
```
The server will start on `http://localhost:5209`.

### 2. Start the Simulator

The simulator will visualize the cars moving on a map in the terminal.

```bash
cd CarSimulationSystem.Simulator
dotnet run
```
**Note:** The simulator requires cars to be created first. If no cars are moving, use the Dashboard to add some.

### 3. Start the Dashboard

The dashboard allows you to manage the fleet.

```bash
cd CarSimulationSystem.Dashboard
dotnet run
```

### Usage Flow

1.  Open the **Dashboard** and select option **2. Add Vehicle** to create a new car.
2.  Once a car is added, the **Simulator** will automatically pick it up and start simulating its movement.
3.  You can view the moving cars in the **Simulator** window or monitor their telemetry in the **Dashboard** (Option 1).

## Features

- **Real-time Telemetry**: Cars send GPS updates via MQTT.
- **Speed Monitoring**: The backend calculates speed and sends commands ("HONK" or "STOP") if a vehicle speeds.
- **Visual Simulation**: ASCII-based map visualization in the Simulator terminal.
- **CRUD Operations**: Manage the vehicle fleet via the Dashboard.
