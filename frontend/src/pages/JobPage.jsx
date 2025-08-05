import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionIntro } from '@/components/SectionIntro'
import { Button } from '@/components/Button'
import { useTranslations } from '@/context/TranslationContext'
import { apiService } from '@/services/apiService'

function JobCard({ job }) {
  const { t } = useTranslations()
  
  return (
    <FadeIn>
      <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
        <h3 className="font-display text-xl font-semibold text-neutral-950">
          {job.title}
        </h3>
        
        {job.department && (
          <p className="mt-2 text-sm font-medium text-neutral-500 uppercase tracking-wider">
            {job.department}
          </p>
        )}
        
        {job.location && (
          <p className="mt-2 text-sm text-neutral-600">
            📍 {job.location}
          </p>
        )}
        
        {job.employment_type && (
          <p className="mt-1 text-sm text-neutral-600">
            💼 {job.employment_type}
          </p>
        )}
        
        {job.description && (
          <p className="mt-4 text-neutral-600 line-clamp-3">
            {job.description}
          </p>
        )}
        
        {job.requirements && (
          <div className="mt-4">
            <h4 className="font-medium text-neutral-950">
              {t('job.requirements', 'Вимоги:')}
            </h4>
            <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
              {job.requirements}
            </p>
          </div>
        )}
        
        {job.salary_range && (
          <p className="mt-4 font-medium text-neutral-950">
            💰 {job.salary_range}
          </p>
        )}
        
        <div className="mt-6 flex items-center justify-between">
          {job.posted_date && (
            <p className="text-sm text-neutral-500">
              {t('job.posted', 'Опубліковано')}: {new Date(job.posted_date).toLocaleDateString('uk-UA')}
            </p>
          )}
          
          <Button
            onClick={() => handleApply(job)}
            className="ml-auto"
          >
            {t('job.apply', 'Подати заявку')}
          </Button>
        </div>
      </article>
    </FadeIn>
  )
}

function ApplicationModal({ job, isOpen, onClose }) {
  const { t } = useTranslations()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cover_letter: '',
    resume_file: null
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const applicationData = {
        ...formData,
        job_position: job.id
      }
      
      await apiService.submitJobApplication(applicationData)
      
      alert(t('job.applicationSuccess', 'Ваша заявка успішно надіслана!'))
      onClose()
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        cover_letter: '',
        resume_file: null
      })
    } catch (error) {
      console.error('Failed to submit application:', error)
      alert(t('job.applicationError', 'Помилка при надсиланні заявки. Спробуйте ще раз.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-semibold text-neutral-950">
            {t('job.applyFor', 'Подати заявку на')} {job.title}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('job.fullName', 'Повне ім\'я')} *
            </label>
            <input
              required
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('job.email', 'Електронна пошта')} *
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('job.phone', 'Телефон')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('job.coverLetter', 'Супровідний лист')}
            </label>
            <textarea
              rows={4}
              value={formData.cover_letter}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
              placeholder={t('job.coverLetterPlaceholder', 'Розкажіть про себе та чому ви підходите для цієї позиції...')}
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button type="button" onClick={onClose} className="flex-1" invert>
              {t('common.cancel', 'Скасувати')}
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? t('common.sending', 'Надсилаємо...') : t('job.submit', 'Надіслати')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function JobPage() {
  const { t } = useTranslations()
  const [jobs, setJobs] = useState([])
  const [workplacePhotos, setWorkplacePhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [jobsData, photosData] = await Promise.all([
          apiService.getJobs(),
          apiService.getWorkplacePhotos()
        ])
        
        setJobs(jobsData)
        setWorkplacePhotos(photosData)
      } catch (error) {
        console.error('Failed to load job data:', error)
        // Fallback data
        setJobs([
          {
            id: 1,
            title: 'Швач/Швачка',
            department: 'Виробництво',
            location: 'Київ',
            employment_type: 'Повна зайнятість',
            description: 'Шукаємо досвідченого швача для роботи з спецодягом.',
            requirements: 'Досвід роботи від 2 років, знання промислових швейних машин.',
            salary_range: '15 000 - 25 000 грн',
            posted_date: '2023-12-01'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleApply = (job) => {
    setSelectedJob(job)
    setModalOpen(true)
  }

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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl p-6 ring-1 ring-neutral-950/5">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
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
        eyebrow={t('job.eyebrow', 'Кар\'єра')}
        title={t('job.title', 'Приєднуйтесь до нашої команди')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('job.description', 'Ми завжди шукаємо талановитих людей, які хочуть розвиватися разом з нами.')}
        </p>
      </SectionIntro>

      {jobs.length > 0 ? (
        <Container className="mt-16">
          <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </FadeInStagger>
        </Container>
      ) : (
        <Container className="mt-16">
          <FadeIn>
            <div className="text-center py-16">
              <h3 className="font-display text-2xl font-medium text-neutral-950">
                {t('job.noOpenings', 'Наразі відкритих вакансій немає')}
              </h3>
              <p className="mt-4 text-neutral-600">
                {t('job.noOpeningsDescription', 'Але ми завжди готові розглянути резюме ініціативних кандидатів.')}
              </p>
              <div className="mt-8">
                <Button to="/contact">
                  {t('job.sendResume', 'Надіслати резюме')}
                </Button>
              </div>
            </div>
          </FadeIn>
        </Container>
      )}

      {workplacePhotos.length > 0 && (
        <Container className="mt-24">
          <SectionIntro
            title={t('job.workplace.title', 'Наше робоче середовище')}
          >
            <p>
              {t('job.workplace.description', 'Подивіться, як виглядає наш офіс та виробничі приміщення.')}
            </p>
          </SectionIntro>
          
          <FadeInStagger className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {workplacePhotos.map((photo) => (
              <FadeIn key={photo.id}>
                <img
                  src={photo.image_url}
                  alt={photo.description || photo.title}
                  className="h-64 w-full rounded-3xl object-cover"
                />
                {photo.description && (
                  <p className="mt-4 text-sm text-neutral-600 text-center">
                    {photo.description}
                  </p>
                )}
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      )}

      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedJob(null)
          }}
        />
      )}
    </motion.div>
  )
}