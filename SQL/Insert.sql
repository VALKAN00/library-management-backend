-- 7. DUMMY DATA (For Testing)
-- =======================================================================================
USE library_db;

CALL RegisterUser('John', 'Doe', '1990-01-01', 'johndoe', 'password123',
'Admin');

LOAD DATA INFILE '/var/lib/mysql-files/edited_book_data.csv'
INTO TABLE Books
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(Category, Title, Author, Price, Quantity, Available_Copies, Pub_Year, Pub_Name, Cover, Rating, Availability);

select * from Books;

select * from Users;



DELETE FROM Users
WHERE Username = 'admin';

