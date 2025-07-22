# backend/apps/api/utils/serializers.py
"""
Utility функції для серіалізаторів API
"""
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class SerializerMixin:
    """Mixin з корисними методами для серіалізаторів"""
    
    def get_localized_field(self, obj, field_name, language=None):
        """
        Отримує локалізоване поле
        Спочатку шукає поле з суфіксом мови, потім базове поле
        """
        if not language:
            language = getattr(self.context.get('request'), 'LANGUAGE_CODE', 'uk')
        
        # Спробуємо отримати локалізоване поле
        localized_field = f"{field_name}_{language}"
        if hasattr(obj, localized_field):
            value = getattr(obj, localized_field, None)
            if value:
                return value
        
        # Якщо локалізованого поля немає, повертаємо базове
        return getattr(obj, field_name, '')
    
    def get_absolute_url(self, obj, field_name):
        """Отримує абсолютний URL для медіа файлу"""
        field_value = getattr(obj, field_name, None)
        if field_value:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(field_value.url)
            return field_value.url
        return None
    
    def get_cached_count(self, cache_key, queryset_func, timeout=60*15):
        """Отримує кількість з кешу або обчислює і кешує"""
        count = cache.get(cache_key)
        if count is None:
            count = queryset_func().count()
            cache.set(cache_key, count, timeout)
        return count


class ImageSerializerMixin:
    """Mixin для роботи з зображеннями"""
    
    def get_image_urls(self, obj, field_name):
        """
        Повертає різні розміри зображення
        """
        field_value = getattr(obj, field_name, None)
        if not field_value:
            return {
                'original': None,
                'thumbnail': None,
                'medium': None,
                'large': None
            }
        
        request = self.context.get('request')
        base_url = request.build_absolute_uri('/') if request else ''
        
        return {
            'original': f"{base_url}{field_value.url}",
            'thumbnail': f"{base_url}{field_value.url}",  # TODO: Add thumbnail logic
            'medium': f"{base_url}{field_value.url}",     # TODO: Add medium size logic
            'large': f"{base_url}{field_value.url}"       # TODO: Add large size logic
        }


class MetaFieldsMixin:
    """Mixin для SEO метаданих"""
    
    def get_meta_data(self, obj):
        """Повертає SEO метадані"""
        return {
            'title': getattr(obj, 'meta_title', '') or getattr(obj, 'title', '') or getattr(obj, 'name', ''),
            'description': getattr(obj, 'meta_description', '') or getattr(obj, 'short_description', ''),
            'keywords': getattr(obj, 'meta_keywords', ''),
            'canonical_url': getattr(obj, 'get_absolute_url', lambda: '')(),
        }


class StatsMixin:
    """Mixin для статистики"""
    
    def get_engagement_stats(self, obj):
        """Повертає статистику залученості"""
        stats = {
            'views': 0,
            'likes': 0,
            'shares': 0,
            'comments': 0
        }
        
        # TODO: Додати логіку підрахунку статистики
        return stats


def validate_image_file(image):
    """Валідація зображення"""
    if not image:
        return True
    
    # Перевірка розміру файлу (максимум 5MB)
    if image.size > 5 * 1024 * 1024:
        from rest_framework import serializers
        raise serializers.ValidationError("Розмір зображення не повинен перевищувати 5MB")
    
    # Перевірка типу файлу
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    if hasattr(image, 'content_type') and image.content_type not in allowed_types:
        from rest_framework import serializers
        raise serializers.ValidationError("Дозволені тільки JPEG, PNG та WebP зображення")
    
    return True


def validate_phone_number(phone):
    """Валідація номера телефону"""
    import re
    
    if not phone:
        return phone
    
    # Прибираємо всі символи крім цифр та +
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    # Перевіряємо формат українського номера
    ukraine_pattern = r'^(\+380|380|0)[0-9]{9}$'
    if not re.match(ukraine_pattern, cleaned):
        from rest_framework import serializers
        raise serializers.ValidationError("Некоректний формат номера телефону")
    
    return cleaned


def validate_email_domain(email):
    """Валідація домену email"""
    if not email:
        return email
    
    # Список заборонених доменів (спам)
    blocked_domains = [
        'tempmail.org',
        '10minutemail.com',
        'guerrillamail.com'
    ]
    
    domain = email.split('@')[-1].lower()
    if domain in blocked_domains:
        from rest_framework import serializers
        raise serializers.ValidationError("Використання тимчасових email адрес заборонено")
    
    return email


class TimestampedSerializerMixin:
    """Mixin для форматування дат"""
    
    def get_formatted_date(self, obj, field_name, format_string='%d.%m.%Y'):
        """Форматує дату у потрібному форматі"""
        date_value = getattr(obj, field_name, None)
        if date_value:
            return date_value.strftime(format_string)
        return None
    
    def get_relative_time(self, obj, field_name):
        """Повертає відносний час (наприклад, "2 години тому")"""
        date_value = getattr(obj, field_name, None)
        if not date_value:
            return None
        
        now = timezone.now()
        diff = now - date_value
        
        if diff.days > 0:
            return f"{diff.days} дн. тому"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} год. тому"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} хв. тому"
        else:
            return "щойно"


class CacheKeyGenerator:
    """Генератор ключів для кешування"""
    
    @staticmethod
    def generate_list_key(model_name, filters=None, language='uk'):
        """Генерує ключ для списку об'єктів"""
        base_key = f"api_{model_name.lower()}_list_{language}"
        if filters:
            filter_string = "_".join([f"{k}_{v}" for k, v in sorted(filters.items())])
            base_key += f"_{filter_string}"
        return base_key
    
    @staticmethod
    def generate_detail_key(model_name, obj_id, language='uk'):
        """Генерує ключ для детального об'єкта"""
        return f"api_{model_name.lower()}_detail_{obj_id}_{language}"
    
    @staticmethod
    def generate_stats_key(model_name):
        """Генерує ключ для статистики"""
        return f"api_{model_name.lower()}_stats"


class APIResponseFormatter:
    """Форматування відповідей API"""
    
    @staticmethod
    def success_response(data, message="Операція виконана успішно", meta=None):
        """Форматує успішну відповідь"""
        response = {
            'success': True,
            'message': message,
            'data': data
        }
        
        if meta:
            response['meta'] = meta
        
        return response
    
    @staticmethod
    def error_response(error, message="Виникла помилка", code=None):
        """Форматує помилку"""
        response = {
            'success': False,
            'error': error,
            'message': message
        }
        
        if code:
            response['code'] = code
        
        return response
    
    @staticmethod
    def paginated_response(data, pagination_info):
        """Форматує пагіновану відповідь"""
        return {
            'success': True,
            'data': data,
            'pagination': {
                'count': pagination_info.get('count', 0),
                'next': pagination_info.get('next'),
                'previous': pagination_info.get('previous'),
                'page_size': pagination_info.get('page_size', 20),
                'current_page': pagination_info.get('current_page', 1),
                'total_pages': pagination_info.get('total_pages', 1)
            }
        }


# Константи для серіалізаторів
COMMON_EXCLUDE_FIELDS = ['created_at', 'updated_at', 'is_active']
IMAGE_FIELDS = ['main_image', 'hero_image', 'photo', 'image']
TRANSLATABLE_FIELDS = ['title', 'name', 'description', 'short_description']

# Налаштування кешування для серіалізаторів
SERIALIZER_CACHE_TIMEOUTS = {
    'homepage': 60 * 15,      # 15 хвилин
    'services': 60 * 20,      # 20 хвилин
    'projects': 60 * 25,      # 25 хвилин
    'jobs': 60 * 10,          # 10 хвилин
    'offices': 60 * 60,       # 1 година
    'translations': 60 * 30,  # 30 хвилин
}