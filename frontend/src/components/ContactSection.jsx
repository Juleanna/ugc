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
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Зв'яжіться з нами
            <br />
            <span className="text-gradient-blue">прямо зараз</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
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
          <Card className="p-6 shadow-xl border-0">
            <CardBody className="p-0">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Поле Ім'я */}
                <div className="flex flex-col gap-2">
                  <label className="text-black/70 dark:text-white/70 text-medium font-medium">
                    Ім'я
                  </label>
                  <Input
                    placeholder="Введіть ваше ім'я"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    variant="flat"
                    size="lg"
                    classNames={{
                      base: "w-full",
                      mainWrapper: "h-full",
                      input: [
                        "text-black/90 dark:text-white/90",
                        "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                      ],
                      innerWrapper: "bg-transparent",
                      inputWrapper: [
                        "min-h-[3.5rem]",
                        "shadow-lg",
                        "bg-white/80",
                        "dark:bg-default/60",
                        "backdrop-blur-xl",
                        "backdrop-saturate-200",
                        "hover:bg-white/90",
                        "dark:hover:bg-default/70",
                        "group-data-[focused=true]:bg-white/90",
                        "dark:group-data-[focused=true]:bg-default/60",
                        "!cursor-text",
                        "border-2",
                        "border-gray-200/50",
                        "hover:border-primary-300/50",
                        "group-data-[focused=true]:border-primary-500/50",
                        "!outline-none",
                        "focus:outline-none",
                        "focus:ring-0",
                        "transition-all",
                        "duration-300"
                      ]
                    }}
                  />
                </div>
                
                {/* Поле Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-black/70 dark:text-white/70 text-medium font-medium">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    variant="flat"
                    size="lg"
                    classNames={{
                      base: "w-full",
                      mainWrapper: "h-full",
                      input: [
                        "text-black/90 dark:text-white/90",
                        "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                      ],
                      innerWrapper: "bg-transparent",
                      inputWrapper: [
                        "min-h-[3.5rem]",
                        "shadow-lg",
                        "bg-white/80",
                        "dark:bg-default/60",
                        "backdrop-blur-xl",
                        "backdrop-saturate-200",
                        "hover:bg-white/90",
                        "dark:hover:bg-default/70",
                        "group-data-[focused=true]:bg-white/90",
                        "dark:group-data-[focused=true]:bg-default/60",
                        "!cursor-text",
                        "border-2",
                        "border-gray-200/50",
                        "hover:border-primary-300/50",
                        "group-data-[focused=true]:border-primary-500/50",
                        "!outline-none",
                        "focus:outline-none",
                        "focus:ring-0",
                        "transition-all",
                        "duration-300"
                      ]
                    }}
                  />
                </div>
                
                {/* Поле Повідомлення */}
                <div className="flex flex-col gap-2">
                  <label className="text-black/70 dark:text-white/70 text-medium font-medium">
                    Повідомлення
                  </label>
                  <Textarea
                    placeholder="Розкажіть детально про ваш проєкт, вимоги та побажання..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    variant="flat"
                    size="lg"
                    minRows={4}
                    classNames={{
                      base: "w-full",
                      input: [
                        "resize-none",
                        "text-black/90 dark:text-white/90",
                        "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                        "min-h-[120px]"
                      ],
                      innerWrapper: "bg-transparent",
                      inputWrapper: [
                        "shadow-lg",
                        "bg-white/80",
                        "dark:bg-default/60",
                        "backdrop-blur-xl",
                        "backdrop-saturate-200",
                        "hover:bg-white/90",
                        "dark:hover:bg-default/70",
                        "group-data-[focused=true]:bg-white/90",
                        "dark:group-data-[focused=true]:bg-default/60",
                        "!cursor-text",
                        "border-2",
                        "border-gray-200/50",
                        "hover:border-primary-300/50",
                        "group-data-[focused=true]:border-primary-500/50",
                        "!outline-none",
                        "focus:outline-none",
                        "focus:ring-0",
                        "transition-all",
                        "duration-300"
                      ]
                    }}
                  />
                </div>
                
                {/* Поле Телефон */}
                <div className="flex flex-col gap-2">
                  <label className="text-black/70 dark:text-white/70 text-medium font-medium">
                    Телефон
                  </label>
                  <Input
                    type="tel"
                    placeholder="+38 (067) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    variant="flat"
                    size="lg"
                    classNames={{
                      base: "w-full",
                      mainWrapper: "h-full",
                      input: [
                        "text-black/90 dark:text-white/90",
                        "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                      ],
                      innerWrapper: "bg-transparent",
                      inputWrapper: [
                        "min-h-[3.5rem]",
                        "shadow-lg",
                        "bg-white/80",
                        "dark:bg-default/60",
                        "backdrop-blur-xl",
                        "backdrop-saturate-200",
                        "hover:bg-white/90",
                        "dark:hover:bg-default/70",
                        "group-data-[focused=true]:bg-white/90",
                        "dark:group-data-[focused=true]:bg-default/60",
                        "!cursor-text",
                        "border-2",
                        "border-gray-200/50",
                        "hover:border-primary-300/50",
                        "group-data-[focused=true]:border-primary-500/50",
                        "!outline-none",
                        "focus:outline-none",
                        "focus:ring-0",
                        "transition-all",
                        "duration-300"
                      ]
                    }}
                  />
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className={`
                      w-full h-14 
                      bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 
                      hover:from-blue-600 hover:via-blue-700 hover:to-purple-700
                      active:from-blue-700 active:via-blue-800 active:to-purple-800
                      text-white font-semibold text-lg
                      shadow-2xl hover:shadow-blue/25 
                      transition-all duration-500 ease-out
                      transform hover:scale-[1.02] hover:-translate-y-1
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                      disabled:hover:scale-100 disabled:hover:translate-y-0
                      border-0 outline-none focus:outline-none
                      relative overflow-hidden
                      before:absolute before:inset-0 
                      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                      before:translate-x-[-100%] hover:before:translate-x-[100%]
                      before:transition-transform before:duration-700
                      rounded-xl
                    `}
                    startContent={!isSubmitting && (
                      <div className="flex items-center">
                        <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    )}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                        <span>Відправляємо повідомлення...</span>
                      </div>
                    ) : (
                      <span className="relative z-10">Відправити повідомлення</span>
                    )}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;