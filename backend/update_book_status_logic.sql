-- Update book status based on available_copies logic
-- If available_copies = 0, status = 'borrowed'
-- If available_copies >= 1, status = 'available'

-- First, update all existing books based on current available_copies
UPDATE books SET status = 'borrowed' WHERE available_copies = 0;
UPDATE books SET status = 'available' WHERE available_copies >= 1;

-- Create a trigger to automatically update status when available_copies changes
DELIMITER $$

CREATE TRIGGER update_book_status_on_available_copies_change
BEFORE UPDATE ON books
FOR EACH ROW
BEGIN
    -- Update status based on available_copies
    IF NEW.available_copies = 0 THEN
        SET NEW.status = 'borrowed';
    ELSEIF NEW.available_copies >= 1 THEN
        SET NEW.status = 'available';
    END IF;
END$$

DELIMITER ;

-- Create a trigger to automatically set status when inserting new books
DELIMITER $$

CREATE TRIGGER set_book_status_on_insert
BEFORE INSERT ON books
FOR EACH ROW
BEGIN
    -- Set status based on available_copies
    IF NEW.available_copies = 0 THEN
        SET NEW.status = 'borrowed';
    ELSEIF NEW.available_copies >= 1 THEN
        SET NEW.status = 'available';
    END IF;
END$$

DELIMITER ;

-- Also create a trigger to update available_copies when book_copies changes
DELIMITER $$

CREATE TRIGGER update_available_copies_on_book_copies_change
BEFORE UPDATE ON books
FOR EACH ROW
BEGIN
    -- If book_copies is being updated, adjust available_copies accordingly
    IF NEW.book_copies != OLD.book_copies THEN
        -- Calculate the difference
        SET @diff = NEW.book_copies - OLD.book_copies;
        -- Update available_copies by the same amount
        SET NEW.available_copies = OLD.available_copies + @diff;
        
        -- Ensure available_copies doesn't go below 0 or above book_copies
        IF NEW.available_copies < 0 THEN
            SET NEW.available_copies = 0;
        ELSEIF NEW.available_copies > NEW.book_copies THEN
            SET NEW.available_copies = NEW.book_copies;
        END IF;
    END IF;
END$$

DELIMITER ;
