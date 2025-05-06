#!/usr/bin/env python3
"""
Comprehensive seed script to populate all database tables with initial data
while respecting foreign key dependencies
"""

import uuid
import hashlib
import random
from datetime import datetime, date, timedelta
from db_connection import connect

# Helper function to generate UUID strings
def generate_uuid():
    return str(uuid.uuid4())

# Helper function to create a simple password hash (for development only)
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def seed_data():
    conn = connect()
    cur = conn.cursor()
    print("Starting database seeding process...")
    
    try:
        # Step 1: Create classes
        print("Creating classes...")
        classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]
        class_ids = {}
        
        for class_name in classes:
            class_id = generate_uuid()
            cur.execute(
                "INSERT INTO class (id, name) VALUES (%s, %s)",
                (class_id, class_name)
            )
            class_ids[class_name] = class_id
            print(f"  Created class: {class_name}")
        
        # Step 2: Create subjects
        print("Creating subjects...")
        subjects = [
            {"name": "Physics", "description": "Study of matter, energy, and the interaction between them"},
            {"name": "Mathematics", "description": "Study of numbers, quantities, and shapes"},
            {"name": "Chemistry", "description": "Study of the composition, properties, and behavior of matter"},
            {"name": "Business", "description": "Study of organizations, management, and the marketplace"},
            {"name": "Computer Science", "description": "Study of computation, automation, and information"}
        ]
        subject_ids = {}
        
        for subject in subjects:
            subject_id = generate_uuid()
            cur.execute(
                "INSERT INTO subject (id, name, description) VALUES (%s, %s, %s)",
                (subject_id, subject["name"], subject["description"])
            )
            subject_ids[subject["name"]] = subject_id
            print(f"  Created subject: {subject['name']}")
        
        # Step 3: Create users (base records)
        print("Creating users...")
        users = [
            # Required users with specified roles
            {"email": "raihan@gmail.com", "role": "student", "username": "raihan", "first_name": "Raihan", "last_name": "Rashid", "dob": date(1998, 5, 15)},
            {"email": "mahdi@gmail.com", "role": "teacher", "username": "mahdi", "first_name": "Mahdi", "last_name": "Hassan", "dob": date(1985, 8, 23)},
            {"email": "redom@goat.com", "role": "teacher", "username": "redom", "first_name": "Redom", "last_name": "Shah", "dob": date(1988, 12, 7)},
            {"email": "aritra@gmail.com", "role": "student", "username": "aritra", "first_name": "Aritra", "last_name": "Dash", "dob": date(1999, 3, 11)},
            {"email": "ahnaf@gmail.com", "role": "student", "username": "ahnaf", "first_name": "Ahnaf", "last_name": "Khan", "dob": date(2000, 9, 4)},
            
            # Additional users
            {"email": "john@example.com", "role": "student", "username": "john123", "first_name": "John", "last_name": "Doe", "dob": date(1997, 4, 10)},
            {"email": "sarah@example.com", "role": "student", "username": "sarah456", "first_name": "Sarah", "last_name": "Johnson", "dob": date(1996, 7, 22)},
            {"email": "ahmed@example.com", "role": "teacher", "username": "ahmed789", "first_name": "Ahmed", "last_name": "Patel", "dob": date(1982, 11, 19)},
            {"email": "emily@example.com", "role": "teacher", "username": "emilyprof", "first_name": "Emily", "last_name": "Wilson", "dob": date(1979, 6, 3)},
            {"email": "moderator@example.com", "role": "moderator", "username": "modadmin", "first_name": "Admin", "last_name": "Moderator", "dob": date(1990, 1, 15)},
        ]
        
        user_ids = {}
        student_ids = []
        teacher_ids = []
        moderator_ids = []
        
        for user in users:
            user_id = generate_uuid()
            cur.execute(
                'INSERT INTO "user" (id, role, username, email, password_hash, first_name, last_name, date_of_birth) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
                (user_id, user["role"], user["username"], user["email"], hash_password("password"), user["first_name"], user["last_name"], user["dob"])
            )
            user_ids[user["email"]] = user_id
            print(f"  Created user: {user['first_name']} {user['last_name']} ({user['email']}) - {user['role']}")
            
            # Save IDs by role for later use
            if user["role"] == "student":
                student_ids.append(user_id)
            elif user["role"] == "teacher":
                teacher_ids.append(user_id)
            elif user["role"] == "moderator":
                moderator_ids.append(user_id)
        
        # Step 4: Create student profiles
        print("Creating student profiles...")
        for student_id in student_ids:
            # Assign each student to a random class
            random_class_id = class_ids[random.choice(classes)]
            cur.execute(
                "INSERT INTO student (user_id, current_class_id) VALUES (%s, %s)",
                (student_id, random_class_id)
            )
            print(f"  Created student profile for user ID: {student_id}")
        
        # Step 5: Create teacher profiles
        print("Creating teacher profiles...")
        teacher_designations = ["Assistant Professor", "Associate Professor", "Professor", "Lecturer", "Senior Lecturer"]
        for teacher_id in teacher_ids:
            designation = random.choice(teacher_designations)
            cur.execute(
                "INSERT INTO teacher (user_id, designation) VALUES (%s, %s)",
                (teacher_id, designation)
            )
            print(f"  Created teacher profile for user ID: {teacher_id}")
        
        # Step 6: Create moderator profiles
        print("Creating moderator profiles...")
        moderator_roles = ["System Administrator", "Content Moderator", "User Manager"]
        for moderator_id in moderator_ids:
            role = random.choice(moderator_roles)
            cur.execute(
                "INSERT INTO moderator (user_id, system_role) VALUES (%s, %s)",
                (moderator_id, role)
            )
            print(f"  Created moderator profile for user ID: {moderator_id}")
        
        # Step 7: Create questions with rubrics
        print("Creating questions and rubrics...")
        questions_data = {
            "Physics": [
                {
                    "question_text": r"\text{A body of mass 2 kg is projected vertically upwards with a velocity of } 20 \text{ m/s. Calculate the maximum height reached by the body. (Take } g = 10 \text{ m/s}^2\text{)}",
                    "rubrics": [
                        {"text": r"\text{Use the equation } v^2 = u^2 - 2gh \text{ where } v = 0 \text{ at max height.}", "marks": 2, "serial": 1},
                        {"text": r"\text{Substitute values: } 0 = 20^2 - 2 \times 10 \times h", "marks": 2, "serial": 2},
                        {"text": r"\text{Solve for } h = 20 \text{ m.}", "marks": 1, "serial": 3}
                    ]
                },
                {
                    "question_text": r"\text{Derive the formula for the period of a simple pendulum and state the conditions under which it is valid.}",
                    "rubrics": [
                        {"text": r"\text{Write the equation of motion.}", "marks": 1, "serial": 1},
                        {"text": r"\text{Solve for the angular frequency.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Derive the period formula } T = 2\pi\sqrt{\frac{L}{g}}", "marks": 1, "serial": 3},
                        {"text": r"\text{State the small angle approximation and other conditions.}", "marks": 1, "serial": 4}
                    ]
                },
                {
                    "question_text": r"\text{A uniform electric field of strength } 5 \times 10^3 \text{ N/C points in the positive x-direction. Calculate the work done in moving a charge of } 2 \text{ μC from the origin to the point } (3, 4, 0) \text{ meters.}",
                    "rubrics": [
                        {"text": r"\text{Identify that work done } W = q\vec{E} \cdot \vec{d}", "marks": 1, "serial": 1},
                        {"text": r"\text{Calculate the dot product correctly.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Final answer } W = 30 \text{ μJ}", "marks": 1, "serial": 3}
                    ]
                },
                {
                    "question_text": r"\text{A ray of light traveling in air is incident on a glass surface at an angle of } 30^\circ \text{ with the normal. If the refractive index of glass is } 1.5\text{, find the angle of refraction.}",
                    "rubrics": [
                        {"text": r"\text{Write Snell's law } n_1\sin\theta_1 = n_2\sin\theta_2", "marks": 1, "serial": 1},
                        {"text": r"\text{Substitute values and solve.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Final answer } \theta_2 = 19.5^\circ", "marks": 1, "serial": 3}
                    ]
                }
            ],
            "Mathematics": [
                {
                    "question_text": r"\text{Evaluate the integral } \int_{0}^{\pi} \sin^2 x \, dx",
                    "rubrics": [
                        {"text": r"\text{Use identity } \sin^2 x = \frac{1 - \cos 2x}{2}", "marks": 1, "serial": 1},
                        {"text": r"\text{Integrate the resulting terms.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Apply limits correctly to get } \frac{\pi}{2}", "marks": 1, "serial": 3}
                    ]
                },
                {
                    "question_text": r"\text{Find the derivative of } f(x) = x^3 \ln(x^2 + 1)",
                    "rubrics": [
                        {"text": r"\text{Use product rule to separate } f'(x) = x^3 \cdot \frac{d}{dx}[\ln(x^2 + 1)] + \ln(x^2 + 1) \cdot \frac{d}{dx}[x^3]", "marks": 1, "serial": 1},
                        {"text": r"\text{Calculate each derivative correctly.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Simplify the final expression.}", "marks": 1, "serial": 3}
                    ]
                },
                {
                    "question_text": r"\text{Solve the differential equation } \frac{dy}{dx} = 2xy \text{ with initial condition } y(0) = 3",
                    "rubrics": [
                        {"text": r"\text{Rearrange to } \frac{1}{y} \frac{dy}{dx} = 2x", "marks": 1, "serial": 1},
                        {"text": r"\text{Integrate both sides.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Apply initial condition and get } y = 3e^{x^2}", "marks": 1, "serial": 3}
                    ]
                },
                {
                    "question_text": r"\text{Find the eigenvalues and eigenvectors of the matrix } A = \begin{pmatrix} 4 & -2 \\ 1 & 1 \end{pmatrix}",
                    "rubrics": [
                        {"text": r"\text{Set up the equation } \det(A - \lambda I) = 0", "marks": 1, "serial": 1},
                        {"text": r"\text{Solve for eigenvalues.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Find eigenvectors for each eigenvalue.}", "marks": 2, "serial": 3}
                    ]
                }
            ],
            "Chemistry": [
                {
                    "question_text": r"\text{Calculate the pH of a buffer solution that is } 0.1 \text{ M in CH}_3\text{COOH and } 0.1 \text{ M in CH}_3\text{COONa. (The } K_a \text{ of CH}_3\text{COOH is } 1.8 \times 10^{-5}\text{)}",
                    "rubrics": [
                        {"text": r"\text{Identify the Henderson-Hasselbalch equation } pH = pK_a + \log\frac{[A^-]}{[HA]}", "marks": 1, "serial": 1},
                        {"text": r"\text{Convert } K_a \text{ to } pK_a = -\log(1.8 \times 10^{-5}) \approx 4.74", "marks": 1, "serial": 2},
                        {"text": r"\text{Substitute values and calculate } pH = 4.74 + \log\frac{0.1}{0.1} = 4.74", "marks": 1, "serial": 3}
                    ]
                },
                {
                    "question_text": r"\text{Determine the hybridization, geometry, and polarity of the SF}_6 \text{ molecule.}",
                    "rubrics": [
                        {"text": r"\text{Identify the hybridization as } sp^3d^2", "marks": 1, "serial": 1},
                        {"text": r"\text{Describe the octahedral geometry.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Explain that SF}_6 \text{ is non-polar due to its symmetry.}", "marks": 1, "serial": 3}
                    ]
                }
            ],
            "Business": [
                {
                    "question_text": r"\text{Calculate the Net Present Value (NPV) of a project with the following cash flows: Initial investment: \$50,000; Year 1: \$20,000; Year 2: \$25,000; Year 3: \$30,000. Use a discount rate of 10\%.}",
                    "rubrics": [
                        {"text": r"\text{Set up the NPV formula } NPV = -50000 + \frac{20000}{(1+0.1)^1} + \frac{25000}{(1+0.1)^2} + \frac{30000}{(1+0.1)^3}", "marks": 2, "serial": 1},
                        {"text": r"\text{Calculate each term and sum.}", "marks": 2, "serial": 2},
                        {"text": r"\text{Final NPV calculation and recommendation.}", "marks": 1, "serial": 3}
                    ]
                },
                {
                    "question_text": r"\text{Calculate the break-even point in units and dollars for a product with the following data: Selling price per unit = \$25; Variable cost per unit = \$15; Total fixed costs = \$100,000.}",
                    "rubrics": [
                        {"text": r"\text{Calculate contribution margin: \$25 - \$15 = \$10 per unit.}", "marks": 1, "serial": 1},
                        {"text": r"\text{Calculate break-even units: Fixed costs ÷ Contribution margin = \$100,000 ÷ \$10 = 10,000 units.}", "marks": 1, "serial": 2},
                        {"text": r"\text{Calculate break-even dollars: 10,000 units × \$25 = \$250,000.}", "marks": 1, "serial": 3}
                    ]
                }
            ],
            "Computer Science": [
                {
                    "question_text": r"\text{Explain the time complexity of the quicksort algorithm in best, average, and worst cases. What factors determine which case applies?}",
                    "rubrics": [
                        {"text": r"\text{Correctly state best case as } O(n \log n) \text{ and explain when it occurs.}", "marks": 1, "serial": 1},
                        {"text": r"\text{Correctly state average case as } O(n \log n) \text{ and explain the probabilistic reasoning.}", "marks": 1, "serial": 2},
                        {"text": r"\text{Correctly state worst case as } O(n^2) \text{ and explain when it occurs.}", "marks": 1, "serial": 3},
                        {"text": r"\text{Explain factors affecting performance like pivot selection and partitioning strategy.}", "marks": 2, "serial": 4}
                    ]
                },
                {
                    "question_text": r"\text{Write pseudocode for a function that checks if a binary tree is a valid binary search tree (BST).}",
                    "rubrics": [
                        {"text": r"\text{Define a correct approach (recursive or iterative).}", "marks": 1, "serial": 1},
                        {"text": r"\text{Handle the base cases correctly.}", "marks": 1, "serial": 2},
                        {"text": r"\text{Implement proper value checking against min/max bounds.}", "marks": 2, "serial": 3},
                        {"text": r"\text{Present complete and correct pseudocode that would work.}", "marks": 1, "serial": 4}
                    ]
                }
            ]
        }
        
        question_ids = {}
        
        for subject_name, questions in questions_data.items():
            subject_id = subject_ids[subject_name]
            # Randomly select a teacher for each question
            for question_data in questions:
                question_id = generate_uuid()
                teacher_id = random.choice(teacher_ids)
                
                cur.execute(
                    "INSERT INTO question (id, subject_id, teacher_id, question_text, created_at) VALUES (%s, %s, %s, %s, %s)",
                    (question_id, subject_id, teacher_id, question_data["question_text"], datetime.now())
                )
                
                # Create rubrics for this question
                for rubric_data in question_data["rubrics"]:
                    rubric_id = generate_uuid()
                    cur.execute(
                        "INSERT INTO rubric (id, question_id, rubric_text, marks, serial_number, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
                        (rubric_id, question_id, rubric_data["text"], rubric_data["marks"], rubric_data["serial"], datetime.now())
                    )
                
                question_ids[question_id] = {"subject": subject_name, "text": question_data["question_text"][:30] + "..."}
                print(f"  Created question for {subject_name} with ID: {question_id}")
        
        # Step 8: Create question sets
        print("Creating question sets...")
        question_set_ids = []
        
        # Group questions by subject
        questions_by_subject = {}
        for q_id, q_info in question_ids.items():
            if q_info["subject"] not in questions_by_subject:
                questions_by_subject[q_info["subject"]] = []
            questions_by_subject[q_info["subject"]].append(q_id)
        
        for subject_name, subject_questions in questions_by_subject.items():
            if len(subject_questions) < 2:
                continue  # Skip subjects with too few questions
                
            # Create 1-2 question sets per subject
            for i in range(random.randint(1, 2)):
                set_id = generate_uuid()
                teacher_id = random.choice(teacher_ids)
                subject_id = subject_ids[subject_name]
                set_name = f"{subject_name} Set {i+1}"
                
                cur.execute(
                    "INSERT INTO question_set (id, name, description, subject_id, teacher_id, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
                    (set_id, set_name, f"Sample question set for {subject_name}", subject_id, teacher_id, datetime.now())
                )
                question_set_ids.append(set_id)
                print(f"  Created question set: {set_name} with ID: {set_id}")
                
                # Add questions to the set
                if len(subject_questions) >= 2:
                    # Select a subset of questions (at least 2)
                    selected_questions = random.sample(subject_questions, random.randint(2, min(4, len(subject_questions))))
                    
                    for idx, q_id in enumerate(selected_questions):
                        mapping_id = generate_uuid()
                        cur.execute(
                            "INSERT INTO question_set_mapping (id, question_set_id, question_id, question_order) VALUES (%s, %s, %s, %s)",
                            (mapping_id, set_id, q_id, idx + 1)
                        )
                        print(f"    Added question {q_id} to set {set_id} with order {idx + 1}")
        
        # Step 9: Create some evaluations
        print("Creating sample evaluations...")
        for student_id in student_ids[:3]:  # Only create for first few students
            # Create 1-3 evaluations per student
            for _ in range(random.randint(1, 3)):
                # Randomly select a question
                question_id = random.choice(list(question_ids.keys()))
                # Randomly select a question set (if any)
                question_set_id = random.choice(question_set_ids) if question_set_ids else None
                
                evaluation_id = generate_uuid()
                pdf_url = f"sample_answer_{student_id[-6:]}.pdf"  # Simplified URL for example
                answer_text = "This is a sample answer text for evaluation."
                
                # Randomly set status (mostly 'completed' for examples)
                status = random.choices(
                    ['completed', 'pending'], 
                    weights=[0.8, 0.2], 
                    k=1
                )[0]
                
                cur.execute(
                    "INSERT INTO evaluation (id, student_id, question_id, question_set_id, answer_text, answer_pdf_url, evaluation_status, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                    (evaluation_id, student_id, question_id, question_set_id, answer_text, pdf_url, status, datetime.now())
                )
                print(f"  Created evaluation {evaluation_id} for student {student_id}")
                
                # If status is 'completed', add evaluation details
                if status == 'completed':
                    # Get rubrics for this question
                    cur.execute("SELECT id FROM rubric WHERE question_id = %s ORDER BY serial_number", (question_id,))
                    rubric_ids = [row[0] for row in cur.fetchall()]
                    
                    for idx, rubric_id in enumerate(rubric_ids):
                        detail_id = generate_uuid()
                        # Random marks between 50-100% of possible
                        obtained_marks = round(random.uniform(0.5, 1.0) * 1.0, 1)
                        result = "Partial explanation provided." if obtained_marks < 1.0 else "Excellent answer."
                        
                        cur.execute(
                            "INSERT INTO evaluation_detail (id, evaluation_id, rubric_id, obtained_marks, detailed_result, serial_number, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                            (detail_id, evaluation_id, rubric_id, obtained_marks, result, idx+1, datetime.now())
                        )
                
                # Randomly create recheck requests (25% chance)
                if status == 'completed' and random.random() < 0.25:
                    recheck_id = generate_uuid()
                    issue = "I believe my answer for part 2 deserves more marks because of XYZ reason."
                    
                    # 50% chance of having a response
                    response = None
                    responser_id = None
                    if random.random() < 0.5:
                        response = "After reviewing your answer, we have decided to maintain the original evaluation."
                        responser_id = random.choice(teacher_ids)
                    
                    cur.execute(
                        "INSERT INTO recheck (id, evaluation_id, issue_detail, response_detail, responser_id, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
                        (recheck_id, evaluation_id, issue, response, responser_id, datetime.now())
                    )
                    print(f"    Created recheck request {recheck_id} for evaluation {evaluation_id}")
        
        conn.commit()
        print("\nDatabase seeded successfully!")
    
    except Exception as e:
        conn.rollback()
        print(f"Error during seeding: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_data()