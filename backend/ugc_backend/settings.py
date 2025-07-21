# backend/ugc_backend/settings.py - ВИПРАВЛЕНИЙ ФАЙЛ
from pathlib import Path
import os
from decouple import config
from django.templatetags.static import static
from django.utils.translation import gettext_lazy as _

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ========== ОСНОВНІ НАЛАШТУВАННЯ ==========

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost').split(',')

# ========== ДОДАТКИ ==========

DJANGO_APPS = [
    'modeltranslation',  # ВАЖЛИВО: має бути перед django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'django_filters',
    'corsheaders',
    'parler', 
    'rosetta',
    'ckeditor',
    'ckeditor_uploader',
]

LOCAL_APPS = [
    'apps.content',
    'apps.services',
    'apps.projects',
    'apps.jobs',
    'apps.partners',
    'apps.contacts',
    'apps.api',
    'ugc_backend.apps.UgcBackendConfig',  # Додаємо наш AppConfig
]

UNFOLD = [
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'unfold.contrib.inlines',
    'unfold.contrib.import_export',
    'unfold.contrib.guardian',
    'unfold.contrib.simple_history',
]

INSTALLED_APPS = UNFOLD + DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ========== MIDDLEWARE ==========

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # Для i18n
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ugc_backend.urls'

# ========== ШАБЛОНИ ==========

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.i18n',  # Для i18n
            ],
        },
    },
]

WSGI_APPLICATION = 'ugc_backend.wsgi.application'

# ========== БАЗА ДАНИХ ==========

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# ========== ВАЛІДАЦІЯ ПАРОЛІВ ==========

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ========== ЛОКАЛІЗАЦІЯ ТА ПЕРЕКЛАДИ ==========

# Основні налаштування мови
LANGUAGE_CODE = 'uk'
TIME_ZONE = 'Europe/Kiev'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Підтримувані мови
LANGUAGES = [
    ('uk', 'Українська'),
    ('en', 'English'),
]

# Шляхи до файлів локалізації
LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

# Налаштування для django-modeltranslation
MODELTRANSLATION_LANGUAGES = ('uk', 'en')
MODELTRANSLATION_DEFAULT_LANGUAGE = 'uk'
MODELTRANSLATION_PREPOPULATE_LANGUAGE = 'uk'
MODELTRANSLATION_ENABLE_FALLBACKS = True
MODELTRANSLATION_FALLBACK_LANGUAGES = {
    'default': ('uk',),
    'uk': ('uk', 'en'),
    'en': ('uk',),
}

# ========== СТАТИЧНІ ТА МЕДІА ФАЙЛИ ==========

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ========== НАЛАШТУВАННЯ CKEDITOR ==========

CKEDITOR_UPLOAD_PATH = "uploads/"
CKEDITOR_BROWSE_SHOW_DIRS = True
CKEDITOR_UPLOAD_SLUGIFY_FILENAME = True

CKEDITOR_CONFIGS = {
    'default': {
        'skin': 'office2013',
        'toolbar_Basic': [
            ['Source', '-', 'Bold', 'Italic']
        ],
        'toolbar_YourCustomToolbarConfig': [
            {'name': 'document', 'items': ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates']},
            {'name': 'clipboard', 'items': ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
            {'name': 'editing', 'items': ['Find', 'Replace', '-', 'SelectAll']},
            {'name': 'forms',
             'items': ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton',
                       'HiddenField']},
            '/',
            {'name': 'basicstyles',
             'items': ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
            {'name': 'paragraph',
             'items': ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-',
                       'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl',
                       'Language']},
            {'name': 'links', 'items': ['Link', 'Unlink', 'Anchor']},
            {'name': 'insert',
             'items': ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']},
            '/',
            {'name': 'styles', 'items': ['Styles', 'Format', 'Font', 'FontSize']},
            {'name': 'colors', 'items': ['TextColor', 'BGColor']},
            {'name': 'tools', 'items': ['Maximize', 'ShowBlocks']},
            {'name': 'about', 'items': ['About']},
            '/',
            {'name': 'yourcustomtools', 'items': [
                'Preview',
                'Maximize',
            ]},
        ],
        'toolbar': 'YourCustomToolbarConfig',
        'tabSpaces': 4,
        'extraPlugins': ','.join([
            'uploadimage',
            'div',
            'autolink',
            'autoembed',
            'embedsemantic',
            'autogrow',
            'widget',
            'lineutils',
            'clipboard',
            'dialog',
            'dialogui',
            'elementspath'
        ]),
    }
}

# ========== КЕШУВАННЯ ==========

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SERIALIZER': 'django_redis.serializers.json.JSONSerializer',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            },
            'IGNORE_EXCEPTIONS': True,
        },
        'KEY_PREFIX': 'ugc_translations',
        'TIMEOUT': 300,
    }
}

# Налаштування кешування перекладів
TRANSLATION_CACHE_SETTINGS = {
    'STATIC_TIMEOUT': 60 * 60,          # 1 година для статичних перекладів
    'DYNAMIC_TIMEOUT': 60 * 30,         # 30 хвилин для динамічних
    'PO_TIMEOUT': 60 * 60 * 2,          # 2 години для PO файлів
    'UNIFIED_TIMEOUT': 60 * 45,         # 45 хвилин для об'єднаних
    'MAX_CACHE_SIZE': 10000,            # Максимальний розмір кешу
    'ENABLE_COMPRESSION': True,         # Стиснення великих перекладів
    'VERSION_TIMEOUT': 60 * 60 * 24,    # 24 години для версій
}

# ========== НАЛАШТУВАННЯ СТАТИЧНИХ ПЕРЕКЛАДІВ ==========

# Директорії для різних типів перекладів
STATIC_TRANSLATIONS_DIR = BASE_DIR / 'static_translations'
FRONTEND_TRANSLATIONS_DIR = BASE_DIR / 'frontend_translations'

# Створюємо директорії якщо не існують
os.makedirs(STATIC_TRANSLATIONS_DIR, exist_ok=True)
os.makedirs(FRONTEND_TRANSLATIONS_DIR, exist_ok=True)

# Шляхи для експорту
TRANSLATION_EXPORT_PATHS = {
    'static': STATIC_TRANSLATIONS_DIR,
    'frontend': FRONTEND_TRANSLATIONS_DIR,
    'nextjs': BASE_DIR.parent / 'frontend' / 'public' / 'translations',
    'react': BASE_DIR.parent / 'frontend' / 'src' / 'translations',
}

# Налаштування експорту перекладів
TRANSLATION_EXPORT_SETTINGS = {
    'INCLUDE_DYNAMIC': True,
    'INCLUDE_PO': True,
    'BATCH_SIZE': 1000,
    'MAX_EXPORT_SIZE': 50000,
    'AUTO_BACKUP': True,
    'BACKUP_COUNT': 5,
    'COMPRESSION_LEVEL': 6,
    'GENERATE_TYPESCRIPT': True,
    'GENERATE_METADATA': True,
}

# ========== REST FRAMEWORK ==========

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'user': '2000/hour',
        'translations': '100/min',
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.NamespaceVersioning',
    'DEFAULT_VERSION': 'v1',
    'ALLOWED_VERSIONS': ['v1'],
}

# ========== CORS НАЛАШТУВАННЯ ==========

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # React/Next.js dev server
    "http://127.0.0.1:3000",
    "http://localhost:5173",    # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:8080",    # Vue dev server
    "http://127.0.0.1:8080",
    # Додайте ваш production домен
    # "https://yourdomain.com",
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-cache',
    'cache-control',
    'x-api-key',
]

CORS_ALLOW_CREDENTIALS = True
CORS_PREFLIGHT_MAX_AGE = 86400
CORS_URLS_REGEX = r'^/api/.*$'

# ========== БЕЗПЕКА ==========

# Налаштування сесій
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# CSRF
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# Безпекові заголовки
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_FRAME_DENY = True

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Rate limiting для API перекладів
TRANSLATION_RATE_LIMITING = {
    'ENABLE': True,
    'REQUESTS_PER_MINUTE': 60,
    'REQUESTS_PER_HOUR': 1000,
    'BLOCK_DURATION': 60 * 15,
}

# Валідація файлів перекладів
TRANSLATION_VALIDATION = {
    'MAX_FILE_SIZE': 1024 * 1024 * 5,  # 5MB
    'ALLOWED_EXTENSIONS': ['.json', '.po', '.mo'],
    'MAX_KEY_LENGTH': 200,
    'MAX_VALUE_LENGTH': 1000,
    'FORBIDDEN_KEYS': ['__proto__', 'constructor', 'prototype'],
}

# ========== ЛОГУВАННЯ ==========

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'translations_file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'translations.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps.api': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'apps.api.views.translations': {
            'handlers': ['translations_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps.api.utils.translations': {
            'handlers': ['translations_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Створюємо папку для логів
os.makedirs(BASE_DIR / 'logs', exist_ok=True)

# ========== РОЗШИРЕНІ НАЛАШТУВАННЯ ==========

# Автоматичне резервне копіювання
AUTO_BACKUP_TRANSLATIONS = {
    'ENABLED': True,
    'SCHEDULE': '0 2 * * *',  # Щодня о 2:00
    'RETENTION_DAYS': 30,
    'BACKUP_DIR': BASE_DIR / 'backups' / 'translations',
}

os.makedirs(AUTO_BACKUP_TRANSLATIONS['BACKUP_DIR'], exist_ok=True)

# Налаштування для webhooks
TRANSLATION_WEBHOOKS = {
    'ENABLED': True,
    'SECRET_KEY': config('TRANSLATION_WEBHOOK_SECRET', default='your-secret-key'),
    'ALLOWED_IPS': ['127.0.0.1', 'localhost'],
    'TIMEOUT': 30,
}

# Моніторинг та метрики
TRANSLATION_METRICS = {
    'ENABLED': True,
    'TRACK_USAGE': True,
    'TRACK_PERFORMANCE': True,
    'EXPORT_INTERVAL': 60 * 60,
    'METRICS_DIR': BASE_DIR / 'metrics',
}

os.makedirs(TRANSLATION_METRICS['METRICS_DIR'], exist_ok=True)

# Інтеграція з зовнішніми сервісами перекладу
EXTERNAL_TRANSLATION_SERVICES = {
    'GOOGLE_TRANSLATE': {
        'ENABLED': False,
        'API_KEY': config('GOOGLE_TRANSLATE_API_KEY', default=''),
        'AUTO_TRANSLATE': False,
    },
    'DEEPL': {
        'ENABLED': False,
        'API_KEY': config('DEEPL_API_KEY', default=''),
        'AUTO_TRANSLATE': False,
    }
}

# Команди management
TRANSLATION_MANAGEMENT = {
    'DEFAULT_EXPORT_FORMAT': 'flat',
    'DEFAULT_OUTPUT_DIR': 'frontend/public/translations',
    'AUTO_VALIDATE': True,
    'AUTO_FIX': False,
    'BACKUP_BEFORE_EXPORT': True,
    'NOTIFY_ON_ERRORS': True,
}

# ========== DEVELOPMENT/PRODUCTION СПЕЦИФІЧНІ НАЛАШТУВАННЯ ==========

if DEBUG:
    # Development налаштування
    TRANSLATION_CACHE_SETTINGS['STATIC_TIMEOUT'] = 60
    TRANSLATION_CACHE_SETTINGS['DYNAMIC_TIMEOUT'] = 30
    
    # Детальніше логування в development
    LOGGING['loggers']['apps.api.views.translations']['level'] = 'DEBUG'
    LOGGING['loggers']['apps.api.utils.translations']['level'] = 'DEBUG'
    
    # Відключення стиснення кешу в development
    CACHES['default']['OPTIONS']['COMPRESSOR'] = 'django_redis.compressors.zlib.ZlibCompressor'
    
else:
    # Production налаштування
    TRANSLATION_CACHE_SETTINGS['ENABLE_COMPRESSION'] = True
    
    # Строже rate limiting
    TRANSLATION_RATE_LIMITING['REQUESTS_PER_MINUTE'] = 30
    TRANSLATION_RATE_LIMITING['REQUESTS_PER_HOUR'] = 500
    
    # Кращий компресор для production
    CACHES['default']['OPTIONS']['COMPRESSOR'] = 'django_redis.compressors.lz4.Lz4Compressor'

# ========== СПРОЩЕНІ UNFOLD НАЛАШТУВАННЯ ==========

# Базові налаштування UNFOLD без reverse_lazy
UNFOLD = {
    "SITE_TITLE": "UGC Admin",
    "SITE_HEADER": "UGC Administration", 
    "SITE_URL": "/",
    "SITE_ICON": lambda request: static("icon.svg"),
    "SITE_SYMBOL": "speed",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "LOGIN": {
        "image": lambda request: static("sample/login-bg.jpg"),
    },
    "STYLES": [
        lambda request: static("css/styles.css"),
    ],
    "SCRIPTS": [
        lambda request: static("js/script.js"),
    ],
    "COLORS": {
        "primary": {
            "50": "250 245 255",
            "100": "243 232 255", 
            "200": "233 213 255",
            "300": "196 181 253",
            "400": "167 139 250",
            "500": "139 92 246",
            "600": "124 58 237",
            "700": "109 40 217",
            "800": "91 33 182",
            "900": "76 29 149",
        },
    },
    "EXTENSIONS": {
        "modeltranslation": {
            "flags": {
                "en": "🇬🇧",
                "uk": "🇺🇦",
            },
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        # Navigation буде додано через функцію після ініціалізації Django
    },
}

# Функція для ініціалізації UNFOLD navigation після завантаження Django
def setup_unfold_navigation():
    """
    Налаштовує навігацію UNFOLD після завантаження Django.
    Викликається з apps.py
    """
    try:
        from .unfold_config import get_unfold_navigation, get_unfold_tabs
        UNFOLD["SIDEBAR"]["navigation"] = get_unfold_navigation()
        UNFOLD["TABS"] = get_unfold_tabs()
    except ImportError:
        # Якщо файл unfold_config.py не існує, використовуємо базову навігацію
        UNFOLD["SIDEBAR"]["navigation"] = [
            {
                "title": _("Адміністрування"),
                "separator": True,
                "items": [
                    {
                        "title": _("Головна"),
                        "icon": "dashboard", 
                        "link": "/admin/",
                    },
                ],
            },
        ]