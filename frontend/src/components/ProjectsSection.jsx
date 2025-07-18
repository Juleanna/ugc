import React from 'react';
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import { FolderOpen, CheckCircle, ExternalLink } from 'lucide-react';

const ProjectsSection = ({ data }) => {
  const defaultProjects = [
    {
      title: 'Національна Гвардія України',
      subtitle: 'Захист і комфорт для наших захисників',
      description: 'Національна Гвардія України забезпечує своїх працівників якісним спецодягом, який відповідає найвищим стандартам захисту і комфорту в різних умовах служби.',
      badge: 'Успішний проєкт'
    },
    {
      title: 'Міністерство оборони України',
      subtitle: 'Вітро-вологозахисний костюм для військових',
      description: 'Міністерство оборони України замовило спеціальний вітро-вологозахисний костюм, який забезпечує надійний захист і комфорт для військових у різних погодних умовах.',
      badge: 'Успішний проєкт'
    }
  ];

  const handleProjectClick = (project) => {
    console.log('Clicked project:', project.client || project.name || project.title);
  };

  const handleViewDetailsClick = (e, project) => {
    e.stopPropagation();
    console.log('View project details:', project.client || project.name || project.title);
  };

  const projects = data.projects?.length > 0 ? data.projects.slice(0, 2) : defaultProjects;

  return (
    <section id="projects" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
         <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Успішні реалізації
            <br />
            <span className="text-gradient-blue">та довіра клієнтів</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, index) => {
            const title = project.client || project.name || project.title;
            const subtitle = project.short_description || project.subtitle;
            const description = project.detailed_description || project.description;

            return (
              <Card 
                key={project.id || index} 
                className="hover-lift cursor-pointer"
                onPress={() => handleProjectClick(project)}
              >
                <CardHeader className="pb-0">
                  <div className="w-full">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-4">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-green-700 font-semibold text-sm">
                        {project.badge || 'Успішний проєкт'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {title}
                    </h3>
                    <p className="text-lg font-medium text-primary mb-4">
                      {subtitle}
                    </p>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {description}
                  </p>
                  <div 
                    className="inline-flex items-center text-primary cursor-pointer hover:text-blue-800 transition-colors"
                    onClick={(e) => handleViewDetailsClick(e, project)}
                  >
                    <span className="text-sm font-medium">Дивитися проєкт</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;