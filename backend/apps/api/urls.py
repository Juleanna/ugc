# backend/apps/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Імпортуємо існуючі views
from .views import (HomePageViewSet, AboutPageViewSet, ServiceViewSet, JobPositionViewSet, JobApplicationViewSet,
 OfficeViewSet, ContactInquiryViewSet, PartnershipInfoViewSet, PartnerInquiryViewSet,WorkplacePhotoViewSet,
ProjectCategoryViewSet, ProjectViewSet)

# Імпортуємо views для перекладів
from .views.translations import (
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

# ============================= ДОКУМЕНТАЦІЯ API ===============================

"""
API Ендпоінти для перекладів:

1. БАЗОВІ ПЕРЕКЛАДИ:
   GET /api/v1/translations/uk/ - Статичні переклади українською
   GET /api/v1/translations/en/ - Статичні переклади англійською
   
2. ДИНАМІЧНІ ПЕРЕКЛАДИ (з моделей):
   GET /api/v1/translations/uk/dynamic/ - Динамічні переклади з Django моделей
   
3. ВСІ ПЕРЕКЛАДИ:
   GET /api/v1/translations/uk/all/ - Статичні + динамічні переклади
   
4. ПОШУК:
   GET /api/v1/translations/uk/search/?q=пошук - Пошук перекладів
   
5. КЛЮЧІ:
   GET /api/v1/translations/uk/keys/ - Список всіх ключів перекладів
   
6. СТАТИСТИКА:
   GET /api/v1/translations/stats/ - Статистика по всім мовам
   
7. WEBHOOK:
   POST /api/v1/webhooks/translations/update/ - Очищення кешу

ПРИКЛАДИ ВІДПОВІДЕЙ:

1. Базові переклади:
{
  "language": "uk",
  "translations": {
    "nav.home": "Головна",
    "nav.about": "Про нас",
    "common.loading": "Завантаження..."
  },
  "count": 3,
  "source": "static",
  "available_languages": ["uk", "en"]
}

2. Пошук:
{
  "query": "головна",
  "language": "uk", 
  "results": {
    "nav.home": "Головна",
    "page.home.title": "Головна сторінка"
  },
  "count": 2
}

3. Статистика:
{
  "languages": {
    "uk": {
      "name": "Українська",
      "static_count": 45,
      "dynamic_count": 12,
      "total_count": 57
    },
    "en": {
      "name": "English", 
      "static_count": 43,
      "dynamic_count": 10,
      "total_count": 53
    }
  },
  "total_languages": 2
}

ПАРАМЕТРИ ЗАПИТІВ:

1. Пошук:
   - q: текст для пошуку (обов'язковий)
   
2. Всі ендпоінти підтримують:
   - Cache-Control заголовки
   - CORS
   - Rate limiting

ПОМИЛКИ:

400 Bad Request - Некоректні параметри
404 Not Found - Мова не підтримується  
500 Internal Server Error - Помилка сервера
429 Too Many Requests - Перевищено ліміт запитів

КЕШУВАННЯ:

- Статичні переклади: 30 хвилин
- Динамічні переклади: 15 хвилин
- Кеш очищається через webhook або автоматично

БЕЗПЕКА:

- Rate limiting: 100 запитів/хвилину
- CORS налаштований для фронтенду
- CSRF захист для webhook
"""