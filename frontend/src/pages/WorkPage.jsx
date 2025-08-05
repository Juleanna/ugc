import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionIntro } from '@/components/SectionIntro'
import { useTranslations } from '@/context/TranslationContext'
import { apiService } from '@/services/apiService'

function ProjectCard({ project }) {
  const { currentLocale } = useTranslations()
  
  return (
    <FadeIn>
      <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
        <Link to={`/${currentLocale}/work/${project.slug}`}>
          <span className="absolute inset-0 rounded-3xl" />
          
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="h-48 w-full rounded-lg object-cover"
            />
          ) : (
            <div className="h-48 w-full rounded-lg bg-neutral-200 flex items-center justify-center">
              <span className="text-4xl font-bold text-neutral-400">
                {project.title[0]}
              </span>
            </div>
          )}
        </Link>
        
        <div className="mt-6">
          {project.category && (
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
              {project.category.name}
            </p>
          )}
          
          <h3 className="mt-2 font-display text-xl font-semibold text-neutral-950">
            <Link to={`/${currentLocale}/work/${project.slug}`}>
              {project.title}
            </Link>
          </h3>
          
          {project.description && (
            <p className="mt-4 text-neutral-600 line-clamp-3">
              {project.description}
            </p>
          )}
          
          {project.date && (
            <p className="mt-4 text-sm text-neutral-500">
              {new Date(project.date).getFullYear()}
            </p>
          )}
        </div>
      </article>
    </FadeIn>
  )
}

export default function WorkPage() {
  const { t } = useTranslations()
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [projectsData, categoriesData] = await Promise.all([
          apiService.getProjects(),
          apiService.getProjectCategories()
        ])
        
        setProjects(projectsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load projects:', error)
        // Fallback data
        setProjects([
          {
            id: 1,
            slug: 'military-uniform',
            title: 'Військова форма',
            description: 'Надійна та практична форма для військових підрозділів.',
            category: { name: 'Військовий одяг' },
            date: '2023-01-01'
          },
          {
            id: 2,
            slug: 'medical-clothing',
            title: 'Медичний одяг',
            description: 'Комфортний та функціональний медичний одяг для персоналу лікарень.',
            category: { name: 'Медичний одяг' },
            date: '2023-02-01'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProjects = selectedCategory
    ? projects.filter(project => project.category?.id === selectedCategory)
    : projects

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-3xl p-6 ring-1 ring-neutral-950/5">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
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
        eyebrow={t('work.eyebrow', 'Наші роботи')}
        title={t('work.title', 'Портфоліо наших проєктів')}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('work.description', 'Ознайомтесь з нашими останніми проєктами та переконайтесь у якості нашої роботи.')}
        </p>
      </SectionIntro>

      {categories.length > 0 && (
        <Container className="mt-16">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === null
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {t('work.allCategories', 'Всі категорії')}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </Container>
      )}

      <Container className="mt-16">
        {filteredProjects.length > 0 ? (
          <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </FadeInStagger>
        ) : (
          <FadeIn>
            <div className="text-center py-16">
              <h3 className="font-display text-2xl font-medium text-neutral-950">
                {t('work.noProjects', 'Проєкти не знайдено')}
              </h3>
              <p className="mt-4 text-neutral-600">
                {t('work.noProjectsDescription', 'Спробуйте обрати іншу категорію або поверніться пізніше.')}
              </p>
            </div>
          </FadeIn>
        )}
      </Container>
    </motion.div>
  )
}