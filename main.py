import os
from fastapi import FastAPI, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import distinct
# List kullanmak için
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
import models
import schemas
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import google.generativeai as genai
import json
import requests

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="bookrecommendationFastAPI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], )


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def get_password_hash(password: str):
    return pwd_context.hash(password)
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- YARDIMCI FONKSİYON: KİTAP ADI TEMİZLEYİCİ ---
def normalize_title(title):
    if not title:
        return ""
    # Parantez veya köşeli parantez içindekileri siler
    t = re.sub(r'\(.*?\)', '', title)
    t = re.sub(r'\[.*?\]', '', t)
    # Alt başlıkları (iki nokta veya tire sonrasını) siler
    t = t.split(':')[0]
    t = t.split('-')[0]
    # Baştaki/sondaki boşlukları alıp küçük harfe çevirir
    return t.strip().lower()


@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user=db.query(models.User).filter(models.User.username==user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User with that username already exists")
    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, password= hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user) #id bilgisi için veriyi temizle
    return new_user
@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user=db.query(models.User).filter(models.User.username==user.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="User with that username does not exist")
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    return {  "message" : "login successful", "user_id": db_user.id, "username": db_user.username}

"""     
# DİKKAT: Pydantic hata vermesin diye en üstteki response_model kısmı kaldırıldı
@app.get("/books")
def get_books(
        page: int = 1,
        limit: int = 24,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        author: Optional[str] = None,
        publisher: Optional[str] = None,
        min_year: Optional[int] = None,
        db: Session = Depends(get_db)
):
    # 1. Her title için TEK bir temsilci id seç (örn: en küçük id -> ilk eklenen kayıt)
    # HIZLANDIRMA: Alt sorgu (subquery) yerine SQL group_by kullanıyoruz, çok daha hızlı!
    query = db.query(models.Book).group_by(models.Book.title)

    # EĞER KURYEDEN YAYINEVİ GELDİYSE FİLTRELE
    if publisher:
        # Veritabanında yayınevi isminin içinde bu kelime geçiyor mu diye bakar
        query = query.filter(models.Book.publisher.contains(publisher))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%") )
    if min_year:
        query = query.filter(models.Book.year >= min_year)

    # 2. Eğer arama kelimesi varsa zincire filtre ekle
    if search:
        query = query.filter(
            models.Book.title.ilike(f"%{search}%") | models.Book.author.ilike(f"%{search}%")
        )

    # 3. Eğer sıralama istenmişse zincire dizilim kuralını ekle
    if sort_by == "alphabetical":
        # Özel fonksiyon yerine veritabanının kendi hızlı sıralamasını kullan
        query = query.order_by(models.Book.title.asc())

    elif sort_by == "popular":
        #  Oylara göre sıralamak için Rating tablosunu zincire bağlıyoruz
        query = query.outerjoin(models.Rating, models.Book.isbn == models.Rating.book_isbn)\
                     .order_by(func.count(models.Rating.id).desc())

    elif sort_by == "newest":
        query = query.filter(models.Book.year>0).order_by(models.Book.year.desc())
    elif sort_by == "oldest":
        query = query.filter(models.Book.year>0).order_by(models.Book.year.asc())

    skip = (page - 1) * limit
    total_books = query.count()

    # 4. En son zincire sayfalamayı (offset/limit) ekle ve tümünü getir
    books = query.offset(skip).limit(limit).all()

    return {"total": total_books, "books": books}
 """


@app.get("/books")
def get_books(
        page: int = 1,
        limit: int = 24,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        author: Optional[str] = None,
        publisher: Optional[str] = None,
        min_year: Optional[int] = None,
        db: Session = Depends(get_db)
):
    # 1. Her title için TEK bir temsilci id seç (örn: en küçük id -> ilk eklenen kayıt)
    # HIZLANDIRMA: Alt sorgu (subquery) yerine SQL group_by kullanıyoruz, çok daha hızlı!
    query = db.query(models.Book).group_by(models.Book.title)

    # EĞER KURYEDEN YAYINEVİ GELDİYSE FİLTRELE
    if publisher:
        # Veritabanında yayınevi isminin içinde bu kelime geçiyor mu diye bakar
        query = query.filter(models.Book.publisher.contains(publisher))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%") )
    if min_year:
        query = query.filter(models.Book.year >= min_year)

    # 2. Eğer arama kelimesi varsa zincire filtre ekle
    if search:
        query = query.filter(
            models.Book.title.ilike(f"%{search}%") | models.Book.author.ilike(f"%{search}%")
        )

    # 3. Eğer sıralama istenmişse zincire dizilim kuralını ekle
    if sort_by == "alphabetical":
        # HIZLANDIRMA: Özel fonksiyon yerine veritabanının kendi hızlı sıralamasını kullanıyoruz
        query = query.order_by(func.akilli_sirala(models.Book.title).asc())

    elif sort_by == "popular":
        # HATA DÜZELTME: Oylara göre sıralamak için Rating tablosunu zincire bağlıyoruz (outerjoin)
        # KESİN ÇÖZÜM: Coalesce ile NULL (boş) değerleri 0.0 kabul ediyoruz.
        # Sıralama Zekası: Önce en yüksek puan (avg), puanlar eşitse en çok oy alan (count) öne gelir!
        query = query.outerjoin(models.Rating, models.Book.isbn == models.Rating.book_isbn) \
            .group_by(models.Book.isbn) \
            .order_by(
            func.coalesce(func.avg(models.Rating.score), 0.0).desc(),
            func.count(models.Rating.id).desc()
        )

    elif sort_by == "lowest":
        # Hiç oy almayan (NULL) kitapları 0.0 kabul et ve küçükten büyüğe (asc) sırala
        # Puanlar eşitse, en az oy alanlar yine en başta dursun
        query = query.outerjoin(models.Rating, models.Book.isbn == models.Rating.book_isbn) \
            .group_by(models.Book.isbn) \
            .order_by(
            func.coalesce(func.avg(models.Rating.score), 0.0).asc(),
            func.count(models.Rating.id).asc()
        )

    elif sort_by == "newest":
        query = query.filter(models.Book.year>0).order_by(models.Book.year.desc())
    elif sort_by == "oldest":
        query = query.filter(models.Book.year>0).order_by(models.Book.year.asc())

    skip = (page - 1) * limit
    total_books = query.count()

    # 4. En son zincire sayfalamayı (offset/limit) ekle ve tümünü getir
    books = query.offset(skip).limit(limit).all()
    result_books = []
    for book in books:
        # Bu kitaba ait tüm oyların ortalamasını çekiyoruz
        avg_score = db.query(func.avg(models.Rating.score)).filter(models.Rating.book_isbn == book.isbn).scalar()

        # Kitabı React'in okuyabileceği bir sözlüğe (dictionary) çeviriyoruz
        book_data = book.__dict__.copy()
        book_data.pop("_sa_instance_state", None)  # SQLAlchemy'nin arka plan kodunu temizliyoruz

        # Eğer oy varsa yuvarla (örn: 4.3), hiç oy yoksa 0.0 yap
        book_data["rating"] = round(avg_score, 1) if avg_score else 0.0

        result_books.append(book_data)

    return {"total": total_books, "books": result_books}


@app.post("/rate", status_code=status.HTTP_201_CREATED)
def rate_book(rating: schemas.RatingCreate, user_id: int, db: Session = Depends(get_db)): #Bu fonksiyona girmeden önce git get_db fonksiyonuna BAĞIMLI (Depends) ol. Önce onu çalıştır, oradan çıkan sonucu alıp bana getir
    #  Böyle bir kitap gerçekten var mı?
    db_book = db.query(models.Book).filter(models.Book.isbn == rating.book_isbn).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

    #Kullanıcı daha önce bu kitaba puan vermiş mi? (Unique kontrolü)
    existing_rating = db.query(models.Rating).filter(
        models.Rating.user_id == user_id,
        models.Rating.book_isbn == rating.book_isbn ).first()

    if existing_rating:
        # Eğer zaten puan vermişse, eski puanı ve yorumu güncelliyoruz (Clean data mantığı)
        existing_rating.score = rating.score
        existing_rating.comments = rating.comments
        db.commit()
        return {"message": "Rating updated successfully!"}

    # Eğer ilk defa puan veriyorsa yeni satır oluşturuyoruz
    new_rating = models.Rating(
        user_id=user_id,
        book_isbn=rating.book_isbn,
        score=rating.score,
        comments=rating.comments
    )
    db.add(new_rating)
    db.commit()
    return {"message": "Rating saved successfully!"}

@app.delete("/rate", status_code=status.HTTP_204_NO_CONTENT)
def delete_rating(user_id: int, book_isbn: str, db: Session = Depends(get_db)):
    rating_to_delete = db.query(models.Rating).filter(
        models.Rating.user_id == user_id,
        models.Rating.book_isbn == book_isbn  ).first()
    if not rating_to_delete:
        raise HTTPException(status_code=404, detail="there is no rating with that isbn.")

    # Kaydı sil ve onayla
    db.delete(rating_to_delete)
    db.commit()
    return {"message": "score deleted successfully!."}


@app.delete("/books/{isbn}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(isbn: str, db: Session = Depends(get_db)):
    # 1.  silinecek kitap var mı diye kontrol et
    book = db.query(models.Book).filter(models.Book.isbn == isbn).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found.")

    # 2. Önce o kitaba ait tüm puanları ve yorumları sil veritabanı bütünlüğü için şart

    db.query(models.Rating).filter(models.Rating.book_isbn == isbn).delete()


    db.delete(book)


    db.commit()

    return {"message": "Book deleted successfully!."}


@app.post("/rate", status_code=status.HTTP_200_OK) # post veritabanına yepyeni veriler kaydediyor
def create_or_update_rating(rating: schemas.RatingCreate, user_id: int, db: Session = Depends(get_db)):
    # 1. Adım: Kullanıcının bu kitaba daha önceden verdiği bir kayıt var mı diye veritabanına bak
    existing_rating = db.query(models.Rating).filter(
        models.Rating.user_id == user_id,
        models.Rating.book_isbn == rating.book_isbn
    ).first()

    if existing_rating:
        # Kayıt VARSA: Eski değerleri yeni gelen değerlerle GÜNCELLE
        existing_rating.score = rating.score
        existing_rating.comments = rating.comments
        db.commit()
        return {"message": "Rating updated successfully!"}
    else:
        #  Kayıt YOKSA: Veritabanına yepyeni bir puan/yorum EKLİYORUZ
        new_rating = models.Rating(
            user_id=user_id,
            book_isbn=rating.book_isbn,
            score=rating.score,
            comments=rating.comments
        )
        db.add(new_rating)
        db.commit()
        return {"message": "Rating saved successfully!"}

@app.put("/books/{isbn}", response_model=schemas.BookResponse)
def update_book(isbn: str, book_data: schemas.BookUpdate, db: Session = Depends(get_db)): # depends demek get db çalışmadan çalışmaz ona bağlı ordan taze bi database alıp otomatik yerleştirim sonra çalışsın demek
    db_book = db.query(models.Book).filter(models.Book.isbn == isbn).first()

    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found.")

    update_data = book_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_book, key, value)

    db.commit()
    db.refresh(db_book)
    return db_book

@app.get("/my-ratings")
def get_user_ratings(user_id: int, db: Session = Depends(get_db)):
    results = db.query(models.Rating, models.Book).join(models.Book,models.Rating.book_isbn==models.Book.isbn).filter(models.Rating.user_id == user_id).order_by(models.Rating.score.desc()).all()
    formatted_ratings = []
    for rating, book in results:
        formatted_ratings.append({
            "isbn": book.isbn,
            "title": book.title,
            "image_url": book.image_url,
            "score": rating.score,
            "comments": rating.comments
        })

    return{"ratings": formatted_ratings}







@app.get("/authors")
def get_all_authors(page: int = 1, limit: int = 30, db: Session = Depends(get_db)):
    # Kaç tane yazar atlayacağını hesapla (offset)
    skip = (page - 1) * limit

    authors = db.query(models.Book.author) \
        .filter(
        models.Book.author.isnot(None),
        models.Book.author != "Not Applicable (Na )"
    ) \
        .group_by(models.Book.author) \
        .order_by(models.Book.author.asc()) \
        .offset(skip) \
        .limit(limit) \
        .all()

    # Temiz bir listeye çeviriyoruz
    author_list = [a[0] for a in authors if a[0] and str(a[0]).strip() != ""]

    return {"authors": author_list}


@app.get("/publishers")
def get_top_publishers(db: Session = Depends(get_db)):
    # Veritabanında publisher bilgisi dolu olanları al, en çok kitabı olana göre sırala ve ilk 100'ü getir
    publishers = db.query(models.Book.publisher) \
        .filter(
        models.Book.publisher.isnot(None),
        models.Book.publisher != ""
    ) \
        .group_by(models.Book.publisher) \
        .order_by(func.count(models.Book.publisher).desc()) \
        .limit(800) \
        .all()

    # Temiz bir listeye çeviriyoruz
    pub_list = [p[0] for p in publishers if p[0] and str(p[0]).strip() != ""]
    return {"publishers": pub_list} #json formatında frontende gönderiyor
    #p0 her verinin ilk elemamnını alır eğer boş veriyse çöpe atıyor strip sağdaki soldaki boşlukları kırpar


@app.put("/users/{user_id}/username", status_code=status.HTTP_200_OK)
def update_username(user_id: int, data: schemas.UsernameUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Yeni ismin başka biri tarafından kullanılıp kullanılmadığını kontrol et
    name_check = db.query(models.User).filter(models.User.username == data.new_username).first()
    if name_check:
        raise HTTPException(status_code=400, detail="Username already exists.")

    user.username = data.new_username
    db.commit()
    return {"message": "Username updated succesfully.", "new_username": user.username}


@app.put("/users/{user_id}/password", status_code=status.HTTP_200_OK) # put olan bir veriyi güncellemek için
def update_password(user_id: int, data: schemas.PasswordUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    #  şifreler hash'li tutulur burada düz metin karşılaştırması yapıyoruz
    if user.password != data.current_password:
        raise HTTPException(status_code=401, detail="Current password doesn't match.")

    user.password = data.new_password
    db.commit()
    return {"message": "Password updated succesfully."}

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    #  kullanıcının verdiği tüm oyları ve yorumları sil (Veritabanı bütünlüğü için)
    db.query(models.Rating).filter(models.Rating.user_id == user_id).delete()


    db.delete(user)


    db.commit()
    return {"message": "Acount deleted succesfully and permanently."}


  # Bunu en üste import kısmına ekleyebilirsin veya burada kalabilir sorun olmaz

import re


@app.get("/suggestions")
def get_suggestions(
        user_id: int,
        search_query: Optional[str] = None,
        limit: int = 25,  # LİMİT KESİN OLARAK 25'E SABİTLENDİ
        db: Session = Depends(get_db)
):
    # 1. Bütün kitapları çek
    all_books = db.query(models.Book).group_by(models.Book.title).all()
    if not all_books:
        return {"suggestions": [], "message": "No books in the database."}

    # 2. Makine Öğrenmesi Veri Hazırlığı
    book_texts = []
    isbn_list = []
    book_dict = {}

    for b in all_books:
        title = b.title or ""
        author = b.author or ""
        publisher = b.publisher or ""
        book_texts.append(f"{title} {author} {publisher}".lower())
        isbn_list.append(b.isbn)
        book_dict[b.isbn] = b

    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(book_texts)
    except ValueError:
        return {"suggestions": [], "message": "Not enough text data to process."}

    target_indices = []
    already_rated_isbns = set()
    seen_clean_titles = set()  # YENİ: Kopya Takip Listesi

    if search_query:
        search_text = search_query.lower()
        search_vector = vectorizer.transform([search_text])
        sim_scores = cosine_similarity(search_vector, tfidf_matrix).flatten()
        best_match_idx = sim_scores.argmax()
        if sim_scores[best_match_idx] > 0.1:
            target_indices.append(best_match_idx)
    else:
        user_favorites = db.query(models.Rating).filter(models.Rating.user_id == user_id,
                                                        models.Rating.score >= 4).all()
        for fav in user_favorites:
            already_rated_isbns.add(fav.book_isbn)
            if fav.book_isbn in isbn_list:
                idx = isbn_list.index(fav.book_isbn)
                target_indices.append(idx)
                raw_title = book_dict[fav.book_isbn].title
                seen_clean_titles.add(normalize_title(raw_title))  # Okuduğun kitapları 'görüldü' olarak işaretle

    if not target_indices:
        return {"suggestions": [],
                "message": "Please rate a few books 4 or 5 stars so we can recommend something for you! 🌟"}

    # 4. Kosinüs Benzerliği
    target_vectors = tfidf_matrix[target_indices]
    user_profile_vector = np.asarray(target_vectors.mean(axis=0))
    cosine_sim = cosine_similarity(user_profile_vector, tfidf_matrix).flatten()
    similar_indices = cosine_sim.argsort()[::-1]

    # 5. KİTAP SEÇİMİ VE KESİN KOPYA ENGELLEME
    recommended_books = []
    for idx in similar_indices:
        match_isbn = isbn_list[idx]
        if match_isbn in already_rated_isbns:
            continue

        b = book_dict[match_isbn]

        # Kitabın kök adını bul
        suggested_clean_title = normalize_title(b.title)

        # Eğer bu kök isim kullanıcının okuduklarında VEYA şu anki 25'lik listede varsa atla!
        if suggested_clean_title in seen_clean_titles:
            continue

        # Yoksa listeye ekle ve bu ismi bir daha çıkmaması için 'görüldü' listesine at
        seen_clean_titles.add(suggested_clean_title)

        avg_score = db.query(func.avg(models.Rating.score)).filter(models.Rating.book_isbn == b.isbn).scalar()
        book_data = b.__dict__.copy()
        book_data.pop("_sa_instance_state", None)
        book_data["rating"] = round(avg_score, 1) if avg_score else 0.0

        recommended_books.append(book_data)
        if len(recommended_books) == limit:
            break

    top_suggestions = recommended_books

    # === 6. YAPAY ZEKA: 25 KİTABIN TAMAMINA YORUM ===
    try:
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        fav_books = list(seen_clean_titles)[:3]
        suggested_info = [b['title'] for b in top_suggestions]

        # PROMPT 25 kitap için özelleştirildi ve cümlelerin kısa olması tembihlendi
        prompt = f"""
        We are recommending exactly {len(top_suggestions)} new books to a user.
        User likes: {', '.join(fav_books) if fav_books else 'Adventure and fiction'}
        Recommended Books: {', '.join(suggested_info)}

        Write a very short, 1-sentence engaging comment in ENGLISH for EVERY SINGLE BOOK in the recommended list.
        Respond ONLY in JSON format.
        {{
            "{suggested_info[0] if suggested_info else 'Book1'}": "Short English comment...",
            "{suggested_info[1] if len(suggested_info) > 1 else 'Book2'}": "Short English comment..."
        }}
        """

        list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        list_response = requests.get(list_url)

        if list_response.status_code == 200:
            models_data = list_response.json().get("models", [])
            gemini_modelleri = [
                m['name'] for m in models_data
                if 'gemini' in m['name'].lower() and 'generateContent' in m.get('supportedGenerationMethods', [])
            ]
        else:
            gemini_modelleri = []

        raw_text = None

        headers = {'Content-Type': 'application/json'}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        for model_adi in gemini_modelleri:
            url = f"https://generativelanguage.googleapis.com/v1beta/{model_adi}:generateContent?key={api_key}"
            resp = requests.post(url, headers=headers, json=payload)

            if resp.status_code == 200:
                resp_data = resp.json()
                if 'candidates' in resp_data and len(resp_data['candidates']) > 0:
                    raw_text = resp_data['candidates'][0]['content']['parts'][0]['text'].strip()
                    break

        if raw_text:
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match:
                ai_comments = json.loads(match.group(0))
            else:
                ai_comments = json.loads(raw_text)
        else:
            ai_comments = {}

        # Gelen 25 yorumu kitaplara eşle
        for b in top_suggestions:
            comment = ai_comments.get(b['title'])
            if not comment:
                for key, val in ai_comments.items():
                    if key.lower() in b['title'].lower() or b['title'].lower() in key.lower():
                        comment = val
                        break
            b['ai_comment'] = comment if comment else "✨ A perfect addition to your reading list!"

    except Exception as e:
        print(f"GEMINI DİNAMİK API HATASI: {e}")
        for b in top_suggestions:
            b['ai_comment'] = "✨ A perfect addition to your reading list!"

    return {"suggestions": top_suggestions, "message": "Success"}


@app.get("/books/{isbn}/reviews")
def get_book_reviews(isbn: str, db: Session = Depends(get_db)):
    try:
        # Puanlar (Rating) ve Kullanıcılar (User) tablolarını birleştirerek veriyi çekiyoruz.
        # Sadece yorum (comments) kısmı boş olmayan değerlendirmeleri listeliyoruz.
        reviews_query = db.query(models.Rating, models.User) \
            .join(models.User, models.Rating.user_id == models.User.id) \
            .filter(
            models.Rating.book_isbn == isbn,
            models.Rating.comments != None,
            models.Rating.comments != ""
        ).all()

        reviews_data = []
        for rating, user in reviews_query:
            reviews_data.append({
                "username": user.username,
                "score": rating.score,
                "comments": rating.comments
            })

        return {"reviews": reviews_data}

    except Exception as e:
        print(f"Yorumları çekerken hata oluştu: {e}")
        return {"reviews": []}
# terminale uvicorn main:app --reload yazdım veriyi görmek  için