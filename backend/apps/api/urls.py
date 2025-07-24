# backend/apps/api/urls.py
# Повна конфігурація URL з усіма необхідними endpoints

from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Імпорт всіх views
from .views import (
    # API Root
    api_root,
    
    # Homepage endpoints
    HomepageAPIView,
    HomepageStatsAPIView,
    
    # Services endpoints
    ServicesAPIView,
    FeaturedServicesAPIView,
    
    # Projects endpoints
    ProjectsAPIView,
    FeaturedProjectsAPIView,
    
    # Translations endpoints
    TranslationsAPIView,
    AllTranslationsAPIView,
    
    # Utility endpoints
    APIHealthCheckView,
    CacheManagementView
)

# Імпорт існуючих ViewSets (якщо є)
try:
    from .views import (
        HomePageViewSet, 
        AboutPageViewSet, 
        ServiceViewSet, 
        JobPositionViewSet, 
        JobApplicationViewSet,
        OfficeViewSet, 
        ContactInquiryViewSet, 
        PartnershipInfoViewSet, 
        PartnerInquiryViewSet,
        WorkplacePhotoViewSet,
        ProjectCategoryViewSet, 
        ProjectViewSet
    )
    VIEWSETS_AVAILABLE = True
    print("✅ ViewSets імпортовано успішно")
except ImportError:
    VIEWSETS_AVAILABLE = False
    print("⚠️ ViewSets не доступні, використовуємо тільки API views")

# ============================= РОУТЕР =============================
router = DefaultRouter()

# Реєструємо ViewSets тільки якщо вони доступні
if VIEWSETS_AVAILABLE:
    # Контент
    router.register(r'homepage-viewset', HomePageViewSet, basename='homepage-viewset')
    router.register(r'about-viewset', AboutPageViewSet, basename='about-viewset')
    
    # Послуги  
    router.register(r'services-viewset', ServiceViewSet, basename='services-viewset')
    
    # Проекти
    router.register(r'project-categories', ProjectCategoryViewSet, basename='projectcategory')
    router.register(r'projects-viewset', ProjectViewSet, basename='projects-viewset')
    
    # Вакансії
    router.register(r'jobs', JobPositionViewSet, basename='jobs')
    router.register(r'job-applications', JobApplicationViewSet, basename='jobapplications')
    
    # Офіси та контакти
    router.register(r'offices', OfficeViewSet, basename='offices')
    router.register(r'contact-inquiries', ContactInquiryViewSet, basename='contactinquiries')
    
    # Партнерство
    router.register(r'partnership-info', PartnershipInfoViewSet, basename='partnershipinfo')
    router.register(r'partner-inquiries', PartnerInquiryViewSet, basename='partnerinquiries')
    
    # Фото
    router.register(r'workplace-photos', WorkplacePhotoViewSet, basename='workplacephotos')

# ============================= URL PATTERNS =============================
urlpatterns = [
    # =============== API ROOT ===============
    path('', api_root, name='api-root'),
    
    # =============== HOMEPAGE ENDPOINTS ===============
    # НОВИЙ: Основні дані головної сторінки
    path('homepage/', HomepageAPIView.as_view(), name='homepage'),
    # ІСНУЮЧИЙ: Статистика головної сторінки
    path('homepage/stats/', HomepageStatsAPIView.as_view(), name='homepage-stats'),
    
    # =============== SERVICES ENDPOINTS ===============
    # НОВИЙ: Всі послуги
    path('services/', ServicesAPIView.as_view(), name='services'),
    # ІСНУЮЧИЙ: Рекомендовані послуги
    path('services/featured/', FeaturedServicesAPIView.as_view(), name='services-featured'),
    
    # =============== PROJECTS ENDPOINTS ===============
    # НОВИЙ: Всі проєкти
    path('projects/', ProjectsAPIView.as_view(), name='projects'),
    # ІСНУЮЧИЙ: Рекомендовані проєкти
    path('projects/featured/', FeaturedProjectsAPIView.as_view(), name='projects-featured'),
    
    # =============== TRANSLATIONS ENDPOINTS ===============
    # Основні переклади для мови
    path('translations/<str:lang>/', TranslationsAPIView.as_view(), name='translations'),
    # Всі переклади для мови (розширений формат)
    path('translations/<str:lang>/all/', AllTranslationsAPIView.as_view(), name='translations-all'),
    
    # =============== UTILITY ENDPOINTS ===============
    # Перевірка здоров'я API
    path('health/', APIHealthCheckView.as_view(), name='api-health'),
    # Управління кешем
    path('cache/', CacheManagementView.as_view(), name='cache-management'),
    
    # =============== VIEWSETS (якщо доступні) ===============
    # Включаємо роутер якщо ViewSets доступні
    path('', include(router.urls)) if VIEWSETS_AVAILABLE else path('', api_root),
]

# =============== ДОДАТКОВІ МАРШРУТИ ===============

# Альтернативні шляхи для сумісності
urlpatterns += [
    # Альтернативний шлях для статистики
    path('stats/', HomepageStatsAPIView.as_view(), name='stats-alt'),
    
    # Альтернативні шляхи для перекладів
    path('translations/stats/', APIHealthCheckView.as_view(), name='translations-stats'),
    
    # Швидкий доступ до здоров'я API
    path('ping/', APIHealthCheckView.as_view(), name='api-ping'),
]

# =============== DEBUG INFO ===============
if VIEWSETS_AVAILABLE:
    print("🔗 URL Configuration loaded with ViewSets support")
    print(f"📊 Total URL patterns: {len(urlpatterns)}")
else:
    print("🔗 URL Configuration loaded with API Views only")
    print(f"📊 Total URL patterns: {len(urlpatterns)}")

# =============== ENDPOINT SUMMARY ===============
"""
📋 ДОСТУПНІ ENDPOINTS:

✅ ПРАЦЮЮЧІ (існуючі):
- GET /api/v1/homepage/stats/          # Статистика головної сторінки
- GET /api/v1/services/featured/       # Рекомендовані послуги  
- GET /api/v1/projects/featured/       # Рекомендовані проєкти

🆕 НОВІ (додані):
- GET /api/v1/                         # API root з інформацією
- GET /api/v1/homepage/                # Основні дані головної сторінки
- GET /api/v1/services/                # Всі послуги
- GET /api/v1/projects/                # Всі проєкти
- GET /api/v1/translations/{lang}/     # Переклади для мови
- GET /api/v1/translations/{lang}/all/ # Всі переклади для мови
- GET /api/v1/health/                  # Перевірка здоров'я API
- GET /api/v1/cache/                   # Статистика кешу
- DELETE /api/v1/cache/                # Очищення кешу

🔧 УТИЛІТАРНІ:
- GET /api/v1/stats/                   # Альтернативний шлях для статистики
- GET /api/v1/ping/                    # Швидка перевірка API
- GET /api/v1/translations/stats/      # Статистика перекладів

📦 VIEWSETS (якщо доступні):
- /api/v1/homepage-viewset/            # ViewSet для головної сторінки
- /api/v1/services-viewset/            # ViewSet для послуг
- /api/v1/projects-viewset/            # ViewSet для проєктів
- /api/v1/jobs/                        # Вакансії
- /api/v1/offices/                     # Офіси
- /api/v1/contact-inquiries/           # Звернення
"""