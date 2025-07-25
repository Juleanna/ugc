from .models import Office, ContactInquiry
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from unfold.contrib.filters.admin import (
    RangeDateFilter,
)
from unfold.decorators import display
from apps.common.admin import UnfoldTabbedTranslationAdmin  


@admin.register(Office)
class OfficeAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для офисов и фабрик"""
    list_display = [
        'name', 
        'city',  # Додано city
        'office_type_display', 
        'phone', 
        'email', 
        'is_main_display',
        'is_active_display',
        'order',
        'is_active'
    ]
    list_display_links = ['name']
    list_filter = [
        'city',  # Додано city в фільтри
        'office_type',
        'is_main',
        'is_active',
    ]
    list_editable = ['order', 'is_active']
    search_fields = ['name', 'city', 'address', 'phone', 'email']  # Додано city в пошук
    ordering = ['order', 'city', 'name']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['name', 'city', 'office_type', 'description'],  # Додано city
            'classes': ['tab'],
        }),
        (_("Контактна інформація"), {
            'fields': ['phone', 'email', 'address', 'working_hours'],
            'classes': ['tab'],
        }),
        (_("Місцезнаходження"), {
            'fields': ['latitude', 'longitude'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['order', 'is_main', 'is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Тип"), ordering='office_type')
    def office_type_display(self, obj):
        colors = {
            'office': 'blue',
            'factory': 'green', 
            'warehouse': 'orange'
        }
        color = colors.get(obj.office_type, 'gray')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-{}-100 text-{}-800">{}</span>',
            color, color, obj.get_office_type_display()
        )
    
    @display(description=_("Головний"), ordering='is_main')
    def is_main_display(self, obj):
        if obj.is_main:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Головний</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Звичайний</span>'
        )
    
    @display(description=_("Активний"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Активний</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">✗ Неактивний</span>'
        )


@admin.register(ContactInquiry) 
class ContactInquiryAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для звернень"""
    list_display = [
        'name', 
        'email', 
        'company',
        'inquiry_type_display',
        'subject',
        'is_processed',
        'created_at'
    ]
    list_display_links = ['name', 'subject']
    list_filter = [
        'inquiry_type',
        'is_processed',
        ('created_at', RangeDateFilter),
        ('processed_at', RangeDateFilter),
    ]
    list_editable = ['is_processed']
    search_fields = ['name', 'email', 'company', 'subject', 'message']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = [
        (_("Контактна інформація"), {
            'fields': ['name', 'email', 'phone', 'company'],
            'classes': ['tab'],
        }),
        (_("Запит"), {
            'fields': ['inquiry_type', 'subject', 'message'],
            'classes': ['tab'],
        }),
        (_("Обробка"), {
            'fields': ['is_processed', 'response', 'processed_at', 'created_at'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Тип запиту"), ordering='inquiry_type')
    def inquiry_type_display(self, obj):
        colors = {
            'general': 'blue',
            'cooperation': 'green',
            'complaint': 'red',
            'suggestion': 'yellow',
            'quote': 'purple'
        }
        color = colors.get(obj.inquiry_type, 'gray')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-{}-100 text-{}-800">{}</span>',
            color, color, obj.get_inquiry_type_display()
        )
    
    @display(description=_("Статус"), ordering='is_processed')
    def is_processed_display(self, obj):
        if obj.is_processed:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Оброблено</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ В обробці</span>'
        )