# Model Testing Guide

This document provides test cases and instructions for testing the automated script checker LLM evaluation model.

## Test Cases

### Test Case 1: Simple Capital Cities Questions

**Input:**
```json
[
    {
        "question": "What is the capital of Bangladesh?",
        "answer": "Dhaka",
        "rubric": "1. Provides the correct answer(1 point)"
    },
    {
        "question": "What is the capital of Bangladesh?",
        "answer": "Colombo",
        "rubric": "1. Provides the correct answer(1 point)"
    },
    {
        "question": "What is the capital of India?",
        "answer": "Delhi",
        "rubric": "1. Provides the correct answer(1 point)"
    },
    {
        "question": "What is the capital of India?",
        "answer": "Dhaka",
        "rubric": "1. Provides the correct answer(1 point)"
    },
    {
        "question": "What is the capital of Pakistan?",
        "answer": "Dhaka",
        "rubric": "1. Provides the correct answer(1 point)"
    }
]
```

**Expected Output:**
```json
[
    [
        [
            "1. The student provides the correct answer.",
            1,
            1,
            "1. Dhaka is indeed the capital of Bangladesh, so the student provided the correct answer."
        ]
    ],
    [
        [
            "1. The student did not provide the correct answer.",
            0,
            1,
            "1. The capital of Bangladesh is Dhaka, not Colombo. Colombo is the capital of Sri Lanka."
        ]
    ],
    [
        [
            "1. The student provided the correct answer.",
            1,
            1,
            "1. The student correctly identified Delhi as the capital of India."
        ]
    ],
    [
        [
            "1. The student did not provide the correct answer.",
            0,
            1,
            "1. The capital of India is not Dhaka; it is New Delhi."
        ]
    ],
    [
        [
            "1. The student did not provide the correct answer.",
            0,
            1,
            "1. The capital of Pakistan is Islamabad, not Dhaka. Dhaka is the capital of Bangladesh."
        ]
    ]
]
```

### Test Case 2: Mixed Subject Questions (Math, Physics, Bengali, Chemistry)

**Input:**
```json
[
    {
        "question": "0 থেকে π পর্যন্ত y=sinx দ্বারা আবদ্ধ ক্ষেত্রফল কত?",
        "answer": "ধরি, \nA = \\int_{0}^{\\pi} \\sin x \\, dx\n\nআমরা জানি,\n\\int \\sin x \\, dx = -\\cos x + C\n\nঅতএব,\nA = \\left[-\\cos x\\right]_{0}^{\\pi} = \\left(-\\cos \\pi\\right) - \\left(-\\cos 0\\right)\n\n= -(-1) - (-1) = 1 + 1 = 2\n\nসুতরাং,\n\\boxed{ \\text{ক্ষেত্রফল} = 2 \\text{ একক} }",
        "rubric": "1. ক্ষেত্রফলের সাথে সম্পর্কিত নির্দিষ্ট ইন্টিগ্রাল চিহ্নিত করে। (4 points)\n2. ক্ষেত্রফল ইন্টিগ্রেট করার জন্য সঠিক সূত্র ব্যবহার করে। (3 points)\n3. সঠিক ক্ষেত্রফল গণনা করে। (3 points)"
    },
    {
        "question": "A car initially at rest, achieved a speed of 60 km/h in a minute. Calculate the accelaration of the car",
        "answer": "Given u=0m/s,t=60s\nv=60/3.6=16.67m/s\na=0.278ms^-2",
        "rubric": "1. Identifies the given informations correctly (3 points)\n2. Mentions the formula for accelaration explicitely (2 points)\n3. Uses the correct formula for accelaration (3 points)\n4. Calculates the correct accelaration(Might be in m/s or km/h).(2 points)"
    },
    {
        "question": "The time period of a simple pendulum in earth is 2 seconds. What will be its time period in space?",
        "answer": "The time period will be unchanged. It will still be 2 seconds",
        "rubric": "1. Provides the correct answer (2 points)"
    },
    {
        "question": "0 থেকে 2π পর্যন্ত y=sinx দ্বারা আবদ্ধ মোট ক্ষেত্রফল কত?",
        "answer": "ধরি, \nA = \\int_{0}^{2\\pi} \\sin x \\, dx\n\nআমরা জানি,\n\\int \\sin x \\, dx = -\\cos x + C\n\nঅতএব,\nA = \\left[-\\cos x\\right]_{0}^{2\\pi} = \\left(-\\cos 2\\pi\\right) - \\left(-\\cos 0\\right)\n\n= -(1) - (-1) = -1 + 1 = 0\n\nসুতরাং,\n\\boxed{ \\text{ক্ষেত্রফল} = 0 \\text{ একক} }",
        "rubric": "1. ক্ষেত্রফলের সাথে সম্পর্কিত নির্দিষ্ট ইন্টিগ্রাল চিহ্নিত করে। (4 points)\n2. ক্ষেত্রফল ইন্টিগ্রেট করার জন্য সঠিক সূত্র ব্যবহার করে। (3 points)\n3. সঠিক ক্ষেত্রফল গণনা করে। (3 points)"
    },
    {
        "question": "Write a short paragraph about industrial revolution",
        "answer": "The Industrial Revolushion was a time of big changes in the 1800s, when things started to be made by machines insted of by hand. It started in Britain and spreaded to other countries. It help make new technology and factories, but also caused problem like pollution and poor working conditions. It has great impact in the history of human kind. Without industrial revolution, nothing would be possible.",
        "rubric": "1.Information is historically correct and relevant. (2 points)\n2.Sentences are grammatically correct with proper spelling. (2 points)\n3.Ideas are clearly expressed and logically connected. (2 points)\n4.Content stays focused on the Industrial Revolution. (2 points)\n5.Paragraph is brief but includes key details. (2 points)"
    },
    {
        "question": "Why benzene is stable despite having $\\pi$ bonds?",
        "answer": "Benzene is stable because its π bonds are stronger than normal double bonds and are fixed between alternating carbon atoms. The structure doesn't change because the double bonds stay in place, and this makes it stable. Also, since it's a ring, the shape helps it be more balanced and less reactive.",
        "rubric": "1.Explains correct reasons (e.g., resonance, delocalization, aromaticity, Huckel's rule). (5 points)\n2.Shows understanding of electron delocalization and bond behavior in benzene. (3 points)\n3.Uses correct scientific terms appropriately (e.g., π bonds, resonance, aromaticity). (2 points)"
    },
    {
        "question": "Write a paragraph on Sundarban in Bangla",
        "answer": "সুন্দরবন বিশ্বের সর্ববৃহৎ ম্যানগ্রোভ বন, যা বাংলাদেশ ও ভারতের একটি অংশ জুড়ে বিস্তৃত। এটি রয়েল বেঙ্গল টাইগার, চিত্রা হরিণ, কুমিরসহ অনেক বিরল প্রাণীর আবাসস্থল। সুন্দরবন তার জটিল নদী-নালা, খাল এবং লবণাক্ত পরিবেশের জন্য পরিচিত। এটি প্রাকৃতিক দুর্যোগ থেকে উপকূলীয় এলাকাগুলোকে রক্ষা করে এবং বাংলাদেশের পরিবেশ ও জীববৈচিত্র্যের জন্য অত্যন্ত গুরুত্বপূর্ণ।",
        "rubric": "1.তথ্যগত সঠিকতা (4 points) – সুন্দরবন সম্পর্কিত সঠিক তথ্য প্রদান করা হয়েছে কি না (অবস্থান, বৈশিষ্ট্য, প্রাণী)।\n2.বিষয়বস্তুর প্রাসঙ্গিকতা (2 points) – অনুচেদটি সুন্দরবন বিষয়ে কেন্দ্রভিত্তিক ও প্রাসঙ্গিক কি না।\n3.ভাষার গঠন ও ব্যাকরণ (2 points) – সঠিক ব্যাকরণ, বানান ও বাক্য গঠন রয়েছে কি না।\n4.পরিভাষার যথাযথ ব্যবহার (2 points) – পরিবেশ, বন্যপ্রাণী ও ভূগোল সম্পর্কিত সঠিক শব্দ ও পরিভাষা ব্যবহার করা হয়েছে কি না।"
    }
]
```

## Testing with Postman

You can use Postman to test our model with these sample test cases. Follow these steps:

1. Open Postman and create a new request
2. Set the request type to POST
3. Enter the endpoint URL: `http://localhost:3000/api/llm/evaluate/batch`
4. Add header: `Content-Type: application/json`
5. Add your authentication token in the Authorization tab (if required)
6. In the Body tab, select "raw" and "JSON"
7. Copy and paste one of the test cases above into the request body
8. Click "Send" to submit the request

The response will contain the LLM's evaluation of each answer according to the rubrics provided. Each evaluation includes:
- The rubric item being evaluated
- Points awarded
- Total possible points
- Detailed feedback explaining the scoring

For batch processing of multiple submissions, use the same endpoint but format your request with an array of evaluation objects as shown in the test cases.

## Expected Response Format

The response will be a nested array structure where:
- The outer array represents all submitted answers
- For each answer, there's an array of rubric evaluations
- Each rubric evaluation contains:
  - Rubric text (string)
  - Points awarded (number)
  - Maximum points possible (number)
  - Detailed explanation (string)

This format allows for detailed feedback on each component of the rubric for each submission.