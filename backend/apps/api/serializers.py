# backend/apps/api/serializers.py
from rest_framework import serializers
from django.conf import settings
from django.utils import timezone
from apps.content.models import HomePage, AboutPage, TeamMember, Certificate, ProductionPhoto
from apps.services.models import Service, ServiceFeature
from apps.projects.models import Project, ProjectCategory, ProjectImage
from apps.jobs.models import JobPosition, JobApplication, WorkplacePhoto
from apps.partners.models import PartnershipInfo, WorkStage, PartnerInquiry
from apps.contacts.models import Office, ContactInquiry


# ============================================================================
# HOMEPAGE SERIALIZERS (З ПІДТРИМКОЮ HERO СЕКЦІЇ)
# ============================================================================

class HomePageSerializer(serializers.ModelSerializer):
    """Розширений серіалізатор для Homepage з підтримкою Hero секції"""
    
    # Додаткові поля для Hero секції
    stats = serializers.SerializerMethodField()
    featured_services = serializers.SerializerMethodField()
    featured_projects = serializers.SerializerMethodField()
    
    class Meta:
        model = HomePage
        fields = [
            'id',
            # Основний контент
            'main_title',
            'sphere_title',
            'subtitle',
            
                      
            # Кнопки дій
            'primary_button_text',
            'secondary_button_text',
            
            # Статистика
            'years_experience',
            'satisfied_clients',
            'completed_projects',
            'employees_count',
            
            # Додаткова інформація
            'additional_info',
                       
            # SEO
            'meta_title',
            'meta_description',
            
            # Налаштування
            'show_featured_services',
            'featured_services_count',
            
            # Обчислені поля
            'stats',
            'featured_services',
            'featured_projects',
            
            # Системні поля
            'created_at',
            'updated_at'
        ]
    
    def get_stats(self, obj):
        """Повертає статистику у зручному для frontend форматі"""
        return {
            'experience': obj.years_experience or '5+',
            'projects': f"{obj.completed_projects}+" if obj.completed_projects else '100+',
            'clients': obj.satisfied_clients or '50+',
            'employees': f"{obj.employees_count}+" if obj.employees_count else '20+',
            'support': '24/7'
        }
    
    def get_featured_services(self, obj):
        """Повертає рекомендовані послуги для Hero секції"""
        if not obj.show_featured_services:
            return []
        
        try:
            services = Service.objects.filter(
                is_active=True, 
                is_featured=True
            ).order_by('order', 'name')[:obj.featured_services_count]
            
            return ServiceListSerializer(
                services, 
                many=True, 
                context=self.context
            ).data
        except Exception as e:
            return []
    
    def get_featured_projects(self, obj):
        """Повертає рекомендовані проекти для Hero секції"""
        try:
            projects = Project.objects.filter(
                is_active=True, 
                is_featured=True
            ).order_by('-project_date', 'title')[:3]
            
            return ProjectListSerializer(
                projects, 
                many=True, 
                context=self.context
            ).data
        except Exception as e:
            return []


# ============================================================================
# TEAM AND ABOUT SERIALIZERS
# ============================================================================

class TeamMemberSerializer(serializers.ModelSerializer):
    """Серіалізатор для учасників команди"""
    
    class Meta:
        model = TeamMember
        fields = [
            'id',
            'name',
            'position',
            'bio',
            'photo',
            'email',
            'linkedin',
            'is_management',
            'order'
        ]


class CertificateSerializer(serializers.ModelSerializer):
    """Серіалізатор для сертифікатів"""
    
    class Meta:
        model = Certificate
        fields = [
            'id',
            'title',
            'description',
            'image',
            'issued_date',
            'issuing_organization',
            'certificate_url',
            'is_active'
        ]


class ProductionPhotoSerializer(serializers.ModelSerializer):
    """Серіалізатор для фото виробництва"""
    
    class Meta:
        model = ProductionPhoto
        fields = [
            'id',
            'title',
            'description',
            'image',
            'is_featured',
            'order'
        ]


class AboutPageSerializer(serializers.ModelSerializer):
    """Серіалізатор для сторінки 'Про нас'"""
    team_members = TeamMemberSerializer(many=True, read_only=True, source='teammember_set')
    certificates = CertificateSerializer(many=True, read_only=True, source='certificate_set')
    production_photos = ProductionPhotoSerializer(many=True, read_only=True, source='productionphoto_set')
    
    class Meta:
        model = AboutPage
        fields = [
            'id',
            'history_text',
            'mission_text',
            'values_text',
            'social_responsibility',
            'team_members',
            'certificates',
            'production_photos',
            'created_at',
            'updated_at'
        ]


# ============================================================================
# SERVICE SERIALIZERS
# ============================================================================

class ServiceFeatureSerializer(serializers.ModelSerializer):
    """Серіалізатор для особливостей послуг"""
    
    class Meta:
        model = ServiceFeature
        fields = [
            'id',
            'title',
            'description',
            'icon',
            'order'
        ]


class ServiceListSerializer(serializers.ModelSerializer):
    """Серіалізатор для списку послуг"""
    
    class Meta:
        model = Service
        fields = [
            'id',
            'name',
            'short_description',
            'slug',
            'icon',
            'main_image',
            'is_featured',
            'is_active',
            'order',
            'created_at'
        ]


class ServiceDetailSerializer(serializers.ModelSerializer):
    """Детальний серіалізатор для послуг"""
    features = ServiceFeatureSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id',
            'name',
            'short_description',
            'detailed_description',
            'benefits',
            'slug',
            'icon',
            'main_image',
            'min_order_quantity',
            'production_time',
            'is_featured',
            'is_active',
            'order',
            'features',
            'meta_title',
            'meta_description',
            'created_at',
            'updated_at'
        ]


# ============================================================================
# PROJECT SERIALIZERS
# ============================================================================

class ProjectCategorySerializer(serializers.ModelSerializer):
    """Серіалізатор для категорій проектів"""
    projects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectCategory
        fields = [
            'id',
            'name',
            'description',
            'slug',
            'image',
            'order',
            'is_active',
            'projects_count'
        ]
    
    def get_projects_count(self, obj):
        """Підраховує кількість активних проектів в категорії"""
        return obj.projects.filter(is_active=True).count()


class ProjectImageSerializer(serializers.ModelSerializer):
    """Серіалізатор для зображень проектів"""
    
    class Meta:
        model = ProjectImage
        fields = [
            'id',
            'image',
            'caption',
            'order'
        ]


class ProjectListSerializer(serializers.ModelSerializer):
    """Серіалізатор для списку проектів"""
    category = ProjectCategorySerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'short_description',
            'slug',
            'category',
            'category_name',
            'client_name',
            'project_date',
            'main_image',
            'is_featured',
            'is_active',
            'created_at'
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Детальний серіалізатор для проектів"""
    category = ProjectCategorySerializer(read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'short_description',
            'detailed_description',
            'challenge',
            'solution',
            'result',
            'slug',
            'category',
            'client_name',
            'project_date',
            'quantity',
            'materials_used',
            'main_image',
            'meta_title',
            'meta_description',
            'is_featured',
            'is_active',
            'images',
            'created_at',
            'updated_at'
        ]


# ============================================================================
# JOB SERIALIZERS
# ============================================================================

class JobPositionListSerializer(serializers.ModelSerializer):
    """Серіалізатор для списку вакансій"""
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosition
        fields = [
            'id',
            'title',
            'employment_type',
            'location',
            'salary_range',
            'experience_required',
            'is_urgent',
            'is_active',
            'applications_count',
            'created_at'
        ]
    
    def get_applications_count(self, obj):
        """Підраховує кількість заявок на вакансію"""
        return obj.applications.count()


class JobPositionDetailSerializer(serializers.ModelSerializer):
    """Детальний серіалізатор для вакансій"""
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosition
        fields = [
            'id',
            'title',
            'description',
            'responsibilities',
            'requirements',
            'benefits',
            'employment_type',
            'location',
            'salary_range',
            'experience_required',
            'deadline',
            'is_urgent',
            'is_active',
            'applications_count',
            'created_at',
            'updated_at'
        ]
    
    def get_applications_count(self, obj):
        return obj.applications.count()


class JobApplicationSerializer(serializers.ModelSerializer):
    """Серіалізатор для заявок на роботу"""
    
    class Meta:
        model = JobApplication
        fields = [
            'name',
            'email',
            'phone',
            'position',
            'experience',
            'cover_letter',
            'resume'
        ]
    
    def create(self, validated_data):
        """Створює нову заявку"""
        return JobApplication.objects.create(**validated_data)


class WorkplacePhotoSerializer(serializers.ModelSerializer):
    """Серіалізатор для фото робочих місць"""
    
    class Meta:
        model = WorkplacePhoto
        fields = [
            'id',
            'title',
            'description',
            'image',
            'is_active',
            'order'
        ]


# ============================================================================
# OFFICE AND CONTACT SERIALIZERS
# ============================================================================

class OfficeSerializer(serializers.ModelSerializer):
    """Серіалізатор для офісів"""
    
    class Meta:
        model = Office
        fields = [
            'id',
            'name',
            'address',
            'city',
            'phone',
            'email',
            'working_hours',
            'is_main',
            'latitude',
            'longitude',
            'is_active'
        ]


class ContactInquirySerializer(serializers.ModelSerializer):
    """Серіалізатор для звернень клієнтів"""
    
    class Meta:
        model = ContactInquiry
        fields = [
            'name',
            'email',
            'phone',
            'company',
            'inquiry_type',
            'subject',
            'message'
        ]
    
    def create(self, validated_data):
        """Створює нове звернення"""
        return ContactInquiry.objects.create(**validated_data)


# ============================================================================
# PARTNER SERIALIZERS
# ============================================================================

class WorkStageSerializer(serializers.ModelSerializer):
    """Серіалізатор для етапів роботи"""
    
    class Meta:
        model = WorkStage
        fields = [
            'id',
            'title',
            'description',
            'icon',
            'duration',
            'order'
        ]


class PartnershipInfoSerializer(serializers.ModelSerializer):
    """Серіалізатор для інформації про партнерство"""
    work_stages = WorkStageSerializer(many=True, read_only=True, source='workstage_set')
    
    class Meta:
        model = PartnershipInfo
        fields = [
            'id',
            'cooperation_terms',
            'work_stages_info',
            'faq_content',
            'benefits',
            'min_order_amount',
            'production_capacity',
            'work_stages',
            'updated_at'
        ]


class PartnerInquirySerializer(serializers.ModelSerializer):
    """Серіалізатор для запитів партнерів"""
    
    class Meta:
        model = PartnerInquiry
        fields = [
            'company_name',
            'contact_person',
            'email',
            'phone',
            'inquiry_type',
            'message',
            'project_description',
            'estimated_quantity'
        ]
    
    def create(self, validated_data):
        """Створює новий запит партнера"""
        return PartnerInquiry.objects.create(**validated_data)


# ============================================================================
# TRANSLATION SERIALIZERS
# ============================================================================

class TranslationSerializer(serializers.Serializer):
    """Серіалізатор для перекладів"""
    language = serializers.CharField(max_length=5)
    translations = serializers.DictField()
    count = serializers.IntegerField()
    source = serializers.CharField(required=False)
    last_updated = serializers.DateTimeField(required=False)
    cache_info = serializers.DictField(required=False)


class TranslationStatsSerializer(serializers.Serializer):
    """Серіалізатор для статистики перекладів"""
    languages = serializers.DictField()
    total_keys = serializers.IntegerField()
    cache_info = serializers.DictField()
    last_updated = serializers.DateTimeField()


# ============================================================================
# UNIFIED API RESPONSE SERIALIZERS
# ============================================================================

class APIStatsSerializer(serializers.Serializer):
    """Серіалізатор для загальної статистики API"""
    services_count = serializers.IntegerField()
    projects_count = serializers.IntegerField()
    jobs_count = serializers.IntegerField()
    offices_count = serializers.IntegerField()
    last_updated = serializers.DateTimeField()


class ErrorResponseSerializer(serializers.Serializer):
    """Серіалізатор для помилок API"""
    error = serializers.CharField()
    message = serializers.CharField(required=False)
    code = serializers.CharField(required=False)
    details = serializers.DictField(required=False)


class SuccessResponseSerializer(serializers.Serializer):
    """Серіалізатор для успішних відповідей"""
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    data = serializers.DictField(required=False)