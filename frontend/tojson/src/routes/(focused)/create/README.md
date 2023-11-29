# Create API Wizard
  Accepts a file and creates an API from it.

  - Goes through some **steps** to create an API:

    - ## Document OCR
      - Non-interactive
      - Do document OCR if user provided a document
        - Documents are either PDFs (later images)
      - Skip if user provided a TXT file (later)

    - ## Post OCR Corrections
      - Interactive
      - Allow user to correct OCR mistakes
      - Allow user to add additional data
      - Allow user to remove data
      - Popups for suggestions 
      - Corrective Actions:
        - Table
          - Label
          - Merge
          - Approve
        - Column
          - Validation Rules (JSON Schema)
          - Name
          - Drop
        - Row
          - Extract
          - Remove
        
    - ## Schema Generation
      - Non-interactive
      - Generate a schema from the data

    - ## Schema Corrections
      - Interactive
      - Allow user to edit the schema
      - Allow user to skip if they are happy with the schema
    
    - ## Create API
      - Non-interactive
      - Create stuff on the backend
      - Redirect to the dashboard page of the new API
