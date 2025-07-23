# backend/apps/api/urls.py
# Оновлена конфігурація URL без дублювання

from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Імпорт оновлених views
from .views import (
    HomepageStatsAPIView,
    TranslationsAPIView, 
    AllTranslationsAPIView,
    FeaturedServicesAPIView,
    FeaturedProjectsAPIView,
    APIHealthCheckView,
    CacheManagementView,
    api_root
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
except ImportError:
    VIEWSETS_AVAILABLE = False
    print("⚠️ ViewSets not available, using API views only")

# ============================= РОУТЕР =============================
router = DefaultRouter()

# Реєструємо ViewSets тільки якщо вони доступні
if VIEWSETS_AVAILABLE:
    # Контент
    router.register(r'homepage', HomePageViewSet, basename='homepage')
    router.register(r'about', AboutPageViewSet, basename='about')
    
    # Послуги
    router.register(r'services', ServiceViewSet, basename='services')
    
    # Проекти  
    router.register(r'project-categories', ProjectCategoryViewSet, basename='projectcategory')
    router.register(r'projects', ProjectViewSet, basename='projects')
    
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
    # API корінь
    path('', api_root, name='api-root'),
    
    # Включаємо роутер якщо ViewSets доступні
    path('', include(router.urls)) if VIEWSETS_AVAILABLE else path('', api_root),
    
    # =============== ОСНОВНІ API ENDPOINTS ===============
    
    # Статистика (виправляє помилку 404)
    path('homepage/stats/', HomepageStatsAPIView.as_view(), name='homepage-stats'),
    
    # Рекомендовані послуги та проекти (для frontend)
    path('services/featured/', FeaturedServicesAPIView.as_view(), name='services-featured'),
    path('projects/featured/', FeaturedProjectsAPIView.as_view(), name='projects-featured'),
    
    # =============== API ДЛЯ ПЕРЕКЛАДІВ ===============
    
    # Основні ендпоінти перекладів
    path('translations/<str:lang>/', TranslationsAPIView.as_view(), name='translations'),
    path('translations/<str:lang>/all/', AllTranslationsAPIView.as_view(), name='translations-all'),
    
    # =============== УТИЛІТАРНІ ENDPOINTS ===============
    
    # Перевірка здоров'я API
    path('health/', APIHealthCheckView.as_view(), name='api-health'),
    
    # Управління кешем
    path('cache/', CacheManagementView.as_view(), name='cache-management'),
]

# Додаткові маршрути для сумісності
urlpatterns += [
    # Альтернативні шляхи для перекладів
    path('translations/stats/', APIHealthCheckView.as_view(), name='translations-stats'),
]