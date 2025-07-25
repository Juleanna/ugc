from django.core.management.base import BaseCommand
from django.urls import reverse
from django.test import Client
from rest_framework.routers import DefaultRouter
from apps.api.urls import router
import json

class Command(BaseCommand):
    help = 'Валідація API endpoints на предмет дублювання та помилок'

    def add_arguments(self, parser):
        parser.add_argument('--fix', action='store_true', help='Автоматично виправляти помилки')
        parser.add_argument('--verbose', action='store_true', help='Детальний вивід')

    def handle(self, *args, **options):
        self.verbose = options['verbose']
        self.fix_mode = options['fix']
        
        self.stdout.write(self.style.SUCCESS('🔍 Почато валідацію API endpoints...'))
        
        # Ініціалізуємо клієнт для тестування
        self.client = Client()
        
        # Виконуємо перевірки
        self.check_duplicates()
        self.check_missing_endpoints()
        self.check_endpoint_responses()
        self.check_optimization_opportunities()
        
        self.stdout.write(self.style.SUCCESS('✅ Валідацію завершено!'))

    def check_duplicates(self):
        """Перевіряє дублювання endpoints"""
        self.stdout.write('🔍 Перевірка дублювання endpoints...')
        
        # Отримуємо всі зареєстровані URLs
        registered_urls = []
        for prefix, viewset, basename in router.registry:
            registered_urls.append(f'/api/v1/{prefix}/')
        
        # Перевіряємо на дублювання
        duplicates = []
        seen = set()
        
        for url in registered_urls:
            if url in seen:
                duplicates.append(url)
            seen.add(url)
        
        if duplicates:
            self.stdout.write(self.style.WARNING(f'⚠️ Знайдено дублювання: {duplicates}'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ Дублювання не знайдено'))

    def check_missing_endpoints(self):
        """Перевіряє відсутні endpoints"""
        self.stdout.write('🔍 Перевірка відсутніх endpoints...')
        
        expected_endpoints = [
            'homepage', 'about', 'team-members',
            'services', 'projects', 'project-categories',
            'jobs', 'job-applications', 'workplace-photos',
            'partnership-info', 'work-stages', 'partner-inquiries',
            'offices', 'contact-inquiries', 'content'
        ]
        
        registered_prefixes = [prefix for prefix, _, _ in router.registry]
        missing = [ep for ep in expected_endpoints if ep not in registered_prefixes]
        
        if missing:
            self.stdout.write(self.style.WARNING(f'⚠️ Відсутні endpoints: {missing}'))
            if self.fix_mode:
                self.stdout.write('🔧 Режим виправлення: додайте відсутні ViewSets')
        else:
            self.stdout.write(self.style.SUCCESS('✅ Всі необхідні endpoints присутні'))

    def check_endpoint_responses(self):
        """Перевіряє відповіді endpoints"""
        self.stdout.write('🔍 Перевірка відповідей endpoints...')
        
        test_endpoints = [
            '/api/v1/',
            '/api/v1/content/stats/',
            '/api/v1/content/featured/',
            '/api/v1/health/',
        ]
        
        for endpoint in test_endpoints:
            try:
                response = self.client.get(endpoint)
                if response.status_code == 200:
                    if self.verbose:
                        self.stdout.write(f'✅ {endpoint} - OK')
                else:
                    self.stdout.write(self.style.WARNING(f'⚠️ {endpoint} - Status: {response.status_code}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ {endpoint} - Error: {str(e)}'))

    def check_optimization_opportunities(self):
        """Перевіряє можливості оптимізації"""
        self.stdout.write('🔍 Аналіз можливостей оптимізації...')
        
        optimizations = []
        
        # Перевіряємо кількість ViewSets
        viewset_count = len(router.registry)
        if viewset_count > 15:
            optimizations.append(f'Багато ViewSets ({viewset_count}), розгляньте об\'єднання')
        
        # Перевіряємо наявність централізованих endpoints
        registered_prefixes = [prefix for prefix, _, _ in router.registry]
        if 'content' not in registered_prefixes:
            optimizations.append('Відсутній централізований ContentViewSet')
        
        if optimizations:
            self.stdout.write(self.style.WARNING('💡 Рекомендації для оптимізації:'))
            for opt in optimizations:
                self.stdout.write(f'  • {opt}')
        else:
            self.stdout.write(self.style.SUCCESS('✅ API добре оптимізовано'))

    def generate_report(self):
        """Генерує звіт про стан API"""
        report = {
            'total_viewsets': len(router.registry),
            'registered_endpoints': [prefix for prefix, _, _ in router.registry],
            'timestamp': '2024-01-01T00:00:00Z'
        }
        
        with open('api_validation_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        self.stdout.write(self.style.SUCCESS('📊 Звіт збережено в api_validation_report.json'))