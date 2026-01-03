/*
 Navicat Premium Data Transfer

 Source Server         : mysql_server_localhost
 Source Server Type    : MySQL
 Source Server Version : 80038 (8.0.38)
 Source Host           : localhost:3307
 Source Schema         : dsas-system-db

 Target Server Type    : MySQL
 Target Server Version : 80038 (8.0.38)
 File Encoding         : 65001

 Date: 19/06/2025 10:11:10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for appointment_approval_tbl
-- ----------------------------
DROP TABLE IF EXISTS `appointment_approval_tbl`;
CREATE TABLE `appointment_approval_tbl`  (
  `appointment_approval_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NULL DEFAULT NULL,
  `approved_by` int NULL DEFAULT NULL,
  `date_approved` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`appointment_approval_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for appointment_tbl
-- ----------------------------
DROP TABLE IF EXISTS `appointment_tbl`;
CREATE TABLE `appointment_tbl`  (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `transaction_type_id` int NULL DEFAULT NULL,
  `user_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `appointment_date` date NULL DEFAULT NULL,
  `time_window_id` int NULL DEFAULT NULL,
  `time_frame` enum('AM','PM') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `appointment_status` enum('Pending','Declined','Approved','') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Pending',
  `created_at` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`appointment_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for availability_tbl
-- ----------------------------
DROP TABLE IF EXISTS `availability_tbl`;
CREATE TABLE `availability_tbl`  (
  `availability_id` int NOT NULL AUTO_INCREMENT,
  `transaction_type_id` int NULL DEFAULT NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  `capacity_per_day` int NULL DEFAULT NULL,
  `created_by` int NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`availability_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for log_entries_tbl
-- ----------------------------
DROP TABLE IF EXISTS `log_entries_tbl`;
CREATE TABLE `log_entries_tbl`  (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `details` json NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`log_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for time_window_tbl
-- ----------------------------
DROP TABLE IF EXISTS `time_window_tbl`;
CREATE TABLE `time_window_tbl`  (
  `time_window_id` int NOT NULL AUTO_INCREMENT,
  `availability_id` int NULL DEFAULT NULL,
  `availability_date` date NOT NULL,
  `start_time_am` time NULL DEFAULT NULL,
  `end_time_am` time NULL DEFAULT NULL,
  `start_time_pm` time NULL DEFAULT NULL,
  `end_time_pm` time NULL DEFAULT NULL,
  PRIMARY KEY (`time_window_id`, `availability_date`) USING BTREE,
  UNIQUE INDEX `ux_timewindow`(`availability_date` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for transaction_type_tbl
-- ----------------------------
DROP TABLE IF EXISTS `transaction_type_tbl`;
CREATE TABLE `transaction_type_tbl`  (
  `transaction_type_id` int NOT NULL AUTO_INCREMENT,
  `transaction_title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `transaction_details` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`transaction_type_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users_tbl
-- ----------------------------
DROP TABLE IF EXISTS `users_tbl`;
CREATE TABLE `users_tbl`  (
  `user_id` int NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `password` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email_verified_at` date NULL DEFAULT NULL,
  `secret_key` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `create_at` datetime NULL DEFAULT NULL,
  `expired_at` datetime NULL DEFAULT NULL,
  `otp` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `otp_generated_at` datetime NULL DEFAULT NULL,
  `otp_expired_at` datetime NULL DEFAULT NULL,
  `user_level` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `mobile_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Procedure structure for approve_appointment
-- ----------------------------
DROP PROCEDURE IF EXISTS `approve_appointment`;
delimiter ;;
CREATE PROCEDURE `approve_appointment`(IN jsondata JSON)
BEGIN
    DECLARE _response JSON; 
    DECLARE _appointment_id INT DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.appointment_id'));
    DECLARE _user_id VARCHAR(100) DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.user_id'));
    -- Assuming _appointment_status is an integer representing the status
    DECLARE _appointment_status INT DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.appointment_status'));
    DECLARE _date_approved DATETIME DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.date_approved'));

    -- Initialize a default error response, which can be overwritten
    SET _response = JSON_OBJECT('success', FALSE, 'message', 'An unexpected error occurred.');

    IF NOT EXISTS(SELECT 1 FROM appointment_tbl WHERE appointment_id = _appointment_id) THEN
        SET _response = JSON_OBJECT('success', FALSE, 'message', 'Appointment not found.');
    ELSEIF EXISTS(SELECT 1
                  FROM appointment_approval_tbl
                  WHERE appointment_id = _appointment_id) THEN
        SET _response = JSON_OBJECT('success', FALSE, 'message', 'Appointment already approved.');
    ELSE
        -- Insert into approval table
        INSERT INTO appointment_approval_tbl (
            appointment_id,
            approved_by,
            date_approved
        ) VALUES (
            _appointment_id,
            _user_id,
            _date_approved
        );

        -- Update appointment status in main table
        UPDATE appointment_tbl
        SET
            appointment_status = _appointment_status
        WHERE
            appointment_id = _appointment_id;

        SET _response = JSON_OBJECT('success', TRUE, 'message', 'Appointment approved successfully.');
    END IF;

    -- Return the final JSON response
    SELECT _response AS result;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for delete_appointment
-- ----------------------------
DROP PROCEDURE IF EXISTS `delete_appointment`;
delimiter ;;
CREATE PROCEDURE `delete_appointment`(IN `_appointment_id` INT)
BEGIN
    DECLARE _response JSON;
    DECLARE _current_status VARCHAR(50); -- Assuming appointment_status is VARCHAR, adjust if it's INT
    DECLARE _rows_affected INT;

    -- Get the current status of the appointment
    SELECT appointment_status
    INTO _current_status
    FROM appointment_tbl
    WHERE appointment_id = _appointment_id;

    -- Check if the appointment exists
    IF _current_status IS NULL THEN
        SET _response = JSON_OBJECT(
            'success', FALSE,
            'message', CONCAT('Appointment with ID ', _appointment_id, ' not found.')
        );
    -- Check if the appointment status is 'Approved' (case-insensitive check)
    ELSEIF LOWER(_current_status) = 'approved' THEN
        SET _response = JSON_OBJECT(
            'success', FALSE,
            'message', CONCAT('Appointment with ID ', _appointment_id, ' cannot be deleted because it is already approved.')
        );
    ELSE
        -- Delete the record from appointment_tbl
        DELETE FROM appointment_tbl
        WHERE appointment_id = _appointment_id;

        -- Get the number of rows affected by the DELETE statement
        SET _rows_affected = ROW_COUNT();

        -- Prepare the JSON response based on deletion outcome
        IF _rows_affected > 0 THEN
            SET _response = JSON_OBJECT(
                'success', TRUE,
                'message', CONCAT('Appointment with ID ', _appointment_id, ' deleted successfully.')
            );
        ELSE
            -- This case would typically mean it was found but couldn't be deleted for another reason (rare if not approved)
            SET _response = JSON_OBJECT(
                'success', FALSE,
                'message', CONCAT('Failed to delete appointment with ID ', _appointment_id, '.')
            );
        END IF;
    END IF;

    -- Return the JSON response
    SELECT _response AS result;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for get_appointment
-- ----------------------------
DROP PROCEDURE IF EXISTS `get_appointment`;
delimiter ;;
CREATE PROCEDURE `get_appointment`(IN jsondata JSON)
BEGIN
    -- Declare variables to hold extracted JSON parameters
    DECLARE _appointment_id_param VARCHAR(50) DEFAULT NULL;
    DECLARE _appointment_status_param VARCHAR(50) DEFAULT NULL;
    DECLARE _appointment_date_param DATE DEFAULT NULL;
    DECLARE _transaction_title_param VARCHAR(100) DEFAULT NULL;
    DECLARE _user_id_param VARCHAR(100) DEFAULT NULL;

    -- Extract values from JSON and handle empty strings by setting them to NULL
    SET _appointment_id_param = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.appointment_id'));
    IF _appointment_id_param = '' THEN SET _appointment_id_param = NULL; END IF;

    SET _appointment_status_param = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.appointment_status'));
    IF _appointment_status_param = '' THEN SET _appointment_status_param = NULL; END IF;

    -- For date parameters, extract to VARCHAR first to avoid "Incorrect DATE value: ''" error
    BEGIN
        DECLARE _temp_date_str VARCHAR(20);
        SET _temp_date_str = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.appointment_date'));
        IF _temp_date_str = '' THEN
            SET _appointment_date_param = NULL;
        ELSE
            SET _appointment_date_param = STR_TO_DATE(_temp_date_str, '%Y-%m-%d'); -- Ensure correct date format
        END IF;
    END;

    SET _transaction_title_param = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.transaction_title'));
    IF _transaction_title_param = '' THEN SET _transaction_title_param = NULL; END IF;

    SET _user_id_param = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.user_id'));
    IF _user_id_param = '' THEN SET _user_id_param = NULL; END IF;


    SELECT
        A.appointment_id,
        T.transaction_title,
        DATE_FORMAT(A.appointment_date, '%Y-%m-%d') AS appointment_date,
        A.appointment_status,
        DATE_FORMAT(A.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        CASE
            WHEN A.time_frame = 'AM' THEN TIME_FORMAT(TW.start_time_am, '%h:%i %p')
            ELSE TIME_FORMAT(TW.start_time_pm, '%h:%i %p')
        END AS start_time,
        CASE
            WHEN A.time_frame = 'AM' THEN TIME_FORMAT(TW.end_time_am, '%h:%i %p')
            ELSE TIME_FORMAT(TW.end_time_pm, '%h:%i %p')
        END AS end_time
    FROM
        appointment_tbl AS A
    LEFT JOIN
        transaction_type_tbl AS T ON A.transaction_type_id = T.transaction_type_id
    LEFT JOIN
        time_window_tbl AS TW ON A.time_window_id = TW.time_window_id
    WHERE
        -- If ALL extracted parameters are NULL, return all records.
        -- Otherwise, apply filters for non-NULL parameters.
        (
            _appointment_id_param IS NULL AND
            _appointment_status_param IS NULL AND
            _appointment_date_param IS NULL AND
            _transaction_title_param IS NULL AND
            _user_id_param IS NULL
        )
        OR
        (
            -- Filter by appointment_id if provided
            (_appointment_id_param IS NULL OR A.appointment_id LIKE CONCAT('%', _appointment_id_param, '%'))
            AND
            -- Filter by appointment_status if provided
            (_appointment_status_param IS NULL OR A.appointment_status LIKE CONCAT('%', _appointment_status_param, '%'))
            AND
            -- Filter by appointment_date if provided
            (_appointment_date_param IS NULL OR A.appointment_date = _appointment_date_param)
            AND
            -- Filter by transaction_title if provided
            (_transaction_title_param IS NULL OR LOWER(T.transaction_title) LIKE CONCAT('%', LOWER(_transaction_title_param), '%'))
						AND
            -- Filter by user_id if provided
            (_user_id_param IS NULL OR A.user_id = _user_id_param)
        )
    ORDER BY
        A.appointment_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for get_availability
-- ----------------------------
DROP PROCEDURE IF EXISTS `get_availability`;
delimiter ;;
CREATE PROCEDURE `get_availability`(IN searchkey VARCHAR(100))
BEGIN
    SELECT
        A.availability_id,
        T.transaction_title,
        DATE_FORMAT(A.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(A.end_date, '%Y-%m-%d') AS end_date,
        A.capacity_per_day,
        A.created_by,
        DATE_FORMAT(A.created_at, '%Y-%m-%d %H:%i:%s') AS created_at, -- Including time for created_at
        TW.time_window_id,
        DATE_FORMAT(TW.availability_date, '%Y-%m-%d') AS availability_date, -- Explicitly selecting availability_date
        TW.start_time_am,
        TW.end_time_am,
        TW.start_time_pm,
        TW.end_time_pm
    FROM
        availability_tbl AS A
    LEFT JOIN
        transaction_type_tbl AS T ON A.transaction_type_id = T.transaction_type_id
    LEFT JOIN
        time_window_tbl AS TW ON A.availability_id = TW.availability_id
    WHERE
        -- Filter time_window_tbl entries to be within the availability range
        TW.availability_date BETWEEN A.start_date AND A.end_date
        AND
        -- If searchkey is empty or NULL, return all records.
        (searchkey IS NULL OR searchkey = '')
        OR
        -- Otherwise, filter by the searchkey contents.
        (
            A.availability_id LIKE CONCAT('%', searchkey, '%') OR
            A.capacity_per_day LIKE CONCAT('%', searchkey, '%') OR
            A.created_by LIKE CONCAT('%', searchkey, '%') OR
            T.transaction_title LIKE CONCAT('%', searchkey, '%')
        )
    ORDER BY
        A.availability_id, TW.availability_date; -- Order by availability_date for better readability of time windows
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for get_transaction_type
-- ----------------------------
DROP PROCEDURE IF EXISTS `get_transaction_type`;
delimiter ;;
CREATE PROCEDURE `get_transaction_type`()
BEGIN
	
	IF EXISTS(SELECT 1 FROM transaction_type_tbl LIMIT 1)THEN 
	
		SELECT transaction_title, transaction_details FROM transaction_type_tbl;
	
	ELSE 
	
		SELECT "No Transaction Type Found!" as response;
		
	END IF;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for insert_appointment
-- ----------------------------
DROP PROCEDURE IF EXISTS `insert_appointment`;
delimiter ;;
CREATE PROCEDURE `insert_appointment`(IN `jsondata` JSON)
BEGIN
    DECLARE _appointment_id INT DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, "$.appointment_id"));
    DECLARE _transaction_type_id INT DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, "$.transaction_type_id"));
    DECLARE _user_id INT DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, "$.user_id"));
    DECLARE _appointment_date DATE DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, "$.appointment_date"));
    DECLARE _timewindow_id INT DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, "$.timewindow_id"));
    DECLARE _updated_at DATETIME DEFAULT NOW();
    DECLARE _created_at DATETIME DEFAULT NOW();
    DECLARE _response JSON; -- Declare the response variable

    IF EXISTS(SELECT 1 FROM appointment_tbl WHERE appointment_id = _appointment_id AND user_id = _user_id AND appointment_status = "Pending") THEN
        -- Update existing appointment
        UPDATE appointment_tbl
        SET
            transaction_type_id = _transaction_type_id,
            appointment_date = _appointment_date,
            timewindow_id = _timewindow_id,
            updated_at = _updated_at
        WHERE
            appointment_id = _appointment_id
            AND user_id = _user_id;

        SET _response = JSON_OBJECT('success', TRUE, 'message', 'Appointment updated successfully.');
    ELSE
        -- Insert new appointment
        INSERT INTO appointment_tbl(transaction_type_id, user_id, appointment_date, timewindow_id, created_at)
        VALUES(_transaction_type_id, _user_id, _appointment_date, _timewindow_id, _created_at);

        SET _response = JSON_OBJECT('success', TRUE, 'message', 'Appointment inserted successfully.');
    END IF;

    -- Return the JSON response
    SELECT _response AS result;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for insert_availability
-- ----------------------------
DROP PROCEDURE IF EXISTS `insert_availability`;
delimiter ;;
CREATE PROCEDURE `insert_availability`(IN jsondata JSON)
BEGIN
    DECLARE _response JSON;
    DECLARE _availability_id INT;
    DECLARE _transaction_type_id INT;
    DECLARE _start_date DATE;
    DECLARE _end_date DATE;
    DECLARE _capacity_per_day INT;
    DECLARE _created_by INT;
    DECLARE _created_at DATETIME;
    DECLARE duplicate_entry_occurred BOOLEAN DEFAULT FALSE;

    -- Custom handler for duplicate entry errors (Error Code 1062) for time_window_tbl inserts.
    -- This handler catches the error for a specific row and allows the procedure to continue,
    -- setting a flag to indicate that a duplicate occurred (leading to an update instead of insert).
    DECLARE CONTINUE HANDLER FOR 1062
    BEGIN
        SET duplicate_entry_occurred = TRUE;
    END;

    -- Extract values from JSON
    SET _transaction_type_id = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.transaction_type_id'));
    SET _start_date = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.start_date'));
    SET _end_date = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.end_date'));
    SET _capacity_per_day = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.capacity_per_day'));
    SET _created_by = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.created_by'));
    SET _created_at = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.created_at'));

    -- Insert into the main availability table
    INSERT INTO availability_tbl (
        transaction_type_id,
        start_date,
        end_date,
        capacity_per_day,
        created_by,
        created_at
    ) VALUES (
        _transaction_type_id,
        _start_date,
        _end_date,
        _capacity_per_day,
        _created_by,
        _created_at
    );

    -- Get the ID of the newly inserted availability record
    SET _availability_id = LAST_INSERT_ID();

    -- Insert time window records.
    -- If (availability_id, availability_date) is a UNIQUE key on time_window_tbl,
    -- ON DUPLICATE KEY UPDATE will update existing rows for duplicates,
    -- and continue processing other rows from the JSON_TABLE.
    INSERT INTO time_window_tbl (
        availability_id,
        availability_date,
        start_time_am,
        end_time_am,
        start_time_pm,
        end_time_pm
    )
    SELECT
        _availability_id,
        tw.availability_date,
        tw.start_time_am,
        tw.end_time_am,
        tw.start_time_pm,
        tw.end_time_pm
    FROM
        JSON_TABLE(
            jsondata,
            '$.time_windows[*]' COLUMNS (
                availability_date DATE PATH '$.availability_date',
                start_time_am TIME PATH '$.start_time_am',
                end_time_am TIME PATH '$.end_time_am',
                start_time_pm TIME PATH '$.start_time_pm',
                end_time_pm TIME PATH '$.end_time_pm'
            )
        ) AS tw
    ON DUPLICATE KEY UPDATE
        start_time_am = VALUES(start_time_am),
        end_time_am = VALUES(end_time_am),
        start_time_pm = VALUES(start_time_pm),
        end_time_pm = VALUES(end_time_pm);

    -- Determine the response based on whether duplicate entries were encountered
    IF duplicate_entry_occurred THEN
        SET _response = JSON_OBJECT(
            'success', TRUE,
            'message', 'New availability record inserted. Some time windows were updated due to duplicate dates.',
            'warning', 'Some time windows had duplicate availability_date entries and were updated instead of inserted.',
            'new_availability_id', _availability_id
        );
    ELSE
        SET _response = JSON_OBJECT(
            'success', TRUE,
            'message', 'New availability record and all time windows successfully inserted.',
            'new_availability_id', _availability_id
        );
    END IF;

    SELECT _response AS result;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for insert_log_entry
-- ----------------------------
DROP PROCEDURE IF EXISTS `insert_log_entry`;
delimiter ;;
CREATE PROCEDURE `insert_log_entry`(IN jsondata JSON)
BEGIN
    -- Declare variables to hold extracted JSON parameters
    DECLARE _action VARCHAR(100) DEFAULT NULL;
    DECLARE _user_id VARCHAR(100) DEFAULT NULL;
    DECLARE _details JSON DEFAULT NULL;
    DECLARE _timestamp_str VARCHAR(50) DEFAULT NULL; -- Temporary variable to hold timestamp as string
    DECLARE _timestamp TIMESTAMP; -- Final TIMESTAMP variable
    DECLARE _response JSON;

    -- Extract values from JSON
    SET _action = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.action'));
		
    SET _user_id = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.user_id'));
    
    SET _details = JSON_EXTRACT(jsondata, '$.details');

    -- Extract timestamp as string first to handle empty string issue
    SET _timestamp_str = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.timestamp'));

    -- Determine the final timestamp value
    IF _timestamp_str IS NULL OR _timestamp_str = '' THEN
        SET _timestamp = NOW(); -- Use current timestamp if not provided or empty
    ELSE

        SET _timestamp = _timestamp_str;
				
    END IF;

    -- Insert the log entry into the log_entry table
    INSERT INTO log_entries_tbl (action, user_id, details, `timestamp`)
    VALUES (_action, _user_id, _details, _timestamp);

    -- Set the success response
    SET _response = JSON_OBJECT(
        'success', TRUE,
        'message', 'Log entry inserted successfully.'
    );

    -- Return the JSON response
    SELECT _response AS result;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for insert_transaction_type
-- ----------------------------
DROP PROCEDURE IF EXISTS `insert_transaction_type`;
delimiter ;;
CREATE PROCEDURE `insert_transaction_type`(IN jsondata LONGTEXT)
BEGIN
    DECLARE _transaction_title VARCHAR(100) DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, "$.transaction_title"));
    DECLARE _transaction_details VARCHAR(200) DEFAULT JSON_UNQUOTE(JSON_EXTRACT(jsondata, "$.transaction_detail"));
    DECLARE _response JSON; -- Declare a JSON variable for the response

    IF EXISTS(SELECT 1 FROM transaction_type_tbl WHERE transaction_title = _transaction_title) THEN
        -- If transaction title exists, update its details
        UPDATE transaction_type_tbl
        SET
            transaction_details = _transaction_details
        WHERE
            transaction_title = _transaction_title;

        -- Set the JSON response for update
        SET _response = JSON_OBJECT(
            'success', TRUE,
            'message', 'Transaction Type already existed, transaction details updated.'
        );
    ELSE
        -- If transaction title does not exist, insert a new record
        INSERT INTO transaction_type_tbl(transaction_title, transaction_details)
        VALUES(_transaction_title, _transaction_details);

        -- Set the JSON response for insert
        SET _response = JSON_OBJECT(
            'success', TRUE,
            'message', 'Transaction Type successfully inserted.'
        );
    END IF;

    -- Return the JSON response
    SELECT _response AS result;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for login_user
-- ----------------------------
DROP PROCEDURE IF EXISTS `login_user`;
delimiter ;;
CREATE PROCEDURE `login_user`(IN _userdata JSON)
BEGIN

	DECLARE _user_email VARCHAR(255) DEFAULT JSON_UNQUOTE(JSON_EXTRACT(_userdata, "$.email"));

	
	SET @JsonSchema = '{
	"type":"object",
	"properties": {
		"email":{"type":"string"}
	},
	"required":["email"]
	}';
	
	IF JSON_SCHEMA_VALID(@JsonSchema, _userdata) = 0 THEN
		
		SELECT JSON_OBJECT("status",500 , "message", "Invalid Schema Given") as result;
	ELSE
		
		IF EXISTS(SELECT * FROM users_tbl WHERE email = _user_email) THEN
			IF EXISTS(SELECT * FROM users_tbl WHERE email = _user_email AND email_verified_at IS NULL) THEN
				IF EXISTS(SELECT * FROM users_tbl WHERE email = _user_email AND otp_expired_at >= NOW() ) THEN
					
					SELECT JSON_OBJECT("status",400 , "message", "Please do verify your Email using the OTP sent to your Email") as result;
				ELSE
					SELECT JSON_OBJECT("status",401 , "message", "OTP has expired generate a new one!") as result;
				END IF;
			ELSE
			
						SELECT user_id, user_level, username, mobile, `password`, email, 
									 JSON_OBJECT("status", 200 , "message", "User Found!") AS result
						FROM users_tbl 
						WHERE email = _user_email;
			END IF;
		ELSE
					SELECT JSON_OBJECT("status" , 404,
														 "message", "User not registered") as result;
		END IF;
		
		
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for update_availability
-- ----------------------------
DROP PROCEDURE IF EXISTS `update_availability`;
delimiter ;;
CREATE PROCEDURE `update_availability`(IN jsondata JSON)
BEGIN
    DECLARE _response JSON;
    DECLARE _availability_id INT;
    DECLARE _transaction_type_id INT;
    DECLARE _start_date DATE;
    DECLARE _end_date DATE;
    DECLARE _capacity_per_day INT;
    DECLARE _created_by INT;
    DECLARE _created_at DATETIME;
    DECLARE duplicate_entry_occurred BOOLEAN DEFAULT FALSE;

    -- Custom handler for duplicate entry errors (Error Code 1062)
    -- This handler will catch the error but allow the procedure to continue,
    -- setting a flag to indicate a duplicate occurred.
    DECLARE CONTINUE HANDLER FOR 1062
    BEGIN
        SET duplicate_entry_occurred = TRUE;
    END;

    -- Extract values from JSON
    SET _availability_id = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.availability_id'));
    SET _transaction_type_id = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.transaction_type_id'));
    SET _start_date = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.start_date'));
    SET _end_date = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.end_date'));
    SET _capacity_per_day = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.capacity_per_day'));
    SET _created_by = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.created_by'));
    SET _created_at = JSON_UNQUOTE(JSON_EXTRACT(jsondata, '$.created_at'));

    -- Main logic: Only proceed if an existing availability_id is provided
    IF _availability_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM availability_tbl WHERE availability_id = _availability_id)
    THEN
        -- Update the main availability record
        UPDATE availability_tbl
        SET
            transaction_type_id = _transaction_type_id,
            start_date = _start_date,
            end_date = _end_date,
            capacity_per_day = _capacity_per_day,
            created_by = _created_by,
            created_at = _created_at
        WHERE
            availability_id = _availability_id;

        -- Insert/Update time window records.
        -- If (availability_id, availability_date) is a UNIQUE key,
        -- ON DUPLICATE KEY UPDATE will update existing rows rather than inserting new ones
        -- for duplicates, and continue processing other rows from the JSON_TABLE.
        INSERT INTO time_window_tbl (
            availability_id,
            availability_date,
            start_time_am,
            end_time_am,
            start_time_pm,
            end_time_pm
        )
        SELECT
            _availability_id,
            tw.availability_date,
            tw.start_time_am,
            tw.end_time_am,
            tw.start_time_pm,
            tw.end_time_pm
        FROM
            JSON_TABLE(
                jsondata,
                '$.time_windows[*]' COLUMNS (
                    availability_date DATE PATH '$.availability_date',
                    start_time_am TIME PATH '$.start_time_am',
                    end_time_am TIME PATH '$.end_time_am',
                    start_time_pm TIME PATH '$.start_time_pm',
                    end_time_pm TIME PATH '$.end_time_pm'
                )
            ) AS tw
        ON DUPLICATE KEY UPDATE
            start_time_am = VALUES(start_time_am),
            end_time_am = VALUES(end_time_am),
            start_time_pm = VALUES(start_time_pm),
            end_time_pm = VALUES(end_time_pm);

        IF duplicate_entry_occurred THEN
            SET _response = JSON_OBJECT(
                'success', TRUE,
                'message', 'Availability record updated. Some time windows were updated due to duplicate dates.',
                'warning', 'Some time windows had duplicate availability_date entries and were updated instead of inserted.'
            );
        ELSE
            SET _response = JSON_OBJECT(
                'success', TRUE,
                'message', 'Availability record and all time windows successfully updated.'
            );
        END IF;

    ELSE
        -- If _availability_id is NULL or does not exist, return an error as we are only updating.
        SET _response = JSON_OBJECT(
            'success', FALSE,
            'message', 'Error: Availability ID is missing or record does not exist for update.'
        );
    END IF;

    SELECT _response AS result;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
