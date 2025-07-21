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
                    "title": _("Про нас"),
                    "icon": "article",
                    "link": reverse_lazy("admin:content_aboutpage_changelist"),
                },
                {
                    "title": _("Команда"),
                    "icon": "people",
                    "link": reverse_lazy("admin:content_teammember_changelist"),
                },
                {
                    "title": _("Сертифікати"),
                    "icon": "verified",
                    "link": reverse_lazy("admin:content_certificate_changelist"),
                },
                {
                    "title": _("Фото виробництва"),
                    "icon": "photo_camera",
                    "link": reverse_lazy("admin:content_productionphoto_changelist"),
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
                {
                    "title": _("Функції послуг"),
                    "icon": "featured_play_list",
                    "link": reverse_lazy("admin:services_servicefeature_changelist"),
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
                {
                    "title": _("Категорії"),
                    "icon": "category",
                    "link": reverse_lazy("admin:projects_projectcategory_changelist"),
                },
                {
                    "title": _("Зображення проектів"),
                    "icon": "image",
                    "link": reverse_lazy("admin:projects_projectimage_changelist"),
                },
            ],
        },
        {
            "title": _("Партнери"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Інформація про партнерство"),
                    "icon": "info",
                    "link": reverse_lazy("admin:partners_partnershipinfo_changelist"),
                },
                {
                    "title": _("Етапи роботи"),
                    "icon": "timeline",
                    "link": reverse_lazy("admin:partners_workstage_changelist"),
                },
                {
                    "title": _("Заявки партнерів"),
                    "icon": "contact_mail",
                    "link": reverse_lazy("admin:partners_partnerinquiry_changelist"),
                },
                {
                    "title": _("Нові заявки"),
                    "icon": "fiber_new",
                    "link": "/admin/partners/partnerinquiry/?is_processed__exact=0",
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
                    "icon": "work",
                    "link": reverse_lazy("admin:jobs_jobposition_changelist"),
                },
                {
                    "title": _("Активні"),
                    "icon": "verified",
                    "link": "/admin/jobs/jobposition/?is_active__exact=1",
                },
                {
                    "title": _("Термінові"),
                    "icon": "priority_high",
                    "link": "/admin/jobs/jobposition/?is_urgent__exact=1",
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
                {
                    "title": _("Фото робочих місць"),
                    "icon": "photo_camera",
                    "link": reverse_lazy("admin:jobs_workplacephoto_changelist"),
                },
            ],
        },
        {
            "title": _("Контакти"),
            "separator": True,
            "collapsible": True,
            "items": [
                {
                    "title": _("Офіси/Фабрики"),
                    "icon": "location_on",
                    "link": reverse_lazy("admin:contacts_office_changelist"),
                },
                {
                    "title": _("Активні офіси"),
                    "icon": "verified",
                    "link": "/admin/contacts/office/?is_active__exact=1",
                },
                {
                    "title": _("Головні офіси"),
                    "icon": "business",
                    "link": "/admin/contacts/office/?is_main__exact=1",
                },
                {
                    "title": _("Звернення"),
                    "icon": "email",
                    "link": reverse_lazy("admin:contacts_contactinquiry_changelist"),
                },
                {
                    "title": _("Нові звернення"),
                    "icon": "mark_email_unread",
                    "link": "/admin/contacts/contactinquiry/?is_processed__exact=0",
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
                "content.homepage",
                "content.aboutpage",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "link": "#",
                },
                {
                    "title": _("Медіа"),
                    "icon": "image",
                    "link": "#",
                },
            ],
        },
        {
            "models": [
                "content.teammember",
            ],
            "items": [
                {
                    "title": _("Особиста інформація"),
                    "icon": "person",
                    "link": "#",
                },
                {
                    "title": _("Контакти"),
                    "icon": "contact_mail",
                    "link": "#",
                },
            ],
        },
        {
            "models": [
                "services.service",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "link": "#",
                },
                {
                    "title": _("Медіа"),
                    "icon": "image",
                    "link": "#",
                },
                {
                    "title": _("Налаштування"),
                    "icon": "settings",
                    "link": "#",
                },
            ],
        },
        {
            "models": [
                "projects.project",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "link": "#",
                },
                {
                    "title": _("Медіа"),
                    "icon": "image",
                    "link": "#",
                },
                {
                    "title": _("Налаштування"),
                    "icon": "settings",
                    "link": "#",
                },
            ],
        },
        {
            "models": [
                "jobs.jobposition",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "link": "#",
                },
                {
                    "title": _("Вимоги"),
                    "icon": "checklist",
                    "link": "#",
                },
                {
                    "title": _("Зарплата"),
                    "icon": "payments",
                    "link": "#",
                },
                {
                    "title": _("Налаштування"),
                    "icon": "settings",
                    "link": "#",
                },
            ],
        },
        {
            "models": [
                "partners.partnershipinfo",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "link": "#",
                },
                {
                    "title": _("FAQ"),
                    "icon": "help",
                    "link": "#",
                },
                {
                    "title": _("Налаштування"),
                    "icon": "settings",
                    "link": "#",
                },
            ],
        },
        {
            "models": [
                "contacts.office",
            ],
            "items": [
                {
                    "title": _("Основна інформація"),
                    "icon": "info",
                    "link": "#",
                },
                {
                    "title": _("Контакти"),
                    "icon": "contact_mail",
                    "link": "#",
                },
                {
                    "title": _("Місцезнаходження"),
                    "icon": "location_on",
                    "link": "#",
                },
            ],
        },
    ]