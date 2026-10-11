# Book Recommendation

[English](README.md) | [Türkçe](README.tr.md)

A full-stack book discovery and recommendation application I developed during my internship. Users can explore a book catalog, rate and review books, and discover recommendations based on their reading preferences.

The React interface communicates with a FastAPI backend backed by SQLite. Recommendations use TF-IDF and cosine similarity, with optional Google Gemini integration for short English descriptions of the suggested books.

## Features

- User registration, login, username and password updates, and account deletion.
- Search by book title or author; filter by author, publisher, and minimum publication year.
- Paginated catalog with alphabetical, rating, and publication-year sorting.
- Rate books from 1 to 5 stars, write reviews, and update or delete ratings.
- View personal ratings and other users' reviews of a book.
- Get recommendations from highly rated books or a search query.
- Light and dark themes, and a login screen with a video background.

## Screenshots

Save application screenshots in `docs/screenshots/` using the filenames below. Once the images are available, remove the opening and closing HTML comment lines around the corresponding block. Keep only the entries for images you have added.

<!-- Add the screenshots before uncommenting this block.
### Login and registration
![Login and registration screen](docs/screenshots/login.png)

### Book catalog
![Book catalog and filters](docs/screenshots/catalog.png)

### Recommendations
![Personalized book recommendations](docs/screenshots/recommendations.png)

### My ratings
![Personal ratings and reviews](docs/screenshots/my-ratings.png)
-->

Actual application screenshots have not been added yet. Both language versions use the same image files.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, React Router, Vite 8, JavaScript, CSS, Axios / Fetch |
| Backend | Python, FastAPI, Pydantic |
| Data | SQLite, SQLAlchemy, Pandas |
| Recommendations | scikit-learn, TF-IDF, cosine similarity, NumPy |
| Optional descriptions | Google Gemini API |
| Password hashing | Passlib, bcrypt |
| Tests | pytest, FastAPI TestClient |

## Getting started

The following commands are for Windows PowerShell. Open a terminal in the project root and run each command on its own line. Python dependencies are pinned to the versions in the original development environment, which uses Python 3.14. Frontend builds were checked with Node.js 24.18.0.

### 1. Install backend dependencies

```powershell
$env:PYTHONUTF8 = "1"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
```

### 2. Prepare the book data

The original database and full dataset are excluded from this repository. A small sample containing six fictional books is included for a quick local demo. These entries do not represent real books or valid ISBNs, and their cover image fields are empty.

```powershell
$env:PYTHONUTF8 = "1"
Copy-Item data/books.example.csv books.csv
.\.venv\Scripts\python.exe import_data.py
```

To use your own dataset, place it in the project root as `books.csv` before running the importer. The lowercase filename matters on case-sensitive operating systems. The importer expects a comma-separated CSV, reads it with `latin-1` encoding, and uses these columns:

```text
ISBN, Book-Title, Book-Author, Year-Of-Publication, Publisher, Image-URL-M
```

**The importer drops and recreates the books table every time it runs.** Use it during initial setup. Back up an existing database before running it again, as replacing the book records may affect their relationship with existing ratings.

### 3. Start the backend

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

- [Local API](http://127.0.0.1:8000)
- [Interactive API documentation](http://127.0.0.1:8000/docs)

#### Optional: enable Gemini descriptions

Before starting the backend, set your own API key in the same PowerShell session. Keep the quotation marks, replace the placeholder, and press Enter:

```powershell
$env:GEMINI_API_KEY = "YOUR_API_KEY"
```

Then run this as a separate command:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

If the server is already running, stop it with `Ctrl+C` before setting the variable and restarting it. Never commit your API key. `.env.example` documents the variable name; the application does not automatically load `.env` files.

Without a key, the local recommendation algorithm still works and returns default descriptions. When Gemini is enabled, selected book titles are sent to Google's API to generate descriptions.

### 4. Start the frontend

Open a second terminal in the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the local URL printed in the terminal, usually [http://localhost:5173](http://localhost:5173). Create an account and sign in. The frontend connects to the backend through `localhost:8000` and `127.0.0.1:8000`.

To create a production build, run this inside `frontend`:

```powershell
npm run build
```

## How recommendations work

1. Each book's title, author, and publisher are combined into a text representation.
2. TF-IDF converts those texts into numerical vectors.
3. For personalized suggestions, vectors of books rated 4 or 5 stars are averaged into a user profile. When a search query is supplied, a matching book is used as the reference instead.
4. Cosine similarity ranks the catalog against that reference. In the rating-based flow, the highly rated reference books are excluded; normalized titles also help avoid repeated suggestions.
5. The endpoint returns up to 25 suggestions by default. Gemini optionally generates descriptions; the local algorithm determines the ranking.

## Project structure

```text
BookRecommendation-GitHub/
├── README.md               # English documentation
├── README.tr.md            # Turkish documentation
├── main.py                 # API endpoints and recommendations
├── database.py             # SQLite connection and sorting function
├── models.py               # Book, user, and rating models
├── schemas.py              # Request and response schemas
├── import_data.py          # CSV importer
├── check_db.py              # Database inspection utility
├── test_api.py              # Manual development test script
├── tests/test_book.py       # Existing API tests
├── requirements.txt
├── requirements-dev.txt
├── data/books.example.csv   # Fictional sample data
├── docs/screenshots/        # README screenshots
└── frontend/
    ├── src/                 # React components and styles
    ├── public/              # Video and static assets
    └── package.json
```

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/register`, `/login` | Registration and login |
| GET | `/books` | Search, filtering, and pagination |
| GET | `/authors`, `/publishers` | Available filter options |
| POST / DELETE | `/rate` | Save or delete a rating and review |
| GET | `/my-ratings` | A user's ratings |
| GET | `/books/{isbn}/reviews` | Reviews for a book |
| GET | `/suggestions` | Book recommendations |
| PUT / DELETE | `/books/{isbn}` | Update or delete a book |
| PUT | `/users/{user_id}/username` | Change a username |
| PUT | `/users/{user_id}/password` | Change a password |
| DELETE | `/users/{user_id}` | Delete an account |

## Tests and current limitations

Run the existing tests from the project root:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

This is an internship and learning project. The original source comments have been preserved.

- Login returns user information, but token-based sessions and endpoint-level user authorization are not implemented. These are needed before deploying for real users.
- CORS settings are permissive for local development.
- `POST /rate` is defined twice in the existing source.
- The manual `test_api.py` script expects an older response format. It needs updating to read the `books` field in the current `/books` response. The pytest command above runs a separate test file.
- The TF-IDF matrix is rebuilt for each recommendation request, which can increase response time with large datasets.
- Dataset and visual asset sources and usage permissions still need to be documented. A repository license has not been selected.

## Validation status

The Vite production build completed successfully. The six sample records were imported into SQLite, and the catalog and recommendation functions were checked through direct calls without a Gemini key. The pytest run did not complete in the preparation environment, so a passing test suite has not been confirmed. Live Gemini requests and all browser workflows have not been tested.
