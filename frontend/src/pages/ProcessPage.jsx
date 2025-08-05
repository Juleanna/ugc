import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionIntro } from '@/components/SectionIntro'
import { useTranslations } from '@/context/TranslationContext'
import { apiService } from '@/services/apiService'

function ProcessStep({ step, index }) {
  return (
    <FadeIn>
      <div className="relative pl-8">
        <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-sm font-bold text-white">
          {index + 1}
        </div>
        <h3 className="font-display text-xl font-medium text-neutral-950">
          {step.title || step.name}
        </h3>
        <p className="mt-4 text-neutral-600">{step.description}</p>
        {step.duration && (
          <p className="mt-2 text-sm text-neutral-500">
            {t('process.duration', 'Тривалість')}: {step.duration}
          </p>
        )}
      </div>
    </FadeIn>
  )
}

export default function ProcessPage() {
  const { t } = useTranslations()
  const [workStages, setWorkStages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const stages = await apiService.getWorkStages()
        setWorkStages(stages)
      } catch (error) {
        console.error('Failed to load work stages:', error)
        // Fallback data
        setWorkStages([
          {
            id: 1,
            title: 'Консультація та аналіз потреб',
            description: 'Ми обговорюємо ваші вимоги, аналізуємо специфіку роботи та визначаємо оптимальні рішення для вашого спецодягу.',
            duration: '1-2 дні'
          },
          {
            id: 2,
            title: 'Розробка технічних умов',
            description: 'Створюємо детальні технічні умови, включаючи вибір матеріалів, конструкцію та специфікації виробу.',
            duration: '3-5 днів'
          },
          {
            id: 3,
            title: 'Виготовлення зразка',
            description: 'Створюємо прототип для підтвердження якості та відповідності всім вашим вимогам.',
            duration: '5-7 днів'
          },
          {
            id: 4,
            title: 'Узгодження та затвердження',
            description: 'Ви перевіряєте зразок, вносимо необхідні корективи та отримуємо остаточне затвердження.',
            duration: '2-3 дні'
          },
          {
            id: 5,
            title: 'Серійне виробництво',
            description: 'Запускаємо повномасштабне виробництво з суворим контролем якості на кожному етапі.',
            duration: 'Залежить від обсягу'
          },
          {
            id: 6,
            title: 'Контроль якості та доставка',
            description: 'Проводимо фінальну перевірку якості та організовуємо доставку готової продукції.',
            duration: '1-2 дні'
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
            <div className="space-y-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-0 top-0 h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
        eyebrow={t('process.eyebrow', 'Наш процес')}
        title={t('process.title', 'Як ми працюємо')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('process.description', 'Наш відлагоджений процес виробництва гарантує високу якість продукції та дотримання всіх термінів.')}
        </p>
      </SectionIntro>

      <Container className="mt-24">
        <FadeInStagger className="space-y-12">
          {workStages.map((stage, index) => (
            <ProcessStep key={stage.id} step={stage} index={index} />
          ))}
        </FadeInStagger>
      </Container>

      <Container className="mt-24">
        <FadeIn>
          <div className="rounded-3xl bg-neutral-950 px-8 py-16 text-center">
            <h2 className="font-display text-3xl font-medium text-white">
              {t('process.cta.title', 'Готові розпочати проєкт?')}
            </h2>
            <p className="mt-4 text-lg text-neutral-300">
              {t('process.cta.description', 'Зв\'яжіться з нами, щоб обговорити ваші потреби та отримати персональну пропозицію.')}
            </p>
            <div className="mt-8">
              <Button to="/contact" invert>
                {t('process.cta.button', 'Зв\'язатися з нами')}
              </Button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </motion.div>
  )
}