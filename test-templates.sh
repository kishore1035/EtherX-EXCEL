#!/bin/bash

# Template System API Test Script
# This script tests all template endpoints

API_URL="http://localhost:5000"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}================================${NC}"
echo -e "${BOLD}${BLUE}Template System API Tests${NC}"
echo -e "${BOLD}${BLUE}================================${NC}\n"

# Test 1: Health Check
echo -e "${BOLD}Test 1: Health Check${NC}"
response=$(curl -s "${API_URL}/api/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Server is running${NC}"
    echo -e "Response: $response\n"
else
    echo -e "${RED}✗ Server is not responding${NC}\n"
    exit 1
fi

# Test 2: Get All Templates
echo -e "${BOLD}Test 2: Get All Templates${NC}"
response=$(curl -s "${API_URL}/api/templates")
if echo "$response" | grep -q "success.*true"; then
    template_count=$(echo "$response" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓ Successfully fetched templates${NC}"
    echo -e "Template count: $template_count"
    echo -e "Sample response: $(echo $response | head -c 200)...\n"
else
    echo -e "${RED}✗ Failed to fetch templates${NC}"
    echo -e "Response: $response\n"
fi

# Test 3: Get Specific Template (Business Report)
echo -e "${BOLD}Test 3: Get Business Report Template${NC}"
response=$(curl -s "${API_URL}/api/templates/business-report")
if echo "$response" | grep -q "Business Report Template"; then
    echo -e "${GREEN}✓ Successfully fetched business-report template${NC}"
    echo -e "Sample: $(echo $response | head -c 200)...\n"
else
    echo -e "${RED}✗ Failed to fetch template${NC}"
    echo -e "Response: $response\n"
fi

# Test 4: Get Specific Template (Invoice)
echo -e "${BOLD}Test 4: Get Invoice Template${NC}"
response=$(curl -s "${API_URL}/api/templates/invoice")
if echo "$response" | grep -q "Invoice Template"; then
    echo -e "${GREEN}✓ Successfully fetched invoice template${NC}\n"
else
    echo -e "${RED}✗ Failed to fetch template${NC}\n"
fi

# Test 5: Generate Business Report Template
echo -e "${BOLD}Test 5: Generate Business Report Template${NC}"
response=$(curl -s -X POST "${API_URL}/api/templates/business-report/generate")
if echo "$response" | grep -q '"cells"'; then
    echo -e "${GREEN}✓ Successfully generated template data${NC}"
    cell_count=$(echo "$response" | grep -o '"[A-Z][0-9]*"' | wc -l)
    echo -e "Cell count: $cell_count"
    echo -e "Sample: $(echo $response | head -c 300)...\n"
else
    echo -e "${RED}✗ Failed to generate template${NC}"
    echo -e "Response: $response\n"
fi

# Test 6: Generate Invoice Template
echo -e "${BOLD}Test 6: Generate Invoice Template${NC}"
response=$(curl -s -X POST "${API_URL}/api/templates/invoice/generate")
if echo "$response" | grep -q '"INVOICE"'; then
    echo -e "${GREEN}✓ Successfully generated invoice template${NC}\n"
else
    echo -e "${RED}✗ Failed to generate invoice${NC}\n"
fi

# Test 7: Generate Budget Planner Template
echo -e "${BOLD}Test 7: Generate Budget Planner Template${NC}"
response=$(curl -s -X POST "${API_URL}/api/templates/budget-planner/generate")
if echo "$response" | grep -q '"Difference"'; then
    echo -e "${GREEN}✓ Successfully generated budget planner${NC}\n"
else
    echo -e "${RED}✗ Failed to generate budget planner${NC}\n"
fi

# Test 8: Test Invalid Template
echo -e "${BOLD}Test 8: Test Invalid Template ID${NC}"
response=$(curl -s "${API_URL}/api/templates/invalid-template-id")
if echo "$response" | grep -q "Template not found"; then
    echo -e "${GREEN}✓ Correctly returns 404 for invalid template${NC}\n"
else
    echo -e "${RED}✗ Error handling not working${NC}\n"
fi

# Test All 8 Templates
echo -e "${BOLD}${BLUE}================================${NC}"
echo -e "${BOLD}${BLUE}Testing All 8 Templates${NC}"
echo -e "${BOLD}${BLUE}================================${NC}\n"

templates=("business-report" "attendance" "budget-planner" "invoice" "project-tracker" "sales-tracker" "inventory-management" "school-gradebook")

for template in "${templates[@]}"; do
    echo -e "${BOLD}Generating: $template${NC}"
    response=$(curl -s -X POST "${API_URL}/api/templates/${template}/generate")
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ $template generated successfully${NC}"
    else
        echo -e "${RED}✗ $template generation failed${NC}"
        echo -e "Error: $response"
    fi
done

echo -e "\n${BOLD}${BLUE}================================${NC}"
echo -e "${BOLD}${GREEN}All Tests Completed!${NC}"
echo -e "${BOLD}${BLUE}================================${NC}"
