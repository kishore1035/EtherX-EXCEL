#!/bin/bash

echo "Testing Sales Tracker Template Generation..."
echo "=============================================="
echo ""

# Test template generation
echo "1. Generating Sales Tracker Template..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/templates/sales-tracker/generate)

# Check if response is valid JSON
if echo "$RESPONSE" | grep -q '"cells"'; then
  echo "✓ Template generated successfully"
else
  echo "✗ Failed to generate template"
  echo "$RESPONSE"
  exit 1
fi

# Check for main title
if echo "$RESPONSE" | grep -q '"A1".*Sales Tracker Dashboard'; then
  echo "✓ Main title created"
else
  echo "✗ Main title missing"
fi

# Check for summary header
if echo "$RESPONSE" | grep -q '"A3".*Sales Summary'; then
  echo "✓ Summary section header created"
else
  echo "✗ Summary section header missing"
fi

# Check for summary formulas
if echo "$RESPONSE" | grep -q 'SUM(H10:H24)'; then
  echo "✓ Total Sales formula included"
else
  echo "✗ Total Sales formula missing"
fi

if echo "$RESPONSE" | grep -q 'COUNTA(B10:B24)'; then
  echo "✓ Total Orders formula included"
else
  echo "✗ Total Orders formula missing"
fi

# Check for table headers
if echo "$RESPONSE" | grep -q '"A8".*Date'; then
  echo "✓ Sales table headers created"
else
  echo "✗ Sales table headers missing"
fi

# Check for sample data
if echo "$RESPONSE" | grep -q 'ORD-1001'; then
  echo "✓ Sample order data created"
else
  echo "✗ Sample order data missing"
fi

# Check for total formulas in data rows
if echo "$RESPONSE" | grep -q '=F10\*G10'; then
  echo "✓ Total calculation formulas included"
else
  echo "✗ Total calculation formulas missing"
fi

# Check for regional analysis
if echo "$RESPONSE" | grep -q '"A26".*Sales by Region'; then
  echo "✓ Regional analysis section created"
else
  echo "✗ Regional analysis section missing"
fi

# Check for SUMIF formulas
if echo "$RESPONSE" | grep -q 'SUMIF(D10:D24,"North",H10:H24)'; then
  echo "✓ Regional SUMIF formulas included"
else
  echo "✗ Regional SUMIF formulas missing"
fi

# Check for COUNTIF formulas
if echo "$RESPONSE" | grep -q 'COUNTIF(D10:D24,"North")'; then
  echo "✓ Regional COUNTIF formulas included"
else
  echo "✗ Regional COUNTIF formulas missing"
fi

echo ""
echo "Sample of generated cells:"
echo "$RESPONSE" | grep -o '"A1":{[^}]*}' | head -1
echo "$RESPONSE" | grep -o '"B4":{[^}]*}' | head -1
echo "$RESPONSE" | grep -o '"H10":{[^}]*}' | head -1
echo "$RESPONSE" | grep -o '"B29":{[^}]*}' | head -1

echo ""
echo "=============================================="
echo "Sales Tracker Template Test Complete"
