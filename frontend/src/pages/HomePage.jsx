import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { List, ListItem } from '@/components/List'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { Testimonial } from '@/components/Testimonial'
import { useTranslations } from '@/context/TranslationContext'
import { apiService } from '@/services/apiService'

// Temporary logo placeholders - will be replaced with actual API data
const clients = [
  'Phobia',
  'Family Fund', 
  'Unseal',
  'Mail Smirk',
  'Home Work',
  'Green Life',
  'Bright Path',
  'North Adventures',
]

function Clients() {
  const { t } = useTranslations()
  
  return (
    <div className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-32 lg:mt-56">
      <Container>
        <FadeIn className="flex items-center gap-x-8">
          <h2 className="text-center font-display text-sm font-semibold tracking-wider text-white sm:text-left">
            {t('clients.title', 'Ми працюємо з провідними компаніями України та Європи')}
          </h2>
          <div className="h-px flex-auto bg-neutral-800" />
        </FadeIn>
        <FadeInStagger faster>
          <ul
            role="list"
            className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4"
          >
            {clients.map((client) => (
              <li key={client}>
                <FadeIn>
                  <div className="flex h-16 items-center justify-center text-white font-medium">
                    {client}
                  </div>
                </FadeIn>
              </li>
            ))}
          </ul>
        </FadeInStagger>
      </Container>
    </div>
  )
}

function CaseStudies() {
  const { t, currentLocale } = useTranslations()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await apiService.getProjects()
        // Take first 3 projects as featured
        setProjects(data.slice(0, 3))
      } catch (error) {
        console.error('Failed to load projects:', error)
        // Fallback data
        setProjects([
          {
            id: 1,
            slug: 'phobia',
            title: t('caseStudies.items.phobia.title', 'Захисний одяг для промисловості'),
            description: t('caseStudies.items.phobia.description', 'Розробка та виготовлення спецодягу для захисту працівників у важких умовах.'),
            date: '2023',
            client_name: 'Phobia'
          },
          {
            id: 2, 
            slug: 'family-fund',
            title: t('caseStudies.items.familyFund.title', 'Медичний одяг'),
            description: t('caseStudies.items.familyFund.description', 'Комфортний та функціональний медичний одяг для персоналу лікарень.'),
            date: '2023',
            client_name: 'Family Fund'
          },
          {
            id: 3,
            slug: 'unseal', 
            title: t('caseStudies.items.unseal.title', 'Військова форма'),
            description: t('caseStudies.items.unseal.description', 'Надійна та практична форма для військових підрозділів.'),
            date: '2022',
            client_name: 'Unseal'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [t])
  
  if (loading) {
    return (
      <div className="mt-24 sm:mt-32 lg:mt-40">
        <Container>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    )
  }
  
  return (
    <>
      <SectionIntro
        title={t('caseStudies.title', 'Надійність та якість у кожній деталі')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('caseStudies.description', 'Наш багаторічний досвід у виробництві спецодягу гарантує високу якість і надійність кожного виробу.')}
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {projects.map((project) => (
            <FadeIn key={project.slug} className="flex">
              <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
                <h3>
                  <Link to={`/${currentLocale}/work/${project.slug}`}>
                    <span className="absolute inset-0 rounded-3xl" />
                    <div className="h-16 w-16 bg-neutral-200 rounded-lg flex items-center justify-center font-bold text-neutral-600">
                      {project.client_name?.[0] || project.title[0]}
                    </div>
                  </Link>
                </h3>
                <p className="mt-6 flex gap-x-2 text-sm text-neutral-950">
                  <time
                    dateTime={project.date || '2023'}
                    className="font-semibold"
                  >
                    {project.date || '2023'}
                  </time>
                  <span className="text-neutral-300" aria-hidden="true">
                    /
                  </span>
                  <span>{t('caseStudies.successfulProject', 'Успішний проєкт')}</span>
                </p>
                <p className="mt-6 font-display text-2xl font-semibold text-neutral-950">
                  {project.title}
                </p>
                <p className="mt-4 text-base text-neutral-600">
                  {project.description}
                </p>
              </article>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </>
  )
}

function Services() {
  const { t } = useTranslations()
  const [services, setServices] = useState([])
  
  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await apiService.getServices()
        setServices(data)
      } catch (error) {
        console.error('Failed to load services:', error)
      }
    }

    loadServices()
  }, [])
  
  return (
    <>
      <SectionIntro
        eyebrow={t('services.eyebrow', 'Послуги')}
        title={t('services.title', 'Ми створюємо якісний спецодяг під ваші потреби.')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('services.description', 'Ми виготовляємо спецодяг для різних галузей, включаючи військову форму, медичний одяг, а також спецодяг для інших сфер.')}
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <div className="lg:flex lg:items-center lg:justify-end">
          <div className="flex justify-center lg:w-1/2 lg:justify-end lg:pr-12">
            <FadeIn className="w-[33.75rem] flex-none lg:w-[45rem]">
              <StylizedImage
                src="/images/sewing.jpg"
                sizes="(min-width: 1024px) 41rem, 31rem"
                className="justify-center lg:justify-end"
              />
            </FadeIn>
          </div>
          <List className="mt-16 lg:mt-0 lg:w-1/2 lg:min-w-[33rem] lg:pl-4">
            <ListItem title={t('services.technicalSpecs.title', 'Розробка технічних умов (ТУ)')}>
              {t('services.technicalSpecs.description', 'Ми спеціалізуємося на створенні технічних умов згідно з вашими вимогами.')}
            </ListItem>
            <ListItem title={t('services.tailoring.title', 'Пошиття одягу')}>
              {t('services.tailoring.description', 'За вашими специфікаціями ми виготовляємо продукцію з використанням ваших матеріалів або наших власних.')}
            </ListItem>
            <ListItem title={t('services.logoApplication.title', 'Нанесення логотипу')}>
              {t('services.logoApplication.description', 'Ми пропонуємо послуги нанесення логотипу або бренду на вироби.')}
            </ListItem>
            <ListItem title={t('services.other.title', 'Інше')}>
              {t('services.other.description', 'Крім того, ми пропонуємо широкий асортимент готових виробів, тканин та фурнітури.')}
            </ListItem>
            {services.map((service) => (
              <ListItem key={service.id} title={service.name || service.title}>
                {service.description}
              </ListItem>
            ))}
          </List>
        </div>
      </Container>
    </>
  )
}

export default function HomePage() {
  const { t } = useTranslations()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiService.getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    loadStats()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="mt-24 sm:mt-32 md:mt-56">
        <FadeIn className="max-w-3xl">
          <h1 className="font-display text-5xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-7xl">
            {t('hero.title', 'Виробник спецодягу в Україні.')}
          </h1>
          <p className="mt-6 text-xl text-neutral-600">
            {t('hero.description', 'Ми створюємо якісний та надійний спецодяг, який забезпечує комфорт і безпеку в будь-яких умовах.')}
          </p>
        </FadeIn>
      </Container>

      <Clients />

      <CaseStudies />

      <Testimonial
        className="mt-24 sm:mt-32 lg:mt-40"
        client={{ name: 'Phobia' }}
      >
        {t('testimonial.quote', 'Команда UGC перевершила наші очікування, забезпечивши високу якість спецодягу та дотримання термінів. Відмінна комунікація і професійний підхід зробили співпрацю легкою та ефективною.')}
      </Testimonial>

      <Services />

      <ContactSection />
    </motion.div>
  )
}