# backend/apps/api/urls.py
# Повна конфігурація URL з ViewSets

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Імпорт ViewSets
from .viewsets import (
    # Content ViewSets
    HomePageViewSet,
    AboutPageViewSet,
    TeamMemberViewSet,
    
    # Service ViewSets
    ServiceViewSet,
    
    # Project ViewSets
    ProjectCategoryViewSet,
    ProjectViewSet,
    
    # Job ViewSets
    JobPositionViewSet,
    JobApplicationViewSet,
    WorkplacePhotoViewSet,
    
    # Partner ViewSets
    PartnershipInfoViewSet,
    PartnerInquiryViewSet,
    
    # Contact ViewSets
    OfficeViewSet,
    ContactInquiryViewSet,
    
    # Utility ViewSets
    APIStatsViewSet
)

# Імпорт додаткових API Views (якщо потрібні)
from .views import (
    # Utility endpoints
    APIHealthCheckView,
    CacheManagementView,
    TranslationsAPIView,
    AllTranslationsAPIView
)

# ============================= РОУТЕР =============================

# Створюємо роутер для автоматичної генерації URL
router = DefaultRouter()

# =============== CONTENT ROUTES ===============
# Реєструємо ViewSets для контенту
router.register(r'homepage', HomePageViewSet, basename='homepage')
router.register(r'about', AboutPageViewSet, basename='about')
router.register(r'team-members', TeamMemberViewSet, basename='teammember')

# =============== SERVICE ROUTES ===============
# Реєструємо ViewSets для послуг
router.register(r'services', ServiceViewSet, basename='service')

# =============== PROJECT ROUTES ===============
# Реєструємо ViewSets для проєктів
router.register(r'project-categories', ProjectCategoryViewSet, basename='projectcategory')
router.register(r'projects', ProjectViewSet, basename='project')

# =============== JOB ROUTES ===============
# Реєструємо ViewSets для вакансій
router.register(r'jobs', JobPositionViewSet, basename='jobposition')
router.register(r'job-applications', JobApplicationViewSet, basename='jobapplication')
router.register(r'workplace-photos', WorkplacePhotoViewSet, basename='workplacephoto')

# =============== PARTNER ROUTES ===============
# Реєструємо ViewSets для партнерів
router.register(r'partnership-info', PartnershipInfoViewSet, basename='partnershipinfo')
router.register(r'partner-inquiries', PartnerInquiryViewSet, basename='partnerinquiry')

# =============== CONTACT ROUTES ===============
# Реєструємо ViewSets для контактів
router.register(r'offices', OfficeViewSet, basename='office')
router.register(r'contact-inquiries', ContactInquiryViewSet, basename='contactinquiry')

# =============== UTILITY ROUTES ===============
# Реєструємо ViewSets для утиліт
router.register(r'stats', APIStatsViewSet, basename='apistats')

# ============================= API ROOT =============================

@api_view(['GET'])
def api_root(request):
    """
    API корінь з повною інформацією про доступні endpoints
    """
    base_url = request.build_absolute_uri('/api/v1/')
    
    # ViewSets endpoints (автоматично згенеровані роутером)
    viewsets_endpoints = {
        'content': {
            'homepage': f'{base_url}homepage/',
            'homepage_detail': f'{base_url}homepage/{{id}}/',
            'homepage_stats': f'{base_url}homepage/{{id}}/stats/',
            'homepage_featured_content': f'{base_url}homepage/{{id}}/featured_content/',
            'about': f'{base_url}about/',
            'team_members': f'{base_url}team-members/',
        },
        'services': {
            'services_list': f'{base_url}services/',
            'service_detail': f'{base_url}services/{{id}}/',
            'featured_services': f'{base_url}services/featured/',
            'service_features': f'{base_url}services/{{id}}/features/',
        },
        'projects': {
            'project_categories': f'{base_url}project-categories/',
            'category_projects': f'{base_url}project-categories/{{id}}/projects/',
            'projects_list': f'{base_url}projects/',
            'project_detail': f'{base_url}projects/{{slug}}/',
            'featured_projects': f'{base_url}projects/featured/',
            'project_images': f'{base_url}projects/{{slug}}/images/',
        },
        'jobs': {
            'jobs_list': f'{base_url}jobs/',
            'job_detail': f'{base_url}jobs/{{slug}}/',
            'urgent_jobs': f'{base_url}jobs/urgent/',
            'job_applications': f'{base_url}job-applications/',
            'workplace_photos': f'{base_url}workplace-photos/',
        },
        'partners': {
            'partnership_info': f'{base_url}partnership-info/',
            'partner_inquiries': f'{base_url}partner-inquiries/',
        },
        'contacts': {
            'offices': f'{base_url}offices/',
            'contact_inquiries': f'{base_url}contact-inquiries/',
        },
        'utilities': {
            'general_stats': f'{base_url}stats/',
            'health_check': f'{base_url}health/',
            'cache_management': f'{base_url}cache/',
            'translations': f'{base_url}translations/{{lang}}/',
            'all_translations': f'{base_url}translations/{{lang}}/all/',
        }
    }
    
    # Підрахунок загальної кількості endpoints
    total_endpoints = sum(len(section) for section in viewsets_endpoints.values())
    
    return Response({
        'success': True,
        'message': 'Django REST API з ViewSets',
        'version': '1.0',
        'architecture': 'ViewSets + DRF Router',
        'endpoints': viewsets_endpoints,
        'meta': {
            'total_endpoints': total_endpoints,
            'viewsets_count': len([
                'HomePageViewSet', 'AboutPageViewSet', 'TeamMemberViewSet',
                'ServiceViewSet', 'ProjectCategoryViewSet', 'ProjectViewSet',
                'JobPositionViewSet', 'JobApplicationViewSet', 'WorkplacePhotoViewSet',
                'PartnershipInfoViewSet', 'PartnerInquiryViewSet',
                'OfficeViewSet', 'ContactInquiryViewSet', 'APIStatsViewSet'
            ]),
            'features': [
                'Автоматична генерація CRUD endpoints',
                'Пагінація',  
                'Фільтрація та пошук',
                'Кешування відповідей',
                'Валідація даних',
                'Дозволи доступу',
                'Кастомні дії (@action)',
                'Оптимізовані запити до БД'
            ]
        }
    })

# ============================= URL PATTERNS =============================

urlpatterns = [
    # API Root
    path('', api_root, name='api-root'),
    
    # Включаємо всі маршрути роутера (ViewSets)
    path('', include(router.urls)),
    
    # =============== ДОДАТКОВІ API VIEWS ===============
    # Endpoints які не підходять для ViewSets архітектури
    
    # Переклади (окремі API views для гнучкості)
    path('translations/<str:lang>/', TranslationsAPIView.as_view(), name='translations'),
    path('translations/<str:lang>/all/', AllTranslationsAPIView.as_view(), name='translations-all'),
    
    # Утилітарні endpoints
    path('health/', APIHealthCheckView.as_view(), name='api-health'),
    path('cache/', CacheManagementView.as_view(), name='cache-management'),
]

# =============== ДОДАТКОВІ АЛЬТЕРНАТИВНІ МАРШРУТИ ===============
# Для зворотної сумісності та зручності

urlpatterns += [
    # Альтернативні шляхи для популярних endpoints
    path('homepage/stats/', api_root, name='homepage-stats-alt'),  # Перенаправлення на root
    path('services/featured/', api_root, name='services-featured-alt'),
    path('projects/featured/', api_root, name='projects-featured-alt'),
    
    # Швидкий доступ
    path('ping/', APIHealthCheckView.as_view(), name='api-ping'),
]

# =============== DEBUG INFO ===============

print("🚀 ViewSets URL Configuration успішно завантажена!")
print(f"📊 Загальна кількість ViewSets: {len(router.registry)}")
print(f"🔗 Загальна кількість URL patterns: {len(urlpatterns)}")
print("✅ Архітектура: ViewSets + DRF Router")

# Виводимо список зареєстрованих ViewSets
print("\n📋 ЗАРЕЄСТРОВАНІ VIEWSETS:")
for prefix, viewset, basename in router.registry:
    print(f"  • {prefix:20} -> {viewset.__name__:25} (basename: {basename})")

# =============== ENDPOINT DOCUMENTATION ===============
"""
📚 ПОВНА ДОКУМЕНТАЦІЯ ENDPOINTS:

🏠 CONTENT ENDPOINTS:
- GET    /api/v1/homepage/                    # Список головних сторінок
- GET    /api/v1/homepage/{id}/               # Детальна головна сторінка
- GET    /api/v1/homepage/{id}/stats/         # Статистика головної сторінки
- GET    /api/v1/homepage/{id}/featured_content/ # Рекомендований контент
- GET    /api/v1/about/                       # Сторінки "Про нас"
- GET    /api/v1/team-members/                # Члени команди
- GET    /api/v1/team-members/?is_management=true # Тільки керівництво

🛠 SERVICE ENDPOINTS:
- GET    /api/v1/services/                    # Список всіх послуг
- GET    /api/v1/services/{id}/               # Деталі послуги
- GET    /api/v1/services/featured/           # Рекомендовані послуги  
- GET    /api/v1/services/{id}/features/      # Особливості послуги
- GET    /api/v1/services/?search=медичний    # Пошук послуг
- GET    /api/v1/services/?is_featured=true   # Фільтр по рекомендованим

📁 PROJECT ENDPOINTS:
- GET    /api/v1/project-categories/          # Категорії проєктів
- GET    /api/v1/project-categories/{id}/projects/ # Проєкти в категорії
- GET    /api/v1/projects/                    # Список всіх проєктів
- GET    /api/v1/projects/{slug}/             # Деталі проєкту
- GET    /api/v1/projects/featured/           # Рекомендовані проєкти
- GET    /api/v1/projects/{slug}/images/      # Зображення проєкту
- GET    /api/v1/projects/?category=1         # Фільтр по категорії
- GET    /api/v1/projects/?search=лікарня     # Пошук проєктів

💼 JOB ENDPOINTS:
- GET    /api/v1/jobs/                        # Активні вакансії
- GET    /api/v1/jobs/{slug}/                 # Деталі вакансії
- GET    /api/v1/jobs/urgent/                 # Термінові вакансії
- POST   /api/v1/job-applications/            # Подача заявки на вакансію
- GET    /api/v1/job-applications/            # Список заявок (auth required)
- GET    /api/v1/workplace-photos/            # Фото робочих місць
- GET    /api/v1/jobs/?employment_type=full_time # Фільтр по типу зайнятості

🤝 PARTNER ENDPOINTS:
- GET    /api/v1/partnership-info/            # Інформація про партнерство  
- POST   /api/v1/partner-inquiries/           # Створення запиту партнера
- GET    /api/v1/partner-inquiries/           # Список запитів (auth required)

📞 CONTACT ENDPOINTS:
- GET    /api/v1/offices/                     # Список офісів
- GET    /api/v1/offices/?city=Київ           # Офіси в місті
- GET    /api/v1/offices/?is_main=true        # Головні офіси
- POST   /api/v1/contact-inquiries/           # Створення звернення
- GET    /api/v1/contact-inquiries/           # Список звернень (auth required)

📊 UTILITY ENDPOINTS:
- GET    /api/v1/stats/                       # Загальна статистика сайту
- GET    /api/v1/health/                      # Перевірка здоров'я API
- GET    /api/v1/cache/                       # Статистика кешу
- DELETE /api/v1/cache/                       # Очищення кешу
- GET    /api/v1/translations/{lang}/         # Переклади для мови
- GET    /api/v1/translations/{lang}/all/     # Всі переклади для мови

🔍 ОСОБЛИВОСТІ VIEWSETS:
- Автоматична пагінація для списків
- Підтримка фільтрації (?field=value)
- Підтримка пошуку (?search=query)
- Підтримка сортування (?ordering=field)
- Кешування відповідей для продуктивності
- Валідація даних через серіалізатори
- Кастомні дії через @action декоратор
- Оптимізовані запити з select_related/prefetch_related

📝 ПРИКЛАДИ ЗАПИТІВ:
- GET /api/v1/services/?is_featured=true&ordering=name
- GET /api/v1/projects/?search=медичний&category=1
- GET /api/v1/jobs/?employment_type=full_time&is_urgent=true
- GET /api/v1/team-members/?is_management=true&ordering=order
- POST /api/v1/contact-inquiries/ (з JSON body)

🔐 ДОЗВОЛИ:
- Більшість GET endpoints: AllowAny (публічний доступ)
- POST endpoints для заявок/звернень: AllowAny
- GET endpoints для заявок/звернень: IsAuthenticated
- Адміністративні функції: IsAuthenticated

⚡ ПРОДУКТИВНІСТЬ:
- Кешування для статичних даних (статистика, переклади)
- Оптимізовані запити до БД
- Пагінація для великих списків
- Compression для API відповідей
"""