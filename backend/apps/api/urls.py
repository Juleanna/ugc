# backend/apps/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Імпортуємо існуючі views
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

# ВИПРАВЛЕНО: Імпортуємо views для перекладів з основної папки api
from .translations import (
    TranslationsAPIView, 
    DynamicTranslationsAPIView, 
    AllTranslationsAPIView,
    TranslationUpdateWebhook,
    TranslationStatsView,
    TranslationSearchView,
    TranslationKeysView
)

# ============================= РОУТЕР =============================
router = DefaultRouter()

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
    # API роутер (ваші існуючі ендпоінти)
    path('', include(router.urls)),
    
    # =============== API ДЛЯ ПЕРЕКЛАДІВ ===============
    
    # Основні ендпоінти перекладів
    path('translations/<str:lang>/', TranslationsAPIView.as_view(), name='translations-static'),
    path('translations/<str:lang>/dynamic/', DynamicTranslationsAPIView.as_view(), name='translations-dynamic'),
    path('translations/<str:lang>/all/', AllTranslationsAPIView.as_view(), name='translations-all'),
    
    # Статистика та утиліти
    path('translations/stats/', TranslationStatsView.as_view(), name='translations-stats'),
    path('translations/<str:lang>/search/', TranslationSearchView.as_view(), name='translations-search'),
    path('translations/<str:lang>/keys/', TranslationKeysView.as_view(), name='translations-keys'),
    
    # =============== WEBHOOKS ===============
    path('webhooks/translations/update/', TranslationUpdateWebhook.as_view(), name='translation-webhook'),
]