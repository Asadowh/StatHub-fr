# Backend Fixes Required for News Feature

This document contains the exact code changes needed in your FastAPI backend to fix two bugs:

1. **News/Comment Delete Problem** - Cascade delete comments when deleting news
2. **Category Not Showing** - Add category field to News model and endpoints

---

## 1. Fix News/Comment Delete Problem

### File: `routers/news.py` (or wherever your news router is)

**Find the DELETE endpoint:**
```python
@router.delete("/{news_id}")
async def delete_news(news_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # ... existing code ...
```

**Replace with:**
```python
@router.delete("/{news_id}")
async def delete_news(news_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete news")
    
    # Get the news item
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Delete all comments associated with this news item FIRST
    from models import Comment  # Adjust import path as needed
    db.query(Comment).filter(Comment.news_id == news_id).delete()
    
    # Then delete the news item
    db.delete(news)
    db.commit()
    
    return {"message": "News deleted successfully"}
```

**Important:** Make sure `Comment` model is imported at the top of the file:
```python
from models import Comment  # or wherever your Comment model is
```

---

## 2. Fix Category Not Showing

### Step 1: Update News Model

**File: `models.py` (or wherever your News model is)**

**Find the News class:**
```python
class News(Base):
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

**Add the category column:**
```python
class News(Base):
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    category = Column(String(50), nullable=True)  # ADD THIS LINE
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Step 2: Create Database Migration

**Run Alembic migration:**
```bash
alembic revision -m "add_category_to_news"
```

**Edit the migration file:**
```python
def upgrade():
    op.add_column('news', sa.Column('category', sa.String(length=50), nullable=True))

def downgrade():
    op.drop_column('news', 'category')
```

**Run migration:**
```bash
alembic upgrade head
```

### Step 3: Update Pydantic Schemas

**File: `schemas.py` (or wherever your schemas are)**

**Find NewsCreate schema:**
```python
class NewsCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
```

**Update to:**
```python
class NewsCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    category: Optional[str] = None  # ADD THIS LINE
```

**Find NewsResponse schema:**
```python
class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str]
    author_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
```

**Update to:**
```python
class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str]
    category: Optional[str] = None  # ADD THIS LINE
    author_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### Step 4: Update POST /news Endpoint

**File: `routers/news.py`**

**Find the POST endpoint:**
```python
@router.post("/", response_model=NewsResponse)
async def create_news(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ... existing code ...
```

**Update to accept category:**
```python
@router.post("/", response_model=NewsResponse)
async def create_news(
    title: str = Form(...),
    content: str = Form(...),
    category: Optional[str] = Form(None),  # ADD THIS LINE
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ... existing code to handle image ...
    
    # Create news item
    news = News(
        title=title,
        content=content,
        category=category if category and category.strip() else None,  # ADD THIS LINE
        author_id=current_user.id,
        image_url=image_url  # or however you handle image
    )
    
    db.add(news)
    db.commit()
    db.refresh(news)
    
    return news
```

### Step 5: Ensure GET /news Returns Category

**File: `routers/news.py`**

**Find the GET endpoint:**
```python
@router.get("/", response_model=List[NewsResponse])
async def get_all_news(db: Session = Depends(get_db)):
    news = db.query(News).all()
    return news
```

**This should already work if NewsResponse includes category**, but verify the response_model includes `category`.

---

## Summary of Changes

### Backend Files to Modify:

1. **`models.py`** - Add `category = Column(String(50), nullable=True)` to News model
2. **`schemas.py`** - Add `category: Optional[str] = None` to NewsCreate and NewsResponse
3. **`routers/news.py`** - 
   - Update DELETE endpoint to delete comments first
   - Update POST endpoint to accept `category` from Form data
   - Ensure GET endpoint uses NewsResponse schema (which includes category)
4. **Database Migration** - Add category column to news table

### Frontend Files Already Fixed:

1. **`src/pages/CreatePost.tsx`** - Now always sends category in FormData
2. **`src/components/NewsFeed.tsx`** - Now uses actual category from API instead of hardcoded "Team News"

---

## Testing

After making these changes:

1. **Test Delete:**
   - Create a news post with comments
   - Delete the post as admin
   - Should delete without foreign key error
   - Comments should be deleted automatically

2. **Test Category:**
   - Create a news post with a category selected
   - Verify category appears on news feed
   - Verify category appears on full post view
   - Verify category badge styling works correctly

---

## Notes

- Make sure to run database migration after adding the category column
- The frontend already sends category in FormData, so once backend accepts it, it should work
- The cascade delete ensures no orphaned comments remain in the database



