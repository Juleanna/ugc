from modeltranslation.translator import translator, TranslationOptions
from .models import Office, ContactInquiry

class OfficeTranslationOptions(TranslationOptions):
    fields = ('name', 'address', 'city', 'description')  # Додано city

class ContactInquiryTranslationOptions(TranslationOptions):
    fields = ('name', 'subject', 'message', 'response')

translator.register(Office, OfficeTranslationOptions)
translator.register(ContactInquiry, ContactInquiryTranslationOptions)