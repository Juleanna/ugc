from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator, RegexValidator
from ckeditor_uploader.fields import RichTextUploadingField

class JobPosition(models.Model):
    """Вакансии"""
    title = models.CharField(max_length=200, verbose_name=_("Назва вакансії"))
    description = RichTextUploadingField(verbose_name=_("Опис"))
    requirements = RichTextUploadingField(verbose_name=_("Вимоги"))
    responsibilities = RichTextUploadingField(verbose_name=_("Обов'язки"))
    benefits = RichTextUploadingField(blank=True, verbose_name=_("Переваги"))
        
    slug = models.SlugField(unique=True, db_index=True, verbose_name=_("URL"))
    
    employment_type = models.CharField(max_length=50, choices=[
        ('full_time', _("Повна зайнятість")),
        ('part_time', _("Часткова зайнятість")),
        ('contract', _("Контракт")),
    ], default='full_time', verbose_name=_("Тип зайнятості"))
    
    experience_required = models.CharField(max_length=100, blank=True, verbose_name=_("Досвід роботи"))
    salary_from = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Зарплата від"))
    salary_to = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Зарплата до"))
    salary_currency = models.CharField(max_length=10, default='UAH', verbose_name=_("Валюта"))
    location = models.CharField(max_length=200, verbose_name=_("Місце роботи"))
    
    is_active = models.BooleanField(default=True, db_index=True, verbose_name=_("Активна"))
    is_urgent = models.BooleanField(default=False, db_index=True, verbose_name=_("Терміново"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Створено"))
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Термін дії"))

    class Meta:
        ordering = ['-is_urgent', '-created_at', 'id']
        verbose_name = _("Вакансія")
        verbose_name_plural = _("Вакансії")
        indexes = [
            models.Index(fields=['is_active', '-created_at']),
            models.Index(fields=['is_urgent', '-created_at']),
            models.Index(fields=['employment_type', 'is_active']),
        ]
    
    def __str__(self):
        return self.title


class JobApplication(models.Model):
    """Заявки на вакансии"""
    position = models.ForeignKey(JobPosition, on_delete=models.CASCADE, related_name='applications', verbose_name=_("Вакансія"))
    first_name = models.CharField(max_length=100, verbose_name=_("Ім'я"))
    last_name = models.CharField(max_length=100, verbose_name=_("Прізвище"))
    email = models.EmailField(verbose_name=_("Електронна пошта"))
    phone = models.CharField(
        max_length=20, 
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message=_("Телефон має бути у форматі: '+999999999'. До 15 цифр дозволено.")
            )
        ],
        verbose_name=_("Телефон")
    )
    cover_letter = models.TextField(blank=True, verbose_name=_("Супровідний лист"))
    resume = models.FileField(
        upload_to='resumes/', 
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])
        ],
        verbose_name=_("Резюме")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Створено"))
    is_reviewed = models.BooleanField(default=False, verbose_name=_("Переглянуто"))

    class Meta:
        ordering = ['-created_at', 'id']
        verbose_name = _("Заявка на вакансію")
        verbose_name_plural = _("Заявки на вакансії")
        indexes = [
            models.Index(fields=['position', '-created_at']),
            models.Index(fields=['is_reviewed', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.position.title}"


class WorkplacePhoto(models.Model):
    """Фото с рабочих мест"""
    title = models.CharField(max_length=100, verbose_name=_("Назва"))
    description = models.TextField(blank=True, verbose_name=_("Опис"))
       
    image = models.ImageField(
        upload_to='workplace/', 
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])
        ],
        verbose_name=_("Зображення")
    )
    order = models.PositiveIntegerField(default=0, db_index=True, verbose_name=_("Порядок"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))

    class Meta:
        ordering = ['order', 'id']
        verbose_name = _("Фото робочого місця")
        verbose_name_plural = _("Фото робочих місць")
        indexes = [
            models.Index(fields=['is_active', 'order']),
        ]
    
    def __str__(self):
        return self.title
