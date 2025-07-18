import React from 'react';
import InteractiveUGCDesign from './components/interactive/InteractiveUGCDesign';
// import UGCDesign from './components/UGCDesign'; // Старий статичний компонент

function App() {
  return (
    <div className="App">
      {/* Використовуємо новий інтерактивний компонент */}
      <InteractiveUGCDesign />
      
      {/* Якщо хочете повернутися до статичного дизайну, розкоментуйте нижче */}
      {/* <UGCDesign /> */}
    </div>
  );
}

export default App;