from sqlalchemy import Column, String, Integer, \
    ForeignKey  # tablo sütünu oluşturmak için column içine yazı ve tam sayı yazmak için string integer
from database import Base
from sqlalchemy.orm import relationship


class Book(Base): # book nesnesini oluşturdum ama bunu veritabanıma kaydetmek için basei miras aldım
    __tablename__ = "books" # sqliteda books adında bir tablo oluştur demek
    isbn = Column(String, primary_key=True, index=True) #primarykey için her kitabın isbn no farklı olucak index true olmazsa sistem 400000 kitap varsa tek tek bakıp kitabı arar string seçtim nolardaki en baştaki 0ları korumak için
    title = Column(String, index=True)
    author = Column(String, index=True)
    year = Column(String, index=True)  #excel dosyasında birüsür karışık veri var bazılarının yerleri kaymış
    publisher = Column(String, index=True)
#en çok arama yapılabilecek durumlar isim ve isbn  o yüzden sadece onlara index atadım arka planda çok yer kaplıyor
    image_url = Column(String)
    genre= Column(String, nullable=True) #kaggle verisinde genre yok oy üzden boş atadık
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

    ratings = relationship("Rating", back_populates="owner")
class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) #foreign key user ismini değilde direkt numarasını işaret eder daha az yer kaplar
    book_isbn = Column(String, ForeignKey("books.isbn"))
    score = Column(Integer)
    comments = Column(String)
    owner = relationship("User", back_populates="ratings")