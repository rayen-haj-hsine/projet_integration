-- Test Data: Past Trip with Reservation
-- This creates a trip that has already departed (yesterday) with a confirmed reservation for user 'rayen'

-- First, find rayen's user ID (assuming email is rayen@example.com or similar)
-- If you need to check: SELECT id, name, email, role FROM users WHERE name LIKE '%rayen%';

-- Insert a past trip (departed yesterday)
-- Assuming driver_id = 1 (change this to an actual driver ID from your database)
INSERT INTO trips (driver_id, departure_city, destination_city, departure_date, price, available_seats, status, created_at)
VALUES (
    1,  -- driver_id (change this to a real driver ID)
    'Tunis',
    'Sousse',
    DATE_SUB(NOW(), INTERVAL 1 DAY),  -- Yesterday
    15.00,
    3,
    'closed',  -- Trip is closed since it already departed
    DATE_SUB(NOW(), INTERVAL 2 DAY)  -- Created 2 days ago
);

-- Get the trip ID (it will be the last inserted ID)
SET @trip_id = LAST_INSERT_ID();

-- Insert a reservation for rayen (assuming passenger_id = 2, change to rayen's actual ID)
-- To find rayen's ID: SELECT id FROM users WHERE name = 'rayen' OR email LIKE '%rayen%';
INSERT INTO reservations (trip_id, passenger_id, status, created_at)
VALUES (
    @trip_id,
    2,  -- passenger_id (change this to rayen's actual user ID)
    'confirmed',
    DATE_SUB(NOW(), INTERVAL 1 DAY)  -- Reserved yesterday
);

-- Verify the data
SELECT 
    t.id as trip_id,
    t.departure_city,
    t.destination_city,
    t.departure_date,
    t.status as trip_status,
    r.id as reservation_id,
    r.status as reservation_status,
    u.name as passenger_name
FROM trips t
JOIN reservations r ON r.trip_id = t.id
JOIN users u ON u.id = r.passenger_id
WHERE t.id = @trip_id;
