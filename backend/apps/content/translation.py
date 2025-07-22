from modeltranslation.translator import translator, TranslationOptions
from .models import HomePage, AboutPage, TeamMember, Certificate, ProductionPhoto

class HomePageTranslationOptions(TranslationOptions):
    fields = ( 'main_title','sphere_title', 'subtitle',
              'primary_button_text', 'secondary_button_text',)

class AboutPageTranslationOptions(TranslationOptions):
    fields = ('history_text', 'mission_text', 'values_text', 'social_responsibility')

class TeamMemberTranslationOptions(TranslationOptions):
    fields = ('name', 'position', 'bio')

class CertificateTranslationOptions(TranslationOptions):
    fields = ('title', 'description')

class ProductionPhotoTranslationOptions(TranslationOptions):
    fields = ('title', 'description')

translator.register(HomePage, HomePageTranslationOptions)
translator.register(AboutPage, AboutPageTranslationOptions)
translator.register(TeamMember, TeamMemberTranslationOptions)
translator.register(Certificate, CertificateTranslationOptions)
translator.register(ProductionPhoto, ProductionPhotoTranslationOptions)