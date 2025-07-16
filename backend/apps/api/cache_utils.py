# backend/apps/api/cache_utils.py - НОВЫЙ ФАЙЛ
from django.core.cache import cache
from django.conf import settings
import logging
import pickle
import json

logger = logging.getLogger(__name__)


class SafeCache:
    """
    Безопасная обертка для кеша с обработкой ошибок сериализации
    """
    
    @staticmethod
    def get(key, default=None):
        """Безопасно получает данные из кеша"""
        try:
            return cache.get(key, default)
        except (pickle.UnpicklingError, ValueError, TypeError) as e:
            logger.warning(f"Cache deserialization error for key {key}: {str(e)}")
            # Пытаемся удалить поврежденный ключ
            SafeCache.delete(key)
            return default
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {str(e)}")
            return default
    
    @staticmethod
    def set(key, value, timeout=None):
        """Безопасно сохраняет данные в кеш"""
        try:
            return cache.set(key, value, timeout)
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {str(e)}")
            return False
    
    @staticmethod
    def delete(key):
        """Безопасно удаляет ключ из кеша"""
        try:
            return cache.delete(key)
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {str(e)}")
            return False
    
    @staticmethod
    def delete_many(keys):
        """Безопасно удаляет множество ключей"""
        try:
            return cache.delete_many(keys)
        except Exception as e:
            logger.error(f"Cache delete_many error: {str(e)}")
            # Пытаемся удалить по одному
            deleted = 0
            for key in keys:
                if SafeCache.delete(key):
                    deleted += 1
            return deleted
    
    @staticmethod
    def clear_corrupted_keys():
        """Очищает поврежденные ключи из кеша"""
        try:
            from django_redis import get_redis_connection
            con = get_redis_connection("default")
            
            # Получаем все ключи API
            pattern = f"{settings.CACHES['default']['KEY_PREFIX']}:*"
            keys = con.keys(pattern)
            
            corrupted_keys = []
            for key in keys:
                try:
                    # Пытаемся прочитать ключ
                    cache.get(key.decode() if isinstance(key, bytes) else key)
                except (pickle.UnpicklingError, ValueError, TypeError):
                    corrupted_keys.append(key)
            
            if corrupted_keys:
                con.delete(*corrupted_keys)
                logger.info(f"Cleared {len(corrupted_keys)} corrupted cache keys")
                return len(corrupted_keys)
            
            return 0
            
        except Exception as e:
            logger.error(f"Clear corrupted keys error: {str(e)}")
            return 0
    
    @staticmethod
    def get_or_set(key, callable_func, timeout=None):
        """Получает значение из кеша или устанавливает новое"""
        try:
            value = SafeCache.get(key)
            if value is None:
                value = callable_func()
                SafeCache.set(key, value, timeout)
            return value
        except Exception as e:
            logger.error(f"Cache get_or_set error for key {key}: {str(e)}")
            # В случае ошибки просто вызываем функцию
            return callable_func()


class CacheMigrator:
    """
    Утилита для миграции кеша между форматами
    """
    
    @staticmethod
    def migrate_json_to_pickle():
        """Мигрирует кеш из JSON в pickle формат"""
        try:
            from django_redis import get_redis_connection
            con = get_redis_connection("default")
            
            pattern = f"{settings.CACHES['default']['KEY_PREFIX']}:*"
            keys = con.keys(pattern)
            
            migrated = 0
            errors = 0
            
            for key in keys:
                try:
                    # Получаем сырые данные
                    raw_value = con.get(key)
                    if not raw_value:
                        continue
                    
                    # Пытаемся распарсить как JSON
                    try:
                        json_data = json.loads(raw_value.decode() if isinstance(raw_value, bytes) else raw_value)
                        # Пересохраняем через Django cache (будет использован новый сериализатор)
                        cache_key = key.decode() if isinstance(key, bytes) else key
                        cache_key = cache_key.replace(f"{settings.CACHES['default']['KEY_PREFIX']}:", "")
                        SafeCache.set(cache_key, json_data, 3600)
                        migrated += 1
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        # Это уже не JSON, удаляем
                        con.delete(key)
                        errors += 1
                        
                except Exception as e:
                    logger.error(f"Migration error for key {key}: {str(e)}")
                    errors += 1
            
            logger.info(f"Cache migration completed: {migrated} migrated, {errors} errors")
            return {'migrated': migrated, 'errors': errors}
            
        except Exception as e:
            logger.error(f"Cache migration failed: {str(e)}")
            return {'migrated': 0, 'errors': 1}


# Обновленный BaseViewSetWithCache с безопасным кешем
class SafeBaseViewSetWithCache:
    """Базовый ViewSet с безопасным кешированием"""
    cache_timeout = 60 * 15
    cache_key_prefix = 'api'
    
    def get_cache_key(self, action='list', **kwargs):
        """Генерирует ключ кеша"""
        model_name = self.queryset.model.__name__.lower()
        key_parts = [self.cache_key_prefix, model_name, action]
        
        if kwargs:
            key_parts.extend([f"{k}_{v}" for k, v in sorted(kwargs.items())])
            
        return "_".join(key_parts)
    
    def get_cached_response(self, cache_key, fallback_func, *args, **kwargs):
        """Получает данные из кеша или выполняет fallback функцию"""
        try:
            cached_data = SafeCache.get(cache_key)
            if cached_data is not None:
                logger.info(f"Cache HIT для {cache_key}")
                from rest_framework.response import Response
                return Response(cached_data)
            
            # Выполняем оригинальную функцию
            response = fallback_func(*args, **kwargs)
            
            # Кешируем только успешные ответы
            if hasattr(response, 'status_code') and response.status_code == 200:
                SafeCache.set(cache_key, response.data, self.cache_timeout)
                logger.info(f"Cache SET для {cache_key}")
            
            return response
            
        except Exception as e:
            logger.error(f"Ошибка кеширования для {cache_key}: {str(e)}")
            # Если кеш не работает, возвращаем данные без кеширования
            return fallback_func(*args, **kwargs)