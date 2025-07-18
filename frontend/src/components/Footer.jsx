import React from 'react';
import { Home, Info, Briefcase, FolderOpen, Mail } from 'lucide-react';

const Footer = ({ scrollToSection }) => {
  const navigation = [
    { id: 'home', label: 'Головна', icon: Home },
    { id: 'about', label: 'Про нас', icon: Info },
    { id: 'services', label: 'Послуги', icon: Briefcase },
    { id: 'projects', label: 'Проєкти', icon: FolderOpen },
    { id: 'contact', label: 'Контакти', icon: Mail }
  ];

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold mb-4">UGC</h3>
            <p className="text-gray-400">
              Професійний одяг для кожної сфери діяльності
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Швидкі посилання</h4>
            <div className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакти</h4>
            <div className="space-y-2 text-gray-400">
              <p>+38 (067) 123-45-67</p>
              <p>info@ugc.ua</p>
              <p>м. Київ, вул. Промислова, 15</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 UGC. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;