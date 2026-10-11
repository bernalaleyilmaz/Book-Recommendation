import pytest
from fastapi.testclient import TestClient
from main import app  # main dosyanın adı farklıysa düzelt

client = TestClient(app)


def test_get_books():
    # Kitapları getir API'sine istek at
    response = client.get("/books")

    # 1. API 200 (OK) döndü mü?
    assert response.status_code == 200

    # 2. Gelen cevapta 'total' ve 'books' anahtarları var mı?
    data = response.json()
    assert "total" in data
    assert "books" in data


def test_rate_book_not_found():
    # Olmayan bir kitap için puan verme testi
    response = client.post("/rate", json={
        "book_isbn": "00000000000000",
        "score": 5,
        "comments": "Harika"
    }, params={"user_id": 1})

    # Kitap olmadığı için 404 dönmeli
    assert response.status_code == 404
    #pytest