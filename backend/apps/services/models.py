from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from ckeditor_uploader.fields import RichTextUploadingField

class Service(models.Model):
    """Услуги компании"""
    name = models.CharField(max_length=200, verbose_name=_("Назва"))
    short_description = RichTextUploadingField(verbose_name=_("Короткий опис"))
    detailed_description = RichTextUploadingField(verbose_name=_("Детальний опис"))
    benefits = RichTextUploadingField(blank=True, verbose_name=_("Переваги"))
    
    slug = models.SlugField(unique=True, db_index=True, verbose_name=_("Слаг"))
    icon = models.ImageField(
        upload_to='services/icons/', 
        blank=True, 
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'svg'])],
        verbose_name=_("Іконка")
    )
    main_image = models.ImageField(
        upload_to='services/', 
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])],
        verbose_name=_("Головне зображення")
    )
    min_order_quantity = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Мін. партія"))
    production_time = models.CharField(max_length=100, blank=True, verbose_name=_("Термін виробництва"))
    order = models.PositiveIntegerField(default=0, db_index=True, verbose_name=_("Порядок"))
    is_featured = models.BooleanField(default=False, db_index=True, verbose_name=_("Рекомендована"))
    is_active = models.BooleanField(default=True, db_index=True, verbose_name=_("Активна"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Створено"))

    class Meta:
        ordering = ['order', 'id']
        verbose_name = _("Послуга")
        verbose_name_plural = _("Послуги")
        indexes = [
            models.Index(fields=['is_active', 'is_featured', 'order']),
            models.Index(fields=['is_active', 'order']),
        ]
    
    def __str__(self):
        return self.name


class ServiceFeature(models.Model):
    """Особенности услуги"""
    title = models.CharField(max_length=100, verbose_name=_("Назва"))
    description = RichTextUploadingField(verbose_name=_("Опис"))
    
    service = models.ForeignKey(Service, related_name='features', on_delete=models.CASCADE, verbose_name=_("Послуга"))
    icon = models.CharField(max_length=50, blank=True, help_text=_("CSS клас для іконки"), verbose_name=_("Іконка"))
    order = models.PositiveIntegerField(default=0, db_index=True, verbose_name=_("Порядок"))

    class Meta:
        ordering = ['order', 'id']
        verbose_name = _("Особливість послуги")
        verbose_name_plural = _("Особливості послуг")
        indexes = [
            models.Index(fields=['service', 'order']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['service', 'order'], name='unique_service_feature_order'),
        ]
    
    def __str__(self):
        return self.title