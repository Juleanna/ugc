import React from 'react';
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Shield, Award, Users } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Надійність',
      description: 'Використовуємо тільки перевірені матеріали та технології'
    },
    {
      icon: Award,
      title: 'Якість',
      description: 'Контроль якості на кожному етапі виробництва'
    },
    {
      icon: Users,
      title: 'Довіра',
      description: 'Понад 50 задоволених клієнтів по всій Україні'
    }
  ];

  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <Chip color="primary" variant="flat" size="lg" className="mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Про компанію
          </Chip>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Наш багаторічний досвід
            <br />
            <span className="text-gradient-blue">гарантує якість</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Ми створюємо одяг, який забезпечує безпеку і комфорт у будь-яких умовах. 
            Наша продукція відповідає найвищим стандартам якості.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((item, index) => (
            <Card key={index} className="hover-lift p-6 text-center">
              <CardBody className="p-0">
                <div className="bg-gradient-blue p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;