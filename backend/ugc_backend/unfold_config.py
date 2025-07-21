# backend/ugc_backend/unfold_config.py
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _

def get_unfold_navigation():
    """
    Повертає навігацію для UNFOLD admin.
    Винесено в окрему функцію щоб уникнути проблем з reverse_lazy при імпорті settings.
    """
    return [
        {
            "title": _("Навігація"),
            "separator": True,
            "items": [
                {
                    "title": _("Головна"),
                    "icon": "dashboard",
                    "link": reverse_lazy("admin:index"),
                },
            ],
        },
        {
            "title": _("Контент"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Головна сторінка"),
                    "icon": "home",
                    "link": reverse_lazy("admin:content_homepage_changelist"),
                },
                {
                    "title": _("Сторінки"),
                    "icon": "article",
                    "link": reverse_lazy("admin:content_page_changelist"),
                },
            ],
        },
        {
            "title": _("Послуги"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Всі послуги"),
                    "icon": "engineering",
                    "link": reverse_lazy("admin:services_service_changelist"),
                },
                {
                    "title": _("Активні"),
                    "icon": "verified",
                    "link": "/admin/services/service/?is_active__exact=1",
                },
                {
                    "title": _("Рекомендовані"),
                    "icon": "recommend",
                    "link": "/admin/services/service/?is_recommended__exact=1",
                },
            ],
        },
        {
            "title": _("Проекти"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Всі проекти"), 
                    "icon": "work",
                    "link": reverse_lazy("admin:projects_project_changelist"),
                },
                {
                    "title": _("Активні"),
                    "icon": "verified",
                    "link": "/admin/projects/project/?is_active__exact=1",
                },
                {
                    "title": _("Рекомендовані"),
                    "icon": "recommend",
                    "link": "/admin/projects/project/?is_recommended__exact=1",
                },
            ],
        },
        {
            "title": _("Партнери"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Всі партнери"),
                    "icon": "handshake",
                    "link": reverse_lazy("admin:partners_partner_changelist"),
                },
                {
                    "title": _("Активні"),
                    "icon": "verified",
                    "link": "/admin/partners/partner/?is_active__exact=1",
                },
            ],
        },
        {
            "title": _("Контакти"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Всі офіси"),
                    "icon": "location_on",
                    "link": reverse_lazy("admin:contacts_contact_changelist"),
                },
                {
                    "title": _("Активні"),
                    "icon": "verified",
                    "link": "/admin/contacts/contact/?is_active__exact=1",
                },
                {
                    "title": _("Головні офіси"),
                    "icon": "business",
                    "link": "/admin/contacts/contact/?is_main__exact=1",
                },
                {
                    "title": _("Повідомлення"),
                    "icon": "email",
                    "link": reverse_lazy("admin:contacts_contactmessage_changelist"),
                },
                {
                    "title": _("Необроблені"),
                    "icon": "mark_email_unread",
                    "link": "/admin/contacts/contactmessage/?is_processed__exact=0",
                },
            ],
        },
        {
            "title": _("Вакансії"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Всі вакансії"),
                    "icon": "work_history",
                    "link": reverse_lazy("admin:jobs_job_changelist"),
                },
                {
                    "title": _("Активні"),
                    "icon": "verified",
                    "link": "/admin/jobs/job/?is_active__exact=1",
                },
                {
                    "title": _("Термінові"),
                    "icon": "priority_high",
                    "link": "/admin/jobs/job/?is_urgent__exact=1",
                },
                {
                    "title": _("Заявки"),
                    "icon": "assignment",
                    "link": reverse_lazy("admin:jobs_jobapplication_changelist"),
                },
                {
                    "title": _("Нові заявки"),
                    "icon": "fiber_new",
                    "link": "/admin/jobs/jobapplication/?status__exact=new",
                },
            ],
        },
        {
            "title": _("Система"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Користувачі"),
                    "icon": "people",
                    "link": reverse_lazy("admin:auth_user_changelist"),
                },
                {
                    "title": _("Групи"),
                    "icon": "group",
                    "link": reverse_lazy("admin:auth_group_changelist"),
                },
                {
                    "title": _("Переклади"),
                    "icon": "translate",
                    "link": "/rosetta/",
                },
            ],
        },
    ]

def get_unfold_tabs():
    """
    Повертає конфігурацію табів для UNFOLD admin.
    """
    return [
        {
            "models": [
                "apps.content.models.HomePage",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "fields": ["title", "subtitle", "description"],
                },
                {
                    "title": _("SEO"),
                    "icon": "search",
                    "fields": ["meta_title", "meta_description", "meta_keywords"],
                },
            ],
        },
        {
            "models": [
                "apps.services.models.Service",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "fields": ["title", "description", "price"],
                },
                {
                    "title": _("Налаштування"),
                    "icon": "settings",
                    "fields": ["is_active", "is_recommended", "order"],
                },
            ],
        },
        {
            "models": [
                "apps.projects.models.Project",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "fields": ["title", "description", "client"],
                },
                {
                    "title": _("Медіа"),
                    "icon": "image",
                    "fields": ["image", "gallery"],
                },
                {
                    "title": _("Налаштування"),
                    "icon": "settings",
                    "fields": ["is_active", "is_recommended", "order"],
                },
            ],
        },
    ]