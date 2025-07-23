# backend/apps/api/views.py
from rest_framework import viewsets, status, filters, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.throttling import AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
import logging

# Моделі
from apps.content.models import HomePage, AboutPage, TeamMember, Certificate, ProductionPhoto
from apps.services.models import Service, ServiceFeature
from apps.projects.models import Project, ProjectCategory, ProjectImage
from apps.jobs.models import JobPosition, JobApplication, WorkplacePhoto
from apps.partners.models import PartnershipInfo, WorkStage, PartnerInquiry
from apps.contacts.models import Office, ContactInquiry

# Серіалізатори
from .serializers import (
    HomePageSerializer, AboutPageSerializer, TeamMemberSerializer, CertificateSerializer,
    ProductionPhotoSerializer, ServiceListSerializer, ServiceDetailSerializer, ServiceFeatureSerializer,
    ProjectListSerializer, ProjectDetailSerializer, ProjectCategorySerializer, ProjectImageSerializer,
    JobPositionListSerializer, JobPositionDetailSerializer, JobApplicationSerializer, WorkplacePhotoSerializer,
    PartnershipInfoSerializer, WorkStageSerializer, PartnerInquirySerializer,
    OfficeSerializer, ContactInquirySerializer, APIStatsSerializer, ErrorResponseSerializer,
    HeroDataSerializer
)

logger = logging.getLogger(__name__)


# ============================================================================
# БАЗОВІ КЛАСИ
# ============================================================================

class BaseViewSetWithCache(viewsets.ReadOnlyModelViewSet):
    """Базовий ViewSet з підтримкою кешування"""
    cache_timeout = 60 * 15  # 15 хвилин за замовчуванням
    cache_key_prefix = 'api'
    
    def get_cache_key(self, action='list', **kwargs):
        """Генерує ключ кешу з врахуванням параметрів"""
        model_name = self.queryset.model.__name__.lower()
        language = getattr(self.request, 'LANGUAGE_CODE', 'uk')
        
        key_parts = [self.cache_key_prefix, model_name, action, language]
        
        # Додаємо параметри до ключа
        if kwargs:
            sorted_params = sorted(kwargs.items())
            key_parts.extend([f"{k}_{v}" for k, v in sorted_params])
            
        return "_".join(str(part) for part in key_parts)
    
    def get_cached_response(self, cache_key, fallback_func, *args, **kwargs):
        """Отримує дані з кешу або виконує fallback функцію"""
        try:
            # Спробуємо отримати з кешу
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                logger.info(f"Cache HIT: {cache_key}")
                return Response(cached_data)
            
            # Виконуємо оригінальну функцію
            response = fallback_func(*args, **kwargs)
            
            # Кешуємо тільки успішні відповіді
            if hasattr(response, 'status_code') and response.status_code == 200:
                cache.set(cache_key, response.data, self.cache_timeout)
                logger.info(f"Cache SET: {cache_key}")
            
            return response
            
        except Exception as e:
            logger.error(f"Cache error for {cache_key}: {str(e)}")
            # При помилці кешу повертаємо дані без кешування
            return fallback_func(*args, **kwargs)
    
    def get_serializer_context(self):
        """Додає контекст для серіалізаторів"""
        context = super().get_serializer_context()
        context.update({
            'cache_timeout': self.cache_timeout,
            'cache_enabled': True
        })
        return context


class CreateOnlyViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """ViewSet тільки для створення об'єктів"""
    pass


# ============================================================================
# HOMEPAGE VIEWSETS
# ============================================================================

class HomePageViewSet(BaseViewSetWithCache):
    """API для головної сторінки з розширеною підтримкою Hero секції"""
    queryset = HomePage.objects.filter(is_active=True).order_by('-id')
    serializer_class = HomePageSerializer
    cache_timeout = 60 * 15  # 15 хвилин
    
    def get_queryset(self):
        """Оптимізований queryset з prefetch"""
        # Тепер teammember_set існує і працює коректно
        return super().get_queryset().prefetch_related(
            'teammember_set',  # Тепер цей зв'язок існує
            'certificate_set', 
            'productionphoto_set'
        )
    
    def list(self, request, *args, **kwargs):
        """Отримати дані головної сторінки"""
        cache_key = self.get_cache_key('list')
        
        def get_homepage_data():
            queryset = self.get_queryset()
            homepage = queryset.first()
            
            if not homepage:
                return Response({
                    'success': False,
                    'message': 'Дані головної сторінки не знайдено',
                    'data': None
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = self.get_serializer(homepage)
            return Response({
                'success': True,
                'message': 'Дані головної сторінки успішно отримано',
                'data': serializer.data
            })
        
        return self.get_cached_response(cache_key, get_homepage_data)
    
    @action(detail=False, methods=['get'], url_path='hero_data')
    def hero_data(self, request):
        """Спеціальний endpoint для отримання даних Hero секції"""
        cache_key = self.get_cache_key('hero')
        
        def get_hero_data():
            try:
                homepage = self.get_queryset().first()
                
                if not homepage:
                    return Response({
                        'success': False,
                        'message': 'Дані головної сторінки не знайдено',
                        'data': None
                    }, status=status.HTTP_404_NOT_FOUND)
                
                # Тепер можемо використовувати зв'язок для отримання команди
                team_members = homepage.teammember_set.filter(
                    is_active=True
                ).order_by('order', 'name')[:3]
                
                # Отримуємо рекомендовані послуги
                featured_services = []
                if homepage.show_featured_services:
                    featured_services = Service.objects.filter(
                        is_active=True, 
                        is_featured=True
                    ).order_by('order', 'name')[:homepage.featured_services_count]
                
                # Отримуємо рекомендовані проекти
                featured_projects = Project.objects.filter(
                    is_active=True, 
                    is_featured=True
                ).order_by('-project_date', 'title')[:3]
                
                # Формуємо дані
                hero_data = {
                    'main_title': homepage.main_title,
                    'sphere_title': homepage.sphere_title,
                    'subtitle': homepage.subtitle,
                    'primary_button_text': homepage.primary_button_text,
                    'secondary_button_text': homepage.secondary_button_text,
                    'stats': {
                        'experience': homepage.years_experience or '5+',
                        'projects': f"{homepage.completed_projects}+" if homepage.completed_projects else '100+',
                        'clients': homepage.satisfied_clients or '50+',
                        'employees': f"{homepage.employees_count}+" if homepage.employees_count else '20+'
                    },
                    'team_members': TeamMemberSerializer(team_members, many=True, context={'request': request}).data,
                    'featured_services': ServiceListSerializer(featured_services, many=True, context={'request': request}).data,
                    'featured_projects': ProjectListSerializer(featured_projects, many=True, context={'request': request}).data,
                    'additional_info': homepage.additional_info,
                    'show_featured_services': homepage.show_featured_services,
                }
                
                return Response({
                    'success': True,
                    'message': 'Hero дані успішно отримано',
                    'data': hero_data
                })
                
            except Exception as e:
                logger.error(f"Error loading hero data: {str(e)}")
                return Response({
                    'success': False,
                    'message': 'Помилка при завантаженні Hero даних',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return self.get_cached_response(cache_key, get_hero_data)


class AboutPageViewSet(BaseViewSetWithCache):
    """API для сторінки 'Про нас'"""
    queryset = AboutPage.objects.filter(is_active=True).order_by('-id')
    serializer_class = AboutPageSerializer
    cache_timeout = 60 * 30  # 30 хвилин
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)


# ============================================================================
# CONTENT VIEWSETS (CERTIFICATES AND PRODUCTION PHOTOS)
# ============================================================================

class CertificateViewSet(BaseViewSetWithCache):
    """API для сертифікатів"""
    queryset = Certificate.objects.filter(is_active=True).order_by('-issued_date')
    serializer_class = CertificateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'homepage']  # Додаємо фільтр по homepage
    search_fields = ['title', 'description', 'issuing_organization']
    ordering_fields = ['title', 'issued_date']
    ordering = ['-issued_date']
    cache_timeout = 60 * 30  # 30 хвилин
    
    def get_queryset(self):
        """Оптимізований queryset"""
        return super().get_queryset().select_related('homepage')
    
    def list(self, request, *args, **kwargs):
        query_params = {k: v for k, v in request.query_params.items()}
        cache_key = self.get_cache_key('list', **query_params)
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def homepage_certificates(self, request):
        """Сертифікати, що показуються на головній сторінці"""
        cache_key = self.get_cache_key('homepage_certificates')
        
        def get_homepage_certificates():
            # Отримуємо сертифікати, пов'язані з активною головною сторінкою
            homepage_certificates = self.get_queryset().filter(
                homepage__is_active=True,
                homepage__isnull=False
            )
            serializer = CertificateSerializer(
                homepage_certificates, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Сертифікати головної сторінки завантажені',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_homepage_certificates)


class ProductionPhotoViewSet(BaseViewSetWithCache):
    """API для фото виробництва"""
    queryset = ProductionPhoto.objects.filter(is_active=True).order_by('order')
    serializer_class = ProductionPhotoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_featured', 'is_active', 'homepage']  # Додаємо фільтр по homepage
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'order']
    ordering = ['order']
    cache_timeout = 60 * 30  # 30 хвилин
    
    def get_queryset(self):
        """Оптимізований queryset"""
        return super().get_queryset().select_related('homepage')
    
    def list(self, request, *args, **kwargs):
        query_params = {k: v for k, v in request.query_params.items()}
        cache_key = self.get_cache_key('list', **query_params)
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Рекомендовані фото виробництва"""
        cache_key = self.get_cache_key('featured')
        
        def get_featured():
            featured_photos = self.get_queryset().filter(is_featured=True)
            serializer = ProductionPhotoSerializer(
                featured_photos, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Рекомендовані фото виробництва завантажені',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_featured)
    
    @action(detail=False, methods=['get'])
    def homepage_photos(self, request):
        """Фото виробництва, що показуються на головній сторінці"""
        cache_key = self.get_cache_key('homepage_photos')
        
        def get_homepage_photos():
            # Отримуємо фото, пов'язані з активною головною сторінкою
            homepage_photos = self.get_queryset().filter(
                homepage__is_active=True,
                homepage__isnull=False
            )
            serializer = ProductionPhotoSerializer(
                homepage_photos, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Фото виробництва головної сторінки завантажені',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_homepage_photos)

class TeamMemberViewSet(BaseViewSetWithCache):
    """API для членів команди"""
    queryset = TeamMember.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = TeamMemberSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_management', 'is_active', 'homepage']  # Додаємо фільтр по homepage
    search_fields = ['name', 'position']
    ordering_fields = ['name', 'position', 'order']
    ordering = ['order', 'name']
    cache_timeout = 60 * 20  # 20 хвилин
    
    def get_queryset(self):
        """Оптимізований queryset"""
        return super().get_queryset().select_related('homepage')
    
    def list(self, request, *args, **kwargs):
        query_params = {k: v for k, v in request.query_params.items()}
        cache_key = self.get_cache_key('list', **query_params)
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def management(self, request):
        """Керівництво компанії"""
        cache_key = self.get_cache_key('management')
        
        def get_management():
            management_team = self.get_queryset().filter(is_management=True)
            serializer = TeamMemberSerializer(
                management_team, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Керівництво компанії завантажено',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_management)
    
    @action(detail=False, methods=['get'])
    def homepage_team(self, request):
        """Команда, що показується на головній сторінці"""
        cache_key = self.get_cache_key('homepage_team')
        
        def get_homepage_team():
            # Отримуємо членів команди, пов'язаних з активною головною сторінкою
            homepage_team = self.get_queryset().filter(
                homepage__is_active=True,
                homepage__isnull=False
            )
            serializer = TeamMemberSerializer(
                homepage_team, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Команда головної сторінки завантажена',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_homepage_team)


# ============================================================================
# SERVICE VIEWSETS
# ============================================================================

class ServiceViewSet(BaseViewSetWithCache):
    """API для послуг"""
    queryset = Service.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = ServiceListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_featured', 'is_active']
    search_fields = ['name', 'short_description']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    cache_timeout = 60 * 20  # 20 хвилин
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ServiceDetailSerializer
        return ServiceListSerializer
    
    def list(self, request, *args, **kwargs):
        query_params = {k: v for k, v in request.query_params.items()}
        cache_key = self.get_cache_key('list', **query_params)
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Рекомендовані послуги"""
        cache_key = self.get_cache_key('featured')
        
        def get_featured():
            featured_services = self.get_queryset().filter(is_featured=True)[:6]
            serializer = ServiceListSerializer(
                featured_services, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Рекомендовані послуги завантажено',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_featured)


# ============================================================================
# PROJECT VIEWSETS
# ============================================================================

class ProjectCategoryViewSet(BaseViewSetWithCache):
    """API для категорій проектів"""
    queryset = ProjectCategory.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = ProjectCategorySerializer
    cache_timeout = 60 * 60  # 1 година
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)


class ProjectViewSet(BaseViewSetWithCache):
    """API для проектів"""
    queryset = Project.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ProjectListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'is_active']
    search_fields = ['title', 'short_description', 'client_name']
    ordering_fields = ['title', 'created_at', 'project_date']
    ordering = ['-created_at']
    cache_timeout = 60 * 25  # 25 хвилин
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer
    
    def get_queryset(self):
        """Оптимізований queryset"""
        return super().get_queryset().select_related('category').prefetch_related('images')
    
    def list(self, request, *args, **kwargs):
        query_params = {k: v for k, v in request.query_params.items()}
        cache_key = self.get_cache_key('list', **query_params)
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Рекомендовані проекти"""
        cache_key = self.get_cache_key('featured')
        
        def get_featured():
            featured_projects = self.get_queryset().filter(is_featured=True)[:6]
            serializer = ProjectListSerializer(
                featured_projects, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Рекомендовані проекти завантажено',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_featured)


# ============================================================================
# JOB VIEWSETS
# ============================================================================

class JobPositionViewSet(BaseViewSetWithCache):
    """API для вакансій"""
    queryset = JobPosition.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = JobPositionListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employment_type', 'is_urgent', 'location']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['title', 'created_at', 'expires_at']
    ordering = ['-created_at']
    cache_timeout = 60 * 10  # 10 хвилин
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobPositionDetailSerializer
        return JobPositionListSerializer
    
    def list(self, request, *args, **kwargs):
        query_params = {k: v for k, v in request.query_params.items()}
        cache_key = self.get_cache_key('list', **query_params)
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Терміново потрібні вакансії"""
        cache_key = self.get_cache_key('urgent')
        
        def get_urgent():
            urgent_jobs = self.get_queryset().filter(is_urgent=True)
            serializer = JobPositionListSerializer(
                urgent_jobs, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Терміново потрібні вакансії завантажено',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_urgent)


class JobApplicationViewSet(CreateOnlyViewSet):
    """API для заявок на вакансії"""
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        
        # Очищаємо кеш вакансій після нової заявки
        self._clear_job_cache()
        
        return Response({
            'success': True,
            'message': 'Заявку на вакансію успішно відправлено',
            'data': {'id': application.id}
        }, status=status.HTTP_201_CREATED)
    
    def _clear_job_cache(self):
        """Очищає кеш пов'язаний з вакансіями"""
        try:
            cache_keys = [
                'api_jobposition_list_uk',
                'api_jobposition_list_en',
                'api_jobposition_urgent_uk',
                'api_jobposition_urgent_en'
            ]
            cache.delete_many(cache_keys)
        except Exception as e:
            logger.warning(f"Failed to clear job cache: {str(e)}")


class WorkplacePhotoViewSet(BaseViewSetWithCache):
    """API для фото робочих місць"""
    queryset = WorkplacePhoto.objects.filter(is_active=True).order_by('order')
    serializer_class = WorkplacePhotoSerializer
    cache_timeout = 60 * 30  # 30 хвилин
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)


# ============================================================================
# CONTACT AND OFFICE VIEWSETS
# ============================================================================

class OfficeViewSet(BaseViewSetWithCache):
    """API для офісів"""
    queryset = Office.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = OfficeSerializer
    cache_timeout = 60 * 60  # 1 година
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)


class ContactInquiryViewSet(CreateOnlyViewSet):
    """API для звернень"""
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Звернення успішно відправлено',
            'data': {'id': inquiry.id}
        }, status=status.HTTP_201_CREATED)


# ============================================================================
# PARTNER VIEWSETS
# ============================================================================

class PartnershipInfoViewSet(BaseViewSetWithCache):
    """API для інформації про партнерство"""
    queryset = PartnershipInfo.objects.filter(is_active=True).order_by('-id')
    serializer_class = PartnershipInfoSerializer
    cache_timeout = 60 * 60  # 1 година
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)


class PartnerInquiryViewSet(CreateOnlyViewSet):
    """API для запитів партнерів"""
    queryset = PartnerInquiry.objects.all()
    serializer_class = PartnerInquirySerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        
        return Response({
            'success': True,
            'message': 'Запит партнера успішно відправлено',
            'data': {'id': inquiry.id}
        }, status=status.HTTP_201_CREATED)


# ============================================================================
# UTILITY AND MANAGEMENT VIEWS
# ============================================================================

class APIStatsViewSet(viewsets.ViewSet):
    """API для загальної статистики"""
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Загальна статистика API"""
        cache_key = 'api_stats_overview'
        
        def get_overview_stats():
            try:
                stats = {
                    'services_count': Service.objects.filter(is_active=True).count(),
                    'projects_count': Project.objects.filter(is_active=True).count(),
                    'jobs_count': JobPosition.objects.filter(is_active=True).count(),
                    'team_members_count': TeamMember.objects.filter(is_active=True).count(),
                    'certificates_count': Certificate.objects.filter(is_active=True).count(),  # Додаємо сертифікати
                    'production_photos_count': ProductionPhoto.objects.filter(is_active=True).count(),  # Додаємо фото
                    'offices_count': Office.objects.filter(is_active=True).count(),
                    'categories_count': ProjectCategory.objects.filter(is_active=True).count(),
                    'applications_count': JobApplication.objects.count(),
                    'inquiries_count': ContactInquiry.objects.count(),
                    'last_updated': timezone.now().isoformat()
                }
                
                return Response({
                    'success': True,
                    'message': 'Статистика API завантажена',
                    'data': stats
                })
                
            except Exception as e:
                logger.error(f"Error loading API stats: {str(e)}")
                return Response({
                    'success': False,
                    'message': 'Помилка завантаження статистики',
                    'data': {}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Кешуємо на 30 хвилин
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        response = get_overview_stats()
        if response.status_code == 200:
            cache.set(cache_key, response.data, 60 * 30)
        
        return response