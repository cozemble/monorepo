base64 < 4614fb56-335d-4985-bac6-7996af859297.pdf > tmp_encoded.txt

curl -X POST \
     -H "Content-Type: multipart/form-data" \
     -F "file=@tmp_encoded.txt;type=text/plain" \
     -F "rectangles=[{\"x\": 10, \"y\": 10, \"width\": 100, \"height\": 50, \"startPage\": 1, \"endPage\": 1, \"rgb\": [1, 0, 0]}]" \
     http://localhost:3000/dev/processPDF -o out.pdf
