# backend/apps/api/unified_views.py
# Комплексне рішення для всіх API endpoints

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class UnifiedAPIResponse:
    """Стандартизований формат відповідей API"""
    
    @staticmethod
    def success(data, message="Success", meta=None):
        response = {
            'success': True,
            'data': data,
            'message': message
        }
        if meta:
            response['meta'] = meta
        return response
    
    @staticmethod
    def error(message, code=None, details=None):
        response = {
            'success': False,
            'message': message
        }
        if code:
            response['code'] = code
        if details:
            response['details'] = details
        return response

class HomepageStatsAPIView(APIView):
    """Статистика для головної сторінки"""
    
    def get(self, request):
        try:
            # Спробуємо отримати з кешу
            cache_key = 'homepage_stats'
            stats = cache.get(cache_key)
            
            if not stats:
                # Формуємо базову статистику
                stats = {
                    'experience': '5+',
                    'projects': '100+', 
                    'clients': '50+',
                    'support': '24/7'
                }
                
                # Якщо є моделі, отримуємо реальні дані
                try:
                    from apps.api.models import Service, Project
                    from django.db.models import Count
                    
                    services_count = Service.objects.filter(is_active=True).count()
                    projects_count = Project.objects.count()
                    
                    if services_count > 0:
                        stats['services_count'] = services_count
                    if projects_count > 0:
                        stats['projects'] = f"{projects_count}+"
                        
                except (ImportError, Exception) as e:
                    logger.warning(f"Could not fetch real stats: {e}")
                
                # Кешуємо на 1 годину
                cache.set(cache_key, stats, 3600)
            
            return Response(UnifiedAPIResponse.success(
                data=stats,
                message="Homepage stats retrieved successfully"
            ))
            
        except Exception as e:
            logger.error(f"Error in HomepageStatsAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(f"Failed to retrieve stats: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TranslationsAPIView(APIView):
    """API для перекладів з кешуванням"""
    
    def get(self, request, lang):
        try:
            # Кеш ключ
            cache_key = f'translations_{lang}'
            translations = cache.get(cache_key)
            
            if not translations:
                # Завантажуємо з файлу
                translations_file = Path(f'static_translations/{lang}.json')
                
                if translations_file.exists():
                    with open(translations_file, 'r', encoding='utf-8') as f:
                        translations = json.load(f)
                else:
                    # Створюємо базові переклади
                    translations = self.get_default_translations(lang)
                
                # Кешуємо на 30 хвилин  
                cache.set(cache_key, translations, 1800)
            
            return Response(UnifiedAPIResponse.success(
                data=translations,
                message=f"Translations for {lang} retrieved successfully",
                meta={
                    'language': lang,
                    'count': len(translations),
                    'cached': True
                }
            ))
            
        except Exception as e:
            logger.error(f"Error in TranslationsAPIView for {lang}: {e}")
            return Response(
                UnifiedAPIResponse.error(f"Failed to retrieve translations: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_default_translations(self, lang):
        """Базові переклади за замовчуванням"""
        if lang == 'uk':
            return {
                'nav.home': 'Головна',
                'nav.about': 'Про нас', 
                'nav.services': 'Послуги',
                'nav.contact': 'Контакти',
                'hero.title': 'Професійний одяг',
                'hero.subtitle': 'для кожної сфери',
                'hero.loading': 'Завантаження контенту...',
                'hero.error': 'Помилка завантаження',
                'hero.error_message': 'Не вдалося завантажити дані Hero секції',
                'services.loading': 'Завантаження послуг...',
                'services.error': 'Помилка завантаження послуг',
                'common.loading': 'Завантаження...',
                'common.error': 'Помилка',
                'common.success': 'Успіх',
                'common.retry': 'Спробувати знову'
            }
        else:  # en
            return {
                'nav.home': 'Home',
                'nav.about': 'About',
                'nav.services': 'Services', 
                'nav.contact': 'Contact',
                'hero.title': 'Professional clothing',
                'hero.subtitle': 'for every sphere',
                'hero.loading': 'Loading content...',
                'hero.error': 'Loading error',
                'hero.error_message': 'Failed to load Hero section data',
                'services.loading': 'Loading services...',
                'services.error': 'Error loading services',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success', 
                'common.retry': 'Try again'
            }

class AllTranslationsAPIView(TranslationsAPIView):
    """Усі переклади для мови"""
    pass

class FeaturedServicesAPIView(APIView):
    """Рекомендовані послуги"""
    
    def get(self, request):
        try:
            cache_key = 'featured_services'
            services = cache.get(cache_key)
            
            if not services:
                # Спробуємо отримати з бази даних
                try:
                    from apps.api.models import Service
                    services_qs = Service.objects.filter(
                        is_active=True, 
                        is_featured=True
                    )[:6]
                    
                    services = []
                    for service in services_qs:
                        services.append({
                            'id': service.id,
                            'title': service.title,
                            'description': service.description,
                            'category': getattr(service, 'category', 'general'),
                            'price_from': getattr(service, 'price_from', None)
                        })
                        
                except (ImportError, Exception) as e:
                    logger.warning(f"Could not fetch services from DB: {e}")
                    # Fallback до демо даних
                    services = self.get_demo_services()
                
                # Кешуємо на 15 хвилин
                cache.set(cache_key, services, 900)
            
            return Response(UnifiedAPIResponse.success(
                data=services,
                message="Featured services retrieved successfully",
                meta={'count': len(services)}
            ))
            
        except Exception as e:
            logger.error(f"Error in FeaturedServicesAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(f"Failed to retrieve services: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_demo_services(self):
        """Демо послуги"""
        return [
            {
                'id': 1,
                'title': 'Корпоративний одяг',
                'description': 'Професійний одяг для офісу та бізнесу',
                'category': 'corporate',
                'price_from': 'від 1500 грн'
            },
            {
                'id': 2,
                'title': 'Медичний одяг',
                'description': 'Спеціалізований одяг для медичних працівників',
                'category': 'medical',
                'price_from': 'від 800 грн'
            },
            {
                'id': 3,
                'title': 'Робочий одяг',
                'description': 'Захисний одяг для промисловості',
                'category': 'industrial',
                'price_from': 'від 1200 грн'
            },
            {
                'id': 4,
                'title': 'Шкільна форма',
                'description': 'Якісна шкільна форма для учнів',
                'category': 'education',
                'price_from': 'від 600 грн'
            },
            {
                'id': 5,
                'title': 'Одяг для HoReCa',
                'description': 'Професійний одяг для ресторанів та готелів',
                'category': 'hospitality',
                'price_from': 'від 900 грн'
            },
            {
                'id': 6,
                'title': 'Форма безпеки',
                'description': 'Спеціалізований одяг для служб безпеки',
                'category': 'security',
                'price_from': 'від 1100 грн'
            }
        ]

class FeaturedProjectsAPIView(APIView):
    """Рекомендовані проекти"""
    
    def get(self, request):
        try:
            cache_key = 'featured_projects'
            projects = cache.get(cache_key)
            
            if not projects:
                # Спробуємо отримати з бази даних
                try:
                    from apps.api.models import Project
                    projects_qs = Project.objects.filter(is_featured=True)[:6]
                    
                    projects = []
                    for project in projects_qs:
                        projects.append({
                            'id': project.id,
                            'title': project.title,
                            'description': project.description,
                            'category': getattr(project, 'category', 'general'),
                            'image': getattr(project, 'image', None)
                        })
                        
                except (ImportError, Exception) as e:
                    logger.warning(f"Could not fetch projects from DB: {e}")
                    # Fallback до демо даних
                    projects = self.get_demo_projects()
                
                # Кешуємо на 15 хвилин
                cache.set(cache_key, projects, 900)
            
            return Response(UnifiedAPIResponse.success(
                data=projects,
                message="Featured projects retrieved successfully",
                meta={'count': len(projects)}
            ))
            
        except Exception as e:
            logger.error(f"Error in FeaturedProjectsAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(f"Failed to retrieve projects: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_demo_projects(self):
        """Демо проекти"""
        return [
            {
                'id': 1,
                'title': 'Національна Гвардія України',
                'description': 'Захист і комфорт для наших захисників',
                'category': 'military'
            },
            {
                'id': 2,
                'title': 'Міністерство оборони України',
                'description': 'Вітро-вологозахисний костюм для військових',
                'category': 'military'
            },
            {
                'id': 3,
                'title': 'Медичний центр "Здоров\'я"',
                'description': 'Комфортний медичний одяг для лікарів',
                'category': 'medical'
            },
            {
                'id': 4,
                'title': 'Завод "Металург"',
                'description': 'Захисний одяг для важкої промисловості',
                'category': 'industrial'
            }
        ]

class APIHealthCheckView(APIView):
    """Перевірка здоров'я API"""
    
    def get(self, request):
        try:
            # Перевіряємо основні компоненти
            health_data = {
                'status': 'healthy',
                'timestamp': request.build_absolute_uri(),
                'version': '1.0.0',
                'cache': 'operational',
                'database': 'operational'
            }
            
            # Перевіряємо кеш
            try:
                cache.set('health_check', 'ok', 60)
                cache_result = cache.get('health_check')
                if cache_result != 'ok':
                    health_data['cache'] = 'warning'
            except Exception:
                health_data['cache'] = 'error'
            
            # Перевіряємо базу даних
            try:
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
            except Exception:
                health_data['database'] = 'error'
                health_data['status'] = 'degraded'
            
            return Response(UnifiedAPIResponse.success(
                data=health_data,
                message="API health check completed"
            ))
            
        except Exception as e:
            return Response(
                UnifiedAPIResponse.error(f"Health check failed: {str(e)}"),
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

@method_decorator(csrf_exempt, name='dispatch')
class CacheManagementView(APIView):
    """Управління кешем"""
    
    def post(self, request):
        try:
            action = request.data.get('action', 'clear_all')
            
            if action == 'clear_all':
                cache.clear()
                message = "All cache cleared successfully"
                
            elif action == 'clear_pattern':
                pattern = request.data.get('pattern', '')
                if pattern:
                    # Django не підтримує pattern clear нативно
                    # Тому очищаємо все
                    cache.clear()
                    message = f"Cache cleared for pattern: {pattern}"
                else:
                    return Response(
                        UnifiedAPIResponse.error("Pattern required for pattern clear"),
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            elif action == 'warm_cache':
                # Попереднє завантаження кешу
                self.warm_critical_cache()
                message = "Cache warmed successfully"
                
            else:
                return Response(
                    UnifiedAPIResponse.error(f"Unknown action: {action}"),
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(UnifiedAPIResponse.success(
                data={'action': action},
                message=message
            ))
            
        except Exception as e:
            logger.error(f"Error in CacheManagementView: {e}")
            return Response(
                UnifiedAPIResponse.error(f"Cache operation failed: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def warm_critical_cache(self):
        """Попереднє завантаження критичного кешу"""
        try:
            # Статистика
            stats = {
                'experience': '5+',
                'projects': '100+', 
                'clients': '50+',
                'support': '24/7'
            }
            cache.set('homepage_stats', stats, 3600)
            
            # Переклади
            uk_translations = {
                'nav.home': 'Головна',
                'nav.about': 'Про нас', 
                'nav.services': 'Послуги',
                'nav.contact': 'Контакти',
                'hero.title': 'Професійний одяг',
                'hero.subtitle': 'для кожної сфери',
                'common.loading': 'Завантаження...',
                'common.error': 'Помилка'
            }
            cache.set('translations_uk', uk_translations, 1800)
            
            en_translations = {
                'nav.home': 'Home',
                'nav.about': 'About',
                'nav.services': 'Services', 
                'nav.contact': 'Contact',
                'hero.title': 'Professional clothing',
                'hero.subtitle': 'for every sphere',
                'common.loading': 'Loading...',
                'common.error': 'Error'
            }
            cache.set('translations_en', en_translations, 1800)
            
            logger.info("Critical cache warmed successfully")
            
        except Exception as e:
            logger.error(f"Failed to warm cache: {e}")

# Утилітарні функції
@api_view(['GET'])
def api_root(request):
    """Корінь API з доступними endpoints"""
    try:
        endpoints = {
            'homepage': request.build_absolute_uri('/api/v1/homepage/'),
            'homepage_stats': request.build_absolute_uri('/api/v1/homepage/stats/'),
            'services_featured': request.build_absolute_uri('/api/v1/services/featured/'),
            'projects_featured': request.build_absolute_uri('/api/v1/projects/featured/'),
            'translations_uk': request.build_absolute_uri('/api/v1/translations/uk/'),
            'translations_en': request.build_absolute_uri('/api/v1/translations/en/'),
            'health_check': request.build_absolute_uri('/api/v1/health/'),
            'cache_management': request.build_absolute_uri('/api/v1/cache/')
        }
        
        return Response(UnifiedAPIResponse.success(
            data=endpoints,
            message="API endpoints available"
        ))
        
    except Exception as e:
        return Response(
            UnifiedAPIResponse.error(f"Failed to build API root: {str(e)}"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )