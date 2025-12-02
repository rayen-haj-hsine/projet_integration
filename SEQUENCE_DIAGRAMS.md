# TripShare Sequence Diagrams

## 1. Passenger: Reserve a Seat (Book Reservation)
This diagram illustrates the process of a passenger searching for a trip and making a reservation request.

```mermaid
sequenceDiagram
    actor Passenger
    participant Frontend as Web App
    participant API as Backend API
    participant DB as Database

    Passenger->>Frontend: Search for trips (City, Date)
    Frontend->>API: GET /api/trips?search=...
    API->>DB: Query open trips
    DB-->>API: Return trip list
    API-->>Frontend: Display trips
    Passenger->>Frontend: Select Trip & Click "Reserve"
    Frontend->>API: POST /api/reservations { trip_id }
    activate API
    API->>DB: Check trip status & seats
    alt Trip Open & Seats Available
        API->>DB: Decrement available_seats
        API->>DB: Insert Reservation (status='pending')
        API->>DB: Insert Notification for Driver
        DB-->>API: Success
        API-->>Frontend: 201 Created (Reservation Pending)
        Frontend-->>Passenger: Show "Reservation Request Sent"
    else No Seats / Error
        DB-->>API: Failure
        API-->>Frontend: 400 Error
        Frontend-->>Passenger: Show Error Message
    end
    deactivate API
```

## 2. Driver: Accept Reservation Request
This diagram shows the driver reviewing and confirming a pending reservation request from a passenger.

```mermaid
sequenceDiagram
    actor Driver
    participant Frontend as Web App
    participant API as Backend API
    participant DB as Database
    actor Passenger as Passenger (User)

    Driver->>Frontend: View Trip Dashboard
    Frontend->>API: GET /api/trips/:id/reservations
    API->>DB: Query reservations for trip
    DB-->>API: Return list
    API-->>Frontend: Display reservations
    Driver->>Frontend: Click "Confirm" on Pending Request
    Frontend->>API: PATCH /api/reservations/:id/confirm
    activate API
    API->>DB: Verify Driver owns trip
    API->>DB: Update Reservation status='confirmed'
    API->>DB: Insert Notification for Passenger
    DB-->>API: Success
    API-->>Frontend: 200 OK
    deactivate API
    Frontend-->>Driver: Update Status to "Confirmed"
    
    note right of DB: Asynchronous Notification
    DB--)Passenger: Notification: "Reservation Confirmed"
```

## 3. Admin: Cancel Trip (Moderation)
This diagram depicts an admin cancelling a trip, which triggers notifications to all affected passengers.

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as Admin Panel
    participant API as Backend API
    participant DB as Database
    actor Passengers as Affected Passengers

    Admin->>Frontend: View All Trips
    Frontend->>API: GET /api/trips (Admin View)
    API-->>Frontend: Return trip list
    Admin->>Frontend: Select Trip & Click "Delete/Cancel"
    Frontend->>API: DELETE /api/trips/:id
    activate API
    API->>DB: Fetch Trip & Reservations
    loop For each Passenger
        API->>DB: Insert Notification (Trip Cancelled)
    end
    API->>DB: Delete Reservations
    API->>DB: Delete Trip
    DB-->>API: Success
    API-->>Frontend: 200 OK
    deactivate API
    Frontend-->>Admin: Show "Trip Deleted"
    
    note right of DB: Asynchronous Notification
    DB--)Passengers: Notification: "Trip Cancelled by Admin"
```
