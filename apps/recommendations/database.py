import uuid
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import String, UUID, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
load_dotenv()

url = os.environ['DATABASE_URL']

engine = create_engine(url)
Base = declarative_base()
class Post(Base):
    __tablename__ = 'posts'

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, unique=True, nullable=False)

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()