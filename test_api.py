"""
Bu script, FastAPI backend'ini sırayla test eder.
ÇALIŞTIRMADAN ÖNCE: uvicorn main:app --reload komutuyla sunucunu ayrı bir terminalde açık tut.

Test sırası:
1) Kayıt ol (register)
2) Giriş yap (login)
3) Kitapları listele (get_books)
4) İlk kitaba puan ver (rate)
5) Aynı kitaba tekrar puan ver -> "update" mantığını test eder
"""

import requests

BASE_URL = "http://127.0.0.1:8000"

def print_result(step, response):
    print(f"\n--- {step} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print("Response:", response.json())
    except Exception:
        print("Response (raw):", response.text)


def main():
    # rastgele bir kullanıcı adı üretiyoruz ki script'i tekrar tekrar
    # çalıştırdığında "username already exists" hatası almayasın
    import random
    test_username = f"test_user_{random.randint(1000, 9999)}"
    test_password = "test1234"

    # 1) REGISTER
    register_payload = {"username": test_username, "password": test_password}
    r = requests.post(f"{BASE_URL}/register", json=register_payload)
    print_result("1) REGISTER", r)
    if r.status_code != 201:
        print("Kayıt başarısız oldu, script durduruluyor.")
        return

    # 2) LOGIN
    login_payload = {"username": test_username, "password": test_password}
    r = requests.post(f"{BASE_URL}/login", json=login_payload)
    print_result("2) LOGIN", r)
    if r.status_code != 200:
        print("Giriş başarısız oldu, script durduruluyor.")
        return
    user_id = r.json()["user_id"]

    # 3) GET BOOKS
    r = requests.get(f"{BASE_URL}/books", params={"skip": 0, "limit": 5})
    print_result("3) GET BOOKS", r)
    if r.status_code != 200:
        print("Kitaplar çekilemedi, script durduruluyor.")
        return
    books = r.json()
    if not books:
        print("Veritabanında hiç kitap yok, seed.py'yi çalıştırdın mı?")
        return
    test_isbn = books[0]["isbn"]
    print(f"\nTest için seçilen kitap: {books[0]['title']} (ISBN: {test_isbn})")

    # 4) RATE BOOK (ilk kez puan veriyoruz)
    rate_payload = {"book_isbn": test_isbn, "score": 4, "comments": "Gayet iyi bir kitap"}
    r = requests.post(f"{BASE_URL}/rate", json=rate_payload, params={"user_id": user_id})
    print_result("4) RATE BOOK (ilk puan)", r)

    # 5) RATE BOOK tekrar (update mantığını test ediyoruz)
    rate_payload_updated = {"book_isbn": test_isbn, "score": 5, "comments": "Fikrimi değiştirdim, harikaymış"}
    r = requests.post(f"{BASE_URL}/rate", json=rate_payload_updated, params={"user_id": user_id})
    print_result("5) RATE BOOK (güncelleme)", r)

    print("\n=== TÜM TESTLER TAMAMLANDI ===")


if __name__ == "__main__":
    main()