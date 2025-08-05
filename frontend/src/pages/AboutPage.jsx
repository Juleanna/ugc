import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionIntro } from '@/components/SectionIntro'
import { useTranslations } from '@/context/TranslationContext'
import { apiService } from '@/services/apiService'

function TeamMember({ member }) {
  return (
    <FadeIn>
      <div className="text-center">
        <div className="mb-4 mx-auto h-24 w-24 rounded-full bg-neutral-200 flex items-center justify-center">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-neutral-600">
              {member.name?.[0] || '?'}
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-medium text-neutral-950">
          {member.name}
        </h3>
        <p className="text-sm text-neutral-600">{member.position}</p>
        {member.bio && (
          <p className="mt-2 text-sm text-neutral-500">{member.bio}</p>
        )}
      </div>
    </FadeIn>
  )
}

export default function AboutPage() {
  const { t } = useTranslations()
  const [aboutData, setAboutData] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [about, team] = await Promise.all([
          apiService.getAboutPage(),
          apiService.getTeamMembers()
        ])
        
        setAboutData(about)
        setTeamMembers(team)
      } catch (error) {
        console.error('Failed to load about data:', error)
        // Fallback data
        setAboutData({
          title: t('about.title', 'Про нашу компанію'),
          description: t('about.description', 'Ми - провідний виробник спецодягу в Україні з багаторічним досвідом та відданістю якості.')
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [t])

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
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
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
        eyebrow={t('about.eyebrow', 'Про нас')}
        title={aboutData?.title || t('about.title', 'Наша історія та цінності')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {aboutData?.description || t('about.description', 'Ми - провідний виробник спецодягу в Україні з багаторічним досвідом та відданістю якості.')}
        </p>
      </SectionIntro>

      {teamMembers.length > 0 && (
        <Container className="mt-24">
          <SectionIntro
            title={t('team.title', 'Наша команда')}
          >
            <p>
              {t('team.description', 'Наша команда професіоналів забезпечує високу якість продукції та сервісу.')}
            </p>
          </SectionIntro>
          
          <FadeInStagger className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <TeamMember key={member.id} member={member} />
            ))}
          </FadeInStagger>
        </Container>
      )}

      <Container className="mt-24">
        <SectionIntro
          title={t('values.title', 'Наші цінності')}
        >
          <p>
            {t('values.description', 'Ми керуємося принципами якості, надійності та професіоналізму в усіх аспектах нашої роботи.')}
          </p>
        </SectionIntro>
        
        <FadeInStagger className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <FadeIn>
            <div className="rounded-3xl p-8 ring-1 ring-neutral-950/5">
              <h3 className="font-display text-xl font-medium text-neutral-950">
                {t('values.quality.title', 'Якість')}
              </h3>
              <p className="mt-4 text-neutral-600">
                {t('values.quality.description', 'Ми використовуємо тільки найкращі матеріали та дотримуємося найвищих стандартів виробництва.')}
              </p>
            </div>
          </FadeIn>
          
          <FadeIn>
            <div className="rounded-3xl p-8 ring-1 ring-neutral-950/5">
              <h3 className="font-display text-xl font-medium text-neutral-950">
                {t('values.reliability.title', 'Надійність')}
              </h3>
              <p className="mt-4 text-neutral-600">
                {t('values.reliability.description', 'Наші клієнти можуть розраховувати на нас у будь-який час та за будь-яких обставин.')}
              </p>
            </div>
          </FadeIn>
          
          <FadeIn>
            <div className="rounded-3xl p-8 ring-1 ring-neutral-950/5">
              <h3 className="font-display text-xl font-medium text-neutral-950">
                {t('values.innovation.title', 'Інновації')}
              </h3>
              <p className="mt-4 text-neutral-600">
                {t('values.innovation.description', 'Ми постійно вдосконалюємо наші процеси та впроваджуємо нові технології.')}
              </p>
            </div>
          </FadeIn>
        </FadeInStagger>
      </Container>
    </motion.div>
  )
}