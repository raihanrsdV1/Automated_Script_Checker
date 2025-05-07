from fastapi import APIRouter, HTTPException, Response, Depends
from database.db_connection import connect
import logging
import uuid
import os
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
import io
from utils.auth import require_role

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

def get_total_marks_for_question(cur, question_id):
    """Get the total possible marks for a question based on its rubrics"""
    cur.execute(
        """
        SELECT COALESCE(SUM(marks), 0) 
        FROM rubric 
        WHERE question_id = %s
        """,
        (question_id,)
    )
    result = cur.fetchone()
    return float(result[0]) if result else 0

def get_obtained_marks_for_evaluation(cur, student_id, question_id, question_set_id):
    """Get the marks obtained by a student for a specific question in a question set"""
    cur.execute(
        """
        SELECT COALESCE(SUM(ed.obtained_marks), 0) 
        FROM evaluation e
        JOIN evaluation_detail ed ON e.id = ed.evaluation_id
        WHERE e.student_id = %s 
        AND e.question_id = %s 
        AND e.question_set_id = %s
        AND e.evaluation_status = 'completed'
        """,
        (student_id, question_id, question_set_id)
    )
    result = cur.fetchone()
    return float(result[0]) if result else 0

def create_pdf_report(data, question_set_name, questions):
    """Generate a PDF report with the student performance data"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    
    # Create the table headers
    headers = ['Student Name']
    for i, q in enumerate(questions):
        headers.append(f'Q{i+1}')
    headers.append('Total')
    
    # Create table data
    table_data = [headers]
    for row in data:
        table_data.append(row)
    
    # Create the table
    t = Table(table_data)
    
    # Style the table
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ])
    
    # Apply alternate row coloring
    for row in range(1, len(table_data)):
        if row % 2 == 0:
            style.add('BACKGROUND', (0, row), (-1, row), colors.lightgrey)
    
    t.setStyle(style)
    
    # Build the PDF
    elements = []
    elements.append(Paragraph(f"Performance Report for {question_set_name}", title_style))
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(t)
    
    doc.build(elements)
    
    # Reset buffer position to the beginning
    buffer.seek(0)
    return buffer

@router.get("/sets/{question_set_id}/report")
async def generate_question_set_report(
    question_set_id: str,
    user=Depends(require_role(['teacher', 'moderator', 'admin']))
):
    """
    Generate a PDF report of all student performances for a particular question set.
    The report shows each student's scores for each question and their total marks,
    sorted in descending order by total marks.
    """
    conn = None
    cur = None
    
    try:
        conn = connect()
        cur = conn.cursor()
        
        # Get question set details
        cur.execute(
            """
            SELECT name 
            FROM question_set 
            WHERE id = %s
            """,
            (question_set_id,)
        )
        question_set = cur.fetchone()
        if not question_set:
            raise HTTPException(status_code=404, detail="Question set not found")
        
        question_set_name = question_set[0]
        
        # Get all questions in this set with their order
        cur.execute(
            """
            SELECT q.id, q.question_text, qsm.question_order
            FROM question q
            JOIN question_set_mapping qsm ON q.id = qsm.question_id
            WHERE qsm.question_set_id = %s
            ORDER BY qsm.question_order
            """,
            (question_set_id,)
        )
        questions = cur.fetchall()
        
        if not questions:
            raise HTTPException(status_code=404, detail="No questions found in this set")
        
        # Get all students
        cur.execute(
            """
            SELECT s.user_id, u.first_name, u.last_name
            FROM student s
            JOIN "user" u ON s.user_id = u.id
            """
        )
        students = cur.fetchall()
        
        # Prepare data for the report
        report_data = []
        
        for student in students:
            student_id, first_name, last_name = student
            student_name = f"{first_name} {last_name}"
            
            # Get marks for each question
            question_marks = []
            total_marks = 0
            
            for question in questions:
                question_id, _, _ = question
                marks = get_obtained_marks_for_evaluation(cur, student_id, question_id, question_set_id)
                question_marks.append(f"{marks:.2f}")
                total_marks += marks
            
            # Add row to report data (student name, marks for each question, total marks)
            row_data = [student_name] + question_marks + [f"{total_marks:.2f}"]
            report_data.append((row_data, total_marks))  # Store with total for sorting
        
        # Sort students by total marks (descending)
        report_data.sort(key=lambda x: x[1], reverse=True)
        sorted_data = [row for row, _ in report_data]
        
        # Generate PDF report
        pdf_buffer = create_pdf_report(sorted_data, question_set_name, questions)
        
        # Return the PDF as a response
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=report_{question_set_id}.pdf"
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()