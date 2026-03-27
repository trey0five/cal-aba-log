#!/bin/bash
# Camp CAL API Deployment
# Usage:
#   ./deploy.sh setup    - First time: create all AWS resources
#   ./deploy.sh code     - Update Lambda code only
#   ./deploy.sh status   - Check stack status and get API URL

set -e
cd "$(dirname "$0")"

STACK_NAME="camp-cal-api"
REGION="us-east-1"
FUNCTION_NAME="camp-cal-api"

case "${1:-help}" in

  setup)
    echo "=== Creating Camp CAL infrastructure ==="
    read -p "Enter a JWT secret (random string for token signing): " JWT_SECRET

    aws cloudformation deploy \
      --template-file template.yaml \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --capabilities CAPABILITY_NAMED_IAM \
      --parameter-overrides \
        JwtSecret="$JWT_SECRET" \
        AllowedOrigin="https://campcalaba.netlify.app"

    echo ""
    echo "=== Infrastructure created! Now deploying code... ==="
    $0 code

    echo ""
    echo "=== Done! Here's your API URL ==="
    $0 status
    ;;

  code)
    echo "Packaging Lambda function..."
    zip -j lambda_deploy.zip lambda_function.py

    echo "Deploying code to Lambda..."
    aws lambda update-function-code \
      --function-name "$FUNCTION_NAME" \
      --zip-file "fileb://lambda_deploy.zip" \
      --region "$REGION" \
      --no-cli-pager

    rm lambda_deploy.zip
    echo "Code deployed!"
    ;;

  status)
    echo "=== Stack Status ==="
    aws cloudformation describe-stacks \
      --stack-name "$STACK_NAME" \
      --region "$REGION" \
      --query 'Stacks[0].{Status:StackStatus,Outputs:Outputs}' \
      --output table \
      --no-cli-pager 2>/dev/null || echo "Stack not found. Run './deploy.sh setup' first."
    ;;

  *)
    echo "Camp CAL API Deploy"
    echo "  ./deploy.sh setup   - First time setup (creates Lambda + API Gateway)"
    echo "  ./deploy.sh code    - Update Lambda code"
    echo "  ./deploy.sh status  - Check status and get API URL"
    ;;

esac
