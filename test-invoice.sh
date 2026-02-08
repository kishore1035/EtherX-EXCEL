#!/bin/bash

echo "Testing Invoice Template..."
echo ""

# Test 1: Get template details
echo "1. Fetching invoice template details..."
TEMPLATE_RESPONSE=$(curl -s http://localhost:5000/api/templates/invoice)
echo "$TEMPLATE_RESPONSE" | grep -q '"customLayout":true' && echo "✓ Custom layout enabled" || echo "✗ Custom layout not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"companyInfo"' && echo "✓ Company info section found" || echo "✗ Company info missing"
echo "$TEMPLATE_RESPONSE" | grep -q '"lineItemsTable"' && echo "✓ Line items table found" || echo "✗ Line items missing"
echo ""

# Test 2: Generate template
echo "2. Generating invoice template data..."
GENERATED=$(curl -s -X POST http://localhost:5000/api/templates/invoice/generate)
echo "$GENERATED" | grep -q '"success":true' && echo "✓ Template generated successfully" || echo "✗ Generation failed"
echo "$GENERATED" | grep -q '"A1"' && echo "✓ Company name cell (A1) created" || echo "✗ Company name missing"
echo "$GENERATED" | grep -q '"INVOICE"' && echo "✓ Invoice title created" || echo "✗ Invoice title missing"
echo "$GENERATED" | grep -q '"Bill To:"' && echo "✓ Bill To section created" || echo "✗ Bill To missing"
echo "$GENERATED" | grep -q '"Item Description"' && echo "✓ Line items headers created" || echo "✗ Headers missing"
echo "$GENERATED" | grep -q '"Website Design"' && echo "✓ Sample line items created" || echo "✗ Line items missing"
echo "$GENERATED" | grep -q '"B13\*C13"' && echo "✓ Line total formulas included" || echo "✗ Line formulas missing"
echo "$GENERATED" | grep -q '"SUM(E13:E17)"' && echo "✓ Subtotal formula included" || echo "✗ Subtotal formula missing"
echo "$GENERATED" | grep -q '"TOTAL DUE:"' && echo "✓ Total due label created" || echo "✗ Total due missing"
echo ""

echo "Testing complete!"
