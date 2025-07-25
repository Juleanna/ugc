# backend/apps/content/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from ckeditor_uploader.fields import RichTextUploadingField
from django.core.validators import MinValueValidator, MaxValueValidator

class HomePage(models.Model):
    """Модель для головної сторінки з підтримкою Hero секції"""
    
    # Основний контент Hero секції
    main_title = models.CharField(
        "Основний заголовок",
        max_length=200,
        default="Професійний одяг",
        help_text="Перший рядок заголовка Hero секції"
    )
    
    sphere_title = models.CharField(
        "Заголовок сфери",
        max_length=200,
        default="кожної сфери",
        help_text="Другий рядок заголовка"
    )
    
    subtitle = models.TextField(
        "Підзаголовок",
        max_length=500,
        help_text="Опис під заголовком Hero секції"
    )
    
    # Кнопки дій
    primary_button_text = models.CharField(
        "Текст основної кнопки",
        max_length=100,
        default="Наші проєкти",
        help_text="Текст для головної кнопки дії"
    )
    
    secondary_button_text = models.CharField(
        "Текст другорядної кнопки",
        max_length=100,
        default="Дізнатися більше",
        help_text="Текст для другорядної кнопки"
    )
    
    # Статистика
    years_experience = models.CharField(
        "Роки досвіду",
        max_length=10,
        default="5+",
        help_text="Кількість років досвіду (наприклад: '5+', '10')"
    )
    
    satisfied_clients = models.CharField(
        "Задоволені клієнти",
        max_length=10,
        default="50+",
        help_text="Кількість задоволених клієнтів (наприклад: '50+', '100')"
    )
    
    completed_projects = models.IntegerField(
        "Завершені проєкти",
        default=100,
        validators=[MinValueValidator(0)],
        help_text="Кількість завершених проєктів (число)"
    )
    
    # ДОДАЄМО ВІДСУТНЄ ПОЛЕ employees_count
    employees_count = models.IntegerField(
        "Кількість співробітників",
        default=20,
        validators=[MinValueValidator(1)],
        help_text="Кількість співробітників компанії"
    )
    
    # Додаткова інформація
    additional_info = models.TextField(
        "Додаткова інформація",
        blank=True,
        help_text="Додатковий текст для відображення в Hero секції"
    )
    
    # SEO та метадані
    meta_title = models.CharField(
        "Meta заголовок",
        max_length=60,
        blank=True,
        help_text="SEO заголовок сторінки"
    )
    
    meta_description = models.TextField(
        "Meta опис",
        max_length=160,
        blank=True,
        help_text="SEO опис сторінки"
    )
    
    # Налаштування
    is_active = models.BooleanField(
        "Активна",
        default=True,
        help_text="Чи активна ця версія головної сторінки"
    )
    
    show_featured_services = models.BooleanField(
        "Показувати рекомендовані послуги",
        default=True,
        help_text="Показувати блок рекомендованих послуг в Hero секції"
    )
    
    featured_services_count = models.IntegerField(
        "Кількість рекомендованих послуг",
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(6)],
        help_text="Скільки рекомендованих послуг показувати"
    )
    
    # Системні поля
    created_at = models.DateTimeField("Створено", auto_now_add=True)
    updated_at = models.DateTimeField("Оновлено", auto_now=True)
    
    class Meta:
        verbose_name = "Головна сторінка"
        verbose_name_plural = "Головна сторінка"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Головна сторінка ({self.main_title})"
    
    def get_stats_dict(self):
        """Повертає статистику у вигляді словника для API"""
        return {
            'experience': self.years_experience,
            'projects': f"{self.completed_projects}+" if self.completed_projects else "100+",
            'clients': self.satisfied_clients,
            'employees': f"{self.employees_count}+" if self.employees_count else "20+",
            'support': '24/7'
        }
    
    def get_featured_services(self):
        """Повертає рекомендовані послуги"""
        if not self.show_featured_services:
            return []
        
        from apps.services.models import Service  # Уникаємо циклічний імпорт
        return Service.objects.filter(
            is_active=True, 
            is_featured=True
        ).order_by('order', 'name')[:self.featured_services_count]



class AboutPage(models.Model):
    """Страница О нас"""
    history_text = RichTextUploadingField(verbose_name=_("Історія компанії"))
    mission_text = RichTextUploadingField(verbose_name=_("Місія"))
    values_text = RichTextUploadingField(verbose_name=_("Цінності"))
    social_responsibility = RichTextUploadingField(verbose_name=_("Соціальна відповідальність"), blank=True)
    
    is_active = models.BooleanField(default=True, verbose_name=_("Активна"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Оновлено"))

    def __str__(self):
        return "Сторінка 'Про нас'"

    class Meta:
        ordering = ['-updated_at', 'id']  # Додано упорядкування
        verbose_name = _("Сторінка 'Про нас'")
        verbose_name_plural = _("Сторінка 'Про нас'")


class TeamMember(models.Model):
    """Команда/Руководство"""
    name = models.CharField(max_length=100, verbose_name=_("Ім'я"))
    position = models.CharField(max_length=100, verbose_name=_("Посада"))
    bio = RichTextUploadingField(blank=True, verbose_name=_("Біографія"))
    
    photo = models.ImageField(upload_to='team/', verbose_name=_("Фото"))
    email = models.EmailField(blank=True, verbose_name=_("Електронна пошта"))
    linkedin = models.URLField(blank=True, verbose_name=_("LinkedIn"))
    
    # ДОДАЄМО зв'язок з HomePage
    homepage = models.ForeignKey(
        HomePage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teammember_set',  # Зберігаємо існуючу назву для зворотної сумісності
        verbose_name=_("Головна сторінка"),
        help_text=_("Чи показувати цього члена команди на головній сторінці")
    )
    
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    is_management = models.BooleanField(default=False, verbose_name=_("Керівництво"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))

    class Meta:
        ordering = ['order', 'name']
        verbose_name = _("Член команди")
        verbose_name_plural = _("Команда")

    def __str__(self):
        return f"{self.name} - {self.position}"


class Certificate(models.Model):
    """Сертификаты компании"""
    title = models.CharField(max_length=200, verbose_name=_("Назва"))
    description = models.TextField(blank=True, verbose_name=_("Опис"))
    
    image = models.ImageField(upload_to='certificates/', verbose_name=_("Зображення"))
    issued_date = models.DateField(verbose_name=_("Дата видачі"))
    issuing_organization = models.CharField(max_length=200, verbose_name=_("Організація, що видала"))
    certificate_url = models.URLField(blank=True, verbose_name=_("Посилання на сертифікат"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))
    
    # ДОДАЄМО зв'язок з HomePage
    homepage = models.ForeignKey(
        HomePage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='certificate_set',
        verbose_name=_("Головна сторінка"),
        help_text=_("Чи показувати цей сертифікат на головній сторінці")
    )

    class Meta:
        ordering = ['-issued_date']
        verbose_name = _("Сертифікат")
        verbose_name_plural = _("Сертифікати")

    def __str__(self):
        return self.title


class ProductionPhoto(models.Model):
    """Фото с производства"""
    title = models.CharField(max_length=100, verbose_name=_("Назва"))
    description = models.TextField(blank=True, verbose_name=_("Опис"))
    
    image = models.ImageField(upload_to='production/', verbose_name=_("Зображення"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    is_featured = models.BooleanField(default=False, verbose_name=_("Рекомендоване"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))
    
    # ДОДАЄМО зв'язок з HomePage
    homepage = models.ForeignKey(
        HomePage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='productionphoto_set',
        verbose_name=_("Головна сторінка"),
        help_text=_("Чи показувати це фото на головній сторінці")
    )

    class Meta:
        ordering = ['order']
        verbose_name = _("Фото виробництва")
        verbose_name_plural = _("Фото виробництва")

    def __str__(self):
        return self.title