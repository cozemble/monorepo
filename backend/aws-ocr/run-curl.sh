#!/bin/bash

ROOT_URL=$(cd pulumi && pulumi stack output apiUrl)
echo "ROOT_URL: $ROOT_URL"

# Use the provided argument as the PDF path or default to pdfs/sample.pdf
PDF_PATH=${1:-pdfs/sample.pdf}

echo "Using PDF: $PDF_PATH"

curl -X POST \
     -H "Content-Type: application/pdf" \
     --data-binary "@$PDF_PATH" \
     $ROOT_URL/echo -o /tmp/echoed.pdf

echo "See echoed.pdf in /tmp/echoed.pdf"
