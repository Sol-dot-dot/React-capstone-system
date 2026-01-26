# Database Relationships - Library Management System

## Entity Relationship Diagram (Text)

```
                                    +------------------+
                                    |  academic_years  |
                                    +------------------+
                                    | PK id            |
                                    | year_name        |
                                    | start_date       |
                                    | end_date         |
                                    | is_current       |
                                    +--------+---------+
                                             |
                                             | 1:N
                                             v
+------------------+              +------------------+
|      users       |              |    semesters     |
+------------------+              +------------------+
| PK id            |              | PK id            |
| UK id_number     |<-------------| FK academic_year |
| UK student_bar...|              | semester_number  |
| UK email         |              | semester_name    |
| password_hash    |              | start/end_date   |
| first/last_name  |              | is_current       |
| role             |              +--------+---------+
+--------+---------+                       |
         |                                 |
         +--------------------------------+|
         |         |         |            ||
         v         v         v            vv
+------------------+  +------------------+  +---------------------+
| borrowing_trans  |  |  login_logs      |  | semester_clearances |
+------------------+  +------------------+  +---------------------+
| PK id            |  | PK id            |  | PK id               |
| FK student_id_no |  | FK user_id       |  | FK user_id          |
| FK book_id       |  | user_type        |  | FK semester_id      |
| FK borrowed_by   |  | login_time       |  | FK cleared_by       |
| FK returned_by   |  | ip_address       |  | books_borrowed      |
| FK semester_id   |  +------------------+  | is_cleared          |
| FK academic_yr   |                        +---------------------+
| borrowed_date    |
| due_date         |  +------------------+  +---------------------+
| status           |  |   audit_logs     |  | student_year_history|
+--------+---------+  +------------------+  +---------------------+
         |            | PK id            |  | PK id               |
         |            | FK user_id       |  | FK user_id          |
         +----------->| action           |  | FK academic_year_id |
         |            | table_name       |  | year_level          |
         |            | old/new_values   |  | status              |
         |            +------------------+  +---------------------+
         |
         +------------------+------------------+
         |                  |                  |
         v                  v                  v
+------------------+  +------------------+  +---------------------+
|      fines       |  | notification_log |  |  return_transactions|
+------------------+  +------------------+  +---------------------+
| PK id            |  | PK id            |  | PK id               |
| FK student_id_no |  | FK user_id       |  | FK transaction_id   |
| FK transaction_id|  | FK transaction_id|  | FK student_id_no    |
| fine_amount      |  | notification_type|  | FK book_id          |
| paid_amount      |  | sent_via         |  | FK returned_by_admin|
| status           |  | book_title       |  | return_condition    |
+--------+---------+  +------------------+  +---------------------+
         |
         v
+------------------+
|  fine_payments   |
+------------------+
| PK id            |
| FK fine_id       |
| FK processed_by  |
| payment_amount   |
| payment_method   |
+------------------+


+------------------+              +------------------+
|      books       |              | overdue_history  |
+------------------+              +------------------+
| PK id            |<-------------| PK id            |
| UK isbn          |              | FK student_id_no |
| UK number_code   |              | FK transaction_id|
| UK barcode       |              | FK returned_by   |
| title            |              | book_title       |
| author           |              | days_overdue     |
| category         |              | fine_amount      |
| status           |              +------------------+
| book_copies      |
| available_copies |
+------------------+


+----------------------+          +----------------------+
| student_borrowing_   |          | notification_        |
| status               |          | preferences          |
+----------------------+          +----------------------+
| PK id                |          | PK id                |
| FK student_id_number |          | FK user_id           |
| FK updated_by        |          | notifications_enabled|
| can_borrow           |          | push_enabled         |
| reason               |          | email_enabled        |
+----------------------+          | days_before_due      |
                                  +----------------------+

+----------------------+          +----------------------+
| system_settings      |          | semester_tracking    |
+----------------------+          | (legacy)             |
| PK id                |          +----------------------+
| UK setting_key       |          | PK id                |
| setting_value        |          | FK student_id_number |
| FK updated_by        |          | semester_start_date  |
+----------------------+          | books_borrowed_count |
                                  +----------------------+

+----------------------+
| semester_fine_       |
| payments             |
+----------------------+
| PK id                |
| FK user_id           |
| FK borrowing_id      |
| FK semester_id       |
| FK received_by       |
| amount               |
| payment_method       |
+----------------------+
```

## Foreign Key Relationships Summary

### Core Tables

| Child Table | Foreign Key Column | References | Parent Table | On Delete |
|------------|-------------------|------------|--------------|-----------|
| borrowing_transactions | student_id_number | id_number | users | CASCADE |
| borrowing_transactions | book_id | id | books | RESTRICT |
| borrowing_transactions | borrowed_by_admin | id | users | SET NULL |
| borrowing_transactions | returned_by_admin | id | users | SET NULL |
| borrowing_transactions | semester_id | id | semesters | SET NULL |
| borrowing_transactions | academic_year_id | id | academic_years | SET NULL |

### Fines & Payments

| Child Table | Foreign Key Column | References | Parent Table | On Delete |
|------------|-------------------|------------|--------------|-----------|
| fines | student_id_number | id_number | users | CASCADE |
| fines | transaction_id | id | borrowing_transactions | CASCADE |
| fine_payments | fine_id | id | fines | CASCADE |
| fine_payments | processed_by | id | users | SET NULL |

### Academic Structure

| Child Table | Foreign Key Column | References | Parent Table | On Delete |
|------------|-------------------|------------|--------------|-----------|
| semesters | academic_year_id | id | academic_years | CASCADE |
| student_year_history | user_id | id | users | CASCADE |
| student_year_history | academic_year_id | id | academic_years | CASCADE |
| semester_clearances | user_id | id | users | CASCADE |
| semester_clearances | semester_id | id | semesters | CASCADE |
| semester_clearances | cleared_by | id | users | SET NULL |
| semester_fine_payments | user_id | id | users | CASCADE |
| semester_fine_payments | borrowing_id | id | borrowing_transactions | SET NULL |
| semester_fine_payments | semester_id | id | semesters | SET NULL |
| semester_fine_payments | received_by | id | users | SET NULL |

### Notifications

| Child Table | Foreign Key Column | References | Parent Table | On Delete |
|------------|-------------------|------------|--------------|-----------|
| notification_preferences | user_id | id | users | CASCADE |
| notification_logs | user_id | id | users | CASCADE |
| notification_logs | transaction_id | id | borrowing_transactions | CASCADE |

### History & Audit

| Child Table | Foreign Key Column | References | Parent Table | On Delete |
|------------|-------------------|------------|--------------|-----------|
| overdue_history | student_id_number | id_number | users | CASCADE |
| overdue_history | transaction_id | id | borrowing_transactions | CASCADE |
| overdue_history | returned_by_admin | id | users | SET NULL |
| return_transactions | transaction_id | id | borrowing_transactions | CASCADE |
| return_transactions | student_id_number | id_number | users | CASCADE |
| return_transactions | book_id | id | books | RESTRICT |
| return_transactions | returned_by_admin | id | users | SET NULL |
| login_logs | user_id | id | users | CASCADE |
| audit_logs | user_id | id | users | SET NULL |

### Status & Settings

| Child Table | Foreign Key Column | References | Parent Table | On Delete |
|------------|-------------------|------------|--------------|-----------|
| student_borrowing_status | student_id_number | id_number | users | CASCADE |
| student_borrowing_status | updated_by | id | users | SET NULL |
| system_settings | updated_by | id | users | SET NULL |
| semester_tracking | student_id_number | id_number | users | CASCADE |

## Cascade Delete Behavior

- **CASCADE**: When parent record is deleted, all child records are also deleted
- **RESTRICT**: Prevents deletion of parent if child records exist
- **SET NULL**: Sets foreign key to NULL when parent is deleted

## How to Apply This Migration

1. **Backup your database first!**
   ```sql
   mysqldump -u root -p capstone_system_optimized > backup_before_fk.sql
   ```

2. Open phpMyAdmin and select your database

3. Go to "Import" tab

4. Select the file: `add_foreign_keys.sql`

5. Click "Go" to execute

6. After successful execution, go to "Designer" view to see all relationships visually

## Troubleshooting

If you get errors:

1. **"Cannot add foreign key constraint"** - Check that:
   - Both columns have the same data type
   - Referenced column has an index
   - Tables use InnoDB engine
   - No orphan records exist

2. **Fix orphan records first:**
   ```sql
   -- Find borrowing transactions with invalid student_id_number
   SELECT * FROM borrowing_transactions bt
   WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id_number = bt.student_id_number);

   -- Delete orphan records (or fix them)
   DELETE FROM borrowing_transactions
   WHERE student_id_number NOT IN (SELECT id_number FROM users);
   ```
