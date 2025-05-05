#!/usr/bin/env python3
"""
Seed script to generate sample questions for various subjects with LaTeX formatting
for both questions and rubrics, including marks allocation.
"""

import uuid
from db_connection import connect

# Ensure subjects exist first
def ensure_subjects():
    conn = connect()
    cur = conn.cursor()
    subjects = ["Physics", "Mathematics", "Chemistry", "Business"]
    subject_ids = {}
    
    for subject in subjects:
        # Check if subject exists
        cur.execute("SELECT id FROM subject WHERE name = %s", (subject,))
        result = cur.fetchone()
        
        if result:
            subject_ids[subject] = result[0]
            print(f"Found existing subject: {subject}, ID: {result[0]}")
        else:
            # Create the subject
            subject_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO subject (id, name) VALUES (%s, %s)",
                (subject_id, subject)
            )
            conn.commit()
            subject_ids[subject] = subject_id
            print(f"Created new subject: {subject}, ID: {subject_id}")
    
    conn.close()
    return subject_ids

def create_questions(subject_ids):
    conn = connect()
    cur = conn.cursor()
    
    # Clear existing questions
    print("Clearing existing questions from the database...")
    cur.execute("DELETE FROM question")
    conn.commit()
    print("Question table cleared successfully.")
    
    # Physics questions (5-6)
    physics_questions = [
        {
            "question_text": r"\text{A body of mass 2 kg is projected vertically upwards with a velocity of } 20 \text{ m/s. Calculate the maximum height reached by the body. (Take } g = 10 \text{ m/s}^2\text{)}",
            "question_rubric": r"\text{Step 1 (2 marks): Use the equation } v^2 = u^2 - 2gh \text{ where } v = 0 \text{ at max height.}\\\text{Step 2 (2 marks): Substitute values: } 0 = 20^2 - 2 \times 10 \times h\\\text{Step 3 (1 mark): Solve for } h = 20 \text{ m.}",
            "marks": 5
        },
        {
            "question_text": r"\text{Derive the formula for the period of a simple pendulum and state the conditions under which it is valid.}",
            "question_rubric": r"\text{Step 1 (1 mark): Write the equation of motion.}\\\text{Step 2 (2 marks): Solve for the angular frequency.}\\\text{Step 3 (1 mark): Derive the period formula } T = 2\pi\sqrt{\frac{L}{g}}\\\text{Step 4 (1 mark): State the small angle approximation and other conditions.}",
            "marks": 5
        },
        {
            "question_text": r"\text{A uniform electric field of strength } 5 \times 10^3 \text{ N/C points in the positive x-direction. Calculate the work done in moving a charge of } 2 \text{ μC from the origin to the point } (3, 4, 0) \text{ meters.}",
            "question_rubric": r"\text{Step 1 (1 mark): Identify that work done } W = q\vec{E} \cdot \vec{d}\\\text{Step 2 (2 marks): Calculate the dot product correctly.}\\\text{Step 3 (1 mark): Final answer } W = 30 \text{ μJ}",
            "marks": 4
        },
        {
            "question_text": r"\text{A ray of light traveling in air is incident on a glass surface at an angle of } 30^\circ \text{ with the normal. If the refractive index of glass is } 1.5\text{, find the angle of refraction.}",
            "question_rubric": r"\text{Step 1 (1 mark): Write Snell's law } n_1\sin\theta_1 = n_2\sin\theta_2\\\text{Step 2 (2 marks): Substitute values and solve.}\\\text{Step 3 (1 mark): Final answer } \theta_2 = 19.5^\circ",
            "marks": 4
        },
        {
            "question_text": r"\text{Two coherent sources } S_1 \text{ and } S_2 \text{ produce waves of the same wavelength } \lambda \text{. At a point } P\text{, the path difference is } \frac{\lambda}{4}\text{. Determine whether constructive or destructive interference occurs at } P \text{ and explain your reasoning.}",
            "question_rubric": r"\text{Step 1 (2 marks): For constructive interference, } \Delta x = n\lambda \text{ and for destructive interference } \Delta x = (n+\frac{1}{2})\lambda\\\text{Step 2 (2 marks): With } \Delta x = \frac{\lambda}{4}\text{, intermediate but closer to constructive.}\\\text{Step 3 (1 mark): Calculate intensity ratio correctly.}",
            "marks": 5
        },
        {
            "question_text": r"\text{A block of mass } m \text{ slides down an inclined plane making an angle } \theta \text{ with the horizontal. If the coefficient of kinetic friction is } \mu_k\text{, derive an expression for the acceleration of the block.}",
            "question_rubric": r"\text{Step 1 (1 mark): Draw the free-body diagram showing all forces.}\\\text{Step 2 (2 marks): Apply Newton's second law along the incline.}\\\text{Step 3 (1 mark): Derive } a = g(\sin\theta - \mu_k\cos\theta)",
            "marks": 4
        }
    ]
    
    # Mathematics questions (10-12)
    mathematics_questions = [
        {
            "question_text": r"\text{Evaluate the integral } \int_{0}^{\pi} \sin^2 x \, dx",
            "question_rubric": r"\text{Step 1 (1 mark): Use identity } \sin^2 x = \frac{1 - \cos 2x}{2}\\\text{Step 2 (2 marks): Integrate the resulting terms.}\\\text{Step 3 (1 mark): Apply limits correctly to get } \frac{\pi}{2}",
            "marks": 4
        },
        {
            "question_text": r"\text{Find the derivative of } f(x) = x^3 \ln(x^2 + 1)",
            "question_rubric": r"\text{Step 1 (1 mark): Use product rule to separate } f'(x) = x^3 \cdot \frac{d}{dx}[\ln(x^2 + 1)] + \ln(x^2 + 1) \cdot \frac{d}{dx}[x^3]\\\text{Step 2 (2 marks): Calculate each derivative correctly.}\\\text{Step 3 (1 mark): Simplify the final expression.}",
            "marks": 4
        },
        {
            "question_text": r"\text{Solve the differential equation } \frac{dy}{dx} = 2xy \text{ with initial condition } y(0) = 3",
            "question_rubric": r"\text{Step 1 (1 mark): Rearrange to } \frac{1}{y} \frac{dy}{dx} = 2x\\\text{Step 2 (2 marks): Integrate both sides.}\\\text{Step 3 (1 mark): Apply initial condition and get } y = 3e^{x^2}",
            "marks": 4
        },
        {
            "question_text": r"\text{Find the eigenvalues and eigenvectors of the matrix } A = \begin{pmatrix} 4 & -2 \\ 1 & 1 \end{pmatrix}",
            "question_rubric": r"\text{Step 1 (1 mark): Set up the equation } \det(A - \lambda I) = 0\\\text{Step 2 (2 marks): Solve for eigenvalues.}\\\text{Step 3 (2 marks): Find eigenvectors for each eigenvalue.}",
            "marks": 5
        },
        {
            "question_text": r"\text{Prove by mathematical induction that } 1 + 4 + 4^2 + ... + 4^n = \frac{4^{n+1} - 1}{3} \text{ for all } n \geq 0",
            "question_rubric": r"\text{Step 1 (1 mark): Base case } n = 0\\\text{Step 2 (1 mark): Inductive hypothesis for } n = k\\\text{Step 3 (2 marks): Prove for } n = k+1\\\text{Step 4 (1 mark): Conclusion}",
            "marks": 5
        },
        {
            "question_text": r"\text{In a group of 25 people, what is the probability that at least two people share the same birthday? (Assume 365 days in a year and birthdays are equally likely for each day)}",
            "question_rubric": r"\text{Step 1 (1 mark): Calculate probability of all different birthdays.}\\\text{Step 2 (2 marks): Calculate } P(\text{different}) = \frac{365 \cdot 364 \cdot ... \cdot 341}{365^{25}}\\\text{Step 3 (1 mark): Calculate } P(\text{at least two same}) = 1 - P(\text{different})",
            "marks": 4
        },
        {
            "question_text": r"\text{Find the sum of the infinite geometric series } 9 + 3 + 1 + \frac{1}{3} + ...",
            "question_rubric": r"\text{Step 1 (1 mark): Identify first term } a = 9 \text{ and common ratio } r = \frac{1}{3}\\\text{Step 2 (2 marks): Apply formula } S_{\infty} = \frac{a}{1-r}\\\text{Step 3 (1 mark): Calculate } S_{\infty} = \frac{9}{1-\frac{1}{3}} = \frac{9}{\frac{2}{3}} = \frac{27}{2}",
            "marks": 4
        },
        {
            "question_text": r"\text{Find all values of } x \text{ in the interval } [0, 2\pi] \text{ that satisfy the equation } \sin 2x = \sin x",
            "question_rubric": r"\text{Step 1 (1 mark): Rearrange to } \sin 2x - \sin x = 0\\\text{Step 2 (2 marks): Use identity } \sin 2x = 2\sin x\cos x\\\text{Step 3 (1 mark): Factorize } 2\sin x\cos x - \sin x = \sin x(2\cos x - 1) = 0\\\text{Step 4 (1 mark): Solve } \sin x = 0 \text{ or } \cos x = \frac{1}{2}",
            "marks": 5
        },
        {
            "question_text": r"\text{A fair dice is rolled 5 times. What is the probability of getting exactly 2 sixes?}",
            "question_rubric": r"\text{Step 1 (1 mark): Use binomial probability formula.}\\\text{Step 2 (1 mark): Calculate } P(X=2) = \binom{5}{2} \cdot (\frac{1}{6})^2 \cdot (\frac{5}{6})^3\\\text{Step 3 (1 mark): Calculate final answer.}",
            "marks": 3
        },
        {
            "question_text": r"\text{Find the volume of the solid obtained by rotating the region bounded by } y = x^2 \text{ and } y = 1 \text{ about the x-axis.}",
            "question_rubric": r"\text{Step 1 (1 mark): Set up the disk method integral.}\\\text{Step 2 (1 mark): Find limits of integration by solving } x^2 = 1\\\text{Step 3 (2 marks): Evaluate } V = \pi \int_{-1}^{1} (1 - x^2)^2 \, dx",
            "marks": 4
        },
        {
            "question_text": r"\text{If } f(x) = \begin{cases} x^2 + 1 & \text{if } x \leq 2 \\ ax + b & \text{if } x > 2 \end{cases} \text{ is continuous and differentiable at } x = 2\text{, find the values of } a \text{ and } b\text{.}",
            "question_rubric": r"\text{Step 1 (1 mark): Use continuity at } x = 2 \text{ to get } 2^2 + 1 = 2a + b\\\text{Step 2 (1 mark): Use differentiability to set } f'(2-) = f'(2+)\\\text{Step 3 (1 mark): Calculate } f'(2-) = 2 \cdot 2 = 4 \text{ and } f'(2+) = a\\\text{Step 4 (1 mark): Solve the system to get } a = 4, b = -3",
            "marks": 4
        },
        {
            "question_text": r"\text{Show that the complex number } z = -1 + i\sqrt{3} \text{ can be written in the form } re^{i\theta} \text{ and determine the values of } r \text{ and } \theta\text{.}",
            "question_rubric": r"\text{Step 1 (1 mark): Calculate modulus } r = |z| = \sqrt{(-1)^2 + (\sqrt{3})^2} = 2\\\text{Step 2 (1 mark): Calculate argument } \theta = \tan^{-1}(\frac{\sqrt{3}}{-1})\\\text{Step 3 (1 mark): Correct value of } \theta = \frac{2\pi}{3} \text{ or } 120^\circ",
            "marks": 3
        }
    ]
    
    # Chemistry questions (4-5)
    chemistry_questions = [
        {
            "question_text": r"\text{Calculate the pH of a buffer solution that is } 0.1 \text{ M in CH}_3\text{COOH and } 0.1 \text{ M in CH}_3\text{COONa. (The } K_a \text{ of CH}_3\text{COOH is } 1.8 \times 10^{-5}\text{)}",
            "question_rubric": r"\text{Step 1 (1 mark): Identify the Henderson-Hasselbalch equation } pH = pK_a + \log\frac{[A^-]}{[HA]}\\\text{Step 2 (1 mark): Convert } K_a \text{ to } pK_a = -\log(1.8 \times 10^{-5}) \approx 4.74\\\text{Step 3 (1 mark): Substitute values and calculate } pH = 4.74 + \log\frac{0.1}{0.1} = 4.74",
            "marks": 3
        },
        {
            "question_text": r"\text{Determine the hybridization, geometry, and polarity of the SF}_6 \text{ molecule.}",
            "question_rubric": r"\text{Step 1 (1 mark): Identify the hybridization as } sp^3d^2\\\text{Step 2 (2 marks): Describe the octahedral geometry.}\\\text{Step 3 (1 mark): Explain that SF}_6 \text{ is non-polar due to its symmetry.}",
            "marks": 4
        },
        {
            "question_text": r"\text{A sample of } 0.255 \text{ g of copper metal is dissolved in concentrated HNO}_3 \text{ and the solution is diluted. Excess KI is added, producing I}_2 \text{ according to the reaction: } 2\text{Cu}^{2+} + 4\text{I}^- \rightarrow 2\text{CuI} + \text{I}_2\text{. The I}_2 \text{ is titrated with } 0.0500 \text{ M Na}_2\text{S}_2\text{O}_3 \text{, requiring } 40.0 \text{ mL to reach the endpoint. Calculate the percentage purity of the copper sample.}",
            "question_rubric": r"\text{Step 1 (2 marks): Calculate moles of thiosulfate used.}\\\text{Step 2 (2 marks): Convert to moles of copper via the stoichiometry.}\\\text{Step 3 (1 mark): Calculate the percentage purity.}",
            "marks": 5
        },
        {
            "question_text": r"\text{Give the IUPAC name for the organic compound } \text{CH}_3\text{CH}_2\text{CHBrCH}_2\text{COOH}",
            "question_rubric": r"\text{Step 1 (1 mark): Identify the parent chain with carboxylic acid having highest priority.}\\\text{Step 2 (2 marks): Number the chain and name substituents.}\\\text{Step 3 (1 mark): Correct IUPAC name: 3-bromopentanoic acid}",
            "marks": 4
        },
        {
            "question_text": r"\text{Calculate the standard cell potential for the cell } \text{Zn(s)|Zn}^{2+}\text{(aq)||Cu}^{2+}\text{(aq)|Cu(s)} \text{ at } 25^\circ\text{C given } E^\circ(\text{Zn}^{2+}\text{/Zn}) = -0.76 \text{ V and } E^\circ(\text{Cu}^{2+}\text{/Cu}) = +0.34 \text{ V.}",
            "question_rubric": r"\text{Step 1 (1 mark): Identify that } E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}}\\\text{Step 2 (1 mark): Identify that Cu is the cathode and Zn is the anode.}\\\text{Step 3 (1 mark): Calculate } E^\circ_{\text{cell}} = 0.34 - (-0.76) = 1.10 \text{ V}",
            "marks": 3
        }
    ]
    
    # Business questions (3-4)
    business_questions = [
        {
            "question_text": r"\text{Calculate the Net Present Value (NPV) of a project with the following cash flows: Initial investment: \$50,000; Year 1: \$20,000; Year 2: \$25,000; Year 3: \$30,000. Use a discount rate of 10\%.}",
            "question_rubric": r"\text{Step 1 (2 marks): Set up the NPV formula } NPV = -50000 + \frac{20000}{(1+0.1)^1} + \frac{25000}{(1+0.1)^2} + \frac{30000}{(1+0.1)^3}\\\text{Step 2 (2 marks): Calculate each term and sum.}\\\text{Step 3 (1 mark): Final NPV calculation and recommendation.}",
            "marks": 5
        },
        {
            "question_text": r"\text{A company is considering two mutually exclusive investment projects. Project A requires an initial investment of \$100,000 and has an IRR of 15\%. Project B requires \$150,000 and has an IRR of 12\%. If the company's cost of capital is 10\%, which project should be selected? Explain your reasoning.}",
            "question_rubric": r"\text{Step 1 (1 mark): Compare each project's IRR to the cost of capital.}\\\text{Step 2 (2 marks): Analyze the issue of project size difference.}\\\text{Step 3 (2 marks): Conclude with proper financial reasoning about incremental investment.}",
            "marks": 5
        },
        {
            "question_text": r"\text{Calculate the break-even point in units and dollars for a product with the following data: Selling price per unit = \$25; Variable cost per unit = \$15; Total fixed costs = \$100,000.}",
            "question_rubric": r"\text{Step 1 (1 mark): Calculate contribution margin: \$25 - \$15 = \$10 per unit.}\\\text{Step 2 (1 mark): Calculate break-even units: Fixed costs ÷ Contribution margin = \$100,000 ÷ \$10 = 10,000 units.}\\\text{Step 3 (1 mark): Calculate break-even dollars: 10,000 units × \$25 = \$250,000.}",
            "marks": 3
        },
        {
            "question_text": r"\text{The following data relate to a company's inventory: Annual demand = 5,000 units; Cost per order = \$40; Annual holding cost per unit = \$4. Calculate the Economic Order Quantity (EOQ) and the total annual relevant cost.}",
            "question_rubric": r"\text{Step 1 (1 mark): Identify the EOQ formula } EOQ = \sqrt{\frac{2DS}{H}} \text{ where D = demand, S = ordering cost, H = holding cost}\\\text{Step 2 (2 marks): Substitute values and calculate } EOQ = \sqrt{\frac{2 \times 5000 \times 40}{4}} = 316.23 \approx 316 \text{ units}\\\text{Step 3 (2 marks): Calculate total annual relevant cost } TRC = \frac{D}{Q}S + \frac{Q}{2}H",
            "marks": 5
        }
    ]
    
    # Insert all questions
    all_questions = {
        "Physics": physics_questions,
        "Mathematics": mathematics_questions,
        "Chemistry": chemistry_questions,
        "Business": business_questions
    }
    
    question_counts = {}
    
    for subject, questions in all_questions.items():
        subject_id = subject_ids[subject]
        print(f"\nInserting questions for {subject} (Subject ID: {subject_id}):")
        count = 0
        for q in questions:
            question_id = str(uuid.uuid4())
            try:
                cur.execute(
                    "INSERT INTO question (id, subject_id, question_text, question_rubric, marks) VALUES (%s, %s, %s, %s, %s)",
                    (question_id, subject_id, q["question_text"], q["question_rubric"], q["marks"])
                )
                count += 1
            except Exception as e:
                print(f"Error inserting {subject} question: {e}")
        question_counts[subject] = count
        print(f"Inserted {count} {subject} questions")
    
    conn.commit()
    conn.close()
    
    print("\nQuestion insertion summary:")
    for subject, count in question_counts.items():
        print(f"{subject}: {count} questions")
    print("Sample questions created successfully.")

if __name__ == "__main__":
    subject_ids = ensure_subjects()
    create_questions(subject_ids)