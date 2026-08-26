import os
import shutil
from pathlib import Path


def _configure_tesseract():
    try:
        import pytesseract
    except ImportError:
        return None
    cmd = os.getenv("TESSERACT_CMD") or shutil.which("tesseract")
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd
    return pytesseract


def extract_text_from_image(file_path: str) -> str:
    pytesseract = _configure_tesseract()
    if not pytesseract:
        return ""
    from PIL import Image
    return pytesseract.image_to_string(Image.open(file_path))


def extract_text_from_pdf(file_path: str) -> str:
    try:
        import fitz
    except ImportError:
        return ""
    pytesseract = _configure_tesseract()
    from PIL import Image
    pdf = fitz.open(file_path)
    chunks = []
    try:
        for page in pdf:
            text = page.get_text("text")
            if text.strip():
                chunks.append(text)
            elif pytesseract:
                pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
                image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                chunks.append(pytesseract.image_to_string(image))
    finally:
        pdf.close()
    return "\n".join(chunks).strip()


def extract_text_from_docx(file_path: str) -> str:
    try:
        from docx import Document as DocxDocument
    except ImportError:
        return ""
    document = DocxDocument(file_path)
    return "\n".join(p.text for p in document.paragraphs).strip()


def extract_text(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()
    if ext in {".jpg", ".jpeg", ".png"}:
        return extract_text_from_image(file_path)
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    if ext == ".docx":
        return extract_text_from_docx(file_path)
    return ""
