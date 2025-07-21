# backend/ugc_backend/apps.py
from django.apps import AppConfig
from django.conf import settings

class UgcBackendConfig(AppConfig):
    """
    Головна конфігурація додатку для ініціалізації компонентів,
    які потребують завантажених URL-ів
    """
    name = 'ugc_backend'
    verbose_name = 'UGC Backend'

    def ready(self):
        """
        Викликається після завантаження всіх додатків та URL-ів.
        Тут можна безпечно використовувати reverse_lazy.
        """
        # Ініціалізуємо UNFOLD навігацію
        self.setup_unfold_navigation()
        
        # Ініціалізуємо систему перекладів
        self.setup_translations()

    def setup_unfold_navigation(self):
        """Налаштовує навігацію UNFOLD"""
        try:
            from .unfold_config import get_unfold_navigation, get_unfold_tabs
            
            # Оновлюємо UNFOLD конфігурацію
            if hasattr(settings, 'UNFOLD'):
                settings.UNFOLD["SIDEBAR"]["navigation"] = get_unfold_navigation()
                settings.UNFOLD["TABS"] = get_unfold_tabs()
                
        except ImportError as e:
            # Якщо файл unfold_config.py не існує або має помилки
            print(f"Warning: Could not load UNFOLD navigation config: {e}")
            
            # Використовуємо базову навігацію
            if hasattr(settings, 'UNFOLD'):
                settings.UNFOLD["SIDEBAR"]["navigation"] = [
                    {
                        "title": "Адміністрування",
                        "separator": True,
                        "items": [
                            {
                                "title": "Головна",
                                "icon": "dashboard",
                                "link": "/admin/",
                            },
                        ],
                    },
                ]

    def setup_translations(self):
        """Ініціалізує систему перекладів"""
        try:
            # Імпортуємо та ініціалізуємо компоненти перекладів
            from apps.api.utils.translations import TranslationUtils
            
            # Перевіряємо чи існують базові файли перекладів
            for lang_code, _ in settings.LANGUAGES:
                translations = TranslationUtils.load_translations(lang_code)
                if not translations:
                    print(f"Warning: No translations found for {lang_code}. Run 'python manage.py setup_translations'")
                    
        except ImportError as e:
            print(f"Warning: Translation system not available: {e}")
        except Exception as e:
            print(f"Warning: Error initializing translations: {e}")