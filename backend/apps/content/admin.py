# backend/apps/content/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from unfold.contrib.filters.admin import (
    RangeDateFilter,
)
from unfold.decorators import display
from apps.common.admin import UnfoldTabbedTranslationAdmin  
from .models import HomePage, AboutPage, TeamMember, Certificate, ProductionPhoto


@admin.register(HomePage)
class HomePageAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для главной страницы"""
    list_display = [
        'main_title',
        'years_experience', 
        'employees_count', 
        'completed_projects',
        'team_members_count',  # Додаємо відображення кількості членів команди
        'is_active_display',
        'updated_at'
    ]
    list_filter = [
        'is_active',
        ('updated_at', RangeDateFilter),
    ]
    search_fields = ['main_title', 'subtitle']
    
    fieldsets = [
        (_("Основний контент"), {
            'fields': ['main_title', 'sphere_title', 'subtitle'],
            'classes': ['tab'],
        }),
        (_("Кнопки дій"), {
            'fields': ['primary_button_text', 'secondary_button_text'],
            'classes': ['tab'],
        }),
        (_("Статистика"), {
            'fields': ['years_experience', 'satisfied_clients', 'completed_projects', 'employees_count'],
            'classes': ['tab'],
        }),
        (_("Додаткова інформація"), {
            'fields': ['additional_info'],
            'classes': ['tab'],
        }),
        (_("SEO"), {
            'fields': ['meta_title', 'meta_description'],
            'classes': ['tab'],
        }),
        (_("Налаштування послуг"), {
            'fields': ['show_featured_services', 'featured_services_count'],
            'classes': ['tab'],
        }),
        (_("Системні налаштування"), {
            'fields': ['is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Членів команди"))
    def team_members_count(self, obj):
        """Показує кількість членів команди, пов'язаних з цією сторінкою"""
        count = obj.teammember_set.filter(is_active=True).count()
        if count > 0:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{}</span>',
                count
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">0</span>'
        )
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активна</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивна</span>'
        )

    def get_queryset(self, request):
        """Оптимізуємо запити до бази даних"""
        return super().get_queryset(request).prefetch_related('teammember_set')


@admin.register(AboutPage)
class AboutPageAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для страницы О нас"""
    list_display = ['is_active_display', 'updated_at']
    list_filter = [
        'is_active',
        ('updated_at', RangeDateFilter),
    ]
    search_fields = ['history_text']
    
    fieldsets = [
        (_("Основний контент"), {
            'fields': ['history_text', 'mission_text', 'values_text'],
            'classes': ['tab'],
        }),
        (_("Додатковий контент"), {
            'fields': ['social_responsibility'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активна</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивна</span>'
        )


@admin.register(TeamMember)
class TeamMemberAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для команды"""
    list_display = [
        'name', 
        'position', 
        'photo_preview',
        'homepage_display',  # Додаємо відображення зв'язку з головною сторінкою
        'is_management_display',
        'is_active',
        'order',
    ]
    list_filter = [
        'homepage',  # Додаємо фільтр по головній сторінці
        'is_management', 
        'is_active',
    ]
    search_fields = ['name', 'position']
    list_editable = ['order', 'is_active']
    ordering = ['order', 'name']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['name', 'position', 'bio'],
            'classes': ['tab'],
        }),
        (_("Фото"), {
            'fields': ['photo'],
            'classes': ['tab'],
        }),
        (_("Контакти"), {
            'fields': ['email', 'linkedin'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['homepage', 'order', 'is_management', 'is_active'],  # Додаємо homepage
            'classes': ['tab'],
        }),
    ]
    
    actions = ['make_active', 'make_inactive', 'mark_as_management', 'add_to_homepage']
    
    @display(description=_("Фото"))
    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" />',
                obj.photo.url
            )
        return format_html('<span class="text-gray-400">Немає фото</span>')
    
    @display(description=_("Головна сторінка"), boolean=True)
    def homepage_display(self, obj):
        """Показує, чи пов'язаний член команди з головною сторінкою"""
        if obj.homepage:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">На головній</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Не на головній</span>'
        )
    
    @display(description=_("Керівництво"))
    def is_management_display(self, obj):
        if obj.is_management:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Керівництво</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Співробітник</span>'
        )
    
    @display(description=_("Статус"))
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активний</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивний</span>'
        )

    def get_queryset(self, request):
        """Оптимізуємо запити до бази даних"""
        return super().get_queryset(request).select_related('homepage')
    
    # Дії для адміністраторів
    @admin.action(description=_("Позначити як активних"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} членів команди позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивних"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} членів команди позначено як неактивні.")
    
    @admin.action(description=_("Позначити як керівництво"))
    def mark_as_management(self, request, queryset):
        count = queryset.update(is_management=True)
        self.message_user(request, f"{count} членів команди позначено як керівництво.")
    
    @admin.action(description=_("Додати на головну сторінку"))
    def add_to_homepage(self, request, queryset):
        """Додає вибраних членів команди на активну головну сторінку"""
        try:
            # Знаходимо активну головну сторінку
            active_homepage = HomePage.objects.filter(is_active=True).first()
            if active_homepage:
                count = queryset.update(homepage=active_homepage)
                self.message_user(request, f"{count} членів команди додано на головну сторінку.")
            else:
                self.message_user(request, "Не знайдено активної головної сторінки.", level='ERROR')
        except Exception as e:
            self.message_user(request, f"Помилка: {str(e)}", level='ERROR')


@admin.register(Certificate)
class CertificateAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для сертификатов"""
    list_display = [
        'title', 
        'issued_date', 
        'issuing_organization',
        'certificate_preview',
        'homepage_display',  # Додаємо відображення зв'язку з головною сторінкою
        'is_active_display'
    ]
    list_filter = [
        'homepage',  # Додаємо фільтр по головній сторінці
        'is_active',
        ('issued_date', RangeDateFilter),
        'issuing_organization',
    ]
    search_fields = ['title', 'issuing_organization']
    date_hierarchy = 'issued_date'
    ordering = ['-issued_date']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['title', 'description'],
            'classes': ['tab'],
        }),
        (_("Деталі сертифікату"), {
            'fields': ['issued_date', 'issuing_organization', 'certificate_url'],
            'classes': ['tab'],
        }),
        (_("Зображення"), {
            'fields': ['image'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['homepage', 'is_active'],  # Додаємо homepage
            'classes': ['tab'],
        }),
    ]
    
    actions = ['add_to_homepage', 'remove_from_homepage']
    
    @display(description=_("Зображення"))
    def certificate_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "Немає зображення"
    
    @display(description=_("Головна сторінка"), boolean=True)
    def homepage_display(self, obj):
        """Показує, чи пов'язаний сертифікат з головною сторінкою"""
        if obj.homepage:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">На головній</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Не на головній</span>'
        )
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активний</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивний</span>'
        )

    def get_queryset(self, request):
        """Оптимізуємо запити до бази даних"""
        return super().get_queryset(request).select_related('homepage')
    
    @admin.action(description=_("Додати на головну сторінку"))
    def add_to_homepage(self, request, queryset):
        """Додає вибрані сертифікати на активну головну сторінку"""
        try:
            active_homepage = HomePage.objects.filter(is_active=True).first()
            if active_homepage:
                count = queryset.update(homepage=active_homepage)
                self.message_user(request, f"{count} сертифікатів додано на головну сторінку.")
            else:
                self.message_user(request, "Не знайдено активної головної сторінки.", level='ERROR')
        except Exception as e:
            self.message_user(request, f"Помилка: {str(e)}", level='ERROR')
    
    @admin.action(description=_("Прибрати з головної сторінки"))
    def remove_from_homepage(self, request, queryset):
        """Прибирає вибрані сертифікати з головної сторінки"""
        count = queryset.update(homepage=None)
        self.message_user(request, f"{count} сертифікатів прибрано з головної сторінки.")


@admin.register(ProductionPhoto)
class ProductionPhotoAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для фото производства"""
    list_display = [
        'title',
        'image_preview', 
        'homepage_display',  # Додаємо відображення зв'язку з головною сторінкою
        'is_featured',
        'is_active',
        'order'
    ]
    list_filter = [
        'homepage',  # Додаємо фільтр по головній сторінці
        'is_featured',
        'is_active',
    ]
    search_fields = ['title', 'description']
    list_editable = ['order', 'is_active', 'is_featured']
    ordering = ['order']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['title', 'description'],
            'classes': ['tab'],
        }),
        (_("Зображення"), {
            'fields': ['image'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['homepage', 'order', 'is_featured', 'is_active'],  # Додаємо homepage
            'classes': ['tab'],
        }),
    ]
    
    actions = ['make_featured', 'remove_featured', 'make_active', 'make_inactive', 'add_to_homepage', 'remove_from_homepage']
    
    @display(description=_("Зображення"))
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="60" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "Немає зображення"
    
    @display(description=_("Головна сторінка"), boolean=True)
    def homepage_display(self, obj):
        """Показує, чи пов'язане фото з головною сторінкою"""
        if obj.homepage:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">На головній</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Не на головній</span>'
        )
    
    @display(description=_("Рекомендоване"), ordering='is_featured')
    def is_featured_display(self, obj):
        if obj.is_featured:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Рекомендоване</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Звичайне</span>'
        )
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активний</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивний</span>'
        )

    def get_queryset(self, request):
        """Оптимізуємо запити до бази даних"""
        return super().get_queryset(request).select_related('homepage')
    
    # Дії для адміністраторів
    @admin.action(description=_("Позначити як рекомендовані"))
    def make_featured(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f"{count} фото позначено як рекомендовані.")
    
    @admin.action(description=_("Прибрати з рекомендованих"))
    def remove_featured(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f"{count} фото прибрано з рекомендованих.")
    
    @admin.action(description=_("Позначити як активні"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} фото позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивні"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} фото позначено як неактивні.")
    
    @admin.action(description=_("Додати на головну сторінку"))
    def add_to_homepage(self, request, queryset):
        """Додає вибрані фото на активну головну сторінку"""
        try:
            active_homepage = HomePage.objects.filter(is_active=True).first()
            if active_homepage:
                count = queryset.update(homepage=active_homepage)
                self.message_user(request, f"{count} фото додано на головну сторінку.")
            else:
                self.message_user(request, "Не знайдено активної головної сторінки.", level='ERROR')
        except Exception as e:
            self.message_user(request, f"Помилка: {str(e)}", level='ERROR')
    
    @admin.action(description=_("Прибрати з головної сторінки"))
    def remove_from_homepage(self, request, queryset):
        """Прибирає вибрані фото з головної сторінки"""
        count = queryset.update(homepage=None)
        self.message_user(request, f"{count} фото прибрано з головної сторінки.")