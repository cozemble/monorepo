#!/bin/bash

ROOT_URL=$(cd pulumi && pulumi stack output apiUrl)
echo "ROOT_URL: $ROOT_URL"

# Use the provided argument as the PDF path or default to pdfs/sample.pdf
PDF_PATH=${1:-pdfs/sample.pdf}

echo "Using PDF: $PDF_PATH"

curl -X POST \
     -H "Content-Type: multipart/form-data" \
     -F "file=@$PDF_PATH" \
     -F "rectangles={\"some_key\":\"some_value\"}" \
     $ROOT_URL/echo -o /tmp/echoed.pdf

echo "See echoed.pdf in /tmp/echoed.pdf"
