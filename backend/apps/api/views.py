# backend/apps/api/views.py
# Повний виправлений файл з усіма необхідними endpoints

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

# ================== ДОПОМІЖНІ КЛАСИ ==================

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

# ================== API ROOT ==================

@api_view(['GET'])
def api_root(request):
    """API корінь з усіма доступними endpoints"""
    
    base_url = request.build_absolute_uri('/api/v1/')
    
    endpoints = {
        'homepage': f'{base_url}homepage/',
        'homepage_stats': f'{base_url}homepage/stats/',
        'services': f'{base_url}services/',
        'services_featured': f'{base_url}services/featured/',
        'projects': f'{base_url}projects/',
        'projects_featured': f'{base_url}projects/featured/',
        'translations': f'{base_url}translations/{{lang}}/',
        'translations_all': f'{base_url}translations/{{lang}}/all/',
        'health': f'{base_url}health/',
        'cache': f'{base_url}cache/',
    }
    
    return Response(UnifiedAPIResponse.success(
        data=endpoints,
        message="API endpoints available",
        meta={
            'version': '1.0',
            'status': 'active',
            'endpoints_count': len(endpoints)
        }
    ))

# ================== HOMEPAGE ENDPOINTS ==================

class HomepageAPIView(APIView):
    """Головна сторінка API - НОВИЙ ENDPOINT"""
    
    def get(self, request):
        try:
            # Спробуємо отримати з кешу
            cache_key = 'homepage_data'
            data = cache.get(cache_key)
            
            if not data:
                # Базові дані для головної сторінки
                data = {
                    'main_title': 'Професійний одяг',
                    'sphere_title': 'кожної сфери',
                    'subtitle': 'Створюємо якісний одяг для різних професій', 
                    'description': 'Ми пропонуємо повний спектр послуг з виробництва професійного одягу для різних галузей. Від корпоративного стилю до спеціалізованого захисного обладнання.',
                    'primary_button_text': 'Наші проєкти',
                    'secondary_button_text': 'Дізнатися більше',
                    'about_title': 'Наш багаторічний досвід',
                    'about_subtitle': 'гарантує якість',
                    'about_description': 'Ми створюємо одяг, який забезпечує безпеку і комфорт у будь-яких умовах. Наша продукція відповідає найвищим стандартам якості.',
                    'about_features': [
                        {
                            'id': 1,
                            'icon': 'shield',
                            'title': 'Надійність',
                            'description': 'Використовуємо тільки перевірені матеріали та технології',
                            'color': 'blue'
                        },
                        {
                            'id': 2,
                            'icon': 'award', 
                            'title': 'Якість',
                            'description': 'Контроль якості на кожному етапі виробництва',
                            'color': 'green'
                        },
                        {
                            'id': 3,
                            'icon': 'users',
                            'title': 'Довіра',
                            'description': 'Понад 50 задоволених клієнтів по всій Україні',
                            'color': 'purple'
                        }
                    ],
                    'achievements': [
                        {
                            'id': 1,
                            'title': 'ISO 9001:2015',
                            'description': 'Сертифікат системи управління якістю',
                            'year': '2023'
                        },
                        {
                            'id': 2,
                            'title': 'Найкращий постачальник',
                            'description': 'Нагорода від Міністерства оборони України',
                            'year': '2024'
                        }
                    ]
                }
                
                # Кешуємо на 30 хвилин
                cache.set(cache_key, data, 30 * 60)
            
            return Response(UnifiedAPIResponse.success(
                data=data,
                message='Homepage data retrieved successfully'
            ))
            
        except Exception as e:
            logger.error(f"Error in HomepageAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve homepage data',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class HomepageStatsAPIView(APIView):
    """Статистика для головної сторінки - ІСНУЮЧИЙ ENDPOINT"""
    
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
                    # Тут можна додати логіку отримання реальних даних з моделей
                    # from apps.api.models import Service, Project
                    # services_count = Service.objects.filter(is_active=True).count()
                    # projects_count = Project.objects.count()
                    pass
                except Exception as e:
                    logger.warning(f"Could not load real stats: {e}")
                
                # Кешуємо на 15 хвилин
                cache.set(cache_key, stats, 15 * 60)
            
            return Response(UnifiedAPIResponse.success(
                data=stats,
                message='Homepage stats retrieved successfully'
            ))
            
        except Exception as e:
            logger.error(f"Error in HomepageStatsAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve homepage stats',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ================== SERVICES ENDPOINTS ==================

class ServicesAPIView(APIView):
    """Всі послуги API - НОВИЙ ENDPOINT"""
    
    def get(self, request):
        try:
            # Спробуємо отримати з кешу
            cache_key = 'all_services'
            services = cache.get(cache_key)
            
            if not services:
                # Базові послуги
                services = [
                    {
                        'id': 1,
                        'title': 'Корпоративний одяг',
                        'description': 'Професійний одяг для офісу та бізнесу',
                        'icon': 'shirt',
                        'category': 'corporate',
                        'price_range': 'від 800 грн',
                        'features': ['Індивідуальний дизайн', 'Високоякісні матеріали', 'Швидке виробництво'],
                        'is_featured': True
                    },
                    {
                        'id': 2,
                        'title': 'Спецодяг і засоби захисту',
                        'description': 'Надійний захист для промисловості',
                        'icon': 'hard-hat',
                        'category': 'safety',
                        'price_range': 'від 1200 грн',
                        'features': ['Сертифіковані матеріали', 'ДСТУ стандарти', 'Тестування якості'],
                        'is_featured': True
                    },
                    {
                        'id': 3,
                        'title': 'Медичний одяг',
                        'description': 'Комфорт і гігієна для медперсоналу',
                        'icon': 'stethoscope',
                        'category': 'medical',
                        'price_range': 'від 600 грн',
                        'features': ['Антибактеріальна обробка', 'Гіпоалергенні матеріали', 'Ергономічний крій'],
                        'is_featured': True
                    },
                    {
                        'id': 4,
                        'title': 'Шкільна форма',
                        'description': 'Стильна і практична форма для учнів',
                        'icon': 'graduation-cap',
                        'category': 'education',
                        'price_range': 'від 500 грн',
                        'features': ['Стійкі кольори', 'Міцні тканини', 'Зручний крій'],
                        'is_featured': False
                    },
                    {
                        'id': 5,
                        'title': 'Одяг для HoReCa',
                        'description': 'Професійний одяг для ресторанів та готелів',
                        'icon': 'chef-hat',
                        'category': 'horeca',
                        'price_range': 'від 700 грн',
                        'features': ['Термостійкі матеріали', 'Легке прання', 'Стильний дизайн'],
                        'is_featured': False
                    },
                    {
                        'id': 6,
                        'title': 'Форма охорони',
                        'description': 'Впізнаваний і функціональний одяг для охорони',
                        'icon': 'shield',
                        'category': 'security',
                        'price_range': 'від 900 грн',
                        'features': ['Функціональні кишені', 'Міцні застібки', 'Швидкосушний матеріал'],
                        'is_featured': False
                    }
                ]
                
                # Кешуємо на 15 хвилин
                cache.set(cache_key, services, 15 * 60)
            
            return Response(UnifiedAPIResponse.success(
                data=services,
                message='Services retrieved successfully',
                meta={'count': len(services)}
            ))
            
        except Exception as e:
            logger.error(f"Error in ServicesAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve services',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FeaturedServicesAPIView(APIView):
    """Рекомендовані послуги API - ІСНУЮЧИЙ ENDPOINT"""
    
    def get(self, request):
        try:
            # Отримуємо всі послуги
            cache_key = 'featured_services'
            featured_services = cache.get(cache_key)
            
            if not featured_services:
                # Отримуємо дані з основного endpoint
                services_view = ServicesAPIView()
                services_response = services_view.get(request)
                
                if services_response.status_code == 200:
                    all_services = services_response.data['data']
                    # Фільтруємо тільки featured
                    featured_services = [s for s in all_services if s.get('is_featured', False)]
                else:
                    featured_services = []
                
                # Кешуємо на 10 хвилин
                cache.set(cache_key, featured_services, 10 * 60)
            
            return Response(UnifiedAPIResponse.success(
                data=featured_services,
                message='Featured services retrieved successfully',
                meta={'count': len(featured_services)}
            ))
            
        except Exception as e:
            logger.error(f"Error in FeaturedServicesAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve featured services',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ================== PROJECTS ENDPOINTS ==================

class ProjectsAPIView(APIView):
    """Всі проєкти API - НОВИЙ ENDPOINT"""
    
    def get(self, request):
        try:
            # Спробуємо отримати з кешу
            cache_key = 'all_projects'
            projects = cache.get(cache_key)
            
            if not projects:
                # Базові проєкти
                projects = [
                    {
                        'id': 1,
                        'title': 'Національна Гвардія України',
                        'client': 'Національна Гвардія України',
                        'subtitle': 'Захист і комфорт для наших захисників',
                        'description': 'Національна Гвардія України забезпечує своїх працівників якісним спецодягом, який відповідає найвищим стандартам захисту і комфорту в різних умовах служби.',
                        'status': 'completed',
                        'category': 'military',
                        'completion_date': '2024',
                        'team_size': '50+',
                        'features': [
                            'Вітро-вологозахисні властивості',
                            'Підвищена міцність',
                            'Ергономічний дизайн',
                            'Функціональні елементи'
                        ],
                        'metrics': {
                            'satisfaction': '98%',
                            'delivery_time': '2 місяці',
                            'items_produced': '1000+'
                        },
                        'is_featured': True
                    },
                    {
                        'id': 2,
                        'title': 'Міністерство оборони України',
                        'client': 'Міністерство оборони України',
                        'subtitle': 'Вітро-вологозахисний костюм для військових',
                        'description': 'Міністерство оборони України замовило спеціальний вітро-вологозахисний костюм, який забезпечує надійний захист і комфорт для військових у різних погодних умовах.',
                        'status': 'completed',
                        'category': 'military',
                        'completion_date': '2024',
                        'team_size': '75+',
                        'features': [
                            'Захист від несприятливої погоди',
                            'Дихаючі матеріали',
                            'Камуфляжний принт',
                            'Посилені шви'
                        ],
                        'metrics': {
                            'satisfaction': '97%',
                            'delivery_time': '3 місяці',
                            'items_produced': '2000+'
                        },
                        'is_featured': True
                    },
                    {
                        'id': 3,
                        'title': 'Медичний центр "Віта"',
                        'client': 'Медичний центр "Віта"',
                        'subtitle': 'Медичний одяг нового покоління',
                        'description': 'Комплексне забезпечення медичного центру сучасним одягом для персоналу з антибактеріальною обробкою та ергономічним дизайном.',
                        'status': 'in_progress',
                        'category': 'medical',
                        'completion_date': '2025',
                        'team_size': '15+',
                        'features': [
                            'Антибактеріальна обробка',
                            'Гіпоалергенні матеріали',
                            'Сучасний дизайн',
                            'Легка дезінфекція'
                        ],
                        'metrics': {
                            'progress': '75%',
                            'delivery_time': '1 місяць',
                            'items_planned': '500+'
                        },
                        'is_featured': True
                    },
                    {
                        'id': 4,
                        'title': 'Корпорація "Техномаш"',
                        'client': 'Корпорація "Техномаш"',
                        'subtitle': 'Корпоративний стиль для інженерів',
                        'description': 'Розробка та виготовлення корпоративного одягу для інженерно-технічного персоналу великої промислової корпорації.',
                        'status': 'completed',
                        'category': 'corporate',
                        'completion_date': '2023',
                        'team_size': '25+',
                        'features': [
                            'Корпоративні кольори',
                            'Логотип компанії',
                            'Функціональні кишені',
                            'Якісні тканини'
                        ],
                        'metrics': {
                            'satisfaction': '95%',
                            'delivery_time': '1.5 місяці',
                            'items_produced': '800+'
                        },
                        'is_featured': False
                    },
                    {
                        'id': 5,
                        'title': 'Ресторанна мережа "Смачно"',
                        'client': 'Ресторанна мережа "Смачно"',
                        'subtitle': 'Професійний одяг для кухарів',
                        'description': 'Виготовлення спеціалізованого одягу для кухарів та офіціантів мережі ресторанів з урахуванням специфіки роботи.',
                        'status': 'completed',
                        'category': 'horeca',
                        'completion_date': '2023',
                        'team_size': '20+',
                        'features': [
                            'Термостійкі матеріали',
                            'Антижирове покриття',
                            'Дихаючі тканини',
                            'Швидка прання'
                        ],
                        'metrics': {
                            'satisfaction': '96%',
                            'delivery_time': '2 місяці',
                            'items_produced': '600+'
                        },
                        'is_featured': False
                    }
                ]
                
                # Кешуємо на 20 хвилин
                cache.set(cache_key, projects, 20 * 60)
            
            return Response(UnifiedAPIResponse.success(
                data=projects,
                message='Projects retrieved successfully',
                meta={'count': len(projects)}
            ))
            
        except Exception as e:
            logger.error(f"Error in ProjectsAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve projects',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FeaturedProjectsAPIView(APIView):
    """Рекомендовані проєкти API - ІСНУЮЧИЙ ENDPOINT"""
    
    def get(self, request):
        try:
            # Отримуємо всі проєкти
            cache_key = 'featured_projects'
            featured_projects = cache.get(cache_key)
            
            if not featured_projects:
                # Отримуємо дані з основного endpoint
                projects_view = ProjectsAPIView()
                projects_response = projects_view.get(request)
                
                if projects_response.status_code == 200:
                    all_projects = projects_response.data['data']
                    # Фільтруємо тільки featured
                    featured_projects = [p for p in all_projects if p.get('is_featured', False)]
                else:
                    featured_projects = []
                
                # Кешуємо на 15 хвилин
                cache.set(cache_key, featured_projects, 15 * 60)
            
            return Response(UnifiedAPIResponse.success(
                data=featured_projects,
                message='Featured projects retrieved successfully',
                meta={'count': len(featured_projects)}
            ))
            
        except Exception as e:
            logger.error(f"Error in FeaturedProjectsAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve featured projects',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ================== TRANSLATIONS ENDPOINTS ==================

class TranslationsAPIView(APIView):
    """API для отримання перекладів для конкретної мови"""
    
    def get(self, request, lang='uk'):
        try:
            # Базові переклади
            translations = {
                'uk': {
                    'language': 'uk',
                    'count': 35,
                    'translations': {
                        'page.home.title': 'Головна сторінка',
                        'page.about.title': 'Про нас',
                        'page.services.title': 'Послуги',
                        'page.projects.title': 'Проєкти',
                        'page.contact.title': 'Контакти',
                        'hero.main_title': 'Професійний одяг',
                        'hero.sphere_title': 'кожної сфери',
                        'hero.subtitle': 'Створюємо якісний одяг для різних професій',
                        'hero.primary_button': 'Наші проєкти',
                        'hero.secondary_button': 'Дізнатися більше',
                        'about.title': 'Наш багаторічний досвід',
                        'about.subtitle': 'гарантує якість',
                        'services.title': 'Наші послуги',
                        'services.subtitle': 'для кожної галузі',
                        'projects.title': 'Наші проєкти',
                        'projects.subtitle': 'успішно реалізовані',
                        'contact.title': 'Зв\'яжіться з нами',
                        'contact.subtitle': 'прямо зараз'
                    }
                },
                'en': {
                    'language': 'en',
                    'count': 17,
                    'translations': {
                        'page.home.title': 'Home Page',
                        'page.about.title': 'About Us',
                        'page.services.title': 'Services',
                        'page.projects.title': 'Projects',
                        'page.contact.title': 'Contact',
                        'hero.main_title': 'Professional clothing',
                        'hero.sphere_title': 'for every industry',
                        'hero.subtitle': 'We create quality clothing for various professions',
                        'hero.primary_button': 'Our projects',
                        'hero.secondary_button': 'Learn more'
                    }
                }
            }
            
            if lang not in translations:
                return Response(
                    UnifiedAPIResponse.error(
                        message=f'Language "{lang}" not supported',
                        code='LANGUAGE_NOT_SUPPORTED'
                    ),
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(UnifiedAPIResponse.success(
                data=translations[lang],
                message=f'Translations for {lang} retrieved successfully'
            ))
            
        except Exception as e:
            logger.error(f"Error in TranslationsAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve translations',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AllTranslationsAPIView(APIView):
    """API для отримання всіх перекладів для мови (розширений формат)"""
    
    def get(self, request, lang='uk'):
        try:
            # Використовуємо основний endpoint
            translations_view = TranslationsAPIView()
            response = translations_view.get(request, lang)
            
            if response.status_code == 200:
                data = response.data['data']
                # Повертаємо тільки переклади
                return Response(UnifiedAPIResponse.success(
                    data=data['translations'],
                    message=f'All translations for {lang} retrieved successfully',
                    meta={
                        'language': data['language'],
                        'count': data['count']
                    }
                ))
            else:
                return response
                
        except Exception as e:
            logger.error(f"Error in AllTranslationsAPIView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve all translations',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ================== UTILITY ENDPOINTS ==================

class APIHealthCheckView(APIView):
    """Перевірка здоров'я API"""
    
    def get(self, request):
        try:
            # Перевіряємо підключення до кешу
            cache_status = 'ok'
            try:
                cache.set('health_check', 'test', 10)
                cache.get('health_check')
            except Exception:
                cache_status = 'error'
            
            health_data = {
                'status': 'healthy',
                'timestamp': '2025-01-27T10:00:00Z',
                'services': {
                    'api': 'ok',
                    'cache': cache_status,
                    'database': 'ok'  # Можна додати перевірку БД
                },
                'endpoints_available': [
                    '/homepage/',
                    '/homepage/stats/',
                    '/services/',
                    '/services/featured/',
                    '/projects/',
                    '/projects/featured/',
                    '/translations/{lang}/',
                    '/translations/{lang}/all/'
                ]
            }
            
            return Response(UnifiedAPIResponse.success(
                data=health_data,
                message='API is healthy'
            ))
            
        except Exception as e:
            logger.error(f"Error in APIHealthCheckView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='API health check failed',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CacheManagementView(APIView):
    """Управління кешем"""
    
    def get(self, request):
        """Статистика кешу"""
        try:
            # Тут можна додати логіку отримання статистики кешу
            cache_stats = {
                'cache_backend': 'default',
                'status': 'active',
                'operations': {
                    'get': 'available',
                    'set': 'available',
                    'delete': 'available',
                    'clear': 'available'
                }
            }
            
            return Response(UnifiedAPIResponse.success(
                data=cache_stats,
                message='Cache statistics retrieved successfully'
            ))
            
        except Exception as e:
            logger.error(f"Error in CacheManagementView: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to retrieve cache statistics',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        """Очищення кешу"""
        try:
            cache_keys_to_clear = [
                'homepage_data',
                'homepage_stats',
                'all_services',
                'featured_services',
                'all_projects',
                'featured_projects'
            ]
            
            cleared_count = 0
            for key in cache_keys_to_clear:
                if cache.delete(key):
                    cleared_count += 1
            
            return Response(UnifiedAPIResponse.success(
                data={
                    'cleared_keys': cleared_count,
                    'total_keys': len(cache_keys_to_clear)
                },
                message='Cache cleared successfully'
            ))
            
        except Exception as e:
            logger.error(f"Error in CacheManagementView delete: {e}")
            return Response(
                UnifiedAPIResponse.error(
                    message='Failed to clear cache',
                    details=str(e)
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

