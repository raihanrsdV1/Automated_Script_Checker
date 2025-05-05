#!/usr/bin/env python3
# PDF text extraction utility using Gemini API

import os
import google.generativeai as genai
from pdf2image import convert_from_path
import io
import logging
import urllib.request
import tempfile
from tempfile import NamedTemporaryFile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get Gemini API key from environment variable, or use the provided one for testing
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCUieJmn1ZBMv4tJpmvLlloTPrxoeAPF1Q")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

def extract_text_from_pdf(pdf_path_or_file):
    """
    Extract text from a PDF file using Gemini API.
    
    Args:
        pdf_path_or_file: Can be either a file path (string), URL, or a file-like object
        
    Returns:
        str: The extracted text from the PDF
    """
    text = ""
    temp_file = None
    try:
        # Handle different input types: path string, URL, or file-like object
        if isinstance(pdf_path_or_file, str):
            if pdf_path_or_file.startswith("http://") or pdf_path_or_file.startswith("https://"):
                # It's a URL
                logger.info(f"Downloading PDF from URL: {pdf_path_or_file}")
                with urllib.request.urlopen(pdf_path_or_file) as response:
                    temp_file = NamedTemporaryFile(delete=False, suffix=".pdf")
                    temp_file.write(response.read())
                    temp_file.close()
                    pdf_path = temp_file.name
            else:
                # It's already a local file path
                pdf_path = pdf_path_or_file
        else:
            # It's a file-like object, save it to a temporary file
            temp_file = NamedTemporaryFile(delete=False, suffix=".pdf")
            temp_file.write(pdf_path_or_file.read())
            temp_file.close()
            pdf_path = temp_file.name
        
        # Check if Gemini API key is configured
        if not GEMINI_API_KEY:
            return "Error: Gemini API key not configured. Please set GEMINI_API_KEY environment variable."
        
        # Convert PDF pages to images
        logger.info(f"Converting PDF to images: {pdf_path}")
        images = convert_from_path(pdf_path)
        
        # Process each page with the Gemini API
        model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')  # Use the desired Gemini model
        
        for i, img in enumerate(images):
            logger.info(f"Processing page {i+1}/{len(images)}")
            
            # Convert image to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Extract text using Gemini
            prompt = "Extract all the text from this image, maintaining paragraph structure and formatting as much as possible."
            try:
                response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": img_byte_arr}])
                
                if response.text:
                    page_text = response.text.strip()
                    text += f"\n\n--- Page {i+1} ---\n\n{page_text}"
                else:
                    text += f"\n\n--- Page {i+1} ---\n\nNo text found on this page."
            except Exception as e:
                logger.error(f"Error processing page {i+1}: {str(e)}")
                text += f"\n\n--- Page {i+1} ---\n\nError extracting text: {str(e)}"
        
        return text.strip()
        
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        return f"Error extracting text from PDF: {str(e)}"
    finally:
        # Clean up temporary file if created
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)

if __name__ == "__main__":
    # Example usage when run as a script
    import sys
    
    if len(sys.argv) == 1:
        # No arguments provided, use the default URL from your script
        pdf_path = "https://firebasestorage.googleapis.com/v0/b/ai-hackathon-system-a9a07.firebasestorage.app/o/Specification.pdf?alt=media&token=88c74a45-ea6a-4252-beaf-7aeef1f0785d"
        output_file = "out.txt"
    elif len(sys.argv) == 2:
        # Only input path provided, use default output name
        pdf_path = sys.argv[1]
        output_file = "out.txt"
    elif len(sys.argv) == 3:
        # Both input and output paths provided
        pdf_path = sys.argv[1]
        output_file = sys.argv[2]
    else:
        print("Usage: python pdf_extractor.py [input_pdf] [output_txt]")
        sys.exit(1)
        
    print(f"Processing PDF: {pdf_path}")
    extracted_text = extract_text_from_pdf(pdf_path)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(extracted_text)
        
    print(f"Text extraction complete. Output saved to: {output_file}")