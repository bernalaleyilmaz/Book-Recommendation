from sqlalchemy import create_engine,event
import re
from sqlalchemy.orm import sessionmaker, declarative_base #session verileri kaydetmrk için declarative tablo için boş kağıt

# proje klasöründe books.db adında bir dosya oluşturacak)
SQLALCHEMY_DATABASE_URL = "sqlite:///./books.db"

# SQLite ile bağlantı kuracak motorumuz
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}) # aynı anda birden çok kullanıcı gelirse sistem hata vermesin diye false




# Mevcut engine tanımınız (Projenizdeki satır aynen kalsın, altına dinleyiciyi ekleyin)
# engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# === TÜM DİLLER İÇİN AKILLI SIRALAMA VE TAMİR MOTORU ===
import unicodedata
import re
from sqlalchemy import create_engine, event


# (Mevcut engine tanımın burada duruyor)

@event.listens_for(engine, "connect")
def sqlite_connect(dbapi_connection, connection_record):
    def universal_sort_key(text):
        if not text:
            # İsimsiz kitapları en sona at
            return "3_zzzz"

            # 1. MOJIBAKE TAMİRİ (Mevcut mantık)
        try:
            cleaned = text.encode('raw_unicode_escape').decode('utf-8').encode('latin-1').decode('utf-8')
        except Exception:
            try:
                cleaned = text.encode('latin-1').decode('utf-8')
            except Exception:
                cleaned = text

        # 2. AKSANLARI TEMİZLE VE KÜÇÜLT (Ü -> u, É -> e)
        normalized = "".join(
            c for c in unicodedata.normalize('NFKD', cleaned)
            if unicodedata.category(c) != 'Mn'
        ).lower()

        # 3. REGEX İLE KESİN TEMİZLİK: Sadece harf veya sayıyla başlayana kadar baştaki TÜM sembolleri siler
        # Örn: "-(The Book)" -> "the book"
        cleaned_text = re.sub(r'^[^a-z0-9]+', '', normalized)

        if not cleaned_text:
            return "3_zzzz"

        # 4. MÜHENDİSLİK HİLESİ
        # Eğer ilk karakter bir harf ise, başına "1_" ekle (En üstte çıkarlar)
        # Eğer ilk karakter bir sayı ise, başına "2_" ekle (Z harfinden sonra çıkarlar)
        if cleaned_text[0].isalpha():
            return "1_" + cleaned_text
        else:
            return "2_" + cleaned_text

    dbapi_connection.create_function("akilli_sirala", 1, universal_sort_key)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tabloları  oluştururken inheritance alacağımız temel sınıf
Base = declarative_base()