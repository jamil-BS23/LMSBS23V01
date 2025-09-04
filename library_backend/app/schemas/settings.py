from pydantic import BaseModel, Field


class SettingsBase(BaseModel):
    borrow_day_limit: int
    borrow_day_extension_limit: int
    borrow_max_limit: int


class SettingsUpdate(BaseModel):
    borrow_day_limit: int = None
    borrow_day_extension_limit: int = None
    borrow_max_limit: int = None


class SettingsResponse(SettingsBase):
    class Config:
        orm_mode = True
