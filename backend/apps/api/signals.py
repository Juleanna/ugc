# backend/apps/api/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Функція для очищення кешу (замість TranslationManager)
def invalidate_translations_cache(locale=None):
    """Очищує кеш перекладів"""
    try:
        if locale:
            # Очищаємо кеш для конкретної локалі
            cache_keys = [
                f"static_translations_{locale}",
                f"dynamic_translations_{locale}",
                f"po_translations_{locale}",
                f"combined_translations_{locale}"
            ]
            cache.delete_many(cache_keys)
            logger.info(f"Очищено кеш перекладів для {locale}")
        else:
            # Очищаємо весь кеш перекладів
            all_keys = []
            for lang_code, _ in settings.LANGUAGES:
                all_keys.extend([
                    f"static_translations_{lang_code}",
                    f"dynamic_translations_{lang_code}",
                    f"po_translations_{lang_code}",
                    f"combined_translations_{lang_code}"
                ])
            
            cache.delete_many(all_keys)
            logger.info("Очищено кеш всіх перекладів")
            
    except Exception as e:
        logger.error(f"Помилка при очищенні кешу перекладів: {e}")

# Сигнали для автоматичного очищення кешу при зміні контенту
@receiver([post_save, post_delete])
def invalidate_translations_cache_signal(sender, **kwargs):
    """Очищає кеш перекладів при зміні моделей з перекладами"""
    
    # Список моделей, зміна яких має призводити до очищення кешу
    translatable_models = [
        'Service', 'Project', 'ProjectCategory', 'JobPosition',
        'HomePage', 'AboutPage', 'TeamMember', 'Contact',
        'ContactMessage', 'Partner', 'Job', 'JobApplication'
    ]
    
    model_name = sender.__name__
    
    if model_name in translatable_models:
        # Очищаємо кеш перекладів
        invalidate_translations_cache()
        
        # Логуємо дію
        action = "створення" if kwargs.get('created', False) else "оновлення"
        if 'signal' in str(kwargs.get('signal', '')).lower() and 'delete' in str(kwargs.get('signal', '')).lower():
            action = "видалення"
            
        logger.info(f"Очищено кеш перекладів через {action} {model_name}")
        
        # Опціонально: автоматично перезавантажуємо кеш
        try:
            from .utils.translations import TranslationUtils
            # Перезавантажуємо переклади для всіх мов
            for lang_code, _ in settings.LANGUAGES:
                TranslationUtils.load_translations(lang_code)
            logger.info("Переклади перезавантажено в кеш")
        except Exception as e:
            logger.warning(f"Не вдалося перезавантажити переклади: {e}")

# Додаткові утиліти для роботи з кешем
def get_cache_stats():
    """Отримує статистику кешу перекладів"""
    try:
        stats = {}
        total_keys = 0
        
        for lang_code, lang_name in settings.LANGUAGES:
            lang_stats = {}
            
            cache_keys = [
                f"static_translations_{lang_code}",
                f"dynamic_translations_{lang_code}",
                f"po_translations_{lang_code}",
                f"combined_translations_{lang_code}"
            ]
            
            cached_keys = 0
            for key in cache_keys:
                if cache.get(key) is not None:
                    cached_keys += 1
            
            lang_stats = {
                'name': lang_name,
                'cached_keys': cached_keys,
                'total_possible_keys': len(cache_keys)
            }
            
            stats[lang_code] = lang_stats
            total_keys += cached_keys
        
        stats['summary'] = {
            'total_cached_keys': total_keys,
            'languages_count': len(settings.LANGUAGES)
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Помилка отримання статистики кешу: {e}")
        return {'error': str(e)}

def warmup_translation_cache():
    """Попередньо завантажує переклади в кеш"""
    try:
        from .utils.translations import TranslationUtils
        
        warmed_up = 0
        for lang_code, _ in settings.LANGUAGES:
            try:
                translations = TranslationUtils.load_translations(lang_code)
                if translations:
                    cache.set(f"static_translations_{lang_code}", translations, 60 * 30)
                    warmed_up += 1
                    logger.info(f"Кеш прогрітий для {lang_code}: {len(translations)} перекладів")
            except Exception as e:
                logger.error(f"Помилка прогріву кешу для {lang_code}: {e}")
        
        logger.info(f"Прогрів кешу завершено для {warmed_up} мов")
        return warmed_up
        
    except Exception as e:
        logger.error(f"Помилка прогріву кешу: {e}")
        return 0