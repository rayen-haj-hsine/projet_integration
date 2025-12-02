# TripShare Use Case Documentation

## 1. Introduction
TripShare is a carpooling application designed to connect drivers with empty seats to passengers looking for a ride. This document outlines the key actors and their interactions with the system.

## 2. Actors

*   **Guest**: An unauthenticated user who visits the site.
*   **User**: An authenticated user. Can act as both a Driver and a Passenger.
*   **Driver**: A user who publishes trips and transports passengers.
*   **Passenger**: A user who searches for and books rides.
*   **Admin**: A privileged user who manages the platform.

## 3. Use Cases by Actor

### 3.1 Guest
*   **Register**: Create a new account.
*   **Login**: Authenticate into the system.
*   **Search Trips**: View available trips (often allowed before login, though booking requires login).

### 3.2 User (Common to Driver & Passenger)
*   **Manage Profile**: View and edit personal information (bio, preferences, vehicle info).
*   **Change Password**: Update account security.
*   **View Notifications**: See updates about reservations, chats, etc.
*   **Chat**: Send and receive messages with other users.
*   **View History**: See past trips and reservations.
*   **Logout**: End the session.

### 3.3 Driver
*   **Publish Trip**: Create a new trip listing with origin, destination, date, time, price, and seats.
*   **Manage My Trips**: View active listings.
*   **Manage Reservations**: Accept or reject reservation requests from passengers.
*   **View Passenger List**: See who is booked on a trip.
*   **Rate Passenger**: Leave feedback for passengers after a trip.

### 3.4 Passenger
*   **Search Trips**: Filter trips by location, date, and price.
*   **View Trip Details**: See full details including driver info, car info, and route.
*   **Book Reservation**: Request a seat on a trip.
*   **Manage Reservations**: View status of bookings or cancel a reservation.
*   **Rate Driver**: Leave feedback for the driver after a trip.

### 3.5 Admin
*   **Dashboard Overview**: View system statistics (users, trips, active reservations).
*   **Manage Users**: View user lists, potentially ban/suspend users.
*   **Manage Trips**: Monitor published trips, cancel inappropriate listings.

## 4. Use Case Diagram

```mermaid
usecaseDiagram
    actor "Guest" as g
    actor "User" as u
    actor "Driver" as d
    actor "Passenger" as p
    actor "Admin" as a

    usecase "Register" as UC1
    usecase "Login" as UC2
    usecase "Manage Profile" as UC3
    usecase "Change Password" as UC4
    usecase "Publish Trip" as UC5
    usecase "Search Trips" as UC6
    usecase "Book Reservation" as UC7
    usecase "Manage Reservations" as UC8
    usecase "Rate User" as UC9
    usecase "Chat" as UC10
    usecase "View Dashboard" as UC11
    usecase "Manage Users" as UC12

    g --> UC1
    g --> UC2
    g --> UC6

    u <|-- d
    u <|-- p
    u --> UC3
    u --> UC4
    u --> UC10
    u --> UC2

    d --> UC5
    d --> UC8
    d --> UC9

    p --> UC6
    p --> UC7
    p --> UC9

    a --> UC11
    a --> UC12
    a --> UC2
```
