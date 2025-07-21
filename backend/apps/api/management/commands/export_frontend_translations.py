# backend/apps/api/management/commands/export_frontend_translations.py
import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.api.utils import TranslationUtils

class Command(BaseCommand):
    help = 'Експорт перекладів для фронтенду'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output', 
            type=str, 
            default='frontend/public/translations',
            help='Директорія для експорту (відносно BASE_DIR)'
        )
        parser.add_argument(
            '--format', 
            type=str, 
            choices=['flat', 'nested'], 
            default='flat',
            help='Формат експорту: flat (ключі через крапку) або nested (вкладені об\'єкти)'
        )
        parser.add_argument(
            '--minify',
            action='store_true',
            help='Мінімізувати JSON (без відступів)'
        )
        parser.add_argument(
            '--validate',
            action='store_true',
            help='Перевірити переклади перед експортом'
        )

    def handle(self, *args, **options):
        output_dir = os.path.join(settings.BASE_DIR, options['output'])
        export_format = options['format']
        minify = options['minify']
        validate = options['validate']
        
        self.stdout.write('🚀 Початок експорту перекладів для фронтенду...')
        
        # Валідація перед експортом
        if validate:
            self.stdout.write('🔍 Перевірка перекладів...')
            missing = TranslationUtils.validate_translations()
            
            if missing:
                self.stdout.write(self.style.WARNING('⚠️ Знайдено відсутні переклади:'))
                for lang, keys in missing.items():
                    self.stdout.write(f'  {lang}: {len(keys)} відсутніх ключів')
                    for key in keys[:5]:  # Показуємо перші 5
                        self.stdout.write(f'    - {key}')
                    if len(keys) > 5:
                        self.stdout.write(f'    ... і ще {len(keys) - 5}')
                
                # Запитуємо чи продовжити
                response = input('Продовжити експорт? (y/N): ')
                if response.lower() != 'y':
                    self.stdout.write('Експорт скасовано')
                    return
            else:
                self.stdout.write(self.style.SUCCESS('✅ Всі переклади на місці'))
        
        # Створюємо директорію
        os.makedirs(output_dir, exist_ok=True)
        self.stdout.write(f'📁 Створено директорію: {output_dir}')
        
        # Експортуємо для кожної мови
        exported_files = []
        total_translations = 0
        
        for lang_code, lang_name in settings.LANGUAGES:
            self.stdout.write(f'📤 Експорт {lang_name} ({lang_code})...')
            
            # Завантажуємо переклади
            translations = TranslationUtils.load_translations(lang_code)
            
            if not translations:
                self.stdout.write(f'⚠️ Немає перекладів для {lang_code}')
                continue
            
            # Конвертуємо формат якщо потрібно
            if export_format == 'nested':
                translations = self.convert_to_nested(translations)
            
            # Зберігаємо файл
            output_file = os.path.join(output_dir, f'{lang_code}.json')
            
            with open(output_file, 'w', encoding='utf-8') as f:
                if minify:
                    json.dump(translations, f, ensure_ascii=False, separators=(',', ':'))
                else:
                    json.dump(translations, f, ensure_ascii=False, indent=2)
            
            file_size = os.path.getsize(output_file)
            translation_count = self.count_translations(translations)
            
            exported_files.append({
                'file': output_file,
                'language': lang_code,
                'size': file_size,
                'count': translation_count
            })
            
            total_translations += translation_count
            
            self.stdout.write(f'✅ {lang_code}: {translation_count} перекладів, {file_size} байт')
        
        # Створюємо метафайл з інформацією про експорт
        self.create_export_metadata(output_dir, exported_files, export_format, minify)
        
        # Створюємо TypeScript типи (якщо є переклади)
        if exported_files and export_format == 'flat':
            self.generate_typescript_types(output_dir, exported_files[0])
        
        # Фінальний звіт
        self.stdout.write(self.style.SUCCESS('🎉 Експорт завершено!'))
        self.stdout.write(f'📊 Загалом: {len(exported_files)} мов, {total_translations} перекладів')
        self.stdout.write(f'📂 Файли збережено в: {output_dir}')
        
        # Показуємо приклад використання
        self.show_usage_examples(output_dir)
    
    def convert_to_nested(self, flat_translations):
        """Конвертує плоскі переклади в вкладені об'єкти"""
        nested = {}
        
        for key, value in flat_translations.items():
            keys = key.split('.')
            current = nested
            
            for k in keys[:-1]:
                if k not in current:
                    current[k] = {}
                current = current[k]
            
            current[keys[-1]] = value
        
        return nested
    
    def count_translations(self, translations):
        """Рахує кількість перекладів (для вкладених об'єктів рекурсивно)"""
        if isinstance(translations, dict):
            count = 0
            for value in translations.values():
                if isinstance(value, dict):
                    count += self.count_translations(value)
                else:
                    count += 1
            return count
        return 1
    
    def create_export_metadata(self, output_dir, exported_files, export_format, minify):
        """Створює метафайл з інформацією про експорт"""
        import datetime
        
        metadata = {
            'export_date': datetime.datetime.now().isoformat(),
            'format': export_format,
            'minified': minify,
            'files': [
                {
                    'language': f['language'],
                    'filename': os.path.basename(f['file']),
                    'size_bytes': f['size'],
                    'translation_count': f['count']
                }
                for f in exported_files
            ],
            'total_files': len(exported_files),
            'total_translations': sum(f['count'] for f in exported_files),
            'django_version': getattr(settings, 'DJANGO_VERSION', 'unknown'),
            'languages': dict(settings.LANGUAGES)
        }
        
        metadata_file = os.path.join(output_dir, 'export-metadata.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        self.stdout.write(f'📋 Метадані збережено: {metadata_file}')
    
    def generate_typescript_types(self, output_dir, sample_file):
        """Генерує TypeScript типи для перекладів"""
        try:
            # Завантажуємо приклад перекладів для генерації типів
            with open(sample_file['file'], 'r', encoding='utf-8') as f:
                translations = json.load(f)
            
            # Генеруємо типи
            type_definitions = self.generate_ts_interface(translations)
            
            # Зберігаємо файл типів
            types_file = os.path.join(output_dir, 'translations.d.ts')
            with open(types_file, 'w', encoding='utf-8') as f:
                f.write(type_definitions)
            
            self.stdout.write(f'📝 TypeScript типи згенеровано: {types_file}')
            
        except Exception as e:
            self.stdout.write(f'⚠️ Помилка генерації TypeScript типів: {e}')
    
    def generate_ts_interface(self, translations):
        """Генерує TypeScript інтерфейс"""
        lines = [
            '// Автоматично згенеровані TypeScript типи для перекладів',
            '// НЕ РЕДАГУЙТЕ ЦЕЙ ФАЙЛ ВРУЧНУ - він перезаписується при експорті',
            '',
            'export type TranslationKey = '
        ]
        
        # Сортуємо ключі для кращої читаності
        sorted_keys = sorted(translations.keys())
        
        # Додаємо кожен ключ як літерал типу
        key_lines = []
        for key in sorted_keys:
            key_lines.append(f'  | "{key}"')
        
        lines.extend(key_lines)
        lines.append(';')
        lines.append('')
        
        # Додаємо інтерфейс для об'єкта перекладів
        lines.extend([
            'export interface Translations {',
            '  [key in TranslationKey]: string;',
            '}',
            '',
            '// Допоміжні типи',
            'export type SupportedLanguage = "uk" | "en";',
            '',
            'export interface TranslationResponse {',
            '  language: string;',
            '  translations: Translations;',
            '  count: number;',
            '  source: "static" | "dynamic" | "combined";',
            '  available_languages?: string[];',
            '}',
            ''
        ])
        
        return '\n'.join(lines)
    
    def show_usage_examples(self, output_dir):
        """Показує приклади використання експортованих перекладів"""
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('💡 Приклади використання:'))
        self.stdout.write('')
        
        # JavaScript/TypeScript приклад
        self.stdout.write('📜 JavaScript/TypeScript:')
        self.stdout.write('''
// Завантаження перекладів
const response = await fetch('/translations/uk.json');
const translations = await response.json();

// Використання
const title = translations['page.home.title'];
console.log(title); // "Головна сторінка"

// З TypeScript типами
import type { TranslationKey, Translations } from './translations';

function t(key: TranslationKey): string {
    return translations[key] || key;
}
        ''')
        
        # React приклад
        self.stdout.write('⚛️ React Hook:')
        self.stdout.write('''
// hooks/useTranslations.ts
import { useState, useEffect } from 'react';
import type { Translations } from '../translations';

export function useTranslations(lang = 'uk') {
    const [translations, setTranslations] = useState<Translations>({} as Translations);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/translations/${lang}.json`)
            .then(res => res.json())
            .then(data => {
                setTranslations(data);
                setLoading(false);
            });
    }, [lang]);

    const t = (key: keyof Translations) => translations[key] || key;

    return { t, loading, translations };
}
        ''')
        
        # Vue приклад
        self.stdout.write('🍃 Vue Composable:')
        self.stdout.write('''
// composables/useTranslations.ts
import { ref, computed } from 'vue';

const translations = ref({});
const currentLang = ref('uk');

export function useTranslations() {
    const loadTranslations = async (lang: string) => {
        const response = await fetch(`/translations/${lang}.json`);
        translations.value = await response.json();
        currentLang.value = lang;
    };

    const t = (key: string) => translations.value[key] || key;

    return {
        t,
        loadTranslations,
        currentLang: computed(() => currentLang.value)
    };
}
        ''')
        
        self.stdout.write(f'📁 Файли знаходяться в: {output_dir}')
        self.stdout.write('🌐 Для веб-сервера скопіюйте файли в публічну директорію')