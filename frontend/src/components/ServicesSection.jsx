import React from 'react';
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import { 
  Briefcase, 
  Shield, 
  Heart, 
  Building, 
  Users, 
  Zap, 
  Star,
  ChevronRight 
} from 'lucide-react';

const ServicesSection = ({ data }) => {
  const defaultServices = [
    {
      title: 'Військова форма',
      description: 'Спеціалізована форма для військових підрозділів з підвищеними захисними властивостями',
      icon: Shield
    },
    {
      title: 'Медичний одяг',
      description: 'Комфортний і функціональний одяг для медичних працівників',
      icon: Heart
    },
    {
      title: 'Робочий одяг',
      description: 'Міцний і практичний одяг для різних сфер діяльності',
      icon: Building
    },
    {
      title: 'Корпоративний одяг',
      description: 'Стильний корпоративний одяг для створення єдиного іміджу компанії',
      icon: Users
    },
    {
      title: 'Спеціалізований одяг',
      description: 'Одяг для особливих умов праці з підвищеними вимогами безпеки',
      icon: Zap
    },
    {
      title: 'Аксесуари',
      description: 'Додаткові елементи та аксесуари для комплектації одягу',
      icon: Star
    }
  ];

  const handleServiceClick = (service) => {
    console.log('Clicked service:', service.name || service.title);
  };

  const handleDetailsClick = (e, service) => {
    e.stopPropagation();
    console.log('Clicked details for:', service.name || service.title);
  };

  const services = data.services?.length > 0 ? data.services : defaultServices;

  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <Chip color="primary" variant="flat" size="lg" className="mb-6">
            <Briefcase className="w-4 h-4 mr-2" />
            Наші послуги
          </Chip>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Повний цикл виробництва
            <br />
            <span className="text-gradient-blue">професійного одягу</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Від проєктування до готового виробу - ми забезпечуємо якість на кожному етапі.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon || Briefcase;
            const title = service.name || service.title;
            const description = service.short_description || service.description;

            return (
              <Card 
                key={service.id || index} 
                className="hover-lift cursor-pointer"
                onPress={() => handleServiceClick(service)}
              >
                <CardHeader className="flex gap-3 items-start pb-2">
                  <div className="bg-gradient-blue p-3 rounded-xl">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {title}
                    </h3>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-gray-600 mb-4">
                    {description}
                  </p>
                  <div 
                    className="inline-flex items-center text-primary cursor-pointer hover:text-blue-800 transition-colors"
                    onClick={(e) => handleDetailsClick(e, service)}
                  >
                    <span className="text-sm font-medium">Детальніше</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
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

export default ServicesSection;