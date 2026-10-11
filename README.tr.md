# Book Recommendation

[English](README.md) | [Türkçe](README.tr.md)

Staj sürecinde geliştirdiğim; kitap keşfetme, puanlama ve kişiselleştirilmiş kitap önerileri sunan bir full-stack web uygulaması. React arayüzü, FastAPI üzerinden SQLite veritabanıyla iletişim kurar. Kitap önerileri TF-IDF ve kosinüs benzerliğiyle hesaplanır; isteğe bağlı Gemini entegrasyonu önerilen kitaplara kısa İngilizce açıklamalar ekler.

## Özellikler

- Kullanıcı kaydı, giriş, kullanıcı adı ve şifre güncelleme, hesap silme.
- Kitap adı veya yazara göre arama; yazar, yayınevi ve minimum yıl filtreleri.
- Sayfalama; alfabetik, puan ve yayın yılına göre sıralama.
- Kitaplara 1–5 yıldız verme, yorum yazma, değerlendirmeleri güncelleme ve silme.
- Kişisel değerlendirmeleri ve kitaplara ait kullanıcı yorumlarını görüntüleme.
- Yüksek puan verilen kitaplara veya arama metnine göre kitap önerileri.
- Açık/koyu tema ve video arka planlı giriş ekranı.

## Ekran görüntüleri

Giriş, kitap kataloğu, öneriler ve değerlendirmeler ekranlarının görüntüleri bu bölüme eklenebilir. Henüz gerçek ekran görüntüleri eklenmemiştir; iki dildeki README aynı görsel dosyalarını kullanır. [Görsel ekleme rehberi](docs/screenshots/README.md) dosya adlarını ve hazır Markdown satırlarını içerir.

<!-- Görselleri docs/screenshots/ klasörüne ekledikten sonra aşağıdaki bloğun yorum işaretlerini kaldırın.
### Giriş ekranı
![Giriş ve kayıt ekranı](docs/screenshots/login.png)

### Kitap kataloğu
![Kitap kataloğu ve filtreler](docs/screenshots/catalog.png)

### Kitap önerileri
![Kişiselleştirilmiş kitap önerileri](docs/screenshots/recommendations.png)

### Değerlendirmelerim
![Kullanıcının puanları ve yorumları](docs/screenshots/my-ratings.png)
-->

## Teknolojiler

| Katman | Kullanılan teknolojiler |
| --- | --- |
| Arayüz | React 19, React Router, Vite 8, JavaScript, CSS, Axios / Fetch |
| API | Python, FastAPI, Pydantic |
| Veri | SQLite, SQLAlchemy, Pandas |
| Öneri sistemi | scikit-learn, TF-IDF, kosinüs benzerliği, NumPy |
| İsteğe bağlı açıklamalar | Google Gemini API |
| Parola saklama | Passlib, bcrypt |
| Test | pytest, FastAPI TestClient |

## Yerel kurulum

Komutlar Windows PowerShell içindir. Proje klasöründe bir terminal açın ve her komutu ayrı satırda çalıştırın. Python bağımlılıkları Python 3.14 kullanılan mevcut geliştirme ortamındaki sürümlerle sabitlenmiştir. Frontend derlemesi Node.js 24.18.0 ile kontrol edilmiştir.

### 1. Backend bağımlılıkları

```powershell
$env:PYTHONUTF8 = "1"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
```

### 2. Kitap verilerini hazırlama

Gerçek veritabanı ve tam veri seti depoya dahil değildir. Hızlı deneme için altı kurmaca kitap içeren örnek veri dosyasını kullanabilirsiniz. Bu kayıtlar gerçek kitap bilgisi veya gerçek ISBN içermez; kapak alanları boştur.

```powershell
$env:PYTHONUTF8 = "1"
Copy-Item data/books.example.csv books.csv
.\.venv\Scripts\python.exe import_data.py
```

Kendi veri setinizle çalışmak için orijinal projenizdeki `Books.csv` dosyasını bu projenin köküne `books.csv` adıyla kopyalayın ve aktarımı çalıştırın. Dosya adının küçük harfle yazılması Linux ortamları için önemlidir. İçe aktarıcı şu sütunları bekler:

```text
ISBN, Book-Title, Book-Author, Year-Of-Publication, Publisher, Image-URL-M
```

CSV virgülle ayrılmış olmalıdır; mevcut içe aktarıcı `latin-1` kodlaması kullanır. `import_data.py` her çalıştırıldığında kitap tablosunu silip yeniden oluşturur. İlk kurulumda çalıştırın; mevcut kitap ve değerlendirme ilişkilerini korumak istiyorsanız yeniden çalıştırmadan önce veritabanınızı yedekleyin.

### 3. Backend'i başlatma

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

- API: http://127.0.0.1:8000
- Etkileşimli API dokümantasyonu: http://127.0.0.1:8000/docs

Gemini açıklamalarını etkinleştirmek isterseniz sunucuyu başlatmadan önce aynı terminalde kendi anahtarınızı tanımlayın:

```powershell
$env:GEMINI_API_KEY = "KENDI_API_ANAHTARINIZ"
```

Tırnakları koruyun, yer tutucuyu kendi anahtarınızla değiştirin ve Enter’a basın. Ardından aşağıdaki komutu ayrı olarak çalıştırın:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Sunucu zaten çalışıyorsa önce `Ctrl+C` ile durdurun, değişkeni tanımlayın ve yeniden başlatın. API anahtarını depoya eklemeyin.

Anahtar verilmediğinde yerel öneri sistemi çalışır ve kitaplara varsayılan açıklamalar eklenir. `.env.example` yalnızca değişken adını gösterir; uygulama `.env` dosyasını otomatik yüklemez. Gemini etkin olduğunda seçilen kitap adları açıklama üretimi için Google API'sine gönderilir.

### 4. Frontend'i başlatma

İkinci terminalde:

```powershell
cd frontend
npm ci
npm run dev
```

Terminalde gösterilen yerel adresi açın (varsayılan: http://localhost:5173). Arayüzde yeni hesap oluşturup giriş yapın. Frontend, backend'e `localhost:8000` ve `127.0.0.1:8000` üzerinden bağlanır.

Üretim derlemesi:

```powershell
npm run build
```

## Öneri sistemi nasıl çalışır?

1. Kitapların adı, yazarı ve yayınevi birleştirilerek metin özellikleri oluşturulur.
2. TF-IDF ile kitaplar sayısal vektörlere dönüştürülür.
3. Kullanıcının 4 veya 5 yıldız verdiği kitapların vektörleri ortalanır. Arama metni verilmişse bununla eşleşen kitap referans alınır.
4. Kosinüs benzerliğiyle yakın kitaplar sıralanır. Puanlara dayalı önerilerde yüksek puanlı referans kitaplar elenir; normalize edilmiş başlıklar da tekrarlanan önerileri azaltır.
5. Varsayılan olarak en fazla 25 öneri döner. Gemini yalnızca açıklama üretir; kitap sıralamasını yerel algoritma belirler.

## Proje yapısı

```text
BookRecommendation-GitHub/
├── README.md               # İngilizce dokümantasyon
├── README.tr.md            # Türkçe dokümantasyon
├── main.py                 # API uç noktaları ve öneri sistemi
├── database.py             # SQLite bağlantısı ve sıralama fonksiyonu
├── models.py               # Kitap, kullanıcı ve değerlendirme tabloları
├── schemas.py              # İstek ve yanıt şemaları
├── import_data.py          # CSV verilerini içe aktarma
├── check_db.py             # Veritabanı kontrolü
├── test_api.py             # Geliştirme sırasında kullanılan manuel test
├── tests/test_book.py      # Mevcut API testleri
├── requirements.txt
├── requirements-dev.txt
├── data/books.example.csv  # Küçük, kurmaca deneme verisi
├── docs/screenshots/       # README ekran görüntüleri
└── frontend/
    ├── src/                # React bileşenleri ve stiller
    ├── public/             # Video ve statik dosyalar
    └── package.json
```

## API özeti

| Metot | Yol | İşlev |
| --- | --- | --- |
| POST | `/register`, `/login` | Kayıt ve giriş |
| GET | `/books` | Arama, filtreleme ve sayfalama |
| GET | `/authors`, `/publishers` | Filtre seçenekleri |
| POST / DELETE | `/rate` | Puan ve yorum kaydetme / silme |
| GET | `/my-ratings` | Kullanıcının değerlendirmeleri |
| GET | `/books/{isbn}/reviews` | Kitabın yorumları |
| GET | `/suggestions` | Kişiselleştirilmiş öneriler |
| PUT / DELETE | `/books/{isbn}` | Kitap güncelleme / silme |
| PUT | `/users/{user_id}/username` | Kullanıcı adını değiştirme |
| PUT | `/users/{user_id}/password` | Parolayı değiştirme |
| DELETE | `/users/{user_id}` | Hesabı silme |

## Testler ve mevcut sınırlar

Proje kökünde mevcut testleri çalıştırın:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

Bu bir staj ve öğrenme projesidir. Kaynak kodda öğrenme sürecinde yazılan yorumlar korunmuştur.

- Giriş yanıtı kullanıcı bilgisi döndürür; token tabanlı oturum ve uç noktalarda kullanıcı yetkilendirmesi bulunmaz. Gerçek kullanıcılarla yayına almadan önce bu katman eklenmelidir.
- CORS ayarları yerel geliştirme için geniş tutulmuştur.
- Aynı `POST /rate` yolu iki kez tanımlıdır; mevcut kod korunmuştur.
- `test_api.py` eski kitap listesi yanıt biçimini bekler; güncel `/books` yanıtı bir `books` alanı içerdiğinden bu manuel betik güncelleme gerektirir. Yukarıdaki pytest komutu ayrı test dosyasını kullanır.
- TF-IDF matrisi öneri isteğinde yeniden oluşturulur; büyük veri setlerinde yanıt süresi artabilir.
- Tam kitap veri seti ve görsel/video varlıklarının kaynak ve kullanım izinleri ayrıca belgelenmelidir. Bu depo için bir lisans seçilmemiştir.

## Doğrulama notu

Hazırlanan kopyanın Vite üretim derlemesi tamamlandı. Örnek CSV'nin altı kaydı SQLite'a aktarıldı; kitap listeleme ve anahtarsız öneri üretme fonksiyonları doğrudan çağrılarak kontrol edildi. Mevcut pytest çalıştırması bu ortamda tamamlanmadı; testlerin geçtiği doğrulanamadı. Gemini'ye canlı istek ve tarayıcıdaki tüm kullanıcı akışları denenmedi.
