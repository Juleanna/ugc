# backend/apps/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# ВИПРАВЛЕННЯ: Імпортуємо ViewSets з views.py (не з views/__init__.py)
from apps.api.views import (
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

# Імпортуємо views для перекладів з views/ директорії
try:
    from .translations import (
        TranslationsAPIView, 
        DynamicTranslationsAPIView, 
        AllTranslationsAPIView,
        TranslationUpdateWebhook,
        TranslationStatsView,
        TranslationSearchView,
        TranslationKeysView
    )
    
    TRANSLATIONS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Translation views not available: {e}")
    TRANSLATIONS_AVAILABLE = False

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
]

# Додаємо переклади тільки якщо вони доступні
if TRANSLATIONS_AVAILABLE:
    translation_urls = [
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
    
    urlpatterns += translation_urls
else:
    print("ℹ️ Translation URLs not loaded - translation views not available")

# ============================= ДОКУМЕНТАЦІЯ API ===============================

"""
ІСНУЮЧІ API ЕНДПОІНТИ:

1. КОНТЕНТ:
   GET /api/v1/homepage/ - Головна сторінка
   GET /api/v1/about/ - Про нас
   
2. ПОСЛУГИ:
   GET /api/v1/services/ - Список послуг
   GET /api/v1/services/{id}/ - Деталі послуги
   GET /api/v1/services/featured/ - Рекомендовані послуги
   
3. ПРОЕКТИ:
   GET /api/v1/project-categories/ - Категорії проектів
   GET /api/v1/projects/ - Список проектів
   GET /api/v1/projects/{id}/ - Деталі проекту
   GET /api/v1/projects/featured/ - Рекомендовані проекти
   
4. ВАКАНСІЇ:
   GET /api/v1/jobs/ - Список вакансій
   GET /api/v1/jobs/{id}/ - Деталі вакансії
   GET /api/v1/jobs/urgent/ - Термінові вакансії
   POST /api/v1/job-applications/ - Подати заявку на роботу
   
5. ОФІСИ ТА КОНТАКТИ:
   GET /api/v1/offices/ - Список офісів
   POST /api/v1/contact-inquiries/ - Надіслати звернення
   
6. ПАРТНЕРСТВО:
   GET /api/v1/partnership-info/ - Інформація про партнерство
   POST /api/v1/partner-inquiries/ - Запит партнера
   
7. ФОТО:
   GET /api/v1/workplace-photos/ - Фото робочих місць

ПЕРЕКЛАДИ (якщо доступні):
   GET /api/v1/translations/uk/ - Українські переклади
   GET /api/v1/translations/en/ - Англійські переклади
   GET /api/v1/translations/stats/ - Статистика
"""