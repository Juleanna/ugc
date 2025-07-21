# backend/apps/api/utils/translations.py
import json
import os
from django.conf import settings
from django.core.cache import cache
from django.utils import translation
from django import template
import logging

logger = logging.getLogger(__name__)

class TranslationUtils:
    """Утиліти для роботи з перекладами"""
    
    @staticmethod
    def get_translation(key, lang=None, default=None):
        """Отримує переклад за ключем"""
        if lang is None:
            lang = translation.get_language() or settings.LANGUAGE_CODE
        
        # Спробуємо з кешу
        cache_key = f'static_translations_{lang}'
        translations = cache.get(cache_key)
        
        if translations is None:
            # Завантажуємо з файлу
            translations = TranslationUtils.load_translations(lang)
            cache.set(cache_key, translations, 60 * 30)
        
        return translations.get(key, default or key)
    
    @staticmethod
    def load_translations(lang):
        """Завантажує переклади з файлу"""
        static_dir = getattr(settings, 'STATIC_TRANSLATIONS_DIR', settings.BASE_DIR / 'static_translations')
        file_path = static_dir / f'{lang}.json'
        
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.error(f"Error loading translations from {file_path}: {e}")
                return {}
        
        return {}
    
    @staticmethod
    def add_translation(key, value, lang='uk'):
        """Додає новий переклад"""
        translations = TranslationUtils.load_translations(lang)
        translations[key] = value
        
        # Зберігаємо у файл
        TranslationUtils.save_translations(translations, lang)
        
        # Очищаємо кеш
        cache.delete(f'static_translations_{lang}')
        
        logger.info(f"Added translation: {key} = {value} for {lang}")
    
    @staticmethod
    def bulk_add_translations(translations_dict, lang='uk'):
        """Додає кілька перекладів одразу"""
        existing = TranslationUtils.load_translations(lang)
        existing.update(translations_dict)
        
        # Зберігаємо у файл
        TranslationUtils.save_translations(existing, lang)
        
        # Очищаємо кеш
        cache.delete(f'static_translations_{lang}')
        
        logger.info(f"Added {len(translations_dict)} translations for {lang}")
    
    @staticmethod
    def save_translations(translations, lang):
        """Зберігає переклади у файл"""
        static_dir = getattr(settings, 'STATIC_TRANSLATIONS_DIR', settings.BASE_DIR / 'static_translations')
        os.makedirs(static_dir, exist_ok=True)
        
        file_path = static_dir / f'{lang}.json'
        
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(translations, f, ensure_ascii=False, indent=2, sort_keys=True)
        except IOError as e:
            logger.error(f"Error saving translations to {file_path}: {e}")
            raise
    
    @staticmethod
    def remove_translation(key, lang='uk'):
        """Видаляє переклад"""
        translations = TranslationUtils.load_translations(lang)
        
        if key in translations:
            del translations[key]
            TranslationUtils.save_translations(translations, lang)
            cache.delete(f'static_translations_{lang}')
            logger.info(f"Removed translation: {key} for {lang}")
            return True
        
        return False
    
    @staticmethod
    def get_all_keys(lang='uk'):
        """Отримує всі ключі перекладів"""
        translations = TranslationUtils.load_translations(lang)
        return list(translations.keys())
    
    @staticmethod
    def search_translations(query, lang='uk'):
        """Пошук перекладів за ключем або значенням"""
        translations = TranslationUtils.load_translations(lang)
        results = {}
        
        query = query.lower()
        
        for key, value in translations.items():
            if query in key.lower() or query in value.lower():
                results[key] = value
        
        return results
    
    @staticmethod
    def validate_translations():
        """Валідує переклади на наявність пропусків між мовами"""
        all_languages = [code for code, name in settings.LANGUAGES]
        all_keys = set()
        language_keys = {}
        
        # Збираємо всі ключі з усіх мов
        for lang in all_languages:
            translations = TranslationUtils.load_translations(lang)
            keys = set(translations.keys())
            language_keys[lang] = keys
            all_keys.update(keys)
        
        # Перевіряємо відсутні ключі
        missing_translations = {}
        for lang in all_languages:
            missing_keys = all_keys - language_keys[lang]
            if missing_keys:
                missing_translations[lang] = list(missing_keys)
        
        return missing_translations
    
    @staticmethod
    def sync_translation_keys():
        """Синхронізує ключі між мовами (додає відсутні з fallback значеннями)"""
        missing = TranslationUtils.validate_translations()
        synced_count = 0
        
        for lang, missing_keys in missing.items():
            if missing_keys:
                translations = TranslationUtils.load_translations(lang)
                
                for key in missing_keys:
                    # Використовуємо ключ як fallback значення
                    translations[key] = f"[{lang.upper()}: {key}]"
                    synced_count += 1
                
                TranslationUtils.save_translations(translations, lang)
                cache.delete(f'static_translations_{lang}')
        
        logger.info(f"Synced {synced_count} missing translation keys")
        return synced_count

# Template tags для використання в Django шаблонах
register = template.Library()

@register.simple_tag
def translate(key, lang=None):
    """Template tag для перекладів"""
    return TranslationUtils.get_translation(key, lang)

@register.filter
def trans(key, lang=None):
    """Filter для перекладів"""
    return TranslationUtils.get_translation(key, lang)

@register.simple_tag
def get_available_languages():
    """Отримує список доступних мов"""
    return settings.LANGUAGES

@register.simple_tag
def get_current_language():
    """Отримує поточну мову"""
    return translation.get_language() or settings.LANGUAGE_CODE

# Контекстний процесор для шаблонів
def translations_context(request):
    """Додає переклади в контекст всіх шаблонів"""
    current_lang = translation.get_language() or settings.LANGUAGE_CODE
    
    return {
        'CURRENT_LANGUAGE': current_lang,
        'AVAILABLE_LANGUAGES': settings.LANGUAGES,
        'translations': TranslationUtils.load_translations(current_lang),
    }