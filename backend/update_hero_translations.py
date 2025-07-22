# update_hero_translations.py
# Скрипт для додавання перекладів Hero секції в backend
# Запустіть з директорії backend: python update_hero_translations.py

import json
import os
from pathlib import Path

def update_translation_files():
    """Оновлює файли перекладів новими ключами для Hero секції"""
    
    backend_dir = Path(__file__).parent
    translations_dir = backend_dir / "static_translations"
    
    # Переклади для української мови
    uk_hero_translations = {
        "hero.title.main": "Професійний одяг",
        "hero.title.for": "для",
        "hero.title.sphere": "кожної сфери",
        "hero.subtitle": "Ми створюємо високоякісний спецодяг, військову форму та корпоративний одяг для українських підприємств та організацій. Наш досвід і прагнення до досконалості допомагають нам задовольняти потреби професіоналів у різних галузях.",
        "hero.button.projects": "Наші проєкти",
        "hero.button.learn_more": "Дізнатися більше",
        "hero.stats.experience": "Років досвіду",
        "hero.stats.projects": "Проєктів",
        "hero.stats.clients": "Клієнтів",
        "hero.stats.support": "Підтримка",
        
        # Додаткові переклади для ServicesSection та інших компонентів
        "services.title": "Повний цикл виробництва",
        "services.subtitle": "професійного одягу",
        "services.description": "Від проєктування до готового виробу - ми забезпечуємо якість на кожному етапі",
        "services.details": "Детальніше",
        "services.additional_info": "Понад 5 років досвіду у створенні професійного одягу найвищої якості",
        "services.quality_guarantee": "Гарантія якості",
        "services.fast_delivery": "Швидка доставка",
        "services.expert_support": "Експертна підтримка",
        
        # Переклади для сервісів
        "services.design.title": "Дизайн та проєктування",
        "services.design.description": "Створюємо унікальні дизайни професійного одягу, що відповідають всім вимогам та стандартам вашої галузі.",
        "services.production.title": "Виробництво",
        "services.production.description": "Повний цикл виробництва від закрою до готового виробу з використанням сучасного обладнання.",
        "services.quality.title": "Контроль якості",
        "services.quality.description": "Багатоступеневий контроль якості на всіх етапах виробництва для забезпечення найвищих стандартів.",
        "services.delivery.title": "Логістика та доставка",
        "services.delivery.description": "Організовуємо швидку та надійну доставку готової продукції в будь-яку точку України.",
        "services.consultation.title": "Консультації",
        "services.consultation.description": "Професійні консультації щодо вибору матеріалів, дизайну та технічних характеристик одягу.",
        "services.aftercare.title": "Післяпродажне обслуговування",
        "services.aftercare.description": "Надаємо повну підтримку після покупки: ремонт, заміна, адаптація під потреби клієнта.",
    }
    
    # Переклади для англійської мови
    en_hero_translations = {
        "hero.title.main": "Professional clothing",
        "hero.title.for": "for",
        "hero.title.sphere": "every industry",
        "hero.subtitle": "We create high-quality workwear, military uniforms and corporate clothing for Ukrainian enterprises and organizations. Our experience and pursuit of excellence help us meet the needs of professionals in various industries.",
        "hero.button.projects": "Our Projects",
        "hero.button.learn_more": "Learn More",
        "hero.stats.experience": "Years of Experience",
        "hero.stats.projects": "Projects",
        "hero.stats.clients": "Clients",
        "hero.stats.support": "Support",
        
        # Додаткові переклади для ServicesSection та інших компонентів
        "services.title": "Full cycle of production",
        "services.subtitle": "professional clothing",
        "services.description": "From design to finished product - we ensure quality at every stage",
        "services.details": "Details",
        "services.additional_info": "Over 5 years of experience in creating the highest quality professional clothing",
        "services.quality_guarantee": "Quality Guarantee",
        "services.fast_delivery": "Fast Delivery",
        "services.expert_support": "Expert Support",
        
        # Переклади для сервісів
        "services.design.title": "Design and Engineering",
        "services.design.description": "We create unique professional clothing designs that meet all requirements and standards of your industry.",
        "services.production.title": "Production",
        "services.production.description": "Full production cycle from cutting to finished product using modern equipment.",
        "services.quality.title": "Quality Control",
        "services.quality.description": "Multi-stage quality control at all stages of production to ensure the highest standards.",
        "services.delivery.title": "Logistics and Delivery",
        "services.delivery.description": "We organize fast and reliable delivery of finished products to any point in Ukraine.",
        "services.consultation.title": "Consultations",
        "services.consultation.description": "Professional consultations on the choice of materials, design and technical characteristics of clothing.",
        "services.aftercare.title": "After-sales Service",
        "services.aftercare.description": "We provide full support after purchase: repair, replacement, adaptation to customer needs.",
    }
    
    # Функція для оновлення файлу перекладів
    def update_language_file(lang, new_translations):
        file_path = translations_dir / f"{lang}.json"
        
        # Завантажуємо існуючі переклади
        existing_translations = {}
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    existing_translations = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                print(f"⚠️  Не вдалося завантажити існуючі переклади для {lang}")
        
        # Об'єднуємо існуючі та нові переклади
        updated_translations = {**existing_translations, **new_translations}
        
        # Зберігаємо оновлені переклади
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(updated_translations, f, ensure_ascii=False, indent=2)
        
        added_count = len(new_translations)
        total_count = len(updated_translations)
        
        print(f"✅ Оновлено {lang}.json:")
        print(f"   📈 Додано нових ключів: {added_count}")
        print(f"   📊 Загальна кількість: {total_count}")
        
        # Показуємо декілька прикладів нових ключів
        print(f"   🔑 Приклади нових ключів:")
        for i, (key, value) in enumerate(list(new_translations.items())[:3]):
            print(f"      {key}: {value[:50]}{'...' if len(value) > 50 else ''}")
        
        if added_count > 3:
            print(f"      ... та ще {added_count - 3} ключів")
    
    # Створюємо директорію якщо не існує
    translations_dir.mkdir(exist_ok=True)
    
    # Оновлюємо файли
    print("🌍 Оновлення файлів перекладів...")
    print("="*50)
    
    update_language_file('uk', uk_hero_translations)
    print()
    update_language_file('en', en_hero_translations)
    
    print("\n" + "="*50)
    print("🎉 Переклади успішно оновлено!")
    print("\nНаступні кроки:")
    print("1. Перезапустіть Django сервер:")
    print("   python manage.py runserver")
    print("\n2. Очистіть кеш перекладів (опціонально):")
    print("   curl -X POST http://127.0.0.1:8000/api/v1/webhooks/translations/update/")
    print("\n3. Перевірте переклади у фронтенді:")
    print("   http://localhost:5173")

if __name__ == "__main__":
    update_translation_files()