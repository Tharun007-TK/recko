# ReconFlow Reconciliation Backend

FastAPI service for reconciling Tally and GST Excel files.

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### 4. Run the Service

```bash
python main.py
```

The service will be available at `http://localhost:8000`

## API Endpoints

### Health Check

```
GET /health
```

### Start Reconciliation

```
POST /api/reconciliation/start
Content-Type: application/json

{
  "job_id": "uuid",
  "firm_id": "uuid"
}
```

### Get Status

```
GET /api/reconciliation/{job_id}
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes.py          # API endpoint definitions
│   ├── services/
│   │   └── reconciliation.py   # Core reconciliation logic
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── utils/
│   │   └── supabase.py         # Supabase client wrapper
│   └── config.py               # Configuration settings
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Features

- **File Loading**: Reads .xlsx and .xls files using pandas
- **Data Mapping**: Applies user-defined column mappings
- **Normalization**: Applies configurable normalization rules:
  - Trim spaces
  - Ignore case
  - Normalize dates
  - Remove separators
  - Numeric rounding
- **Reconciliation**: Compares records and identifies:
  - Matched records
  - Mismatched fields
  - Records missing in GST
  - Records missing in Tally
- **Persistence**: Stores results in Supabase database
- **Status Tracking**: Updates job status throughout process

## Error Handling

All errors are caught and logged. Job status is updated to "failed" if any error occurs during reconciliation.
