# backend/apps/api/views.py - ПОВНІСТЮ ВИПРАВЛЕНА ВЕРСІЯ
from rest_framework import viewsets, status, filters, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.throttling import AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import logging
from .cache_utils import SafeCache, SafeBaseViewSetWithCache
from django.conf import settings


from .serializers import *

logger = logging.getLogger(__name__)

# Rate throttle для перекладів
class TranslationsRateThrottle(AnonRateThrottle):
    """Спеціальний throttle для API перекладів"""
    scope = 'translations'
    rate = '30/min'  # 30 запитів за хвилину


class BaseViewSetWithCache(SafeBaseViewSetWithCache, viewsets.ReadOnlyModelViewSet):
    """Базовий ViewSet з кешуванням даних"""
    cache_timeout = 60 * 15  # 15 хвилин за замовчуванням
    cache_key_prefix = 'api'
    
    def get_cache_key(self, action='list', **kwargs):
        """Генерує ключ кешу"""
        model_name = self.queryset.model.__name__.lower()
        key_parts = [self.cache_key_prefix, model_name, action]
        
        # Додаємо параметри до ключа
        if kwargs:
            key_parts.extend([f"{k}_{v}" for k, v in sorted(kwargs.items())])
            
        return "_".join(key_parts)
    
    def get_cached_response(self, cache_key, fallback_func, *args, **kwargs):
        """Отримує дані з кешу або виконує fallback функцію"""
        try:
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                logger.info(f"Cache HIT для {cache_key}")
                return Response(cached_data)
            
            # Виконуємо оригінальну функцію
            response = fallback_func(*args, **kwargs)
            
            # Кешуємо тільки успішні відповіді
            if response.status_code == 200:
                cache.set(cache_key, response.data, self.cache_timeout)
                logger.info(f"Cache SET для {cache_key}")
            
            return response
            
        except Exception as e:
            logger.error(f"Помилка кешування для {cache_key}: {str(e)}")
            # Якщо кеш не працює, повертаємо дані без кешування
            return fallback_func(*args, **kwargs)


class HomePageViewSet(BaseViewSetWithCache):
    """API для головної сторінки"""
    queryset = HomePage.objects.filter(is_active=True).order_by('-id')
    serializer_class = HomePageSerializer
    cache_timeout = 60 * 15  # 15 хвилин
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(
            cache_key, 
            super().list, 
            request, *args, **kwargs
        )
    
    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        cache_key = self.get_cache_key('detail', pk=pk)
        return self.get_cached_response(
            cache_key,
            super().retrieve,
            request, *args, **kwargs
        )


class AboutPageViewSet(BaseViewSetWithCache):
    """API для сторінки Про нас"""
    queryset = AboutPage.objects.filter(is_active=True).order_by('-id')
    serializer_class = AboutPageSerializer
    cache_timeout = 60 * 30  # 30 хвилин
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(
            cache_key,
            super().list,
            request, *args, **kwargs
        )
    
    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        cache_key = self.get_cache_key('detail', pk=pk)
        return self.get_cached_response(
            cache_key,
            super().retrieve,
            request, *args, **kwargs
        )


class ServiceViewSet(BaseViewSetWithCache):
    """API для послуг"""
    queryset = Service.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = ServiceListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_featured']
    search_fields = ['name', 'short_description']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    cache_timeout = 60 * 20  # 20 хвилин
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ServiceDetailSerializer
        return ServiceListSerializer
    
    def list(self, request, *args, **kwargs):
        # Враховуємо фільтри та пошук в ключі кешу
        query_params = dict(request.query_params.items())
        cache_key = self.get_cache_key('list', **query_params)
        
        return self.get_cached_response(
            cache_key,
            super().list,
            request, *args, **kwargs
        )
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Отримати рекомендовані послуги"""
        cache_key = self.get_cache_key('featured')
        
        def get_featured_services():
            featured_services = self.queryset.filter(is_featured=True)[:6]
            serializer = ServiceListSerializer(
                featured_services, 
                many=True, 
                context={'request': request}
            )
            return Response(serializer.data)
        
        return self.get_cached_response(cache_key, get_featured_services)


class ProjectCategoryViewSet(BaseViewSetWithCache):
    """API для категорій проектів"""
    queryset = ProjectCategory.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = ProjectCategorySerializer
    cache_timeout = 60 * 60  # 1 година
    ordering = ['order', 'name']
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(
            cache_key,
            super().list,
            request, *args, **kwargs
        )


class ProjectViewSet(BaseViewSetWithCache):
    """API для проектів"""
    queryset = Project.objects.filter(is_active=True).order_by('-created_at', 'title')
    serializer_class = ProjectListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['title', 'short_description']
    ordering_fields = ['title', 'created_at', 'project_date']
    ordering = ['-created_at', 'title']
    cache_timeout = 60 * 25  # 25 хвилин
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer
    
    def list(self, request, *args, **kwargs):
        # Враховуємо фільтри в ключі кешу
        query_params = dict(request.query_params.items())
        cache_key = self.get_cache_key('list', **query_params)
        
        return self.get_cached_response(
            cache_key,
            super().list,
            request, *args, **kwargs
        )
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Отримати рекомендовані проекти"""
        cache_key = self.get_cache_key('featured')
        
        def get_featured_projects():
            featured_projects = self.queryset.filter(is_featured=True)[:6]
            serializer = ProjectListSerializer(
                featured_projects,
                many=True,
                context={'request': request}
            )
            return Response(serializer.data)
        
        return self.get_cached_response(cache_key, get_featured_projects)


class JobPositionViewSet(BaseViewSetWithCache):
    """API для вакансій"""
    queryset = JobPosition.objects.filter(is_active=True).order_by('-is_urgent', '-created_at')
    serializer_class = JobPositionListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # ВИПРАВЛЕНО: використовуємо тільки існуючі поля з моделі JobPosition
    filterset_fields = ['is_urgent', 'employment_type', 'salary_currency', 'location']
    
    # ВИПРАВЛЕНО: використовуємо правильні поля для пошуку
    search_fields = ['title', 'description', 'location', 'experience_required']
    
    ordering_fields = ['title', 'created_at', 'is_urgent', 'salary_from']
    ordering = ['-is_urgent', '-created_at']
    cache_timeout = 60 * 10  # 10 хвилин (вакансії змінюються частіше)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobPositionDetailSerializer
        return JobPositionListSerializer
    
    def list(self, request, *args, **kwargs):
        query_params = dict(request.query_params.items())
        cache_key = self.get_cache_key('list', **query_params)
        
        return self.get_cached_response(
            cache_key,
            super().list,
            request, *args, **kwargs
        )
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Отримати терміново потрібні вакансії"""
        cache_key = self.get_cache_key('urgent')
        
        def get_urgent_jobs():
            urgent_jobs = self.queryset.filter(is_urgent=True)[:5]
            serializer = JobPositionListSerializer(
                urgent_jobs,
                many=True,
                context={'request': request}
            )
            return Response(serializer.data)
        
        return self.get_cached_response(cache_key, get_urgent_jobs)


class JobApplicationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """API для заявок на роботу"""
    queryset = JobApplication.objects.all().order_by('-created_at')
    serializer_class = JobApplicationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Очищаємо пов'язані кеші
        self.clear_related_cache()

        return Response(
            {'message': 'Заявку успішно відправлено'},
            status=status.HTTP_201_CREATED
        )
    
    def clear_related_cache(self):
        """Очищає пов'язані кеші при створенні заявки"""
        try:
            # Очищаємо статистику вакансій
            cache.delete_many([
                'api_jobposition_list',
                'api_jobposition_urgent'
            ])
        except Exception as e:
            logger.warning(f"Не вдалося очистити кеш: {str(e)}")


class OfficeViewSet(BaseViewSetWithCache):
    """API для офісів"""
    queryset = Office.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = OfficeSerializer
    cache_timeout = 60 * 60  # 1 година
    ordering = ['order', 'name']
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(
            cache_key,
            super().list,
            request, *args, **kwargs
        )


class ContactInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """API для звернень"""
    queryset = ContactInquiry.objects.all().order_by('-created_at')
    serializer_class = ContactInquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Відправка повідомлення (якщо налаштовано)
        # send_contact_inquiry_notification.delay(serializer.instance.id)

        return Response(
            {'message': 'Звернення успішно відправлено'},
            status=status.HTTP_201_CREATED
        )


class PartnershipInfoViewSet(BaseViewSetWithCache):
    """API для інформації про партнерство"""
    queryset = PartnershipInfo.objects.filter(is_active=True).order_by('-id')
    serializer_class = PartnershipInfoSerializer
    cache_timeout = 60 * 60  # 1 година
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(
            cache_key,
            super().list,
            request, *args, **kwargs
        )


class PartnerInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """API для запитів партнерів"""
    queryset = PartnerInquiry.objects.all().order_by('-created_at')
    serializer_class = PartnerInquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Відправка повідомлення (якщо налаштовано)
        # send_partner_inquiry_notification.delay(serializer.instance.id)

        return Response(
            {'message': 'Запит успішно відправлений'}, 
            status=status.HTTP_201_CREATED
        )


class WorkplacePhotoViewSet(BaseViewSetWithCache):
    """API для фото робочих місць"""
    queryset = WorkplacePhoto.objects.filter(is_active=True).order_by('order')
    serializer_class = WorkplacePhotoSerializer
    cache_timeout = 60 * 30  # 30 хвилин
    ordering = ['order']
    
    def list(self, request, *args, **kwargs):
        cache_key = self.get_cache_key('list')
        return self.get_cached_response(
            cache_key,
            super().list,
            request, *args, **kwargs
        )


# Утилітарні функції для управління кешем
class CacheManager:
    """Клас для управління кешем API"""
    
    @staticmethod
    def clear_model_cache(model_name):
        """Очищає весь кеш для конкретної моделі"""
        try:
            cache_pattern = f"api_{model_name.lower()}_*"
            
            # Для Redis
            try:
                from django_redis import get_redis_connection
                con = get_redis_connection("default")
                keys = con.keys(cache_pattern)
                if keys:
                    con.delete(*keys)
                    logger.info(f"Очищено {len(keys)} ключів кешу для {model_name}")
            except ImportError:
                # Fallback для локального кешу
                cache.clear()
                logger.info(f"Очищено весь локальний кеш для {model_name}")
                
        except Exception as e:
            logger.error(f"Помилка очищення кешу для {model_name}: {str(e)}")
    
    @staticmethod
    def clear_all_api_cache():
        """Очищає весь кеш API"""
        try:
            cache_pattern = "api_*"
            
            try:
                from django_redis import get_redis_connection
                con = get_redis_connection("default")
                keys = con.keys(cache_pattern)
                if keys:
                    con.delete(*keys)
                    logger.info(f"Очищено {len(keys)} ключів API кешу")
            except ImportError:
                cache.clear()
                logger.info("Очищено весь локальний кеш")
                
        except Exception as e:
            logger.error(f"Помилка очищення всього кешу: {str(e)}")
    
    @staticmethod
    def warm_up_cache():
        """Розігріває кеш популярними запитами"""
        try:
            from django.test import RequestFactory
            factory = RequestFactory()
            
            # Список ViewSet'ів для розігріву
            viewsets_to_warm = [
                (HomePageViewSet, 'homepage'),
                (AboutPageViewSet, 'about'),
                (ServiceViewSet, 'services'),
                (OfficeViewSet, 'offices'),
            ]
            
            for viewset_class, name in viewsets_to_warm:
                try:
                    request = factory.get(f'/api/v1/{name}/')
                    viewset = viewset_class()
                    viewset.request = request
                    viewset.list(request)
                    logger.info(f"Розігрітий кеш для {name}")
                except Exception as e:
                    logger.warning(f"Не вдалося розігріти кеш для {name}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Помилка розігріву кешу: {str(e)}")


# Додаткові API endpoints для управління кешем (для розробки)
@action(detail=False, methods=['post'])
def clear_cache(self, request):
    """Ендпоінт для очищення кешу (тільки для розробки)"""
    if settings.DEBUG:
        CacheManager.clear_all_api_cache()
        return Response({'message': 'Кеш очищено'})
    return Response({'error': 'Не дозволено'}, status=status.HTTP_403_FORBIDDEN)


@action(detail=False, methods=['post'])
def warm_cache(self, request):
    """Ендпоінт для розігріву кешу (тільки для розробки)"""
    if settings.DEBUG:
        CacheManager.warm_up_cache()
        return Response({'message': 'Кеш розігрітий'})
    return Response({'error': 'Не дозволено'}, status=status.HTTP_403_FORBIDDEN)