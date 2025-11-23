
DROP DATABASE IF EXISTS library_db;
CREATE DATABASE library_db;
USE library_db;

-- =======================================================================================
-- 1. CORE TABLES (User Management & Catalog)
-- =======================================================================================

-- 1.1 LOGIN (Base table for Authentication)
CREATE TABLE Login (
    Login_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) UNIQUE NOT NULL,
    Login_Password VARCHAR(255) NOT NULL, -- Store Hashed Passwords here
    Entity_Type ENUM('Admin', 'Customer') NOT NULL
);

-- 1.2 ADMIN (One or more admins)
CREATE TABLE Admin (
    AdID INT AUTO_INCREMENT PRIMARY KEY,
    Ad_FirstName VARCHAR(255) NOT NULL,
    Ad_LastName VARCHAR(255) NOT NULL,
    Birth_Date DATE,
    Login_ID INT NOT NULL UNIQUE,
    FOREIGN KEY (Login_ID) REFERENCES Login(Login_ID) ON DELETE CASCADE
);

-- 1.3 CUSTOMER (Members)
-- Note: AdID is NULLABLE to support "Self Sign-Up"
CREATE TABLE Customer (
    CusID INT AUTO_INCREMENT PRIMARY KEY,
    Cus_FirstName VARCHAR(255) NOT NULL,
    Cus_LastName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    AdID INT NULL, -- Assigned Admin
    Login_ID INT NOT NULL UNIQUE,
    FOREIGN KEY (AdID) REFERENCES Admin(AdID),
    FOREIGN KEY (Login_ID) REFERENCES Login(Login_ID) ON DELETE CASCADE
);

-- 1.4 BOOKS (Catalog & Inventory)
CREATE TABLE Books (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    Category VARCHAR(100),
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(255) NOT NULL,
    Price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Pub_Year INT,
    Pub_Name VARCHAR(255),
    Cover VARCHAR(255), -- URL or Path to image
    Rating FLOAT DEFAULT 0, -- Auto-calculated via Trigger
    Quantity INT DEFAULT 1, -- Total owned by library
    Available_Copies INT DEFAULT 1, -- Currently on shelf
    Availability BOOLEAN DEFAULT TRUE, -- 1 = Available, 0 = Out of Stock
    CONSTRAINT chk_copies CHECK (Available_Copies <= Quantity AND Available_Copies >= 0)
);

-- =======================================================================================
-- 2. FEATURE TABLES (Transactions, Fines, Reservations)
-- =======================================================================================

-- 2.1 BORROWING (Loan Management)
CREATE TABLE Borrowing (
    BorrowID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT NOT NULL,
    CusID INT NOT NULL,
    BorrowDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    DueDate DATETIME NOT NULL,
    ReturnDate DATETIME NULL,
    Status ENUM('Borrowed', 'Returned', 'Overdue') DEFAULT 'Borrowed',
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (CusID) REFERENCES Customer(CusID)
);

-- 2.2 INVOICE (Financials & Fines)
CREATE TABLE Invoice (
    InvoiceID INT AUTO_INCREMENT PRIMARY KEY,
    BorrowID INT NOT NULL UNIQUE,
    Amount DECIMAL(10,2) NOT NULL DEFAULT 5.00, -- Base Borrowing Fee
    Fine DECIMAL(10,2) DEFAULT 0.00, -- Penalty (Starts at 0)
    PaymentDate DATETIME NULL,
    Status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
    FOREIGN KEY (BorrowID) REFERENCES Borrowing(BorrowID) ON DELETE CASCADE
);

-- 2.3 RESERVATION (For unavailable books)
CREATE TABLE Reservation (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT NOT NULL,
    CusID INT NOT NULL,
    ReservationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ReservationExpiryDate DATETIME NOT NULL,
    Status ENUM('Active', 'Fulfilled', 'Cancelled') DEFAULT 'Active',
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (CusID) REFERENCES Customer(CusID)
);

-- =======================================================================================
-- 3. NORMALIZATION DETAILS (Addresses, Phones, Ratings)
-- =======================================================================================

CREATE TABLE Ad_Address (
    AdID INT PRIMARY KEY,
    Street_Name VARCHAR(255),
    City VARCHAR(100),
    Country VARCHAR(100),
    Region VARCHAR(100),
    Postal_Code VARCHAR(20),
    FOREIGN KEY (AdID) REFERENCES Admin(AdID) ON DELETE CASCADE
);

CREATE TABLE Cus_Address (
    CusID INT PRIMARY KEY,
    Street_Name VARCHAR(255),
    City VARCHAR(100),
    Country VARCHAR(100),
    Region VARCHAR(100),
    Postal_Code VARCHAR(20),
    FOREIGN KEY (CusID) REFERENCES Customer(CusID) ON DELETE CASCADE
);

CREATE TABLE Ad_Phone (
    AdID INT,
    Phone_Number VARCHAR(20),
    PRIMARY KEY (AdID, Phone_Number),
    FOREIGN KEY (AdID) REFERENCES Admin(AdID) ON DELETE CASCADE
);

CREATE TABLE Cus_Phone (
    CusID INT,
    Phone_Number VARCHAR(20),
    PRIMARY KEY (CusID, Phone_Number),
    FOREIGN KEY (CusID) REFERENCES Customer(CusID) ON DELETE CASCADE
);

CREATE TABLE Cus_Rating (
    CusID INT,
    BookID INT,
    Rating FLOAT CHECK (Rating >= 1 AND Rating <= 5),
    PRIMARY KEY (CusID, BookID), -- Composite PK prevents duplicate ratings
    FOREIGN KEY (CusID) REFERENCES Customer(CusID) ON DELETE CASCADE,
    FOREIGN KEY (BookID) REFERENCES Books(BookID) ON DELETE CASCADE
);
