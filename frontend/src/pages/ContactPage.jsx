import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionIntro } from '@/components/SectionIntro'
import { Button } from '@/components/Button'
import { useTranslations } from '@/context/TranslationContext'
import { apiService } from '@/services/apiService'

function OfficeCard({ office }) {
  return (
    <FadeIn>
      <div className="rounded-3xl p-8 ring-1 ring-neutral-950/5">
        <h3 className="font-display text-xl font-medium text-neutral-950">
          {office.name}
        </h3>
        
        {office.address && (
          <p className="mt-4 text-neutral-600">
            <span className="font-medium">Адреса:</span><br />
            {office.address}
          </p>
        )}
        
        {office.phone && (
          <p className="mt-4 text-neutral-600">
            <span className="font-medium">Телефон:</span><br />
            <a href={`tel:${office.phone}`} className="hover:text-neutral-950 transition">
              {office.phone}
            </a>
          </p>
        )}
        
        {office.email && (
          <p className="mt-4 text-neutral-600">
            <span className="font-medium">Email:</span><br />
            <a href={`mailto:${office.email}`} className="hover:text-neutral-950 transition">
              {office.email}
            </a>
          </p>
        )}
        
        {office.working_hours && (
          <p className="mt-4 text-neutral-600">
            <span className="font-medium">Години роботи:</span><br />
            {office.working_hours}
          </p>
        )}
      </div>
    </FadeIn>
  )
}

function ContactForm() {
  const { t } = useTranslations()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      await apiService.submitContactInquiry(formData)
      
      alert(t('contact.success', 'Ваше повідомлення успішно надіслано! Ми зв\'яжемося з вами найближчим часом.'))
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      alert(t('contact.error', 'Помилка при надсиланні повідомлення. Спробуйте ще раз або зв\'яжіться з нами по телефону.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('contact.form.name', 'Ім\'я')} *
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('contact.form.email', 'Електронна пошта')} *
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('contact.form.phone', 'Телефон')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('contact.form.subject', 'Тема')}
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t('contact.form.message', 'Повідомлення')} *
          </label>
          <textarea
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition"
            placeholder={t('contact.form.messagePlaceholder', 'Розкажіть про ваш проєкт або запитання...')}
          />
        </div>
        
        <div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? t('common.sending', 'Надсилаємо...') : t('contact.form.send', 'Надіслати повідомлення')}
          </Button>
        </div>
      </form>
    </FadeIn>
  )
}

export default function ContactPage() {
  const { t } = useTranslations()
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const officesData = await apiService.getOffices()
        setOffices(officesData)
      } catch (error) {
        console.error('Failed to load offices:', error)
        // Fallback data
        setOffices([
          {
            id: 1,
            name: 'Головний офіс',
            address: 'вул. Промислова, 15, Київ, 03150',
            phone: '+38 (044) 123-45-67',
            email: 'info@ugc.ua',
            working_hours: 'Пн-Пт: 9:00-18:00'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-24"
      >
        <Container>
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded-3xl"></div>
                <div className="h-32 bg-gray-200 rounded-3xl"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-3xl"></div>
            </div>
          </div>
        </Container>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SectionIntro
        eyebrow={t('contact.eyebrow', 'Контакти')}
        title={t('contact.title', 'Зв\'яжіться з нами')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('contact.description', 'Ми готові відповісти на всі ваші запитання та обговорити можливості співпраці.')}
        </p>
      </SectionIntro>

      <Container className="mt-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-medium text-neutral-950 mb-8">
              {t('contact.offices', 'Наші офіси')}
            </h2>
            
            <FadeInStagger className="space-y-8">
              {offices.map((office) => (
                <OfficeCard key={office.id} office={office} />
              ))}
            </FadeInStagger>
          </div>
          
          <div>
            <h2 className="font-display text-2xl font-medium text-neutral-950 mb-8">
              {t('contact.form.title', 'Надішліть нам повідомлення')}
            </h2>
            
            <ContactForm />
          </div>
        </div>
      </Container>

      <Container className="mt-24">
        <FadeIn>
          <div className="rounded-3xl bg-neutral-950 px-8 py-16 text-center">
            <h2 className="font-display text-3xl font-medium text-white">
              {t('contact.cta.title', 'Ready to get started?')}
            </h2>
            <p className="mt-4 text-lg text-neutral-300">
              {t('contact.cta.description', 'Contact us today to discuss your project and receive a personalized quote.')}
            </p>
            <div className="mt-8">
              <Button href="tel:+380441234567" invert>
                {t('contact.cta.call', 'Подзвонити зараз')}
              </Button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </motion.div>
  )
}