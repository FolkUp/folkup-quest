#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Simple test panel creator for QA system validation"""

from PIL import Image, ImageDraw

def create_test_panel():
    """Create a test panel that meets commercial standards"""

    # Create image with correct dimensions and DPI
    width, height = 4125, 6262
    image = Image.new('RGB', (width, height), color='white')

    # Create drawing context
    draw = ImageDraw.Draw(image)

    # Add some basic content
    draw.rectangle([100, 100, 500, 300], fill='black', outline='gray')
    draw.text((200, 150), "TEST PANEL", fill='black')

    # Add Alice's sage notebook color
    sage_color = (131, 158, 117)  # #839E75
    draw.rectangle([600, 200, 800, 400], fill=sage_color, outline='black')
    draw.text((610, 280), "Alice\nNotebook", fill='white')

    # Add some character-like shapes
    # Simple "ponytail" representation for Арни
    draw.ellipse([1000, 200, 1200, 400], fill='brown', outline='black')
    draw.rectangle([1100, 400, 1120, 500], fill='brown', outline='black')  # ponytail

    # Save with correct DPI - set in save method
    image.save('test_panels/test_panel_perfect.png', dpi=(600.0, 600.0))
    print("Created test_panel_perfect.png with correct standards")

    # Create a panel with wrong dimensions for testing failure
    wrong_image = Image.new('RGB', (1000, 1000), color='red')
    wrong_image.save('test_panels/test_panel_wrong_size.png', dpi=(300, 300))
    print("Created test_panel_wrong_size.png with incorrect standards")

    print("Test panels created successfully!")

if __name__ == "__main__":
    create_test_panel()