from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
#reactten gelen verinin yapısını belirlememiz lazım o yüzden pydantic kullandık
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=15, description="User's username must contain at least 3 characters")
    password: str = Field(..., min_length=6, max_length=20, description="User's password must contain at least 6 characters")

class UserResponse(BaseModel):
    id: int
    username: str

    model_config = ConfigDict(from_attributes=True) # sqlalchemy objesini pydantic formatına çevirir

class RatingCreate(BaseModel):
    book_isbn: str
    score: int = Field(..., ge=1, le=5, description="The score of the book must be between 1 and 5")
    comments: Optional[str] = None

class BookResponse(BaseModel):
    isbn: str
    title: str
    author: str
    publisher: str
    year: str
    image_url: str
    genre: Optional[str] = None
    rating: float = 0.0

    model_config = ConfigDict(from_attributes=True) #frontendin anlicağı json formatına çeviriyo

class MyRatingResponse(BaseModel):
    id: int
    score: int
    comments: Optional[str] = None
    book_isbn: str
    book: BookResponse #puanlalan kitabın detayları
    model_config = ConfigDict(from_attributes=True)

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    year: Optional[str] = None
    publisher: Optional[str] = None
    image_url: Optional[str] = None
    genre: Optional[str] = None

class UsernameUpdate(BaseModel):
    new_username: str = Field(..., min_length=3, max_length=15, description="New username must contain at least 3 characters")

class PasswordUpdate(BaseModel):
    current_password: str = Field(..., description="The user's current password to verify their identity.")
    new_password: str = Field(..., min_length=6, max_length=20, description="New password must contain at least 6 characters")