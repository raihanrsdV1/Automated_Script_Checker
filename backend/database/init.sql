-- Enable UUID extension for generating UUIDs
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables in reverse dependency order to avoid foreign key conflicts
DROP TABLE IF EXISTS "recheck" CASCADE;
DROP TABLE IF EXISTS evaluation_detail CASCADE; -- New table for detailed question evaluations
DROP TABLE IF EXISTS submission CASCADE;
DROP TABLE IF EXISTS evaluation CASCADE; -- Renamed from evaluated_script
DROP TABLE IF EXISTS question_set_mapping CASCADE; -- New table for question set mappings
DROP TABLE IF EXISTS question_set CASCADE; -- New table for question sets
DROP TABLE IF EXISTS rubric CASCADE; -- Added new rubric table
DROP TABLE IF EXISTS question CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS teacher CASCADE;
DROP TABLE IF EXISTS moderator CASCADE;
DROP TABLE IF EXISTS class CASCADE;
DROP TABLE IF EXISTS subject CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS test_table CASCADE; -- Added drop for test_table

-- Create User table
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'moderator')),
    creation_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL
);

-- Create Subject table
CREATE TABLE subject (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Class table
CREATE TABLE class (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- Create Student table
CREATE TABLE student (
    user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    current_class_id UUID NOT NULL REFERENCES class(id)
);

-- Create Teacher table
CREATE TABLE teacher (
    user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    designation TEXT NOT NULL,
);

-- Create Moderator table
CREATE TABLE moderator (
    user_id UUID PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    system_role TEXT NOT NULL
);

-- Create Question table
-- Removed marks and question_rubric, added teacher_id
CREATE TABLE question (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subject(id),
    teacher_id UUID NOT NULL REFERENCES teacher(user_id),
    question_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Rubric table
CREATE TABLE rubric (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    rubric_text TEXT NOT NULL,
    marks NUMERIC NOT NULL,
    serial_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, serial_number)
);

-- Create Question Set table
-- Added teacher_id as requested
CREATE TABLE question_set (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subject(id),
    teacher_id UUID NOT NULL REFERENCES teacher(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Question Set Mapping table
CREATE TABLE question_set_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_set_id UUID NOT NULL REFERENCES question_set(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    UNIQUE(question_set_id, question_id)
);

-- Create Evaluation table (renamed from evaluated_script)
-- Updated with fields from TODO comment

CREATE TABLE evaluation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student(user_id),
    question_id UUID NOT NULL REFERENCES question(id),
    question_set_id UUID REFERENCES question_set(id),
    answer_text TEXT,
    answer_pdf_url TEXT NOT NULL,
    evaluation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (evaluation_status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Evaluation Detail table
-- Updated to reference rubric_id and use proper field name for obtained_marks
CREATE TABLE evaluation_detail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES evaluation(id) ON DELETE CASCADE,
    rubric_id UUID NOT NULL REFERENCES rubric(id),
    obtained_marks NUMERIC NOT NULL,
    detailed_result TEXT NOT NULL,
    serial_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Recheck table
-- Updated to reference evaluation_id instead of submission_id
CREATE TABLE "recheck" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES evaluation(id) ON DELETE CASCADE,
    issue_detail TEXT NOT NULL,
    response_detail TEXT,
    responser_id UUID REFERENCES "user"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Test Table
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into test_table
INSERT INTO test_table (value) VALUES ('Test connection successful');