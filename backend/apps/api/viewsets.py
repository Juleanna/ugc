# backend/apps/api/viewsets.py
# Оптимізована реалізація ViewSets без дублювання

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters import rest_framework as django_filters
from django.core.cache import cache
from django.utils import timezone
import logging

# Імпорт моделей
from apps.content.models import HomePage, AboutPage, TeamMember, Certificate, ProductionPhoto
from apps.services.models import Service, ServiceFeature
from apps.projects.models import Project, ProjectCategory, ProjectImage
from apps.jobs.models import JobPosition, JobApplication, WorkplacePhoto
from apps.partners.models import PartnershipInfo, WorkStage, PartnerInquiry
from apps.contacts.models import Office, ContactInquiry

# Іміпорт серіалізаторів
from .serializers import (
    # Content serializers
    HomePageSerializer, AboutPageSerializer, TeamMemberSerializer, 
    CertificateSerializer, ProductionPhotoSerializer,
    # Service serializers
    ServiceListSerializer, ServiceDetailSerializer, ServiceFeatureSerializer,
    # Project serializers
    ProjectListSerializer, ProjectDetailSerializer, ProjectCategorySerializer,
    ProjectImageSerializer,
    # Job serializers
    JobPositionListSerializer, JobPositionDetailSerializer, JobApplicationSerializer,
    WorkplacePhotoSerializer,
    # Partner serializers
    PartnershipInfoSerializer, WorkStageSerializer, PartnerInquirySerializer,
    # Contact serializers
    OfficeSerializer, ContactInquirySerializer
)

logger = logging.getLogger(__name__)

# ============================================================================
# CONTENT VIEWSETS
# ============================================================================

class HomePageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для головної сторінки"""
    
    queryset = HomePage.objects.all()
    serializer_class = HomePageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Оптимізований queryset з prefetch_related"""
        return HomePage.objects.prefetch_related(
            'teammember_set',
            'certificate_set', 
            'productionphoto_set'
        ).all()


class AboutPageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для сторінки 'Про нас'"""
    
    queryset = AboutPage.objects.filter(is_active=True)
    serializer_class = AboutPageSerializer
    permission_classes = [AllowAny]
    ordering = ['-updated_at', 'id']
    
    def get_queryset(self):
        """Оптимізований queryset з упорядкуванням"""
        return AboutPage.objects.filter(is_active=True).prefetch_related(
            'teammember_set',
            'certificate_set',
            'productionphoto_set'
        ).order_by('-updated_at', 'id')


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для членів команди"""
    
    queryset = TeamMember.objects.filter(is_active=True)
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_management', 'homepage']
    ordering_fields = ['order', 'name']
    ordering = ['order', 'name']


# ============================================================================
# SERVICE VIEWSETS
# ============================================================================

class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для послуг"""
    
    queryset = Service.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_featured', 'is_active']
    search_fields = ['name', 'short_description', 'detailed_description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']
    
    def get_serializer_class(self):
        """Вибір серіалізатора залежно від дії"""
        if self.action == 'retrieve':
            return ServiceDetailSerializer
        return ServiceListSerializer
    
    def get_queryset(self):
        """Оптимізований queryset"""
        return Service.objects.filter(is_active=True).prefetch_related('features')
    
    @action(detail=True, methods=['get'])
    def features(self, request, pk=None):
        """Особливості конкретної послуги"""
        service = self.get_object()
        features = service.features.all().order_by('order')
        
        serializer = ServiceFeatureSerializer(features, many=True, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data,
            'count': features.count(),
            'message': f'Особливості послуги "{service.name}" отримано'
        })


# ============================================================================
# PROJECT VIEWSETS
# ============================================================================

class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для категорій проєктів"""
    
    queryset = ProjectCategory.objects.filter(is_active=True)
    serializer_class = ProjectCategorySerializer
    permission_classes = [AllowAny]
    ordering = ['order', 'name']
    
    @action(detail=True, methods=['get'])
    def projects(self, request, pk=None):
        """Проєкти в категорії"""
        category = self.get_object()
        projects = Project.objects.filter(
            category=category, 
            is_active=True
        ).order_by('-project_date')
        
        page = self.paginate_queryset(projects)
        if page is not None:
            serializer = ProjectListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = ProjectListSerializer(projects, many=True, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data,
            'count': projects.count(),
            'message': f'Проєкти категорії "{category.name}" отримано'
        })


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для проєктів"""
    
    queryset = Project.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'is_active']
    search_fields = ['title', 'short_description', 'client_name']
    ordering_fields = ['project_date', 'title', 'created_at']
    ordering = ['-project_date', 'title']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer
    
    def get_queryset(self):
        return Project.objects.filter(is_active=True).select_related(
            'category'
        ).prefetch_related('images')
    
    @action(detail=True, methods=['get'])
    def images(self, request, slug=None):
        """Зображення проєкту"""
        project = self.get_object()
        images = project.images.all().order_by('order')
        
        serializer = ProjectImageSerializer(images, many=True, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data,
            'count': images.count(),
            'message': f'Зображення проєкту "{project.title}" отримано'
        })


# ============================================================================
# JOB VIEWSETS
# ============================================================================

class JobPositionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для вакансій"""
    
    queryset = JobPosition.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employment_type', 'experience_required', 'is_urgent', 'location']
    search_fields = ['title', 'description', 'requirements']
    ordering_fields = ['created_at', 'expires_at', 'title']
    ordering = ['-is_urgent', '-created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobPositionDetailSerializer
        return JobPositionListSerializer
    
    def get_queryset(self):
        """Фільтрує активні вакансії, що не прострочили"""
        return JobPosition.objects.filter(
            is_active=True,
            expires_at__gte=timezone.now()
        )


class JobApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet для заявок на вакансії"""
    
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [AllowAny]
    http_method_names = ['post', 'get']
    ordering = ['-created_at', 'id']
    
    def get_permissions(self):
        """Дозволи залежно від дії"""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Queryset з явним упорядкуванням"""
        return JobApplication.objects.all().order_by('-created_at', 'id')
    
    def create(self, request, *args, **kwargs):
        """Створення нової заявки"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save()
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Заявку подано успішно. Ми зв\'яжемося з вами найближчим часом.'
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Помилка при подачі заявки',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class WorkplacePhotoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для фотографій робочого місця"""
    
    queryset = WorkplacePhoto.objects.filter(is_active=True)
    serializer_class = WorkplacePhotoSerializer
    permission_classes = [AllowAny]
    ordering = ['order', 'id']


# ============================================================================
# PARTNER VIEWSETS
# ============================================================================

class PartnershipInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для інформації про партнерство"""
    
    queryset = PartnershipInfo.objects.filter(is_active=True)
    serializer_class = PartnershipInfoSerializer
    permission_classes = [AllowAny]
    ordering = ['-updated_at', 'id']
    
    def get_queryset(self):
        """Оптимізований queryset з упорядкуванням"""
        return PartnershipInfo.objects.filter(is_active=True).prefetch_related(
            'workstage_set'
        ).order_by('-updated_at', 'id')


class WorkStageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для етапів роботи"""
    
    queryset = WorkStage.objects.all()
    serializer_class = WorkStageSerializer
    permission_classes = [AllowAny]
    ordering = ['order', 'id']


class PartnerInquiryViewSet(viewsets.ModelViewSet):
    """ViewSet для запитів партнерів"""
    
    queryset = PartnerInquiry.objects.all()
    serializer_class = PartnerInquirySerializer
    permission_classes = [AllowAny]
    http_method_names = ['post', 'get']
    ordering = ['-created_at', 'id']
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Queryset з явним упорядкуванням"""
        return PartnerInquiry.objects.all().order_by('-created_at', 'id')
    
    def create(self, request, *args, **kwargs):
        """Створення нового запиту партнера"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            inquiry = serializer.save()
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Запит надіслано успішно. Ми розглянемо його та зв\'яжемося з вами.'
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Помилка при надсиланні запиту',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# CONTACT VIEWSETS
# ============================================================================

class OfficeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для офісів"""
    
    queryset = Office.objects.filter(is_active=True)
    serializer_class = OfficeSerializer
    permission_classes = [AllowAny]
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['office_type', 'is_main']  # Виправлено: прибрано 'city'
    ordering = ['order', 'name']  # Виправлено: прибрано 'city'


class ContactInquiryViewSet(viewsets.ModelViewSet):
    """ViewSet для звернень клієнтів"""
    
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer
    permission_classes = [AllowAny]
    http_method_names = ['post', 'get']
    ordering = ['-created_at', 'id']
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Queryset з явним упорядкуванням"""
        return ContactInquiry.objects.all().order_by('-created_at', 'id')
    
    def create(self, request, *args, **kwargs):
        """Створення нового звернення"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            inquiry = serializer.save()
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Ваше звернення отримано. Ми зв\'яжемося з вами найближчим часом.'
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Помилка при надсиланні звернення',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# ЦЕНТРАЛІЗОВАНИЙ VIEWSET ДЛЯ СТАТИСТИКИ ТА FEATURED CONTENT
# ============================================================================

class UnifiedContentViewSet(viewsets.ViewSet):
    """Централізований ViewSet для статистики та featured контенту"""
    
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Загальна статистика сайту"""
        try:
            cache_key = 'unified_site_stats'
            stats = cache.get(cache_key)
            
            if not stats:
                stats = {
                    'general': {
                        'total_services': Service.objects.filter(is_active=True).count(),
                        'featured_services': Service.objects.filter(is_active=True, is_featured=True).count(),
                        'total_projects': Project.objects.filter(is_active=True).count(),
                        'featured_projects': Project.objects.filter(is_active=True, is_featured=True).count(),
                        'active_jobs': JobPosition.objects.filter(
                            is_active=True, 
                            expires_at__gte=timezone.now()
                        ).count(),
                        'offices': Office.objects.filter(is_active=True).count(),
                        'team_members': TeamMember.objects.filter(is_active=True).count(),
                        'project_categories': ProjectCategory.objects.filter(is_active=True).count(),
                    },
                    'homepage_specific': {
                        'satisfied_clients': 95,
                        'years_experience': 10,
                        'certificates_count': Certificate.objects.filter(is_active=True).count(),
                    }
                }
                cache.set(cache_key, stats, 3600)  # 1 година
            
            return Response({
                'success': True,
                'data': stats,
                'message': 'Статистика отримана успішно'
            })
            
        except Exception as e:
            logger.error(f"Error in unified stats: {str(e)}")
            return Response({
                'success': False,
                'message': 'Помилка при отриманні статистики',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Весь featured контент в одному endpoint"""
        try:
            cache_key = 'unified_featured_content'
            data = cache.get(cache_key)
            
            if not data:
                data = {
                    'services': ServiceListSerializer(
                        Service.objects.filter(is_active=True, is_featured=True)[:6],
                        many=True,
                        context={'request': request}
                    ).data,
                    'projects': ProjectListSerializer(
                        Project.objects.filter(is_active=True, is_featured=True)[:6],
                        many=True,
                        context={'request': request}
                    ).data,
                    'team_members': TeamMemberSerializer(
                        TeamMember.objects.filter(is_active=True, is_management=True)[:4],
                        many=True,
                        context={'request': request}
                    ).data
                }
                cache.set(cache_key, data, 1800)  # 30 хвилин
            
            return Response({
                'success': True,
                'data': data,
                'message': 'Рекомендований контент отримано'
            })
            
        except Exception as e:
            logger.error(f"Error in unified featured content: {str(e)}")
            return Response({
                'success': False,
                'message': 'Помилка при отриманні рекомендованого контенту',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)