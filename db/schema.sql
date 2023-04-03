CREATE DATABASE servo;

CREATE TABLE petrolStations (
    id SERIAL PRIMARY KEY,
    name TEXT,
    address TEXT,
    lat BOOL,
    long BOOL
);