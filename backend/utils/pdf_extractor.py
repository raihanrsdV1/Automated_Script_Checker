#!/usr/bin/env python3
# PDF text extraction utility with multiple extraction methods and text display

import os
import logging
import io
import tempfile
import urllib.request
from tempfile import NamedTemporaryFile
import subprocess
import shutil
import textwrap
import base64
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), os.pardir, '.env'))

# Try importing PDF libraries
HAVE_PYPDF = False
HAVE_PDF2IMAGE = False
HAVE_FITZ = False  # PyMuPDF

try:
    import PyPDF2
    HAVE_PYPDF = True
    logger.info("PyPDF2 is available for text extraction")
except ImportError:
    logger.warning("PyPDF2 is not installed. Will use alternative methods.")

try:
    from pdf2image import convert_from_path
    HAVE_PDF2IMAGE = True
    logger.info("pdf2image is available for PDF conversion")
except ImportError:
    logger.warning("pdf2image is not installed. Will use alternative methods.")

# Try importing PyMuPDF (fitz) - an alternative to pdf2image that doesn't require Poppler
try:
    import fitz  # PyMuPDF
    HAVE_FITZ = True
    logger.info("PyMuPDF (fitz) is available for PDF conversion")
except ImportError:
    logger.warning("PyMuPDF (fitz) is not installed. Will use alternative methods.")

# Try importing Gemini API if key is available
HAVE_GEMINI = False
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        HAVE_GEMINI = True
        logger.info("Google Generative AI (Gemini) is available for text extraction")
    else:
        logger.warning("GEMINI_API_KEY not found in environment. Gemini extraction unavailable.")
except ImportError:
    logger.warning("google.generativeai package not installed. Gemini extraction unavailable.")

def print_extracted_text(text, file_info="", width=80):
    """Print extracted text in a nicely formatted console output"""
    print("\n" + "=" * width)
    print(f"EXTRACTED TEXT FROM {file_info}".center(width))
    print("=" * width)
    
    if not text:
        print("\nNo text was extracted from the document.")
    else:
        # Print the text with nice wrapping
        for line in text.split('\n'):
            if line.strip():  # Skip empty lines
                wrapped = textwrap.fill(line, width=width)
                print(wrapped)
            else:
                print()  # Print empty line to preserve spacing
    
    print("=" * width)
    print(f"CHARACTER COUNT: {len(text)}".center(width))
    print("=" * width + "\n")

def extract_text_with_pypdf(pdf_path):
    """Extract text using PyPDF2"""
    if not HAVE_PYPDF:
        return "PyPDF2 not installed"
    
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                page_text = page.extract_text()
                if page_text:
                    text += f"\n\n--- Page {page_num + 1} ---\n\n{page_text}"
                else:
                    text += f"\n\n--- Page {page_num + 1} ---\n\nNo text found on this page."
        return text
    except Exception as e:
        logger.error(f"Error extracting text with PyPDF2: {str(e)}")
        return f"Error with PyPDF2: {str(e)}"

def extract_text_with_pdftotext(pdf_path):
    """Extract text using pdftotext (Poppler) command line tool"""
    if not shutil.which('pdftotext'):
        return "pdftotext not installed"
    
    try:
        # Create a temporary file for the output
        with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as temp_file:
            temp_output = temp_file.name
        
        # Run pdftotext command
        subprocess.run(['pdftotext', '-layout', pdf_path, temp_output], check=True)
        
        # Read the extracted text
        with open(temp_output, 'r', encoding='utf-8', errors='replace') as f:
            text = f.read()
        
        # Clean up the temporary file
        os.unlink(temp_output)
        
        return text
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running pdftotext: {str(e)}")
        return f"Error with pdftotext: {str(e)}"
    except Exception as e:
        logger.error(f"Error with pdftotext extraction: {str(e)}")
        return f"Error with pdftotext: {str(e)}"

def extract_text_with_ocr(pdf_path):
    """Extract text using OCR via pdf2image and pytesseract"""
    if not HAVE_PDF2IMAGE:
        return "pdf2image not installed"
    
    if not HAVE_PYTESSERACT:
        return "pytesseract not installed"
    
    text = ""
    try:
        logger.info(f"Converting PDF to images: {pdf_path}")
        images = convert_from_path(pdf_path)
        
        logger.info(f"Extracted {len(images)} pages, processing with OCR")
        for i, img in enumerate(images):
            logger.info(f"Processing page {i+1}/{len(images)} with OCR")
            page_text = pytesseract.image_to_string(img)
            text += f"\n\n--- Page {i + 1} ---\n\n{page_text}"
        
        return text
    except Exception as e:
        logger.error(f"Error with OCR extraction: {str(e)}")
        return f"Error with OCR: {str(e)}"

def convert_pdf_to_images_pymupdf(pdf_path):
    """Convert PDF to images using PyMuPDF (no Poppler dependency)"""
    if not HAVE_FITZ:
        return None
    
    try:
        images = []
        pdf_document = fitz.open(pdf_path)
        
        for page_number in range(pdf_document.page_count):
            page = pdf_document[page_number]
            # Higher resolution for better OCR
            pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
            img_data = pix.tobytes("png")
            
            # Convert to PIL Image
            from PIL import Image
            image = Image.open(io.BytesIO(img_data))
            images.append(image)
            
        pdf_document.close()
        return images
    except Exception as e:
        logger.error(f"Error converting PDF to images with PyMuPDF: {str(e)}")
        return None

def extract_text_with_gemini(pdf_path):
    """Extract text using Gemini API with image processing"""
    if not HAVE_GEMINI:
        return "Gemini API not configured"
    
    # First try PyMuPDF for PDF conversion
    images = None
    if pdf_path.lower().endswith('.pdf'):
        logger.info(f"Converting PDF to images using PyMuPDF for Gemini processing: {pdf_path}")
        images = convert_pdf_to_images_pymupdf(pdf_path)
    
    # If PyMuPDF failed, try pdf2image
    if images is None and HAVE_PDF2IMAGE and pdf_path.lower().endswith('.pdf'):
        try:
            logger.info(f"Falling back to pdf2image for conversion: {pdf_path}")
            images = convert_from_path(pdf_path)
        except Exception as e:
            logger.error(f"pdf2image conversion failed: {str(e)}")
            images = None
    
    # If it's an image file (not a PDF), load it directly
    if images is None and not pdf_path.lower().endswith('.pdf'):
        try:
            from PIL import Image
            logger.info(f"Loading image file directly: {pdf_path}")
            img = Image.open(pdf_path)
            images = [img]
        except Exception as e:
            logger.error(f"Failed to load image file: {str(e)}")
            return f"Error loading image file: {str(e)}"
    
    # If we still don't have images, we can't proceed
    if images is None:
        return "Failed to convert PDF to images for Gemini processing"
    
    # Process the images with Gemini API
    text = ""
    try:
        # Use the recommended model instead of the deprecated one
        model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')
        
        logger.info(f"Processing {len(images)} pages/images with Gemini")
        
        # For single page/image, process directly
        if len(images) == 1:
            img = images[0]
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            img_byte_arr = img_byte_arr.getvalue()
            
            prompt = """
            Extract ALL text from this image, maintaining original formatting as much as possible.
            Include ALL text visible in the image, including:
            - Main body text
            - Headers and footers
            - Tables and their contents
            - Bullet points and numbered lists
            - Mathematical equations and formulas
            - Any handwritten text
            
            Be especially thorough with handwritten content and mathematical formulas.
            Preserve paragraph breaks and line structure.
            """
            
            response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": img_byte_arr}])
            if response.text:
                text = response.text.strip()
            else:
                text = "No text found in the image."
        
        # For multi-page documents, process each page and combine
        else:
            for i, img in enumerate(images):
                logger.info(f"Processing page {i+1}/{len(images)} with Gemini")
                
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='JPEG')
                img_byte_arr = img_byte_arr.getvalue()
                
                prompt = f"""
                Extract ALL text from page {i+1} of this document, maintaining original formatting.
                Include ALL text visible in the image, including:
                - Main body text
                - Headers and footers
                - Tables and their contents
                - Bullet points and numbered lists
                - Mathematical equations and formulas
                - Any handwritten text
                
                Be especially thorough with handwritten content and mathematical formulas.
                Preserve paragraph breaks and line structure.
                """
                
                try:
                    response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": img_byte_arr}])
                    
                    if response.text:
                        page_text = response.text.strip()
                        text += f"\n\n--- Page {i+1} ---\n\n{page_text}"
                    else:
                        text += f"\n\n--- Page {i+1} ---\n\nNo text found on this page."
                except Exception as e:
                    logger.error(f"Error processing page {i+1} with Gemini: {str(e)}")
                    text += f"\n\n--- Page {i+1} ---\n\nError extracting text: {str(e)}"
        
        return text
    except Exception as e:
        logger.error(f"Error with Gemini extraction: {str(e)}")
        return f"Error with Gemini: {str(e)}"

def create_mock_extraction(pdf_path):
    """Create mock text for development purposes"""
    filename = os.path.basename(pdf_path)
    return f"""
[MOCK EXTRACTION] This is placeholder text extracted from {filename}.

Since no extraction methods were available, we're using a fallback method.
For development purposes, this mock text can be used to test the workflow.

In production, please install one of the following:
- PyPDF2 (pip install PyPDF2)
- Poppler/pdftotext (system package)
- pdf2image + pytesseract (pip install pdf2image pytesseract)

The actual content would appear here...

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
Sed nisi. Nulla quis sem at nibh elementum imperdiet.
Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
Mauris massa. Vestibulum lacinia arcu eget nulla.

1. First item in a list
2. Second item in a list
3. Third item with a formula: E = mc^2
    """

def extract_text_from_pdf(pdf_path_or_file):
    """
    Extract text from a PDF file or image using multiple methods, with fallbacks
    
    Args:
        pdf_path_or_file: Can be a file path (string), URL, or a file-like object
        
    Returns:
        str: The extracted text from the PDF or image
    """
    temp_file = None
    try:
        # Handle different input types: path string, URL, or file-like object
        if isinstance(pdf_path_or_file, str):
            if pdf_path_or_file.startswith("http://") or pdf_path_or_file.startswith("https://"):
                # It's a URL
                logger.info(f"Downloading file from URL: {pdf_path_or_file}")
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
            # Determine suffix based on content (if possible)
            suffix = ".pdf"  # Default
            if hasattr(pdf_path_or_file, 'name') and '.' in pdf_path_or_file.name:
                ext = pdf_path_or_file.name.split('.')[-1].lower()
                suffix = f".{ext}"
            
            temp_file = NamedTemporaryFile(delete=False, suffix=suffix)
            temp_file.write(pdf_path_or_file.read())
            temp_file.close()
            pdf_path = temp_file.name
        
        # Try Gemini first - our primary method for all files
        logger.info(f"Attempting to extract text using Gemini API")
        text = extract_text_with_gemini(pdf_path)
        
        # Check if Gemini was successful
        if text and not text.startswith("Gemini API not configured") and not text.startswith("Error with Gemini") and not text.startswith("Failed to convert"):
            logger.info(f"Successfully extracted text using Gemini API")
            print_extracted_text(text, f"{os.path.basename(pdf_path)} using Gemini API")
            return text
        
        # If Gemini failed, try other methods for PDFs
        if pdf_path.lower().endswith('.pdf'):
            # Try other extraction methods in order of preference
            extraction_methods = [
                ('pdftotext', extract_text_with_pdftotext),
                ('OCR', extract_text_with_ocr),
                ('PyPDF2', extract_text_with_pypdf)
            ]
            
            # Try each method
            for method_name, method_func in extraction_methods:
                logger.info(f"Attempting to extract text using {method_name}")
                text = method_func(pdf_path)
                
                # Check if the extraction was successful
                if text and not text.startswith(method_name + " not installed") and not text.startswith("Error with " + method_name):
                    logger.info(f"Successfully extracted text using {method_name}")
                    print_extracted_text(text, f"{os.path.basename(pdf_path)} using {method_name}")
                    return text
        
        # If all methods failed, use mock extraction
        logger.warning("All extraction methods failed, using mock extraction")
        mock_text = create_mock_extraction(pdf_path)
        print_extracted_text(mock_text, f"{os.path.basename(pdf_path)} (MOCK)")
        return mock_text
        
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        error_message = f"Error extracting text from file: {str(e)}"
        print_extracted_text(error_message, "ERROR")
        return error_message
    finally:
        # Clean up temporary file if created
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except:
                pass

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