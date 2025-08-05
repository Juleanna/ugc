"""
Команда для створення резервних копій бази даних
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from django.utils import timezone
import os
import json
import gzip
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Створення резервної копії бази даних'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            type=str,
            default='json',
            choices=['json', 'xml', 'yaml'],
            help='Формат резервної копії'
        )
        parser.add_argument(
            '--compress',
            action='store_true',
            help='Стиснення резервної копії'
        )
        parser.add_argument(
            '--exclude',
            nargs='*',
            default=['sessions', 'admin.logentry', 'contenttypes'],
            help='Моделі для виключення з бекапу'
        )
    
    def handle(self, *args, **options):
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = getattr(settings, 'BACKUP_DIR', 'backups')
        
        # Створюємо директорію для бекапів
        os.makedirs(backup_dir, exist_ok=True)
        
        # Формуємо назву файлу
        filename = f'backup_{timestamp}.{options["format"]}'
        if options['compress']:
            filename += '.gz'
        
        filepath = os.path.join(backup_dir, filename)
        
        try:
            self.stdout.write(f'Створення резервної копії: {filepath}')
            
            # Параметри для dumpdata
            dump_options = {
                'format': options['format'],
                'indent': 2,
                'exclude': options['exclude']
            }
            
            if options['compress']:
                # Створюємо стиснений бекап
                with gzip.open(filepath, 'wt', encoding='utf-8') as f:
                    call_command('dumpdata', stdout=f, **dump_options)
            else:
                # Звичайний бекап
                with open(filepath, 'w', encoding='utf-8') as f:
                    call_command('dumpdata', stdout=f, **dump_options)
            
            # Перевіряємо розмір файлу
            file_size = os.path.getsize(filepath)
            size_mb = file_size / (1024 * 1024)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Резервну копію створено успішно!\n'
                    f'Файл: {filepath}\n'
                    f'Розмір: {size_mb:.2f} MB'
                )
            )
            
            # Зберігаємо метадані
            self._save_backup_metadata(filepath, {
                'timestamp': timestamp,
                'format': options['format'],
                'compressed': options['compress'],
                'size_bytes': file_size,
                'excluded_models': options['exclude']
            })
            
            # Очищаємо старі бекапи
            self._cleanup_old_backups(backup_dir)
            
            logger.info(f'Database backup created: {filepath} ({size_mb:.2f} MB)')
            
        except Exception as e:
            error_msg = f'Помилка створення резервної копії: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            logger.error(error_msg)
            raise
    
    def _save_backup_metadata(self, filepath, metadata):
        """Зберігання метаданих бекапу"""
        metadata_file = filepath + '.meta'
        try:
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, default=str)
        except Exception as e:
            logger.warning(f'Could not save backup metadata: {e}')
    
    def _cleanup_old_backups(self, backup_dir, max_backups=10):
        """Очищення старих бекапів"""
        try:
            # Отримуємо список файлів бекапів
            backup_files = []
            for filename in os.listdir(backup_dir):
                if filename.startswith('backup_') and not filename.endswith('.meta'):
                    filepath = os.path.join(backup_dir, filename)
                    backup_files.append((filepath, os.path.getctime(filepath)))
            
            # Сортуємо за датою створення (найновіші першими)
            backup_files.sort(key=lambda x: x[1], reverse=True)
            
            # Видаляємо старі бекапи
            for filepath, _ in backup_files[max_backups:]:
                try:
                    os.remove(filepath)
                    # Видаляємо також метадані
                    meta_file = filepath + '.meta'
                    if os.path.exists(meta_file):
                        os.remove(meta_file)
                    
                    self.stdout.write(f'Видалено старий бекап: {filepath}')
                    logger.info(f'Removed old backup: {filepath}')
                except Exception as e:
                    logger.warning(f'Could not remove old backup {filepath}: {e}')
                    
        except Exception as e:
            logger.warning(f'Error during backup cleanup: {e}')