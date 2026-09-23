#!/usr/bin/env python3
"""
Image Compression Script for Portfolio
Compresses high-res images from art/myart/ to art/web/ for faster loading
"""

import os
import subprocess
import sys
from pathlib import Path

# Configuration
SOURCE_DIR = Path("art/myart")
OUTPUT_DIR = Path("art/web")
QUALITY = 75  # WebP quality (0-100)

def check_tool_available(tool):
    """Check if a compression tool is available"""
    try:
        subprocess.run([tool, "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def compress_with_cwebp(source, output):
    """Compress using cwebp if available"""
    try:
        subprocess.run([
            "cwebp", 
            str(source), 
            "-q", str(QUALITY),
            "-o", str(output)
        ], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def compress_with_imagemagick(source, output):
    """Compress using ImageMagick if available"""
    try:
        subprocess.run([
            "convert",
            str(source),
            "-quality", str(QUALITY),
            str(output)
        ], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def manual_copy(source, output):
    """Fallback: just copy the file"""
    import shutil
    shutil.copy(source, output)
    return True

def compress_images():
    """Main compression function"""
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Check available tools
    tools = {
        "cwebp": check_tool_available("cwebp"),
        "ImageMagick": check_tool_available("convert")
    }
    
    print("Available compression tools:")
    for tool, available in tools.items():
        print(f"  {tool}: {'✓' if available else '✗'}")
    
    if not any(tools.values()):
        print("⚠ No compression tools found. Files will be copied without compression.")
        print("Install cwebp or ImageMagick for better compression.")
    
    # Process images
    image_extensions = {'.png', '.jpg', '.jpeg', '.bmp', '.gif'}
    compressed_count = 0
    copied_count = 0
    
    for file in sorted(SOURCE_DIR.iterdir()):
        if not file.is_file():
            continue
            
        if file.suffix.lower() not in image_extensions:
            continue
            
        output_file = OUTPUT_DIR / f"{file.stem}.webp"
        
        print(f"Processing: {file.name} -> {output_file.name}")
        
        # Try compression tools
        compressed = False
        if tools["cwebp"]:
            compressed = compress_with_cwebp(file, output_file)
        elif tools["ImageMagick"]:
            compressed = compress_with_imagemagick(file, output_file)
        
        if compressed:
            compressed_count += 1
            print(f"  ✓ Compressed")
        else:
            manual_copy(file, output_file)
            copied_count += 1
            print(f"  ⚠ Copied (no compression)")
    
    print(f"\n{'='*50}")
    print(f"Compression complete!")
    print(f"Compressed: {compressed_count} files")
    print(f"Copied: {copied_count} files")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"{'='*50}")

if __name__ == "__main__":
    if not SOURCE_DIR.exists():
        print(f"Error: Source directory '{SOURCE_DIR}' not found")
        sys.exit(1)
    
    compress_images()
