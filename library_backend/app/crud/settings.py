from sqlalchemy.ext.asyncio import AsyncSession
from app.models.settings import Settings
from app.schemas.settings import SettingsUpdate
from fastapi import HTTPException, status
from sqlalchemy import select


class SettingsCRUD:



    @staticmethod
    async def get_borrow_day_limit(db: AsyncSession):
        result = await db.execute(select(Settings.borrow_day_limit))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_settings(db: AsyncSession):
        result = await db.execute("SELECT * FROM settings LIMIT 1")
        return result.fetchone()

    @staticmethod
    async def update_settings(db: AsyncSession, settings_update: SettingsUpdate):
        result = await db.execute("SELECT * FROM settings LIMIT 1")
        settings = result.fetchone()
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found")

        update_data = settings_update.dict(exclude_unset=True)
        await db.execute(
            "UPDATE settings SET "
            + ", ".join([f"{key} = :{key}" for key in update_data.keys()])
            + " WHERE setting_id = :setting_id",
            {**update_data, "setting_id": settings.setting_id},
        )
        await db.commit()
        return await SettingsCRUD.get_settings(db)
