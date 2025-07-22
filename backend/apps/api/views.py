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
    OfficeSerializer, ContactInquirySerializer, APIStatsSerializer, ErrorResponseSerializer
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
        return super().get_queryset().prefetch_related(
            'teammember_set',
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
                'message': 'Дані головної сторінки завантажено успішно',
                'data': serializer.data
            })
        
        return self.get_cached_response(cache_key, get_homepage_data)
    
    @action(detail=False, methods=['get'])
    def hero_data(self, request):
        """Спеціальний endpoint для Hero секції"""
        cache_key = self.get_cache_key('hero_data')
        
        def get_hero_data():
            try:
                homepage = self.get_queryset().first()
                if not homepage:
                    return Response({
                        'success': False,
                        'message': 'Дані для Hero секції не знайдено',
                        'data': self._get_default_hero_data()
                    })
                
                # Формуємо Hero дані
                hero_data = {
                    'main_title': homepage.main_title or 'Професійний одяг',
                    'sphere_title': homepage.sphere_title or 'кожної сфери',
                    'subtitle': homepage.subtitle or '',
                    'primary_button_text': homepage.primary_button_text or 'Наші проєкти',
                    'secondary_button_text': homepage.secondary_button_text or 'Дізнатися більше',
                    'additional_info': homepage.additional_info or '',
                    
                    'stats': homepage.get_stats_dict(),
                    'meta': {
                        'title': homepage.meta_title or '',
                        'description': homepage.meta_description or ''
                    }
                }
                
                # Додаємо рекомендовані послуги
                if homepage.show_featured_services:
                    featured_services = homepage.get_featured_services()
                    hero_data['featured_services'] = ServiceListSerializer(
                        featured_services, 
                        many=True, 
                        context={'request': request}
                    ).data
                
                return Response({
                    'success': True,
                    'message': 'Hero дані завантажено успішно',
                    'data': hero_data
                })
                
            except Exception as e:
                logger.error(f"Error loading hero data: {str(e)}")
                return Response({
                    'success': False,
                    'message': f'Помилка завантаження Hero даних: {str(e)}',
                    'data': self._get_default_hero_data()
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return self.get_cached_response(cache_key, get_hero_data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Endpoint для отримання статистики"""
        cache_key = self.get_cache_key('stats')
        
        def get_stats():
            try:
                homepage = self.get_queryset().first()
                
                if homepage:
                    # Збираємо актуальну статистику
                    actual_projects = Project.objects.filter(is_active=True).count()
                    actual_services = Service.objects.filter(is_active=True).count()
                    
                    stats = {
                        'experience': homepage.years_experience or '5+',
                        'projects': f"{max(actual_projects, homepage.completed_projects or 0)}+",
                        'clients': homepage.satisfied_clients or '50+',
                        'employees': f"{homepage.employees_count}+" if homepage.employees_count else '20+',
                        'services': f"{actual_services}+",
                        'support': '24/7',
                        'last_updated': homepage.updated_at.isoformat() if homepage.updated_at else timezone.now().isoformat()
                    }
                else:
                    # Дефолтна статистика
                    stats = {
                        'experience': '5+',
                        'projects': '100+',
                        'clients': '50+',
                        'employees': '20+',
                        'services': '12+',
                        'support': '24/7',
                        'last_updated': timezone.now().isoformat()
                    }
                
                return Response({
                    'success': True,
                    'message': 'Статистика завантажена успішно',
                    'data': stats
                })
                
            except Exception as e:
                logger.error(f"Error loading stats: {str(e)}")
                return Response({
                    'success': False,
                    'message': 'Помилка завантаження статистики',
                    'data': {}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return self.get_cached_response(cache_key, get_stats)
    
    def _get_default_hero_data(self):
        """Повертає дефолтні Hero дані"""
        return {
            'main_title': 'Професійний одяг',
            'sphere_title': 'кожної сфери',
            'subtitle': 'Ми створюємо високоякісний спецодяг для українських підприємств',
            'primary_button_text': 'Наші проєкти',
            'secondary_button_text': 'Дізнатися більше',
            'stats': {
                'experience': '5+',
                'projects': '100+',
                'clients': '50+',
                'support': '24/7'
            },
            'featured_services': []
        }


class AboutPageViewSet(BaseViewSetWithCache):
    """API для сторінки 'Про нас'"""
    queryset = AboutPage.objects.filter(is_active=True).order_by('-id')
    serializer_class = AboutPageSerializer
    cache_timeout = 60 * 30  # 30 хвилин
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)


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
        # Враховуємо фільтри в ключі кешу
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
    filterset_fields = ['employment_type', 'location', 'is_urgent', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'deadline']
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
        """Терміново вакансії"""
        cache_key = self.get_cache_key('urgent')
        
        def get_urgent():
            urgent_jobs = self.get_queryset().filter(is_urgent=True)[:5]
            serializer = JobPositionListSerializer(
                urgent_jobs, 
                many=True, 
                context={'request': request}
            )
            return Response({
                'success': True,
                'message': 'Термінові вакансії завантажено',
                'data': serializer.data,
                'count': len(serializer.data)
            })
        
        return self.get_cached_response(cache_key, get_urgent)


class JobApplicationViewSet(CreateOnlyViewSet):
    """API для заявок на роботу"""
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        
        # Очищаємо кеш вакансій
        self._clear_job_cache()
        
        return Response({
            'success': True,
            'message': 'Заявку успішно відправлено',
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


class WorkplacePhotoViewSet(BaseViewSetWithCache):
    """API для фото робочих місць"""
    queryset = WorkplacePhoto.objects.filter(is_active=True).order_by('order')
    serializer_class = WorkplacePhotoSerializer
    cache_timeout = 60 * 30  # 30 хвилин
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(cache_key, super().list, request, *args, **kwargs)


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


# ============================================================================
# CACHE MANAGEMENT (DEBUG ONLY)
# ============================================================================

class CacheManagementViewSet(viewsets.ViewSet):
    """ViewSet для управління кешем (тільки для DEBUG)"""
    
    @action(detail=False, methods=['post'])
    def clear_all(self, request):
        """Очищення всього кешу"""
        if not settings.DEBUG:
            return Response({
                'success': False,
                'message': 'Доступно тільки в DEBUG режимі'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            cache.clear()
            return Response({
                'success': True,
                'message': 'Весь кеш очищено успішно'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Помилка очищення кешу: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def info(self, request):
        """Інформація про кеш"""
        if not settings.DEBUG:
            return Response({
                'success': False,
                'message': 'Доступно тільки в DEBUG режимі'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Спробуємо отримати Redis статистику
            from django_redis import get_redis_connection
            con = get_redis_connection("default")
            info = con.info()
            
            cache_info = {
                'redis_version': info.get('redis_version'),
                'connected_clients': info.get('connected_clients'),
                'used_memory_human': info.get('used_memory_human'),
                'total_commands_processed': info.get('total_commands_processed'),
                'keyspace_hits': info.get('keyspace_hits'),
                'keyspace_misses': info.get('keyspace_misses')
            }
            
            return Response({
                'success': True,
                'message': 'Інформація про кеш отримана',
                'data': cache_info
            })
            
        except ImportError:
            return Response({
                'success': True,
                'message': 'Використовується локальний кеш Django',
                'data': {'type': 'local'}
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Помилка отримання інформації: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)