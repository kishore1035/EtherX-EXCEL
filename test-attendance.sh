#!/bin/bash

echo "Testing Attendance Register Template..."
echo ""

# Test 1: Get template details
echo "1. Fetching attendance template details..."
TEMPLATE_RESPONSE=$(curl -s http://localhost:5000/api/templates/attendance)
echo "$TEMPLATE_RESPONSE" | grep -q '"customLayout":true' && echo "✓ Custom layout enabled" || echo "✗ Custom layout not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"Attendance Register"' && echo "✓ Title found" || echo "✗ Title not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"attendanceGrid"' && echo "✓ Attendance grid found" || echo "✗ Grid missing"
echo ""

# Test 2: Generate template
echo "2. Generating attendance template data..."
GENERATED=$(curl -s -X POST http://localhost:5000/api/templates/attendance/generate)
echo "$GENERATED" | grep -q '"success":true' && echo "✓ Template generated successfully" || echo "✗ Generation failed"
echo "$GENERATED" | grep -q '"A1"' && echo "✓ Title cell (A1) created" || echo "✗ Title cell missing"
echo "$GENERATED" | grep -q '"Class / Team:"' && echo "✓ Class info created" || echo "✗ Class info missing"
echo "$GENERATED" | grep -q '"Legend:"' && echo "✓ Legend row created" || echo "✗ Legend missing"
echo "$GENERATED" | grep -q '"Roll No"' && echo "✓ Grid headers created" || echo "✗ Headers missing"
echo "$GENERATED" | grep -q '"Emma Thompson"' && echo "✓ Student data created" || echo "✗ Student data missing"
echo "$GENERATED" | grep -q '"COUNTIF"' && echo "✓ Summary formulas included" || echo "✗ Formulas missing"
echo "$GENERATED" | grep -q '"C10:AG10"' && echo "✓ Day range formulas correct" || echo "✗ Range formulas incorrect"
echo ""

echo "Testing complete!"
