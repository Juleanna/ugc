from django.http import JsonResponse
from django.views import View
from django.conf import settings
from django.contrib.auth.decorators import user_passes_test
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import permission_classes
from .utils import TranslationManager
import json
import hashlib
import hmac
import logging

logger = logging.getLogger(__name__)

def is_admin_user(user):
    """Check if user is admin"""
    return user.is_authenticated and user.is_staff

@method_decorator(user_passes_test(is_admin_user), name='dispatch')
@method_decorator(require_http_methods(["POST"]), name='dispatch')
class TranslationWebhookView(View):
    """Secure webhook для оновлення перекладів після змін в Rosetta"""
    
    def _verify_webhook_signature(self, request):
        """Verify webhook signature for security"""
        signature = request.headers.get('X-Webhook-Signature')
        if not signature:
            return False
            
        secret = getattr(settings, 'TRANSLATION_WEBHOOK_SECRET', None)
        if not secret:
            logger.warning("Webhook secret not configured")
            return False
            
        body = request.body
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(f"sha256={expected_signature}", signature)
    
    def _validate_request_ip(self, request):
        """Validate request IP against allowed IPs"""
        client_ip = self._get_client_ip(request)
        allowed_ips = getattr(settings, 'TRANSLATION_WEBHOOKS', {}).get('ALLOWED_IPS', [])
        
        if allowed_ips and client_ip not in allowed_ips:
            logger.warning(f"Webhook request from unauthorized IP: {client_ip}")
            return False
        return True
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def post(self, request):
        try:
            # Security validations
            if not self._validate_request_ip(request):
                return JsonResponse({
                    'status': 'error', 
                    'message': 'Unauthorized IP address'
                }, status=403)
            
            if hasattr(settings, 'TRANSLATION_WEBHOOK_SECRET'):
                if not self._verify_webhook_signature(request):
                    return JsonResponse({
                        'status': 'error', 
                        'message': 'Invalid webhook signature'
                    }, status=403)
            
            # Log webhook activity
            logger.info(f"Translation webhook triggered by user {request.user} from IP {self._get_client_ip(request)}")
            
            # Очищаємо кеш
            TranslationManager.invalidate_translations_cache()
            
            # Експортуємо нові переклади з безпечним шляхом
            frontend_dir = getattr(settings, 'FRONTEND_TRANSLATIONS_DIR', None)
            if not frontend_dir:
                return JsonResponse({
                    'status': 'error', 
                    'message': 'Frontend translations directory not configured'
                }, status=500)
                
            TranslationManager.export_to_frontend(str(frontend_dir))
            
            logger.info("Translation webhook completed successfully")
            return JsonResponse({
                'status': 'success', 
                'message': 'Переклади оновлено',
                'timestamp': str(request.user)
            })
            
        except Exception as e:
            logger.error(f"Translation webhook error: {str(e)}")
            return JsonResponse({
                'status': 'error', 
                'message': 'Internal server error'
            }, status=500)