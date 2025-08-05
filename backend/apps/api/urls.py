# backend/apps/api/urls.py
# Оптимізована конфігурація URL без дублювання

from django.urls import path, include
from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Імпорт оптимізованих ViewSets
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
    WorkStageViewSet,  # Додано відсутній ViewSet
    PartnerInquiryViewSet,
    
    # Contact ViewSets
    OfficeViewSet,
    ContactInquiryViewSet,
    
    # Централізований ViewSet
    UnifiedContentViewSet
)

# Імпорт додаткових API Views
from .views import (
    APIHealthCheckView,
    CacheManagementView,
    TranslationsAPIView,
    AllTranslationsAPIView
)

# ============================= РОУТЕР =============================

router = DefaultRouter()

# =============== CONTENT ROUTES ===============
router.register(r'homepage', HomePageViewSet, basename='homepage')
router.register(r'about', AboutPageViewSet, basename='about')
router.register(r'team-members', TeamMemberViewSet, basename='teammember')

# =============== SERVICE ROUTES ===============
router.register(r'services', ServiceViewSet, basename='service')

# =============== PROJECT ROUTES ===============
router.register(r'project-categories', ProjectCategoryViewSet, basename='projectcategory')
router.register(r'projects', ProjectViewSet, basename='project')

# =============== JOB ROUTES ===============
router.register(r'jobs', JobPositionViewSet, basename='jobposition')
router.register(r'job-applications', JobApplicationViewSet, basename='jobapplication')
router.register(r'workplace-photos', WorkplacePhotoViewSet, basename='workplacephoto')

# =============== PARTNER ROUTES ===============
router.register(r'partnership-info', PartnershipInfoViewSet, basename='partnershipinfo')
router.register(r'work-stages', WorkStageViewSet, basename='workstage')  # Додано відсутній ViewSet
router.register(r'partner-inquiries', PartnerInquiryViewSet, basename='partnerinquiry')

# =============== CONTACT ROUTES ===============
router.register(r'offices', OfficeViewSet, basename='office')
router.register(r'contact-inquiries', ContactInquiryViewSet, basename='contactinquiry')

# =============== UNIFIED CONTENT ROUTES ===============
# Централізований ViewSet для статистики та featured контенту
router.register(r'content', UnifiedContentViewSet, basename='unifiedcontent')

# ============================= API ROOT =============================

@api_view(['GET'])
def api_root(request):
    """API корінь з оптимізованою інформацією про endpoints"""
    base_url = request.build_absolute_uri('/api/v1/')
    
    endpoints = {
        'content': {
            'homepage': f'{base_url}homepage/',
            'about': f'{base_url}about/',
            'team_members': f'{base_url}team-members/',
            
            # Централізовані endpoints замість дублювання
            'unified_stats': f'{base_url}content/stats/',
            'unified_featured': f'{base_url}content/featured/',
        },
        'services': {
            'services_list': f'{base_url}services/',
            'service_detail': f'{base_url}services/{{id}}/',
            'service_features': f'{base_url}services/{{id}}/features/',
        },
        'projects': {
            'project_categories': f'{base_url}project-categories/',
            'category_projects': f'{base_url}project-categories/{{id}}/projects/',
            'projects_list': f'{base_url}projects/',
            'project_detail': f'{base_url}projects/{{slug}}/',
            'project_images': f'{base_url}projects/{{slug}}/images/',
        },
        'jobs': {
            'jobs_list': f'{base_url}jobs/',
            'job_detail': f'{base_url}jobs/{{slug}}/',
            'job_applications': f'{base_url}job-applications/',
            'workplace_photos': f'{base_url}workplace-photos/',
        },
        'partners': {
            'partnership_info': f'{base_url}partnership-info/',
            'work_stages': f'{base_url}work-stages/',  # Додано відсутній endpoint
            'partner_inquiries': f'{base_url}partner-inquiries/',
        },
        'contacts': {
            'offices': f'{base_url}offices/',
            'contact_inquiries': f'{base_url}contact-inquiries/',
        },
        'utilities': {
            'health_check': f'{base_url}health/',
            'cache_management': f'{base_url}cache/',
            'translations': f'{base_url}translations/{{lang}}/',
            'all_translations': f'{base_url}translations/{{lang}}/all/',
        }
    }
    
    return Response({
        'success': True,
        'message': 'Оптимізований Django REST API',
        'version': '1.1',
        'architecture': 'ViewSets + DRF Router (Optimized)',
        'endpoints': endpoints,
        'optimizations': [
            '✅ Об\'єднано дублюючі статистики в /content/stats/',
            '✅ Централізовано featured контент в /content/featured/',
            '✅ Видалено непотрібні альтернативні маршрути',
            '✅ Додано відсутній WorkStageViewSet',
            '✅ Уніфіковано health check endpoint',
            '✅ Виправлено помилки з полем city в OfficeViewSet'
        ],
        'meta': {
            'total_endpoints': sum(len(section) for section in endpoints.values()),
            'viewsets_count': len(router.registry),
            'removed_duplicates': [
                'homepage/stats/ (merged into /content/stats/)',
                'services/featured/ (merged into /content/featured/)',
                'projects/featured/ (merged into /content/featured/)',
                'ping/ (unified with /health/)'
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
    # Тільки унікальні endpoints без дублювання
    
    # Переклади
    path('translations/<str:lang>/', TranslationsAPIView.as_view(), name='translations'),
    path('translations/<str:lang>/all/', AllTranslationsAPIView.as_view(), name='translations-all'),
    
    # Утилітарні endpoints
    path('health/', APIHealthCheckView.as_view(), name='api-health'),
    path('cache/', CacheManagementView.as_view(), name='cache-management'),
]

# =============== DEBUG INFO (REMOVED FOR PRODUCTION) ===============

# Debug output moved to development settings only
if settings.DEBUG:
    print("🚀 Оптимізовану URL конфігурацію завантажено!")
    print(f"📊 Загальна кількість ViewSets: {len(router.registry)}")
    print(f"🔗 Загальна кількість URL patterns: {len(urlpatterns)}")
    print("✅ Архітектура: Оптимізовані ViewSets + DRF Router")

# =============== ENDPOINT DOCUMENTATION ===============
"""
📚 ОПТИМІЗОВАНА ДОКУМЕНТАЦІЯ ENDPOINTS:

🏠 CONTENT ENDPOINTS:
- GET    /api/v1/homepage/                    # Список головних сторінок
- GET    /api/v1/homepage/{id}/               # Детальна головна сторінка
- GET    /api/v1/about/                       # Сторінки "Про нас"
- GET    /api/v1/team-members/                # Члени команди
- GET    /api/v1/team-members/?is_management=true # Тільки керівництво

📊 ЦЕНТРАЛІЗОВАНІ ENDPOINTS (НОВІ):
- GET    /api/v1/content/stats/               # Об'єднана статистика (замість дублювання)
- GET    /api/v1/content/featured/            # Весь featured контент в одному місці

🛠 SERVICE ENDPOINTS:
- GET    /api/v1/services/                    # Список всіх послуг
- GET    /api/v1/services/{id}/               # Деталі послуги
- GET    /api/v1/services/{id}/features/      # Особливості послуги

📁 PROJECT ENDPOINTS:
- GET    /api/v1/project-categories/          # Категорії проєктів
- GET    /api/v1/project-categories/{id}/projects/ # Проєкти в категорії
- GET    /api/v1/projects/                    # Список проєктів
- GET    /api/v1/projects/{slug}/             # Деталі проєкту
- GET    /api/v1/projects/{slug}/images/      # Зображення проєкту

💼 JOB ENDPOINTS:
- GET    /api/v1/jobs/                        # Список вакансій
- GET    /api/v1/jobs/{slug}/                 # Деталі вакансії
- POST   /api/v1/job-applications/            # Подати заявку на вакансію
- GET    /api/v1/workplace-photos/            # Фото робочих місць

🤝 PARTNER ENDPOINTS:
- GET    /api/v1/partnership-info/            # Інформація для партнерів
- GET    /api/v1/work-stages/                 # Етапи роботи (НОВИЙ ViewSet)
- POST   /api/v1/partner-inquiries/           # Запити партнерів

📞 CONTACT ENDPOINTS:
- GET    /api/v1/offices/                     # Список офісів
- POST   /api/v1/contact-inquiries/           # Звернення клієнтів

📊 UTILITY ENDPOINTS:
- GET    /api/v1/health/                      # Перевірка здоров'я API (єдиний endpoint)
- GET    /api/v1/cache/                       # Статистика кешу
- DELETE /api/v1/cache/                       # Очищення кешу
- GET    /api/v1/translations/{lang}/         # Переклади для мови
- GET    /api/v1/translations/{lang}/all/     # Всі переклади для мови

🔧 ОПТИМІЗАЦІЇ:
✅ Видалено дублюючі endpoints:
   - homepage/{id}/stats/ -> content/stats/
   - services/featured/ -> content/featured/ 
   - projects/featured/ -> content/featured/
   - ping/ -> health/

✅ Додано відсутні ViewSets:
   - WorkStageViewSet для етапів роботи

✅ Виправлено помилки:
   - Видалено неіснуюче поле 'city' з OfficeViewSet
   - Додано proper ordering для всіх моделей

⚡ ПОКРАЩЕННЯ ПРОДУКТИВНОСТІ:
- Централізоване кешування статистики
- Об'єднані запити для featured контенту
- Менше HTTP запитів до API
- Оптимізовані queryset з prefetch_related
"""