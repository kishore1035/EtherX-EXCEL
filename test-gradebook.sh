#!/bin/bash

echo "Testing School Gradebook Template..."
echo ""

# Test 1: Get template details
echo "1. Fetching school gradebook template details..."
TEMPLATE_RESPONSE=$(curl -s http://localhost:5000/api/templates/school-gradebook)
echo "$TEMPLATE_RESPONSE" | grep -q '"customLayout":true' && echo "✓ Custom layout enabled" || echo "✗ Custom layout not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"Gradebook"' && echo "✓ Title found" || echo "✗ Title not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"classInfo"' && echo "✓ Class info section found" || echo "✗ Class info missing"
echo ""

# Test 2: Generate template
echo "2. Generating gradebook template data..."
GENERATED=$(curl -s -X POST http://localhost:5000/api/templates/school-gradebook/generate)
echo "$GENERATED" | grep -q '"success":true' && echo "✓ Template generated successfully" || echo "✗ Generation failed"
echo "$GENERATED" | grep -q '"A1"' && echo "✓ Title cell (A1) created" || echo "✗ Title cell missing"
echo "$GENERATED" | grep -q '"Class / Section:"' && echo "✓ Class info created" || echo "✗ Class info missing"
echo "$GENERATED" | grep -q '"Mathematics"' && echo "✓ Subject info found" || echo "✗ Subject missing"
echo "$GENERATED" | grep -q '"Roll No"' && echo "✓ Grade table headers created" || echo "✗ Headers missing"
echo "$GENERATED" | grep -q '"Emily Johnson"' && echo "✓ Student data created" || echo "✗ Student data missing"
echo "$GENERATED" | grep -q '"C9+D9+E9+F9"' && echo "✓ Total formulas included" || echo "✗ Total formulas missing"
echo "$GENERATED" | grep -q '"Class Average"' && echo "✓ Class average row created" || echo "✗ Class average missing"
echo "$GENERATED" | grep -q '"AVERAGE(H9:H16)"' && echo "✓ Average formula included" || echo "✗ Average formula missing"
echo ""

echo "Testing complete!"
