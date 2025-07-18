import React from 'react';
import { Card, CardBody, Chip, Input, Textarea, Button } from "@nextui-org/react";
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactSection = ({ formData, setFormData, handleFormSubmit, isSubmitting }) => {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Телефон',
      value: '+38 (067) 123-45-67'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@ugc.ua'
    },
    {
      icon: MapPin,
      title: 'Адреса',
      value: 'м. Київ, вул. Промислова, 15'
    }
  ];

  return (
    <section id="contact" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <Chip color="success" variant="flat" size="lg" className="mb-6">
            <Mail className="w-4 h-4 mr-2" />
            Контакти
          </Chip>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Зв'яжіться з нами
            <br />
            <span className="text-gradient-blue">прямо зараз</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Готові допомогти вам з будь-якими питаннями та замовленнями.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Контактна інформація */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Наші контакти</h3>
            
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="bg-gradient-blue p-3 rounded-full">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-gray-600">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Форма зворотного зв'язку */}
          <Card className="p-6">
            <CardBody className="p-0">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <Input
                  label="Ім'я"
                  placeholder="Ваше ім'я"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="form-input"
                />
                
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="form-input"
                />
                
                <Input
                  label="Телефон"
                  type="tel"
                  placeholder="+38 (067) 123-45-67"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                />
                
                <Textarea
                  label="Повідомлення"
                  placeholder="Розкажіть про ваш проєкт..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  className="form-input"
                  rows={4}
                />
                
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-pulse mr-2">⏳</div>
                      Відправляємо...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Відправити повідомлення
                    </>
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;