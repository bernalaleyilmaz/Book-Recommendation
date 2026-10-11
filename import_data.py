import pandas as pd
from database import engine, Base
from models import Book

print("creating database...")
#Base.metadata.drop_all(bind=engine) # bu eski kitapları  hatalıtabloları falan hepsini siler kitapları güncellicekken kullanıcı verileri falanda gitti öyle istemiyoruz
Book.__table__.drop(bind=engine, checkfirst=True)
Book.__table__.create(bind=engine, checkfirst=True)
Base.metadata.create_all(bind=engine)

print("reading kaggle csv folder with pandas")
# pandas bazen belleği yormamak için dosyayı bölüp öyle okur hemen okumasını istiyoruz o yüzden false
df = pd.read_csv('books.csv', sep=',', encoding='latin-1',  escapechar='\\', on_bad_lines='skip', low_memory=False)

print("columns name is being made suitable")
df_to_insert = df[['ISBN', 'Book-Title', 'Book-Author', 'Year-Of-Publication', 'Publisher', 'Image-URL-M']].copy()
df_to_insert.rename(columns={
    'ISBN': 'isbn',
    'Book-Title': 'title',
    'Book-Author': 'author',
    'Year-Of-Publication': 'year',
    'Publisher': 'publisher',
    'Image-URL-M': 'image_url'
}, inplace=True)

print("cleaning data aggressively...")
# hatalı satırları silip sağlam kitapları alıp kalite kontrol yap
df_to_insert.dropna(subset=['isbn', 'title'], inplace=True)


df_to_insert['isbn'] = df_to_insert['isbn'].astype(str).str.strip() # str strip metinlerin kenarlarındaki boşlukları yok eder
df_to_insert = df_to_insert.drop_duplicates(subset=['isbn'], keep='first')
# DÜZELTME 2: KORUMA KALKANI (Type Coercion)
# Yıl sütunundaki her şeyi zorla sayıya çevir (errors='coerce').
# Eğer sayıya çevrilemeyen bir metin (Yayınevi vs.) denk gelirse onu NaN (boş) yap, sonra o boşlukları 0 ile doldur.
df_to_insert['year'] = pd.to_numeric(df_to_insert['year'], errors='coerce').fillna(0).astype(int)
print("books are being saved (it takes a while)...")
# Tüm DataFrame'i tek satırda SQL veritabanına basıyoruz!
# con engine hedefe giden köprü indexleri kaydetmeyelim zaten isbn no var eğer varsa(if exist) altına ekle
try:
    df_to_insert.to_sql('books', con=engine, if_exists='append', index=False, chunksize=1000) #chunks verileri 1000 lik paketler halinde yavaş gönderir hepsini sql motoruna sokup kilitleme yaşamamak için
    print("🎉 congrats all books are transferred on SQLite database")
except Exception as e:
    print(f" error occured during transfer: {e}")