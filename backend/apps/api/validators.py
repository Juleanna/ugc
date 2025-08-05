"""
Система валідації для API
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re
from PIL import Image
import io

def validate_phone_number(value):
    """Валідація телефонного номера"""
    pattern = r'^\+?1?\d{9,15}$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Невірний формат телефону. Використовуйте формат: +380123456789'),
            code='invalid_phone'
        )

def validate_email_domain(value):
    """Валідація домену email"""
    blocked_domains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com']
    domain = value.split('@')[-1].lower()
    if domain in blocked_domains:
        raise ValidationError(
            _('Цей домен email не дозволено'),
            code='blocked_domain'
        )

def validate_image_size(image):
    """Валідація розміру зображення"""
    max_size = 5 * 1024 * 1024  # 5MB
    if hasattr(image, 'size') and image.size > max_size:
        raise ValidationError(
            _('Зображення занадто велике. Максимальний розмір: 5MB'),
            code='image_too_large'
        )
    
    # Перевірка розмірів зображення
    try:
        img = Image.open(image)
        width, height = img.size
        
        # Максимальні розміри: 4000x4000
        if width > 4000 or height > 4000:
            raise ValidationError(
                _('Розміри зображення занадто великі. Максимум: 4000x4000 пікселів'),
                code='image_dimensions_too_large'
            )
    except Exception:
        raise ValidationError(
            _('Неможливо обробити зображення'),
            code='invalid_image'
        )

def validate_file_extension(file, allowed_extensions):
    """Валідація розширення файлу"""
    extension = file.name.split('.')[-1].lower()
    if extension not in allowed_extensions:
        raise ValidationError(
            _('Дозволені розширення файлів: {extensions}').format(
                extensions=', '.join(allowed_extensions)
            ),
            code='invalid_extension'
        )

def validate_content_length(value, min_length=10, max_length=5000):
    """Валідація довжини контенту"""
    if len(value.strip()) < min_length:
        raise ValidationError(
            _('Контент занадто короткий. Мінімум {min} символів').format(min=min_length),
            code='content_too_short'
        )
    
    if len(value) > max_length:
        raise ValidationError(
            _('Контент занадто довгий. Максимум {max} символів').format(max=max_length),
            code='content_too_long'
        )

def validate_slug(value):
    """Валідація slug"""
    pattern = r'^[a-z0-9-]+$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Slug може містити тільки малі літери, цифри та дефіси'),
            code='invalid_slug'
        )

class ContentModerator:
    """Система модерації контенту"""
    
    FORBIDDEN_WORDS = [
        # Додайте заборонені слова
    ]
    
    @classmethod
    def check_content(cls, text):
        """Перевірка контенту на заборонені слова"""
        text_lower = text.lower()
        for word in cls.FORBIDDEN_WORDS:
            if word in text_lower:
                raise ValidationError(
                    _('Контент містить неприпустимі слова'),
                    code='forbidden_content'
                )
        return True
    
    @classmethod
    def moderate_user_input(cls, data):
        """Модерація користувацького вводу"""
        moderated_data = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                # Видаляємо потенційно небезпечні символи
                value = re.sub(r'[<>"\']', '', value)
                # Перевіряємо на заборонені слова
                cls.check_content(value)
                moderated_data[key] = value.strip()
            else:
                moderated_data[key] = value
        
        return moderated_data