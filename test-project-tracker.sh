#!/bin/bash

echo "Testing Project Tracker Template..."
echo ""

# Test 1: Get template details
echo "1. Fetching project tracker template details..."
TEMPLATE_RESPONSE=$(curl -s http://localhost:5000/api/templates/project-tracker)
echo "$TEMPLATE_RESPONSE" | grep -q '"customLayout":true' && echo "✓ Custom layout enabled" || echo "✗ Custom layout not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"Project Tracker"' && echo "✓ Title found" || echo "✗ Title not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"projectInfo"' && echo "✓ Project info section found" || echo "✗ Project info missing"
echo ""

# Test 2: Generate template
echo "2. Generating project tracker template data..."
GENERATED=$(curl -s -X POST http://localhost:5000/api/templates/project-tracker/generate)
echo "$GENERATED" | grep -q '"success":true' && echo "✓ Template generated successfully" || echo "✗ Generation failed"
echo "$GENERATED" | grep -q '"A1"' && echo "✓ Title cell (A1) created" || echo "✗ Title cell missing"
echo "$GENERATED" | grep -q '"Project Name:"' && echo "✓ Project info created" || echo "✗ Project info missing"
echo "$GENERATED" | grep -q '"Task"' && echo "✓ Task table headers created" || echo "✗ Headers missing"
echo "$GENERATED" | grep -q '"Requirements Gathering"' && echo "✓ Sample tasks created" || echo "✗ Sample data missing"
echo "$GENERATED" | grep -q '"In Progress"' && echo "✓ Status values included" || echo "✗ Status missing"
echo "$GENERATED" | grep -q '"65%"' && echo "✓ Progress values included" || echo "✗ Progress missing"
echo ""

echo "Testing complete!"
