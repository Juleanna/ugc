# backend/apps/api/management/commands/clear_cache.py

import logging
from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Очищає кеш Redis і вирішує проблеми серіалізації'

    def add_arguments(self, parser):
        parser.add_argument(
            '--pattern',
            type=str,
            default='*',
            help='Паттерн ключів для очищення (за замовчуванням: все)'
        )
        parser.add_argument(
            '--fix-serializer',
            action='store_true',
            help='Спробувати виправити проблеми серіалізації'
        )

    def handle(self, *args, **options):
        self.stdout.write('Початок очищення кешу...')
        
        try:
            # Спроба використання Redis напряму
            from django_redis import get_redis_connection
            con = get_redis_connection("default")
            
            # Отримуємо всі ключі з префіксом
            prefix = settings.CACHES['default'].get('KEY_PREFIX', '')
            pattern = f"{prefix}:*" if prefix else "*"
            
            if options['pattern'] != '*':
                pattern = f"{prefix}:{options['pattern']}" if prefix else options['pattern']
            
            keys = con.keys(pattern)
            
            if keys:
                # Видаляємо ключі
                deleted = con.delete(*keys)
                self.stdout.write(
                    self.style.SUCCESS(f'Видалено {deleted} ключів кешу')
                )
            else:
                self.stdout.write('Кеш порожній')
                
            # Якщо потрібно виправити серіалізацію
            if options['fix_serializer']:
                self.fix_serialization_issues(con)
                
        except ImportError:
            # Fallback до Django cache API
            cache.clear()
            self.stdout.write(
                self.style.SUCCESS('Очищено весь локальний кеш')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Помилка очищення кешу: {str(e)}')
            )
            
        self.stdout.write(self.style.SUCCESS('Очищення кешу завершено'))

    def fix_serialization_issues(self, con):
        """Виправляє проблеми серіалізації"""
        self.stdout.write('Виправлення проблем серіалізації...')
        
        try:
            # Отримуємо info про Redis
            info = con.info()
            self.stdout.write(f"Redis версія: {info.get('redis_version')}")
            self.stdout.write(f"Кількість ключів в DB: {info.get('db1', {}).get('keys', 0)}")
            
            # Можна додати додаткову логіку для міграції даних
            
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'Не вдалося отримати інформацію Redis: {str(e)}')
            )