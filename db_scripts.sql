--DB and tables
CREATE DATABASE hr_manager IF NOT EXISTS;

CREATE TABLE specialists (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_time TIME(1),
    end_time TIME(1),
    skills UUID[] DEFAULT '{}',
    applicants UUID[] DEFAULT '{}'
    )IF NOT EXISTS;

CREATE TABLE applicants IF NOT EXISTS(
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    arrival_time TIME(1),
    specialist_id UUID REFERENCES specialists,
    skills UUID[] DEFAULT '{}'
    )IF NOT EXISTS;

CREATE TABLE skills (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL
    )IF NOT EXISTS;

-- User (actions: SELECT, INSERT, UPDATE, DELETE)

CREATE ROLE hr_admin LOGIN ENCRYPTED PASSWORD 'admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON specialists, applicants, skills TO hr_admin;

-- SQL Queries
SELECT * FROM specialists ORDER BY start_time,name;

SELECT * FROM applicants ORDER BY arrival_time;

SELECT * FROM skills;

--create new
INSERT INTO specialists (id,name,start_time,end_time) VALUES (<id>,<name>,<start_time>,<end_time>);

INSERT INTO applicants (id,name,arrival_time) VALUES (<id>,<name>,<time>);

INSERT INTO skills (id,name) VALUES (<id>,<name>);

-- bind applicant to a specialist
UPDATE specialists SET applicants = array_remove(applicants,<applicant_id>);
UPDATE applicants SET specialist_id = <specialist_id> WHERE id =<applicant_id>;
UPDATE specialists SET applicants = array_append(applicants,<applicant_id>) WHERE id = <specialist_id>;


--add skills 
UPDATE applicants SET skills = array_append(skills, <skill_id>) WHERE id = <applicant_id>;

UPDATE specialists SET skills = array_append(skills, <skill_id>) WHERE id = <specialist_id>;

--reset skills
UPDATE specialists SET skills=array[]::uuid[] WHERE id = <specialist_id>;

UPDATE applicants SET skills=array[]::uuid[] WHERE id = <applicant_id>;

-- Update applicant
UPDATE applicants SET name= <name>, arrival_time=<time> WHERE id= <applicant_id>;

--Update specialist
UPDATE specialists SET name= <name>, start_time=<start_time>, end_time=<end_time> WHERE id= <specialist_id>;

-- Delete applicant
UPDATE specialists SET applicants = array_remove(applicants,<applicant_id>);
DELETE FROM applicants WHERE id=<applicant_id>;

-- Delete specialist
UPDATE applicants SET specialist_id=NULL WHERE specialist_id=<specialist_id>;
DELETE FROM specialists WHERE id=<specialist_id>;

-- Delete skill
UPDATE specialists SET skills = array_remove(skills,<skill_id>);
UPDATE applicants SET skills = array_remove(skills,<skill_id>);
DELETE FROM skills WHERE id=<skill_id>;