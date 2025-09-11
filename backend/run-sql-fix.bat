@echo off
echo Running overdue fine fix SQL script...
mysql -u root -p capstone_system < overdue-fine-fix.sql
echo SQL script completed!
pause





