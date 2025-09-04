from typing import Optional

def paginate(queryset: list, page: int = 1, page_size: int = 20):
    total = len(queryset)
    start = (page - 1) * page_size
    end = start + page_size
    data = queryset[start:end]
    return {
        "data": data,
        "meta": {"total": total, "page": page, "page_size": page_size}
    }
