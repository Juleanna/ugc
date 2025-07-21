# backend/apps/api/management/commands/validate_translations.py
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.api.utils.translations import TranslationUtils
import json
import re

class Command(BaseCommand):
    help = 'Валідація перекладів на повноту та якість'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Автоматично виправити деякі проблеми'
        )
        parser.add_argument(
            '--detailed',
            action='store_true',
            help='Детальний звіт з прикладами'
        )
        parser.add_argument(
            '--export-report',
            type=str,
            help='Експорт звіту в JSON файл'
        )

    def handle(self, *args, **options):
        self.fix_mode = options['fix']
        self.detailed = options['detailed']
        self.export_file = options['export_report']
        
        self.stdout.write('🔍 Початок валідації перекладів...')
        
        # Ініціалізація звіту
        self.report = {
            'missing_translations': {},
            'inconsistent_keys': [],
            'formatting_issues': {},
            'duplicate_values': {},
            'empty_translations': {},
            'placeholder_issues': {},
            'summary': {}
        }
        
        # Виконуємо всі перевірки
        self.check_missing_translations()
        self.check_formatting_consistency()
        self.check_duplicate_values()
        self.check_empty_translations()
        self.check_placeholder_consistency()
        
        # Генеруємо підсумок
        self.generate_summary()
        
        # Показуємо результати
        self.display_results()
        
        # Експортуємо звіт якщо потрібно
        if self.export_file:
            self.export_report()
        
        # Автоматичне виправлення
        if self.fix_mode:
            self.auto_fix_issues()

    def check_missing_translations(self):
        """Перевіряє відсутні переклади між мовами"""
        self.stdout.write('📝 Перевірка відсутніх перекладів...')
        
        missing = TranslationUtils.validate_translations()
        self.report['missing_translations'] = missing
        
        if missing:
            total_missing = sum(len(keys) for keys in missing.values())
            self.stdout.write(f'⚠️ Знайдено {total_missing} відсутніх перекладів')
            
            if self.detailed:
                for lang, keys in missing.items():
                    self.stdout.write(f'  {lang}: {len(keys)} відсутніх')
                    for key in keys[:3]:
                        self.stdout.write(f'    - {key}')
                    if len(keys) > 3:
                        self.stdout.write(f'    ... та ще {len(keys) - 3}')
        else:
            self.stdout.write('✅ Всі переклади присутні')

    def check_formatting_consistency(self):
        """Перевіряє консистентність форматування"""
        self.stdout.write('🎨 Перевірка форматування...')
        
        issues = {}
        
        for lang_code, _ in settings.LANGUAGES:
            translations = TranslationUtils.load_translations(lang_code)
            lang_issues = []
            
            for key, value in translations.items():
                # Перевірка HTML тегів
                if '<' in value and '>' in value:
                    if not self.is_valid_html_snippet(value):
                        lang_issues.append({
                            'key': key,
                            'issue': 'invalid_html',
                            'value': value
                        })
                
                # Перевірка консистентності знаків пунктуації
                if key.endswith('.title') or key.endswith('.heading'):
                    if value.endswith('.'):
                        lang_issues.append({
                            'key': key,
                            'issue': 'title_with_period',
                            'value': value
                        })
                
                # Перевірка пробілів на початку/кінці
                if value.strip() != value:
                    lang_issues.append({
                        'key': key,
                        'issue': 'whitespace_padding',
                        'value': value
                    })
            
            if lang_issues:
                issues[lang_code] = lang_issues
        
        self.report['formatting_issues'] = issues
        
        if issues:
            total_issues = sum(len(lang_issues) for lang_issues in issues.values())
            self.stdout.write(f'⚠️ Знайдено {total_issues} проблем з форматуванням')
        else:
            self.stdout.write('✅ Форматування консистентне')

    def check_duplicate_values(self):
        """Перевіряє дублікати значень (можливі помилки копіювання)"""
        self.stdout.write('🔄 Перевірка дублікатів...')
        
        duplicates = {}
        
        for lang_code, _ in settings.LANGUAGES:
            translations = TranslationUtils.load_translations(lang_code)
            value_to_keys = {}
            
            # Групуємо ключі за значеннями
            for key, value in translations.items():
                if value in value_to_keys:
                    value_to_keys[value].append(key)
                else:
                    value_to_keys[value] = [key]
            
            # Знаходимо дублікати (виключаємо очевидні)
            lang_duplicates = {}
            for value, keys in value_to_keys.items():
                if len(keys) > 1 and len(value) > 3:  # Ігноруємо короткі значення як "Так", "Ні"
                    # Виключаємо схожі ключі (наприклад, button.save та form.save)
                    if not self.are_related_keys(keys):
                        lang_duplicates[value] = keys
            
            if lang_duplicates:
                duplicates[lang_code] = lang_duplicates
        
        self.report['duplicate_values'] = duplicates
        
        if duplicates:
            total_duplicates = sum(len(dups) for dups in duplicates.values())
            self.stdout.write(f'⚠️ Знайдено {total_duplicates} можливих дублікатів')
        else:
            self.stdout.write('✅ Дублікатів не знайдено')

    def check_empty_translations(self):
        """Перевіряє порожні переклади"""
        self.stdout.write('🈳 Перевірка порожніх перекладів...')
        
        empty = {}
        
        for lang_code, _ in settings.LANGUAGES:
            translations = TranslationUtils.load_translations(lang_code)
            empty_keys = []
            
            for key, value in translations.items():
                if not value or value.strip() == '':
                    empty_keys.append(key)
            
            if empty_keys:
                empty[lang_code] = empty_keys
        
        self.report['empty_translations'] = empty
        
        if empty:
            total_empty = sum(len(keys) for keys in empty.values())
            self.stdout.write(f'⚠️ Знайдено {total_empty} порожніх перекладів')
        else:
            self.stdout.write('✅ Порожніх перекладів немає')

    def check_placeholder_consistency(self):
        """Перевіряє консистентність плейсхолдерів між мовами"""
        self.stdout.write('🔗 Перевірка плейсхолдерів...')
        
        placeholder_issues = {}
        
        # Отримуємо всі ключі
        all_keys = set()
        for lang_code, _ in settings.LANGUAGES:
            translations = TranslationUtils.load_translations(lang_code)
            all_keys.update(translations.keys())
        
        for key in all_keys:
            lang_placeholders = {}
            
            # Збираємо плейсхолдери для кожної мови
            for lang_code, _ in settings.LANGUAGES:
                translations = TranslationUtils.load_translations(lang_code)
                if key in translations:
                    placeholders = self.extract_placeholders(translations[key])
                    if placeholders:
                        lang_placeholders[lang_code] = placeholders
            
            # Перевіряємо консистентність
            if lang_placeholders:
                placeholder_sets = list(lang_placeholders.values())
                if len(set(tuple(sorted(ps)) for ps in placeholder_sets)) > 1:
                    placeholder_issues[key] = lang_placeholders
        
        self.report['placeholder_issues'] = placeholder_issues
        
        if placeholder_issues:
            self.stdout.write(f'⚠️ Знайдено {len(placeholder_issues)} проблем з плейсхолдерами')
        else:
            self.stdout.write('✅ Плейсхолдери консистентні')

    def extract_placeholders(self, text):
        """Витягує плейсхолдери з тексту"""
        # Шукаємо різні типи плейсхолдерів
        patterns = [
            r'\{(\w+)\}',  # {name}
            r'\{\{(\w+)\}\}',  # {{name}}
            r'%\((\w+)\)s',  # %(name)s
            r'%(\w+)%',  # %name%
        ]
        
        placeholders = set()
        for pattern in patterns:
            matches = re.findall(pattern, text)
            placeholders.update(matches)
        
        return sorted(list(placeholders))

    def is_valid_html_snippet(self, text):
        """Перевіряє чи є HTML фрагмент валідним"""
        try:
            from html.parser import HTMLParser
            
            class ValidationParser(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.errors = []
                
                def error(self, message):
                    self.errors.append(message)
            
            parser = ValidationParser()
            parser.feed(f"<div>{text}</div>")
            return len(parser.errors) == 0
        except:
            return False

    def are_related_keys(self, keys):
        """Перевіряє чи є ключі пов'язаними (схожими за змістом)"""
        # Простий алгоритм: якщо ключі мають спільні частини
        if len(keys) < 2:
            return True
        
        # Розбиваємо на частини
        key_parts = [key.split('.') for key in keys]
        
        # Перевіряємо чи є спільні частини
        for i, parts1 in enumerate(key_parts):
            for j, parts2 in enumerate(key_parts[i+1:], i+1):
                common_parts = set(parts1) & set(parts2)
                if len(common_parts) >= 1:
                    return True
        
        return False

    def generate_summary(self):
        """Генерує підсумок валідації"""
        summary = {
            'total_languages': len(settings.LANGUAGES),
            'missing_count': sum(len(keys) for keys in self.report['missing_translations'].values()),
            'formatting_issues_count': sum(len(issues) for issues in self.report['formatting_issues'].values()),
            'duplicate_values_count': sum(len(dups) for dups in self.report['duplicate_values'].values()),
            'empty_translations_count': sum(len(keys) for keys in self.report['empty_translations'].values()),
            'placeholder_issues_count': len(self.report['placeholder_issues']),
        }
        
        summary['total_issues'] = (
            summary['missing_count'] + 
            summary['formatting_issues_count'] + 
            summary['duplicate_values_count'] + 
            summary['empty_translations_count'] + 
            summary['placeholder_issues_count']
        )
        
        summary['health_score'] = max(0, 100 - (summary['total_issues'] * 2))
        
        self.report['summary'] = summary

    def display_results(self):
        """Відображає результати валідації"""
        summary = self.report['summary']
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('📊 ПІДСУМОК ВАЛІДАЦІЇ'))
        self.stdout.write('=' * 50)
        
        if summary['total_issues'] == 0:
            self.stdout.write(self.style.SUCCESS('🎉 Всі переклади валідні!'))
        else:
            self.stdout.write(f"📈 Оцінка здоров'я: {summary['health_score']}/100")
            self.stdout.write(f"🔢 Загальна кількість проблем: {summary['total_issues']}")
            
            if summary['missing_count']:
                self.stdout.write(f"❌ Відсутні переклади: {summary['missing_count']}")
            
            if summary['formatting_issues_count']:
                self.stdout.write(f"🎨 Проблеми форматування: {summary['formatting_issues_count']}")
            
            if summary['duplicate_values_count']:
                self.stdout.write(f"🔄 Дублікати: {summary['duplicate_values_count']}")
            
            if summary['empty_translations_count']:
                self.stdout.write(f"🈳 Порожні переклади: {summary['empty_translations_count']}")
            
            if summary['placeholder_issues_count']:
                self.stdout.write(f"🔗 Проблеми плейсхолдерів: {summary['placeholder_issues_count']}")

    def export_report(self):
        """Експортує звіт у JSON файл"""
        try:
            with open(self.export_file, 'w', encoding='utf-8') as f:
                json.dump(self.report, f, ensure_ascii=False, indent=2)
            self.stdout.write(f'📄 Звіт експортовано: {self.export_file}')
        except Exception as e:
            self.stdout.write(f'❌ Помилка експорту: {e}')

    def auto_fix_issues(self):
        """Автоматично виправляє деякі проблеми"""
        self.stdout.write('')
        self.stdout.write('🔧 Автоматичне виправлення...')
        
        fixed_count = 0
        
        # Виправляємо відсутні переклади
        if self.report['missing_translations']:
            fixed_count += TranslationUtils.sync_translation_keys()
        
        # Виправляємо пробіли в кінці/на початку
        for lang_code, issues in self.report['formatting_issues'].items():
            translations = TranslationUtils.load_translations(lang_code)
            changes_made = False
            
            for issue in issues:
                if issue['issue'] == 'whitespace_padding':
                    key = issue['key']
                    old_value = translations[key]
                    new_value = old_value.strip()
                    
                    if old_value != new_value:
                        translations[key] = new_value
                        changes_made = True
                        fixed_count += 1
            
            if changes_made:
                TranslationUtils.save_translations(translations, lang_code)
        
        if fixed_count > 0:
            self.stdout.write(f'✅ Виправлено {fixed_count} проблем')
        else:
            self.stdout.write('ℹ️ Нічого не потребувало автоматичного виправлення')