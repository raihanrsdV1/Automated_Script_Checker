export const initialQuestions = [
    {
      id: 1,
      subject: 'Mathematics',
      question: '\\text{Solve the quadratic equation } x^2 - 5x + 6 = 0 \\text{ using factorization.}',
      rubric: 'Step 1 (1 mark): Correct factorization of the equation. Step 2 (1 mark): Correct values of x. Total: 2 marks.'
    },
    {
      id: 2,
      subject: 'Physics',
      question: '\\text{A body moves with uniform acceleration. Initial velocity is 0, time is 4s, final velocity is 20 m/s. Find acceleration.}',
      rubric: 'Step 1 (1 mark): Identify variables. Step 2 (1 mark): Apply a = (v - u)/t. Step 3 (1 mark): Final answer. Total: 3 marks.'
    },
    {
      id: 3,
      subject: 'Chemistry',
      question: '\\text{Write the balanced chemical equation for the reaction of sodium with water.}',
      rubric: 'Step 1 (1 mark): Correct reactants and products. Step 2 (1 mark): Balanced equation. Total: 2 marks.'
    },
    {
      id: 4,
      subject: 'Biology',
      question: '\\text{Describe the structure of a mitochondrion and its role in cellular respiration.}',
      rubric: 'Structure (2 marks): Outer/inner membranes, cristae. Function (2 marks): ATP production. Total: 4 marks.'
    },
    {
      id: 5,
      subject: 'Computer Science',
      question: '\\text{Explain the working of a stack with push and pop operations using an example.}',
      rubric: 'Step 1 (1 mark): Define stack. Step 2 (2 marks): Correct example with push/pop. Step 3 (1 mark): Final output. Total: 4 marks.'
    },
    {
      id: 6,
      subject: 'Mathematics',
      question: '\\text{Find the derivative of } f(x) = 3x^3 - 5x + 7.',
      rubric: 'Step 1 (2 marks): Apply power rule. Step 2 (1 mark): Simplify. Total: 3 marks.'
    },
    {
      id: 7,
      subject: 'Physics',
      question: '\\text{State and explain Newton\'s third law of motion with an example.}',
      rubric: 'Step 1 (1 mark): State the law. Step 2 (1 mark): Example. Step 3 (1 mark): Explanation. Total: 3 marks.'
    },
    {
      id: 8,
      subject: 'Chemistry',
      question: '\\text{What is the pH of a solution with } [H^+] = 1 \\times 10^{-4}?',
      rubric: 'Step 1 (1 mark): Use formula pH = -log[H+]. Step 2 (1 mark): Calculate pH = 4. Total: 2 marks.'
    },
    {
      id: 9,
      subject: 'Biology',
      question: '\\text{Differentiate between mitosis and meiosis in terms of phases and outcome.}',
      rubric: 'Mitosis (2 marks): 1 division, 2 identical cells. Meiosis (2 marks): 2 divisions, 4 varied cells. Total: 4 marks.'
    },
    {
      id: 10,
      subject: 'Computer Science',
      question: '\\text{Write a function in Python to check if a number is prime.}',
      rubric: 'Step 1 (1 mark): Loop logic. Step 2 (1 mark): Conditions. Step 3 (1 mark): Return value. Total: 3 marks.'
    },
  
    // Add 28 more as requested
    {
      id: 11,
      subject: 'Mathematics',
      question: '\\text{Evaluate the definite integral } \\int_1^2 x^2 \\,dx.',
      rubric: 'Step 1 (1 mark): Apply integration rule. Step 2 (1 mark): Evaluate bounds. Total: 2 marks.'
    },
    {
      id: 12,
      subject: 'Physics',
      question: '\\text{Derive the formula for kinetic energy from work-energy principle.}',
      rubric: 'Step 1 (1 mark): Define work. Step 2 (2 marks): Derivation steps. Step 3 (1 mark): Final formula. Total: 4 marks.'
    },
    {
      id: 13,
      subject: 'Chemistry',
      question: '\\text{Draw the Lewis structure for CO}_2.',
      rubric: 'Step 1 (1 mark): Count valence electrons. Step 2 (1 mark): Bond structure. Total: 2 marks.'
    },
    {
      id: 14,
      subject: 'Biology',
      question: '\\text{Explain the process of photosynthesis and the role of chlorophyll.}',
      rubric: 'Step 1 (2 marks): Equation. Step 2 (2 marks): Role of chlorophyll. Total: 4 marks.'
    },
    {
      id: 15,
      subject: 'Computer Science',
      question: '\\text{Differentiate between linear and binary search with example.}',
      rubric: 'Step 1 (2 marks): Explain both. Step 2 (2 marks): Provide example. Total: 4 marks.'
    },
    {
      id: 16,
      subject: 'Mathematics',
      question: '\\text{Find the inverse of the matrix } A = \\begin{bmatrix}1 & 2\\\\3 & 4\\end{bmatrix}.',
      rubric: 'Step 1 (1 mark): Compute determinant. Step 2 (2 marks): Apply inverse formula. Total: 3 marks.'
    },
    {
      id: 17,
      subject: 'Physics',
      question: '\\text{Explain Ohm\'s Law and derive the formula for resistance.}',
      rubric: 'Step 1 (1 mark): State law. Step 2 (2 marks): Derivation. Total: 3 marks.'
    },
    {
      id: 18,
      subject: 'Chemistry',
      question: '\\text{Calculate the empirical formula for a compound with 40% C, 6.7% H, and 53.3% O.}',
      rubric: 'Step 1 (1 mark): Moles of each. Step 2 (2 marks): Ratio & final formula. Total: 3 marks.'
    },
    {
      id: 19,
      subject: 'Biology',
      question: '\\text{What is the function of ribosomes in protein synthesis?}',
      rubric: 'Step 1 (1 mark): Translation role. Step 2 (1 mark): rRNA and mRNA explanation. Total: 2 marks.'
    },
    {
      id: 20,
      subject: 'Computer Science',
      question: '\\text{What is a linked list? Implement it using a class in Python.}',
      rubric: 'Step 1 (1 mark): Define structure. Step 2 (2 marks): Correct class. Total: 3 marks.'
    },
  
    // 18 more (trimmed for space; format follows above pattern)
    {
      id: 21, subject: 'Mathematics', question: '\\text{Prove that } \\sqrt{2} \\text{ is irrational.}', rubric: 'Step 1 (1): Assume rational. Step 2 (2): Contradiction via factorization. Total: 3 marks.'
    },
    {
      id: 22, subject: 'Physics', question: '\\text{State the principle of conservation of energy with an example.}', rubric: 'State (1): Law. Example (2): Roller coaster. Total: 3 marks.'
    },
    {
      id: 23, subject: 'Chemistry', question: '\\text{Describe the structure and bonding in diamond.}', rubric: 'Structure (2): Covalent, tetrahedral. Bonding (1): Explanation. Total: 3 marks.'
    },
    {
      id: 24, subject: 'Biology', question: '\\text{Compare DNA and RNA.}', rubric: 'Difference 1 (1): Sugar. 2 (1): Bases. 3 (1): Strands. Total: 3 marks.'
    },
    {
      id: 25, subject: 'Computer Science', question: '\\text{Explain time complexity with Big O notation.}', rubric: 'Step 1 (1): Definition. Step 2 (2): Examples. Total: 3 marks.'
    },
    {
      id: 26, subject: 'Mathematics', question: '\\text{Find the LCM and HCF of 12 and 18.}', rubric: 'Step 1 (1): Prime factors. Step 2 (2): Use formula. Total: 3 marks.'
    },
    {
      id: 27, subject: 'Physics', question: '\\text{Calculate the work done when a force of 10N moves an object 5m.}', rubric: 'Step 1 (1): W = F × d. Step 2 (1): Compute. Total: 2 marks.'
    },
    {
      id: 28, subject: 'Chemistry', question: '\\text{What is an electrolyte? Give an example.}', rubric: 'Definition (1), Example (1). Total: 2 marks.'
    },
    {
      id: 29, subject: 'Biology', question: '\\text{Explain osmosis with the help of an experiment.}', rubric: 'Step 1 (1): Define. Step 2 (2): Potato example. Total: 3 marks.'
    },
    {
      id: 30, subject: 'Computer Science', question: '\\text{Differentiate between compiler and interpreter.}', rubric: 'Compiler (1): Batch process. Interpreter (1): Line-by-line. Total: 2 marks.'
    },
    {
      id: 31, subject: 'Mathematics', question: '\\text{Solve } \\frac{1}{x} + \\frac{1}{y} = \\frac{1}{z} \\text{ for } x.', rubric: 'Step 1 (1): Isolate x. Step 2 (1): Simplify. Total: 2 marks.'
    },
    {
      id: 32, subject: 'Physics', question: '\\text{Define centripetal force and provide a formula.}', rubric: 'Definition (1), Formula (1), Unit (1). Total: 3 marks.'
    },
    {
      id: 33, subject: 'Chemistry', question: '\\text{Define Avogadro’s number and its significance.}', rubric: 'Step 1 (1): Value. Step 2 (1): Use in mole. Total: 2 marks.'
    },
    {
      id: 34, subject: 'Biology', question: '\\text{What is transpiration and how is it measured?}', rubric: 'Definition (1), Measurement (2). Total: 3 marks.'
    },
    {
      id: 35, subject: 'Computer Science', question: '\\text{Write a program to reverse a string in Python.}', rubric: 'Logic (1), Syntax (1), Output (1). Total: 3 marks.'
    },
    {
      id: 36, subject: 'Mathematics', question: '\\text{What is the distance between the points } (2,3) \\text{ and } (5,7)?', rubric: 'Step 1 (1): Distance formula. Step 2 (1): Substitute. Total: 2 marks.'
    },
    {
      id: 37, subject: 'Physics', question: '\\text{Convert 300K temperature to Celsius and Fahrenheit.}', rubric: 'Celsius (1), Fahrenheit (1). Total: 2 marks.'
    },
    {
      id: 38, subject: 'Computer Science', question: '\\text{Explain how recursion works with a factorial function example.}', rubric: 'Step 1 (1): Define recursion. Step 2 (2): Example. Total: 3 marks.'
    },
  ];
  