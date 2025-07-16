# backend/apps/api/middleware.py - ОБНОВЛЕННАЯ ВЕРСИЯ
from django.utils.cache import add_never_cache_headers
from django.core.cache import cache
from django.conf import settings
from django.http import JsonResponse
import hashlib
import json
import time
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class ImprovedTranslationsCacheMiddleware(MiddlewareMixin):
    """
    Улучшенный middleware для кеширования переводов с поддержкой fallback
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.rate_limit_window = 60  # 1 минута
        self.max_requests_per_window = 100  # максимум 100 запросов за минуту
        
        # Настройки кеша
        self.cache_settings = getattr(settings, 'TRANSLATION_CACHE_SETTINGS', {
            'STATIC_TIMEOUT': 60 * 60,
            'DYNAMIC_TIMEOUT': 60 * 30,
            'PO_TIMEOUT': 60 * 60 * 2,
            'UNIFIED_TIMEOUT': 60 * 45,
            'ENABLE_COMPRESSION': True,
        })

    def process_request(self, request):
        """Обрабатывает входящие запросы"""
        if not self._is_translations_request(request):
            return None
            
        # Rate limiting
        if not self._check_rate_limit(request):
            logger.warning(f"Rate limit exceeded for IP: {self._get_client_ip(request)}")
            return JsonResponse({
                'error': 'Превышен лимит запросов. Попробуйте позже.',
                'retry_after': 60
            }, status=429)
        
        return None

    def process_response(self, request, response):
        """Обрабатывает ответы"""
        if not self._is_translations_request(request):
            return response
            
        # Добавляем заголовки кеширования
        if response.status_code == 200:
            response['Cache-Control'] = 'public, max-age=1800'  # 30 минут
            response['Vary'] = 'Accept-Language, Accept-Encoding'
        else:
            add_never_cache_headers(response)
            
        # CORS заголовки
        self._add_cors_headers(response, request)
        
        return response

    def _is_translations_request(self, request):
        """Проверяет, является ли запрос к API переводов"""
        translations_paths = [
            '/api/v1/translations',
            '/api/v1/dynamic-translations',
            '/api/v1/po-translations'
        ]
        return any(request.path.startswith(path) for path in translations_paths)

    def _check_rate_limit(self, request):
        """Проверяет rate limiting"""
        try:
            client_ip = self._get_client_ip(request)
            cache_key = f"rate_limit_{client_ip}"
            
            current_requests = cache.get(cache_key, 0)
            if current_requests >= self.max_requests_per_window:
                return False
            
            # Увеличиваем счетчик
            cache.set(cache_key, current_requests + 1, self.rate_limit_window)
            return True
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {str(e)}")
            return True  # В случае ошибки разрешаем запрос

    def _get_client_ip(self, request):
        """Получает IP клиента"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _add_cors_headers(self, response, request):
        """Добавляет CORS заголовки"""
        origin = self._get_allowed_origin(request)
        
        response['Access-Control-Allow-Origin'] = origin
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, X-Requested-With'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        
        return response
    
    def _get_allowed_origin(self, request):
        """Определяет разрешенный origin"""
        origin = request.META.get('HTTP_ORIGIN', '')
        
        allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ])
        
        if origin in allowed_origins:
            return origin
        
        # В режиме DEBUG разрешаем localhost
        if settings.DEBUG and ('localhost' in origin or '127.0.0.1' in origin):
            return origin
            
        # По умолчанию
        return allowed_origins[0] if allowed_origins else '*'


class CacheMonitoringMiddleware(MiddlewareMixin):
    """
    Middleware для мониторинга производительности кеша
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.monitoring_enabled = getattr(settings, 'CACHE_MONITORING', {}).get('ENABLE_MONITORING', False)
        
    def process_request(self, request):
        """Засекаем время начала запроса"""
        if self.monitoring_enabled:
            request._cache_start_time = time.time()
        return None
        
    def process_response(self, request, response):
        """Логируем статистику кеша"""
        if not self.monitoring_enabled or not hasattr(request, '_cache_start_time'):
            return response
            
        try:
            duration = time.time() - request._cache_start_time
            
            # Логируем медленные запросы
            if duration > 2.0:  # Больше 2 секунд
                logger.warning(f"Медленный запрос: {request.path} - {duration:.2f}s")
            
            # Добавляем заголовки с информацией о производительности
            if settings.DEBUG:
                response['X-Cache-Duration'] = f"{duration:.3f}s"
                response['X-Cache-Timestamp'] = str(int(time.time()))
                
        except Exception as e:
            logger.error(f"Cache monitoring error: {str(e)}")
            
        return response


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Добавляет безопасные заголовки для API
    """
    
    def process_response(self, request, response):
        """Добавляет заголовки безопасности"""
        # Добавляем безопасные заголовки только для API
        if request.path.startswith('/api/'):
            response['X-Content-Type-Options'] = 'nosniff'
            response['X-Frame-Options'] = 'DENY'
            response['X-XSS-Protection'] = '1; mode=block'
            response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            
            # Для переводов добавляем кеширование
            if 'translations' in request.path and response.status_code == 200:
                response['Cache-Control'] = 'public, max-age=1800'  # 30 минут
            elif request.path.startswith('/api/'):
                response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                response['Pragma'] = 'no-cache'
                response['Expires'] = '0'
        
        return response


class CacheInvalidationMiddleware(MiddlewareMixin):
    """
    Middleware для автоматической инвалидации кеша при изменениях
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.invalidation_settings = getattr(settings, 'CACHE_INVALIDATION_SETTINGS', {
            'ENABLE_AUTO_INVALIDATION': True,
            'MODELS_TO_WATCH': [],
            'INVALIDATION_DELAY': 5,
        })
        
    def process_response(self, request, response):
        """Проверяет нужно ли очистить кеш после изменений"""
        if not self.invalidation_settings.get('ENABLE_AUTO_INVALIDATION'):
            return response
            
        # Очищаем кеш после POST/PUT/DELETE запросов к API
        if (request.method in ['POST', 'PUT', 'DELETE', 'PATCH'] and 
            request.path.startswith('/api/') and 
            200 <= response.status_code < 300):
            
            self._schedule_cache_invalidation(request)
            
        return response
    
    def _schedule_cache_invalidation(self, request):
        """Планирует очистку кеша"""
        try:
            # Определяем какие кеши нужно очистить на основе URL
            cache_keys_to_clear = self._get_cache_keys_for_path(request.path)
            
            if cache_keys_to_clear:
                # Очищаем кеши
                cache.delete_many(cache_keys_to_clear)
                logger.info(f"Очищены кеши: {cache_keys_to_clear}")
                
        except Exception as e:
            logger.error(f"Cache invalidation failed: {str(e)}")
    
    def _get_cache_keys_for_path(self, path):
        """Определяет какие ключи кеша нужно очистить для данного пути"""
        keys_to_clear = []
        
        # Мапинг путей к ключам кеша
        path_cache_mapping = {
            '/api/v1/homepage/': ['api_homepage_list', 'api_homepage_detail'],
            '/api/v1/about/': ['api_aboutpage_list', 'api_aboutpage_detail'],
            '/api/v1/services/': ['api_service_list', 'api_service_featured'],
            '/api/v1/projects/': ['api_project_list', 'api_project_featured'],
            '/api/v1/jobs/': ['api_jobposition_list', 'api_jobposition_urgent'],
            '/api/v1/offices/': ['api_office_list'],
        }
        
        for api_path, cache_keys in path_cache_mapping.items():
            if path.startswith(api_path):
                keys_to_clear.extend(cache_keys)
                break
                
        return keys_to_clear


# Утилиты для работы с кешем
class CacheUtils:
    """Утилиты для работы с кешем"""
    
    @staticmethod
    def get_cache_info():
        """Получает информацию о состоянии кеша"""
        try:
            from django_redis import get_redis_connection
            con = get_redis_connection("default")
            info = con.info()
            
            return {
                'redis_version': info.get('redis_version'),
                'connected_clients': info.get('connected_clients'),
                'used_memory_human': info.get('used_memory_human'),
                'total_commands_processed': info.get('total_commands_processed'),
                'keyspace_hits': info.get('keyspace_hits'),
                'keyspace_misses': info.get('keyspace_misses'),
                'hit_rate': info.get('keyspace_hits', 0) / max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1) * 100
            }
        except Exception as e:
            logger.error(f"Failed to get cache info: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def clear_pattern(pattern):
        """Очищает кеш по паттерну"""
        try:
            from django_redis import get_redis_connection
            con = get_redis_connection("default")
            keys = con.keys(pattern)
            if keys:
                con.delete(*keys)
                return len(keys)
            return 0
        except Exception as e:
            logger.error(f"Failed to clear cache pattern {pattern}: {str(e)}")
            return 0
    
    @staticmethod
    def warm_up_popular_caches():
        """Разогревает популярные кеши"""
        from django.test import RequestFactory
        from apps.api.views import HomePageViewSet, ServiceViewSet, OfficeViewSet
        
        factory = RequestFactory()
        warmed_caches = []
        
        try:
            # Разогреваем основные endpoint'ы
            viewsets = [
                (HomePageViewSet, '/api/v1/homepage/'),
                (ServiceViewSet, '/api/v1/services/'),
                (OfficeViewSet, '/api/v1/offices/'),
            ]
            
            for viewset_class, url in viewsets:
                try:
                    request = factory.get(url)
                    viewset = viewset_class()
                    viewset.setup(request)
                    viewset.list(request)
                    warmed_caches.append(url)
                except Exception as e:
                    logger.warning(f"Failed to warm cache for {url}: {str(e)}")
            
            logger.info(f"Warmed up caches: {warmed_caches}")
            return warmed_caches
            
        except Exception as e:
            logger.error(f"Cache warm-up failed: {str(e)}")
            return []


# Сигналы для автоматической очистки кеша
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete])
def invalidate_model_cache(sender, **kwargs):
    """Автоматически очищает кеш при изменении моделей"""
    try:
        # Получаем настройки
        cache_settings = getattr(settings, 'CACHE_INVALIDATION_SETTINGS', {})
        if not cache_settings.get('ENABLE_AUTO_INVALIDATION'):
            return
            
        # Проверяем, нужно ли очищать кеш для этой модели
        model_name = f"{sender._meta.app_label}.{sender._meta.model_name}"
        watched_models = cache_settings.get('MODELS_TO_WATCH', [])
        
        if model_name.lower() in [m.lower() for m in watched_models]:
            # Очищаем соответствующие кеши
            pattern = f"api_{sender._meta.model_name.lower()}_*"
            cleared = CacheUtils.clear_pattern(pattern)
            logger.info(f"Auto-invalidated {cleared} cache keys for {model_name}")
            
    except Exception as e:
        logger.error(f"Auto cache invalidation failed: {str(e)}")
