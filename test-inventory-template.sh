#!/bin/bash

echo "Testing Inventory Management Template..."
echo ""

# Test 1: Get template list
echo "1. Fetching template list..."
curl -s http://localhost:5000/api/templates | grep -o '"id":"inventory-management"' && echo "✓ Inventory template found in list" || echo "✗ Template not found"
echo ""

# Test 2: Get template details
echo "2. Fetching inventory template details..."
TEMPLATE_RESPONSE=$(curl -s http://localhost:5000/api/templates/inventory-management)
echo "$TEMPLATE_RESPONSE" | grep -q '"customLayout":true' && echo "✓ Custom layout enabled" || echo "✗ Custom layout not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"Inventory Management"' && echo "✓ Title found" || echo "✗ Title not found"
echo "$TEMPLATE_RESPONSE" | grep -q '"Item ID"' && echo "✓ Headers found" || echo "✗ Headers not found"
echo ""

# Test 3: Generate template
echo "3. Generating inventory template data..."
GENERATED=$(curl -s http://localhost:5000/api/templates/inventory-management/generate)
echo "$GENERATED" | grep -q '"success":true' && echo "✓ Template generated successfully" || echo "✗ Generation failed"
echo "$GENERATED" | grep -q '"A1"' && echo "✓ Title cell (A1) created" || echo "✗ Title cell missing"
echo "$GENERATED" | grep -q '"Warehouse:"' && echo "✓ Metadata row created" || echo "✗ Metadata missing"
echo "$GENERATED" | grep -q '"Item ID"' && echo "✓ Header row created" || echo "✗ Headers missing"
echo "$GENERATED" | grep -q '"INV-001"' && echo "✓ Sample data created" || echo "✗ Sample data missing"
echo "$GENERATED" | grep -q '"IF(E5<=F5' && echo "✓ Formulas included" || echo "✗ Formulas missing"
echo ""

echo "Testing complete!"
