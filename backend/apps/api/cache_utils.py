"""
Розширена система кешування для API
"""
from django.core.cache import cache
from django.conf import settings
from functools import wraps
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

class SmartCache:
    """Розумна система кешування з тегами"""
    
    DEFAULT_TIMEOUT = 60 * 60  # 1 година
    
    @staticmethod
    def generate_key(prefix, *args, **kwargs):
        """Генерація унікального ключа кешу"""
        key_parts = [prefix] + [str(arg) for arg in args]
        if kwargs:
            key_parts.append(hashlib.md5(
                json.dumps(kwargs, sort_keys=True).encode()
            ).hexdigest())
        return ':'.join(key_parts)
    
    @classmethod
    def get_or_set_with_tags(cls, key, callable_func, timeout=None, tags=None):
        """Кешування з тегами для групового очищення"""
        timeout = timeout or cls.DEFAULT_TIMEOUT
        
        # Спробуємо отримати з кешу
        data = cache.get(key)
        if data is not None:
            logger.debug(f"Cache HIT for key: {key}")
            return data
        
        # Якщо немає в кеші, викликаємо функцію
        logger.debug(f"Cache MISS for key: {key}")
        data = callable_func()
        
        # Зберігаємо в кеш
        cache.set(key, data, timeout)
        
        # Додаємо теги для групового очищення
        if tags:
            for tag in tags:
                tag_key = f"tag:{tag}"
                tagged_keys = cache.get(tag_key, set())
                tagged_keys.add(key)
                cache.set(tag_key, tagged_keys, timeout)
        
        return data
    
    @classmethod
    def invalidate_by_tags(cls, tags):
        """Очищення кешу за тегами"""
        for tag in tags:
            tag_key = f"tag:{tag}"
            tagged_keys = cache.get(tag_key, set())
            
            if tagged_keys:
                # Очищаємо всі ключі з цим тегом
                cache.delete_many(tagged_keys)
                # Очищаємо сам тег
                cache.delete(tag_key)
                logger.info(f"Cleared {len(tagged_keys)} cache keys for tag: {tag}")

def cache_result(timeout=None, key_prefix=None, tags=None):
    """Декоратор для кешування результатів функцій"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Генеруємо ключ
            prefix = key_prefix or f"{func.__module__}.{func.__name__}"
            cache_key = SmartCache.generate_key(prefix, *args, **kwargs)
            
            # Викликаємо функцію через SmartCache
            return SmartCache.get_or_set_with_tags(
                cache_key,
                lambda: func(*args, **kwargs),
                timeout,
                tags
            )
        return wrapper
    return decorator

class CacheManager:
    """Менеджер для управління кешем"""
    
    @staticmethod
    def get_cache_stats():
        """Статистика кешу"""
        known_prefixes = [
            'translations:',
            'queryset:',
            'api:',
            'stats:',
            'featured:'
        ]
        
        stats = {
            'active_keys': 0,
            'memory_usage': 0,
            'hit_rate': 0,
            'prefixes': {}
        }
        
        # Спробуємо отримати статистику з Redis
        try:
            if hasattr(cache, '_cache') and hasattr(cache._cache, '_cache'):
                redis_client = cache._cache._cache
                info = redis_client.info('memory')
                stats['memory_usage'] = info.get('used_memory_human', 'N/A')
                
                # Підрахунок ключів за prefixes
                for prefix in known_prefixes:
                    keys = redis_client.keys(f"{prefix}*")
                    stats['prefixes'][prefix] = len(keys)
                    stats['active_keys'] += len(keys)
                    
        except Exception as e:
            logger.warning(f"Could not get cache stats: {e}")
        
        return stats
    
    @staticmethod
    def clear_cache_by_pattern(pattern):
        """Очищення кешу за шаблоном"""
        try:
            if hasattr(cache, '_cache') and hasattr(cache._cache, '_cache'):
                redis_client = cache._cache._cache
                keys = redis_client.keys(pattern)
                if keys:
                    redis_client.delete(*keys)
                    logger.info(f"Cleared {len(keys)} cache keys with pattern: {pattern}")
                return len(keys)
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return 0

# Готові декоратори для використання
cache_1_hour = cache_result(timeout=60*60, tags=['api'])
cache_30_min = cache_result(timeout=60*30, tags=['api'])
cache_5_min = cache_result(timeout=60*5, tags=['api', 'dynamic'])